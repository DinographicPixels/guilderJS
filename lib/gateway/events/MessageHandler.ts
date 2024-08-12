/** @module MessageHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { Message } from "../../structures/Message";
import { MessageReactionInfo } from "../../structures/MessageReactionInfo";
import {
    GatewayEvent_ChannelMessagePinned,
    GatewayEvent_ChannelMessageReactionCreated,
    GatewayEvent_ChannelMessageReactionDeleted,
    GatewayEvent_ChannelMessageReactionManyDeleted,
    GatewayEvent_ChannelMessageUnpinned,
    GatewayEvent_ChatMessageCreated,
    GatewayEvent_ChatMessageDeleted,
    GatewayEvent_ChatMessageUpdated
} from "../../Constants";
import { TextChannel } from "../../structures/TextChannel";
import { ChannelMessageReactionBulkRemove } from "../../types/";

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
    async messageCreate(data: GatewayEvent_ChatMessageCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);
        this.client.emit("messageCreate", MessageComponent);
    }
    async messageDelete(data: GatewayEvent_ChatMessageDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);
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
        this.client.emit("messageDelete", PU_Message);
    }
    async messagePin(data: GatewayEvent_ChannelMessagePinned): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);
        this.client.emit("messagePin", MessageComponent);
    }
    async messageReactionAdd(data: GatewayEvent_ChannelMessageReactionCreated): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new MessageReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }
    async messageReactionBulkRemove(data: GatewayEvent_ChannelMessageReactionManyDeleted): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.channelId);
            else void this.addGuildChannel(data.serverId, data.channelId);
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
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new MessageReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }
    async messageUnpin(data: GatewayEvent_ChannelMessageUnpinned): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);
        this.client.emit("messageUnpin", MessageComponent);
    }
    async messageUpdate(data: GatewayEvent_ChatMessageUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.message.channelId);
        else void this.addGuildChannel(data.serverId, data.message.channelId);
        const channel =
          this.client.getChannel<TextChannel>(data.serverId, data.message.channelId);
        const CachedMessage = channel?.messages?.get(data.message.id)?.toJSON() ?? null;
        const MessageComponent =
          channel?.messages?.update(data.message) ?? new Message(data.message, this.client);
        this.client.emit("messageUpdate", MessageComponent, CachedMessage);
    }
}
