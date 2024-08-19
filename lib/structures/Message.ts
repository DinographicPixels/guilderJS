/** @module Message */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { Member } from "./Member";
import { Guild } from "./Guild";

import { Base } from "./Base";

import type { TextChannel } from "./TextChannel";
import type {
    JSONMessage,
    MessageAttachment,
    MessageConstructorParams,
    MessageOriginals,
    AnyTextableChannel,
    CreateMessageOptions,
    EditMessageOptions,
    Embed,
    RawMessage,
    RawEmbed,
    RawMentions
} from "../types";

/** Represents a guild message. */
export class Message<T extends AnyTextableChannel> extends Base<string> {
    private _cachedChannel!: T extends AnyTextableChannel ? T : undefined;
    private _cachedGuild?: T extends Guild ? Guild : Guild | null;
    /** ID of the last message created with the message itself. */
    _lastMessageID: string | null;
    /** Message acknowledgement. */
    acknowledged: boolean;
    /** ID of the channel on which the message was sent. */
    channelID: string;
    /** Content of the message. */
    content: string | null;
    /** When the message was created. */
    createdAt: Date;
    /** Raw data. */
    #data: RawMessage;
    /** When the message was deleted. */
    deletedAt: Date | null;
    /** Timestamp at which this message was last edited. */
    editedTimestamp: Date | null;
    /** Array of message embed. */
    embeds?: Array<RawEmbed> | [];
    /** ID of the server on which the message was sent. */
    guildID: string | null;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    hiddenLinkPreviewURLs?: Array<string>;
    /** If true, the message appears as private. */
    isPrivate: boolean;
    /** If true, the message didn't mention anyone. */
    isSilent: boolean;
    /** ID of the message author. */
    memberID: string;
    /** object containing all mentioned users. */
    mentions: RawMentions;
    /** Message Originals */
    originals: {
        /** ID of the message's original message. */
        responseID: string | null;
        /** ID of the message sent by a user, triggering the original response. */
        triggerID: string | null;
    };
    /** The IDs of the message replied by the message. */
    replyMessageIDs: Array<string>;
    /** Message type. */
    type: string;
    /** ID of the webhook used to send this message. (if sent by a webhook) */
    webhookID?: string | null;
    constructor(
        data: RawMessage,
        client: Client,
        params?: MessageConstructorParams
    ) {
        super(data.id, client);
        this.#data = data;
        this.type = data.type;
        this.guildID = data.serverId ?? null;
        this.channelID = data.channelId;
        this.content = data.content ?? "";
        this.hiddenLinkPreviewURLs = data.hiddenLinkPreviewUrls ?? [];
        this.embeds = data.embeds ?? [];
        this.replyMessageIDs = data.replyMessageIds ?? [];
        this.isPrivate = data.isPrivate ?? false;
        this.isSilent = data.isSilent ?? false;
        this.mentions = data.mentions as RawMentions ?? null;
        this.createdAt = new Date(data.createdAt);
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.memberID = data.createdBy;
        this.webhookID = data.createdByWebhookId ?? null;
        this.deletedAt = data["deletedAt" as keyof object]
            ? new Date(data["deletedAt" as keyof object])
            : null;
        this._lastMessageID = null;
        this.originals = {
            responseID: params?.originals?.responseID ?? null,
            triggerID:  params?.originals?.triggerID ?? null
        };
        this.acknowledged = params?.acknowledged ?? false;

        this.update(data);
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

    protected override update(data: RawMessage): void {
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
            this.replyMessageIDs = data.replyMessageIds;
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

    /**
     * Get attachment URLs from this Message
     * *(works for embedded content such as images).*
     */
    get attachmentURLs(): Array<string> {
        const regex = /!\[]\((https:\/\/[^)]+)\)/g;
        const URLs: Array<string> = [];
        let match: RegExpExecArray | null;
        while ((match = regex.exec(this.content ?? "")) !== null) {
            URLs.push(match[1]);
        }
        return URLs;
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

    /** Get to know if this Message is original.
     *
     * It is Original when:
     * - it is a user message that is the original trigger of a response (returns: "trigger")
     * - it is a response to a trigger message (returns: "response")
     *
     * If not, this getter returns the boolean state: false.
     */
    get isOriginal(): "trigger" | "response" | false {
        return (this.originals.triggerID === this.id)
            ? "trigger"
            : ((this.originals.responseID === this.id)
                ? "response"
                : false);
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

    /** Create a follow-up message that replies to the trigger message and original response.
     * (use Message#createMessage if the message has not been acknowledged).
     *
     * Note: The trigger message and original response are automatically replied,
     * use Client.rest.channels#createMessage to create an independent message.
     * @param options Message options.
     */
    async createFollowup(options: CreateMessageOptions): Promise<Message<T>> {
        if (!this.acknowledged || !this.originals.responseID)
            throw new Error(
                "Message has not been acknowledged, " +
              "please acknowledge the message using the createMessage method."
            );

        if (!options.replyMessageIDs) {
            options.replyMessageIDs = [this.id];
        } else if (!options.replyMessageIDs.includes(this.id)) {
            options.replyMessageIDs.push(this.id);
        }

        if (options.replyMessageIDs?.includes(this.originals.triggerID ?? " ")) {
            options.replyMessageIDs[options.replyMessageIDs.length - 1] = this.originals.responseID;
        }

        if (!options.isPrivate && this.isPrivate) options.isPrivate = true;

        const response =
          await this.client.rest.channels.createMessage<T>(
              this.channelID,
              options,
              {
                  originals: {
                      triggerID:  this.originals.triggerID,
                      responseID: this.originals.responseID
                  },
                  acknowledged: true
              }
          );

        this._lastMessageID = response.id as string;
        if (this.isOriginal && !(this.originals.responseID)) this.originals.responseID = response.id;
        return response;
    }

    /** This method is used to create a message following this message
     * (use Message#createFollowup on already acknowledged messages).
     *
     * Note: The trigger message is automatically replied and acknowledged,
     * use Client.rest.channels#createMessage to create an independent message.
     * @param options Message options.
     */
    async createMessage(options: CreateMessageOptions): Promise<Message<T>> {
        if (this.acknowledged)
            throw new Error(
                "Message has already been acknowledged, " +
          "please use the createFollowup method."
            );
        if (!this.isOriginal && !(this.originals.triggerID)) this.originals.triggerID = this.id;

        const idToUse = this.originals.triggerID ?? this.id;
        if (!options.replyMessageIDs) {
            options.replyMessageIDs = [idToUse];
        } else if (!options.replyMessageIDs.includes(idToUse)) {
            options.replyMessageIDs.push(idToUse);
        }

        if (!options.isPrivate && this.isPrivate) options.isPrivate = true;

        const response =
          await this.client.rest.channels.createMessage<T>(
              this.channelID,
              options,
              {
                  originals: {
                      triggerID:  this.originals.triggerID,
                      responseID: this.originals.responseID
                  },
                  acknowledged: true
              }
          );
        this._lastMessageID = response.id as string;
        this.acknowledged = true;
        if (this.isOriginal && !(this.originals.responseID)) this.originals.responseID = response.id;
        return response;
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

    /** This method is used to delete the current message. */
    async delete(): Promise<void> {
        return this.client.rest.channels.deleteMessage(this.channelID, this.id as string);
    }

    /**
     * Delete followup message.
     */
    async deleteFollowup(): Promise<void> {
        if (!this._lastMessageID || !this.acknowledged)
            throw new Error("Cannot delete followup message if it does not exist.");
        return this.client.rest.channels.deleteMessage(
            this.channelID,
            this._lastMessageID
        );
    }

    /** Delete the last message sent with the message itself. */
    async deleteLast(): Promise<void>{
        if (!this._lastMessageID) throw new TypeError("Cannot delete last message if it does not exist.");
        return this.client.rest.channels.deleteMessage(this.channelID, this._lastMessageID);
    }

    /** Delete the message's original response message (prioritizes parent).
     * @param target (optional) Delete specifically the trigger or the response.
     */
    async deleteOriginal(target?: "trigger" | "response"): Promise<void>{
        const targetID =
          target === "trigger"
              ? this.originals.triggerID
              : (target === "response" ? this.originals.responseID : null);

        const messageID = targetID ?? this.originals.responseID ?? this.originals.triggerID;

        if (!(this.originals.responseID) && !(this.originals.triggerID)
          || this.isOriginal || target && !targetID || !messageID
        ) throw new Error(
            "Couldn't delete original message from this Message, " +
          "as it either does not exist or has not been stored inside this component."
        );


        return this.client.rest.channels.deleteMessage(
            this.channelID,
            messageID
        );
    }

    /** Remove a reaction from this message.
     * @param reaction ID of a reaction/emote.
     * @param targetUserID ID of the user to remove reaction from.
     * (works only on Channel Messages | default: @me)
     */
    async deleteReaction(reaction: number, targetUserID?: string): Promise<void>{
        return this.client.rest.channels.deleteReaction(
            this.channelID,
            "ChannelMessage",
            this.id as string,
            reaction,
            targetUserID
        );
    }

    /** This method is used to edit the current message.
     * @param newMessage New message's options
     */
    async edit(newMessage: EditMessageOptions): Promise<Message<T>>{
        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this.id as string,
            newMessage,
            {
                originals: {
                    triggerID:  this.originals.triggerID,
                    responseID: this.originals.responseID
                }
            }
        );
    }

    /**
     * Edit followup message.
     * @param newMessage Edit options.
     */
    async editFollowup(newMessage: EditMessageOptions): Promise<Message<T>> {
        if (!this._lastMessageID || !this.acknowledged)
            throw new Error("Cannot edit followup message if it does not exist.");
        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this._lastMessageID,
            newMessage,
            {
                originals: {
                    triggerID:  this.originals.triggerID,
                    responseID: this.originals.responseID
                }
            }
        );
    }

    /** Edit the last message sent with the message itself.
     * @param newMessage New message's options.
     */
    async editLast(newMessage: {content?: string; embeds?: Array<Embed>;}): Promise<Message<T>>{
        if (!this._lastMessageID) throw new TypeError("Cannot edit last message if it does not exist.");
        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this._lastMessageID,
            newMessage
        );
    }

    /** Edit the message's original response message.
     * @param newMessage New message's options.
     */
    async editOriginal(
        newMessage: {
            content?: string;
            embeds?: Array<Embed>;
        }
    ): Promise<Message<T>>{
        if (!this.originals.responseID || this.isOriginal)
            throw new Error(
                "Couldn't edit the original message from this Message, " +
              "as it either does not exist or has not been stored inside this component."
            );

        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this.originals.responseID,
            newMessage,
            {
                originals: {
                    triggerID:  this.originals.triggerID,
                    responseID: this.originals.responseID
                }
            }
        );
    }

    /**
     * Get attachments from this Message (using REST)
     * *(works for embedded content such as images).*
     */
    async getAttachments(): Promise<Array<MessageAttachment>> {
        return this.client.util.getAttachments(this.attachmentURLs);
    }

    /**
     * Get followup message.
     */
    async getFollowup(): Promise<Message<T>> {
        if (!this._lastMessageID || !this.acknowledged)
            throw new Error("Cannot get followup message if it does not exist.");
        return this.client.rest.channels.getMessage<T>(
            this.channelID,
            this._lastMessageID
        );
    }

    /**
     * Get the latest message sent with this Message.
     */
    async getLast(): Promise<Message<T>> {
        if (!this._lastMessageID)
            throw new TypeError("Cannot get last message if it does not exist.");
        return this.client.rest.channels.getMessage<T>(
            this.channelID,
            this._lastMessageID
        );
    }

    /**
     * Get original message response or trigger
     * (prioritizes parent, the original response).
     * @param target (optional) Get either the trigger or the response.
     */
    async getOriginal(target?: "trigger" | "response"): Promise<Message<T>> {
        const targetID =
          target === "trigger"
              ? this.originals.triggerID
              : (target === "response" ? this.originals.responseID : null);

        const messageID = targetID ?? this.originals.responseID ?? this.originals.triggerID;

        if (!(this.originals.responseID) && !(this.originals.triggerID)
          || this.isOriginal || target && !targetID || !messageID
        ) throw new Error(
            "Couldn't get the original message from this Message, " +
          "as it either does not exist or has not been stored inside this component."
        );

        return this.client.rest.channels.getMessage<T>(
            this.channelID,
            messageID,
            {
                originals: {
                    triggerID:  this.originals.triggerID,
                    responseID: this.originals.responseID
                }
            }
        );
    }

    /**
     * Get original messages
     * (the one triggering the response, and the original response message)
     */
    async getOriginals(): Promise<MessageOriginals> {
        if (!(this.originals.responseID) && !(this.originals.triggerID))
            throw new Error(
                "Couldn't get original messages from this Message, " +
              "as they either do not exist or have not been stored inside this component."
            );

        const request =
          (messageID: string): Promise<Message<T>> => this.client.rest.channels.getMessage<T>(
              this.channelID,
              messageID,
              {
                  originals: {
                      triggerID:  this.originals.triggerID,
                      responseID: this.originals.responseID
                  }
              });

        let originalUserMessage: Message<T> | null = null;
        let originalResponse: Message<T> | null = null;

        if (this.originals.triggerID)
            originalUserMessage = await request(this.originals.triggerID);

        if (this.originals.responseID)
            originalResponse = await request(this.originals.responseID);

        return {
            triggerMessage: originalUserMessage,
            originalResponse
        };
    }

    /** Pin this message */
    async pin(): Promise<void>{
        return this.client.rest.channels.pinMessage(this.channelID, this.id as string);
    }

    override toJSON(): JSONMessage {
        return {
            ...super.toJSON(),
            type:                  this.type,
            guildID:               this.guildID,
            channelID:             this.channelID,
            content:               this.content,
            hiddenLinkPreviewUrls: this.hiddenLinkPreviewURLs,
            embeds:                this.embeds,
            replyMessageIds:       this.replyMessageIDs,
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

    /** Unpin this message */
    async unpin(): Promise<void>{
        return this.client.rest.channels.unpinMessage(this.channelID, this.id as string);
    }
}
