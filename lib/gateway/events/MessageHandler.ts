/** @module MessageHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { Message } from "../../structures/Message";
import { MessageReactionInfo } from "../../structures/MessageReactionInfo";
import {
    type GatewayEvent_ChannelMessagePinned,
    type GatewayEvent_ChannelMessageReactionCreated,
    type GatewayEvent_ChannelMessageReactionDeleted,
    type GatewayEvent_ChannelMessageReactionManyDeleted,
    type GatewayEvent_ChannelMessageUnpinned,
    type GatewayEvent_ChatMessageCreated,
    type GatewayEvent_ChatMessageDeleted,
    type GatewayEvent_ChatMessageUpdated,
    GatewayLayerIntent,
    InteractionComponentType
} from "../../Constants";
import { type TextChannel } from "../../structures/TextChannel";
import type { AnyTextableChannel, ChannelMessageReactionBulkRemove, PrivateApplicationCommand } from "../../types/";
import { CommandInteraction } from "../../structures/CommandInteraction";
import { ComponentInteraction } from "../../structures/ComponentInteraction";

/** Internal component, emitting message events. */
export class MessageHandler extends GatewayEventHandler {
    private async addGuildChannel(guildID: string, channelID: string): Promise<void> {
        if (this.client.getChannel(guildID, channelID) !== undefined) return;
        const channel =
          await this.client.rest.channels.get(channelID)
              .catch(err =>
                  this.client.emit(
                      "warn",
                      `Cannot register channel to cache due to: (${String(err)})`)
              );
        const guild = this.client.guilds.get(guildID);
        if (typeof channel !== "boolean") guild?.channels?.add(channel);
    }
    get isMessageIntentEnabled(): boolean {
        return this.client.util.isIntentEnabled([GatewayLayerIntent.GUILD_MESSAGES]);
    }
    get isMessageReactionIntentEnabled(): boolean {
        return this.client.util.isIntentEnabled([GatewayLayerIntent.GUILD_MESSAGE_REACTIONS]);
    }
    async messageCreate(data: GatewayEvent_ChatMessageCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);

        const treatmentStartTimestamp = performance.now();

        if (
            this.client.application.enabled
          && !data.message.createdByWebhookId
        ) {
            const isReplyingApp =
              data.message.replyMessageIds?.some(messageID => {
                  const message =
                  this.client.getMessage(
                      data.serverId,
                      data.message.channelId,
                      messageID
                  );
                  return message?.memberID === this.client.user?.id;
              }) ?? false;

            const commandNames =
          this.client.application.commands.map(command => command.name);

            let currentCommandName: string | null = null;
            const executionType: "full" | "simple" | false =
              commandNames?.some((name): boolean => {
                  const usingAppCommand = data.message.content?.startsWith("/" + this.client.application.appShortname + " " + name);
                  const usingSimpleCommand = data.message.content?.startsWith("/" + name);

                  if (usingAppCommand) {
                      currentCommandName = name;
                      return true;
                  }

                  if (usingSimpleCommand) {
                      currentCommandName = name;
                      return true;
                  }

                  return false;
              }) ? (data.message.content?.startsWith("/" + this.client.application.appShortname + " ") ? "full" : "simple") : false;

            if (
                isReplyingApp
              && executionType === "simple"
              || executionType === "full"
            ) {
                const interaction =
                  this.client.getChannel<AnyTextableChannel>(data.serverId, data.message.channelId)
                      ?.interactions.update(
                          {
                              guildID:     data.serverId,
                              message:     data.message,
                              name:        currentCommandName!,
                              directReply: isReplyingApp,
                              executionType
                          },
                          {}
                      )
                  ?? new CommandInteraction(
                      {
                          guildID:     data.serverId,
                          message:     data.message,
                          name:        currentCommandName!,
                          directReply: isReplyingApp,
                          executionType
                      },
                      this.client
                  );

                // manipulate private properties as they could be undefined
                // as appCmd could be a simple ApplicationCommand.
                const appCmd = interaction.data.applicationCommand as PrivateApplicationCommand;
                if (appCmd?.private) {
                    if (appCmd?.guildID && appCmd?.guildID !== interaction.guildID) return;
                    if (appCmd?.userID && appCmd?.userID !== interaction.memberID) return;
                }

                const verifyOptionsData = interaction.data ? interaction.data.options.verifyOptions() : { missing: [], incorrect: [], total: [] };
                if (
                    interaction.data?.options.requiredOptions.length
                  && interaction.data.options.values
                  && (verifyOptionsData.missing.length !== 0 || verifyOptionsData.incorrect.length !== 0)
                ) {
                    let content = "";
                    if (verifyOptionsData.missing.length !== 0 && verifyOptionsData.incorrect.length !== 0) {
                        content = `${verifyOptionsData.missing.length} required option${verifyOptionsData.missing.length > 1 ? "s are" : " is"} missing, ${verifyOptionsData.incorrect.length} ${verifyOptionsData.incorrect.length > 1 ? "are" : "is"} incorrect.`;
                    } else if (verifyOptionsData.missing.length !== 0) {
                        content = `${verifyOptionsData.missing.length} required option${verifyOptionsData.missing.length > 1 ? "s are" : " is"} missing.`;
                    } else if (verifyOptionsData.incorrect.length === 0) {
                        content = "An error has occurred while treating your command.";
                    } else {
                        content = `${verifyOptionsData.incorrect.length} required option${verifyOptionsData.incorrect.length > 1 ? "s are" : " is"} incorrect.`;
                    }

                    const totalList = interaction.data.applicationCommand.options ?
                        interaction.data.applicationCommand.options.map(opt => {
                            if (verifyOptionsData.total.includes(opt.name)) return `**${opt.name}**`;
                            if (!opt.required) return `*${opt.name}*`;
                            return opt.name;
                        }) : [];

                    if (content !== "An error has occurred while treating your command.") {
                        content += " (" + totalList.join(", ") + ")";
                    }

                    return void interaction.createMessage({ content, isPrivate: true });
                }

                const treatmentEndTimestamp = performance.now();
                const treatmentDuration = treatmentEndTimestamp - treatmentStartTimestamp;
                void this.client.util.requestDataCollection({
                    event: "message_create_treatment",
                    data:  {
                        duration: treatmentDuration
                    }
                });

                return void this.client.emit(
                    "interactionCreate",
                    interaction
                );
            }
        }

        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";

        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message, {}) ?? new Message(data.message, this.client);


        if (!this.isMessageIntentEnabled) return;
        this.client.emit("messageCreate", MessageComponent);
    }
    async messageDelete(data: GatewayEvent_ChatMessageDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);


        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const PU_Message = channel?.messages?.update(data.message, {}) ?? {
            id:        data.message.id,
            guildID:   data.serverId,
            channelID: data.message.channelId,
            deletedAt: new Date(data.message.deletedAt),
            isPrivate: data.message.isPrivate ?? null
        };
        channel?.messages?.delete(data.message.id);

        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT])
            && PU_Message["content" as keyof object]
        ) Object.assign(PU_Message, { content: "" });

        if (!this.isMessageIntentEnabled) return;
        this.client.emit("messageDelete", PU_Message);
    }
    async messagePin(data: GatewayEvent_ChannelMessagePinned): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);

        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";

        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message, {}) ?? new Message(data.message, this.client);

        if (!this.isMessageIntentEnabled) return;
        this.client.emit("messagePin", MessageComponent);
    }
    async messageReactionAdd(data: GatewayEvent_ChannelMessageReactionCreated): Promise<void> {
        if (data.serverId) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        }
        const ReactionInfo = new MessageReactionInfo(data, this.client);

        if (this.client.application.enabled && data.serverId) {
            // from cache
            const channel =
              this.client.getChannel<AnyTextableChannel>(data.serverId, data.reaction.channelId);
            if (channel && channel.messages.has(data.reaction.messageId)) {
                const interactionMessage =
                  channel.messages.get(data.reaction.messageId)!;
                const originalInteraction =
                  channel.interactions.get(interactionMessage.originals.triggerID ?? "none");
                const hasComponents = interactionMessage.components.length !== 0;
                const emoteComponent =
                  interactionMessage.components
                      .find(component =>
                          component.type === InteractionComponentType.BUTTON && component.emoteID === data.reaction.emote.id
                      );
                if (originalInteraction
                  && hasComponents
                  && emoteComponent
                  && data.reaction.createdBy !== this.client.user?.id
                ) {
                    this.client.emit(
                        "interactionCreate",
                        new ComponentInteraction(
                            {
                                customID:             emoteComponent.customID,
                                emoteID:              emoteComponent.emoteID,
                                userTriggerMessageID: originalInteraction.id,
                                reactionInfo:         ReactionInfo
                            },
                            this.client
                        )
                    );
                }
            }
        }

        if (!this.isMessageReactionIntentEnabled) return;
        this.client.emit("reactionAdd", ReactionInfo);
    }
    async messageReactionBulkRemove(data: GatewayEvent_ChannelMessageReactionManyDeleted): Promise<void> {
        if (data.serverId) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.channelId);
            else void this.addGuildChannel(data.serverId, data.channelId);
        }
        if (!this.isMessageReactionIntentEnabled) return;
        const BulkRemoveInfo: ChannelMessageReactionBulkRemove = {
            channelID: data.channelId,
            guildID:   data.serverId,
            messageID: data.messageId,
            count:     data.count,
            deletedBy: data.deletedBy,
            emote:     data.emote ?? null
        };
        this.client.emit("reactionBulkRemove", BulkRemoveInfo);
    }
    async messageReactionRemove(data: GatewayEvent_ChannelMessageReactionDeleted): Promise<void> {
        if (data.serverId) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        }
        if (!this.isMessageReactionIntentEnabled) return;
        const ReactionInfo = new MessageReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }
    async messageUnpin(data: GatewayEvent_ChannelMessageUnpinned): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);
        if (!this.isMessageIntentEnabled) return;
        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message, {}) ?? new Message(data.message, this.client);
        this.client.emit("messageUnpin", MessageComponent);
    }
    async messageUpdate(data: GatewayEvent_ChatMessageUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);
        if (!this.isMessageIntentEnabled) return;
        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const CachedMessage = channel?.messages?.get(data.message.id)?.toJSON() ?? null;
        const MessageComponent =
          channel?.messages?.update(data.message, {}) ?? new Message(data.message, this.client);
        this.client.emit("messageUpdate", MessageComponent, CachedMessage);
    }
}
