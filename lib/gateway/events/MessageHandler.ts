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
    GatewayLayerIntent
} from "../../Constants";
import { type TextChannel } from "../../structures/TextChannel";
import type { ChannelMessageReactionBulkRemove, PrivateApplicationCommand } from "../../types/";
import { CommandInteraction } from "../../structures/CommandInteraction";

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
    get isGuildIntentEnabled(): boolean {
        return this.client.util.isIntentEnabled([GatewayLayerIntent.GUILDS]);
    }
    get isMessageIntentEnabled(): boolean {
        return this.client.util.isIntentEnabled([GatewayLayerIntent.GUILD_MESSAGES]);
    }
    get isMessageReactionIntentEnabled(): boolean {
        return this.client.util.isIntentEnabled([GatewayLayerIntent.GUILD_MESSAGE_REACTIONS]);
    }
    async messageCreate(data: GatewayEvent_ChatMessageCreated): Promise<void> {
        if (this.isGuildIntentEnabled) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.message.channelId);
            else void this.addGuildChannel(data.serverId, data.message.channelId);
        }

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
                  new CommandInteraction(
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
                return void this.client.emit(
                    "interactionCreate",
                    interaction
                );
            }
        }

        if (!this.isMessageIntentEnabled) return;

        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";

        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);


        this.client.emit("messageCreate", MessageComponent);
    }
    async messageDelete(data: GatewayEvent_ChatMessageDeleted): Promise<void> {
        if (this.isGuildIntentEnabled) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.message.channelId);
            else void this.addGuildChannel(data.serverId, data.message.channelId);
        }

        if (!this.isMessageIntentEnabled) return;

        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const PU_Message = channel?.messages?.update(data.message) ?? {
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

        this.client.emit("messageDelete", PU_Message);
    }
    async messagePin(data: GatewayEvent_ChannelMessagePinned): Promise<void> {
        if (this.isGuildIntentEnabled) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.message.channelId);
            else void this.addGuildChannel(data.serverId, data.message.channelId);
        }

        if (!this.isMessageIntentEnabled) return;

        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";

        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);
        this.client.emit("messagePin", MessageComponent);
    }
    async messageReactionAdd(data: GatewayEvent_ChannelMessageReactionCreated): Promise<void> {
        if (this.isGuildIntentEnabled && data.serverId) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        }
        if (!this.isMessageReactionIntentEnabled) return;
        const ReactionInfo = new MessageReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }
    async messageReactionBulkRemove(data: GatewayEvent_ChannelMessageReactionManyDeleted): Promise<void> {
        if (this.isGuildIntentEnabled && data.serverId) {
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
        if (this.isGuildIntentEnabled && data.serverId) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        }
        if (!this.isMessageReactionIntentEnabled) return;
        const ReactionInfo = new MessageReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }
    async messageUnpin(data: GatewayEvent_ChannelMessageUnpinned): Promise<void> {
        if (this.isGuildIntentEnabled) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.message.channelId);
            else void this.addGuildChannel(data.serverId, data.message.channelId);
        }
        if (!this.isMessageIntentEnabled) return;
        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);
        this.client.emit("messageUnpin", MessageComponent);
    }
    async messageUpdate(data: GatewayEvent_ChatMessageUpdated): Promise<void> {
        if (this.isGuildIntentEnabled) {
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.message.channelId);
            else void this.addGuildChannel(data.serverId, data.message.channelId);
        }
        if (!this.isMessageIntentEnabled) return;
        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.MESSAGE_CONTENT]))
            data.message.content = "";
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const CachedMessage = channel?.messages?.get(data.message.id)?.toJSON() ?? null;
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);
        this.client.emit("messageUpdate", MessageComponent, CachedMessage);
    }
}
