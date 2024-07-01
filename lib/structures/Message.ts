/** @module Message */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Member } from "./Member";
import { Guild } from "./Guild";

import { Base } from "./Base";

import { TextChannel } from "./TextChannel";
import { APIChatMessage, APIEmbedOptions, APIMentions, APIMessageOptions } from "../Constants";
import { JSONMessage } from "../types/json";
import { AnyTextableChannel } from "../types/channel";

/** Represents a guild message. */
export class Message<T extends AnyTextableChannel> extends Base<string> {
    private _cachedChannel!: T extends AnyTextableChannel ? T : undefined;
    private _cachedGuild?: T extends Guild ? Guild : Guild | null;
    /** Raw data. */
    #data: APIChatMessage;
    /** Message type. */
    type: string;
    /** ID of the server on which the message was sent. */
    guildID: string | null;
    /** ID of the channel on which the message was sent. */
    channelID: string;
    /** Content of the message. */
    content: string | null;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    hiddenLinkPreviewUrls?: Array<string>;
    /** Array of message embed. */
    embeds?: Array<APIEmbedOptions> | [];
    /** The IDs of the message replied by the message. */
    replyMessageIds: Array<string>;
    /** If true, the message appears as private. */
    isPrivate: boolean;
    /** If true, the message didn't mention anyone. */
    isSilent: boolean;
    /** object containing all mentioned users. */
    mentions: APIMentions;
    /** ID of the message author. */
    memberID: string;
    /** ID of the webhook used to send this message. (if sent by a webhook) */
    webhookID?: string | null;
    /** When the message was created. */
    createdAt: Date;
    /** Timestamp at which this message was last edited. */
    editedTimestamp: Date | null;
    /** When the message was deleted. */
    deletedAt: Date | null;
    /** ID of the last message created with the message itself. */
    _lastMessageID: string | null;
    /** ID of the message's original message. */
    #originalMessageID: string | null;
    #originalMessageBool: boolean;

    constructor(
        data: APIChatMessage,
        client: Client,
        params?: { originalMessageID?: string | null; }
    ) {
        super(data.id, client);
        this.#data = data;
        this.type = data.type;
        this.guildID = data.serverId ?? null;
        this.channelID = data.channelId;
        this.content = data.content ?? "";
        this.hiddenLinkPreviewUrls = data.hiddenLinkPreviewUrls ?? [];
        this.embeds = data.embeds ?? [];
        this.replyMessageIds = data.replyMessageIds ?? [];
        this.isPrivate = data.isPrivate ?? false;
        this.isSilent = data.isSilent ?? false;
        this.mentions = data.mentions as APIMentions ?? null;
        this.createdAt = new Date(data.createdAt);
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.memberID = data.createdBy;
        this.webhookID = data.createdByWebhookId ?? null;
        this.deletedAt = data["deletedAt" as keyof object]
            ? new Date(data["deletedAt" as keyof object])
            : null;
        this._lastMessageID = null;
        this.#originalMessageID = params?.originalMessageID ?? null;
        this.#originalMessageBool = false;
        this.update(data);
    }

    override toJSON(): JSONMessage {
        return {
            ...super.toJSON(),
            type:                  this.type,
            guildID:               this.guildID,
            channelID:             this.channelID,
            content:               this.content,
            hiddenLinkPreviewUrls: this.hiddenLinkPreviewUrls,
            embeds:                this.embeds,
            replyMessageIds:       this.replyMessageIds,
            isPrivate:             this.isPrivate,
            isSilent:              this.isSilent,
            mentions:              this.mentions,
            createdAt:             this.createdAt,
            editedTimestamp:       this.editedTimestamp,
            memberID:              this.memberID,
            webhookID:             this.webhookID,
            deletedAt:             this.deletedAt
        };
    }

    protected override update(data: APIChatMessage): void {
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.content !== undefined){
            this.content = data.content;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.memberID = data.createdBy;
        }
        if (data.createdByWebhookId !== undefined) {
            this.webhookID = data.createdByWebhookId;
        }
        if (data.embeds !== undefined) {
            this.embeds = data.embeds;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.isPrivate !== undefined) {
            this.isPrivate = data.isPrivate;
        }
        if (data.isSilent !== undefined) {
            this.isSilent = data.isSilent;
        }
        if (data.mentions !== undefined) {
            this.mentions = data.mentions;
        }
        if (data.replyMessageIds !== undefined) {
            this.replyMessageIds = data.replyMessageIds;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.updatedAt !== undefined) {
            this.editedTimestamp = new Date(data.updatedAt);
        }
    }

    /** Retrieve message's member.
     *
     * Make sure to await this property (getter) to still
     * get results even if the member is not cached.
     * @note The API does not provide member information,
     * that's why you might need to await this property.
     */
    get member(): T extends Guild ? Member : Member | Promise<Member> | undefined {
        const guild = this.client.guilds.get(this.guildID as string);
        if (guild?.members?.get(this.memberID) && this.memberID) {
            return guild?.members
                ?.get(this.memberID) as T extends Guild ? Member : Member | Promise<Member> | undefined;
        } else if (this.memberID && this.guildID) {
            const restMember =
              this.client.rest.guilds.getMember(this.guildID, this.memberID);
            void this.setCache(restMember);
            return (guild?.members.get(this.memberID) ?? restMember) as
              T extends Guild ? Member : Member | Promise<Member> | undefined;
        } else {
            const channel =
              this.client.getChannel(this.guildID as string, this.channelID) as TextChannel;
            const message = channel?.messages?.get(this.id);
            if (message instanceof Message && message.guildID && message.memberID) {
                const restMember =
                  this.client.rest.guilds.getMember(message.guildID, message.memberID);
                void this.setCache(restMember);
                return restMember as T extends Guild ? Member : Member | Promise<Member> | undefined;
            }
            return undefined as T extends Guild ? Member : undefined;
        }
    }

    /** The guild the message is in. This will throw an error if the guild isn't cached.*/
    get guild(): T extends Guild ? Guild : Guild | null {
        if (!this.guildID)
            throw new Error(`Couldn't get ${this.constructor.name}#guildID. (guild cannot be retrieved)`);
        if (!this._cachedGuild) {
            this._cachedGuild = this.client.getGuild(this.guildID);
            if (!this._cachedGuild) {
                throw new Error(`${this.constructor.name}#guild: couldn't find the Guild in cache.`);
            }
        }
        return this._cachedGuild as T extends Guild ? Guild : Guild | null;
    }

    /** The channel this message was created in.  */
    get channel(): T extends AnyTextableChannel ? T : undefined {
        if (!this.guildID)
            throw new Error(`Couldn't get ${this.constructor.name}#guildID. (channel cannot be retrieved)`);
        if (!this.channelID)
            throw new Error(`Couldn't get ${this.constructor.name}#channelID. (channel cannot be retrieved)`);
        return this._cachedChannel
          ?? (this._cachedChannel = this.client.getChannel(
              this.guildID,
              this.channelID
          ) as T extends AnyTextableChannel ? T : undefined);
    }

    private async setCache(obj: Promise<Member> | Promise<Guild>): Promise<void> {
        const guild = this.client.guilds.get(this.guildID as string);
        const awaitedObj = await obj;
        if (guild && awaitedObj instanceof Member) {
            guild?.members?.add(awaitedObj);
            if (awaitedObj.user) this.client.users.add(awaitedObj.user);
        } else if (awaitedObj instanceof Guild) {
            this.client.guilds.add(awaitedObj);
        }
    }

    /** This method is used to create a message following this message.
     *
     * Note: this method DOES NOT reply to the current message, you have to do it yourself.
     * @param options Message options.
     */
    async createMessage(options: APIMessageOptions): Promise<Message<T>>{
        const response =
          await this.client.rest.channels.createMessage<T>(
              this.channelID,
              options,
              { originalMessageID: this.#originalMessageID }
          );
        this._lastMessageID = response.id as string;
        if (!this.#originalMessageBool){
            this.#originalMessageBool = true;
            this.#originalMessageID = response.id as string;
        }
        return response;
    }

    /** This method is used to edit the current message.
     * @param newMessage New message's options
     */
    async edit(
        newMessage: {
            content?: string;
            embeds?: Array<APIEmbedOptions>;
        }
    ): Promise<Message<T>>{
        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this.id as string,
            newMessage,
            { originalMessageID: this.#originalMessageID }
        );
    }

    /** This method is used to delete the current message. */
    async delete(): Promise<void> {
        return this.client.rest.channels.deleteMessage(this.channelID, this.id as string);
    }


    /** Edit the last message sent with the message itself.
     * @param newMessage New message's options.
     */
    async editLast(newMessage: {content?: string; embeds?: Array<APIEmbedOptions>;}): Promise<Message<T>>{
        if (!this._lastMessageID) throw new TypeError("Cannot edit last message if it does not exist.");
        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this._lastMessageID,
            newMessage
        );
    }

    /** Delete the last message sent with the message itself. */
    async deleteLast(): Promise<void>{
        if (!this._lastMessageID) throw new TypeError("Cannot delete last message if it does not exist.");
        return this.client.rest.channels.deleteMessage(this.channelID, this._lastMessageID);
    }

    /** Edit the message's original response message.
     * @param newMessage New message's options.
     */
    async editOriginal(newMessage: { content?: string; embeds?: Array<APIEmbedOptions>; }): Promise<Message<T>>{
        if (!this.#originalMessageID)
            throw new TypeError("Cannot edit original message if it does not exist.");
        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this.#originalMessageID,
            newMessage,
            { originalMessageID: this.#originalMessageID }
        );
    }

    /** Delete the message's original response message. */
    async deleteOriginal(): Promise<void>{
        if (!this.#originalMessageID)
            throw new TypeError("Cannot delete original message if it does not exist.");
        return this.client.rest.channels.deleteMessage(this.channelID, this.#originalMessageID);
    }

    /** Add a reaction to this message.
     * @param reaction ID of a reaction/emote.
     */
    async createReaction(reaction: number): Promise<void>{
        return this.client.rest.channels.createReaction(
            this.channelID,
            "ChannelMessage",
            this.id as string,
            reaction
        );
    }

    /** Remove a reaction from this message.
     * @param reaction ID of a reaction/emote.
     */
    async deleteReaction(reaction: number): Promise<void>{
        return this.client.rest.channels.deleteReaction(
            this.channelID,
            "ChannelMessage",
            this.id as string,
            reaction
        );
    }

    /** Pin this message */
    async pin(): Promise<void>{
        return this.client.rest.channels.pinMessage(this.channelID, this.id as string);
    }

    /** Unpin this message */
    async unpin(): Promise<void>{
        return this.client.rest.channels.unpinMessage(this.channelID, this.id as string);
    }
}
