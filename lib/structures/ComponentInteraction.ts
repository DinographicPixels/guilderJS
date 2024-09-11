/** @module ComponentInteraction */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { type Client } from "./Client";

import { Base } from "./Base";

import type { Guild } from "./Guild";
import type { Message } from "./Message";
import type {
    AnyInteractionComponent,
    AnyTextableChannel,
    InteractionConstructorParams,
    EditInteractionMessageOptions,
    EditMessageOptions,
    Embed,
    CreateInteractionMessageOptions,
    ComponentInteractionData,
    JSONComponentInteraction
} from "../types";

/** Represents a Component Interaction. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class ComponentInteraction<V extends AnyInteractionComponent = AnyInteractionComponent, T extends AnyTextableChannel = AnyTextableChannel> extends Base<string> {
    private _cachedChannel!: T extends AnyTextableChannel ? T : undefined;
    private _cachedGuild?: T extends AnyTextableChannel ? Guild : Guild | null;
    /** ID of the last message created with this interaction. */
    _lastMessageID: string | null;
    /** Interaction acknowledgement. */
    acknowledged: boolean;
    /** Channel on which the interaction was sent, if cached. */
    channel: T | null;
    /** ID of the channel on which the interaction was sent. */
    channelID: string;
    /** Component Interaction Data */
    data: ComponentInteractionData;
    /** ID of the server on which the interaction was sent. */
    guildID: (T extends AnyTextableChannel ? string : string | null) | null;
    /** ID of the interaction author. */
    memberID: string;
    /** Interaction Message, triggering this interaction, if cached. */
    message: Message<T> | null;
    /** ID of the Interaction Message, triggering this interaction. */
    messageID: string;
    /** ID of the original response of this interaction, if existant. */
    originalID: string | null;
    constructor(
        data: ComponentInteractionData,
        client: Client,
        params?: InteractionConstructorParams
    ) {
        super(client.util.generateNumericID(), client);
        this._lastMessageID = null;
        this.acknowledged = false;
        this.channelID = data.reactionInfo.channelID;
        this.channel = client.getChannel<T>(data.reactionInfo.raw.serverId ?? "none", this.channelID) ?? null;
        this.data = {
            customID:             data.customID,
            emoteID:              data.emoteID,
            userTriggerMessageID: data.userTriggerMessageID,
            reactionInfo:         data.reactionInfo
        };
        this.guildID = data.reactionInfo.guildID;
        this.messageID = data.reactionInfo.messageID;
        this.memberID = data.reactionInfo.reactorID;
        this.message = client.getMessage<T>(this.guildID ?? "none", this.channelID, this.messageID) ?? null;
        this.originalID =   params?.originalID ?? null;
        this.acknowledged = params?.acknowledged ?? false;
        this.update(data);
    }

    /** Create a follow-up message that replies to the original response.
     * (use ComponentInteraction#createMessage if the interaction has not been acknowledged).
     * @param options Message options.
     */
    async createFollowup(options: CreateInteractionMessageOptions): Promise<Message<T>> {
        if (!this.acknowledged || !this.originalID)
            throw new Error(
                "Interaction has not been acknowledged, " +
              "please acknowledge the message using the createMessage method."
            );

        console.log(this.data.userTriggerMessageID, this.originalID, this.messageID);

        if (!options.replyMessageIDs) {
            options.replyMessageIDs = [this.messageID];
        } else if (!options.replyMessageIDs.includes(this.messageID)) {
            options.replyMessageIDs.push(this.messageID);
        }

        if (options.replyMessageIDs?.includes(this.messageID)) {
            options.replyMessageIDs[options.replyMessageIDs.length - 1] = this.originalID;
        }

        if (!options.isPrivate && this.message?.isPrivate) options.isPrivate = true;

        const response =
          await this.client.rest.channels.createMessage<T>(
              this.channelID,
              options,
              {
                  originals: {
                      triggerID:  this.messageID,
                      responseID: this.originalID
                  },
                  acknowledged: true
              }
          );

        this._lastMessageID = response.id as string;
        await this.client.util.bulkAddComponents<T>(this.channelID, options.components ?? [], response);
        if (!(this.originalID)) this.originalID = response.id;
        return response;
    }

    /** This method is used to create a message following this interaction
     * (use ComponentInteraction#createFollowup on already acknowledged interactions).
     * @param options Message options.
     */
    async createMessage(options: CreateInteractionMessageOptions): Promise<Message<T>> {
        if (this.acknowledged)
            throw new Error(
                "Interaction has already been acknowledged, " +
              "please use the createFollowup method."
            );

        const idToUse = this.messageID;
        if (!options.replyMessageIDs) {
            options.replyMessageIDs = [idToUse];
        } else if (!options.replyMessageIDs.includes(idToUse)) {
            options.replyMessageIDs.push(idToUse);
        }

        if (!options.isPrivate && this.message?.isPrivate) options.isPrivate = true;

        const response =
          await this.client.rest.channels.createMessage<T>(
              this.channelID,
              options,
              {
                  originals: {
                      triggerID:  this.messageID,
                      responseID: this.originalID
                  },
                  acknowledged: true
              }
          );
        this._lastMessageID = response.id as string;
        this.acknowledged = true;
        await this.client.util.bulkAddComponents<T>(this.channelID, options.components ?? [], response);
        if (!(this.originalID)) this.originalID = response.id;
        return response;
    }

    /** Edit the last message sent with the interaction.
     * @param newMessage New message's options.
     */
    async editLast(newMessage: EditMessageOptions): Promise<Message<T>>{
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
    ): Promise<Message<T>> {
        if (!this.originalID)
            throw new Error(
                "Couldn't edit the original message from this Interaction, " +
              "as it either does not exist or has not been cached."
            );

        return this.client.rest.channels.editMessage<T>(
            this.channelID,
            this.originalID,
            newMessage,
            {
                originals: {
                    triggerID:  this.messageID,
                    responseID: this.originalID
                }
            }
        );
    }

    /**
     * Edit Parent Interaction.
     * @param newMessage New message content.
     */
    async editParent(newMessage: EditInteractionMessageOptions): Promise<Message<T>> {
        if (this.acknowledged) throw new Error("Cannot edit parent interaction that has already been acknowledged.");
        this.acknowledged = true;
        return (
            this.message
          ?? await this.client.rest.channels.
              getMessage(this.channelID, this.id)
        ).edit(newMessage);
    }

    /**
     * Get the latest message sent with this interaction.
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
     * Get the original message response.
     */
    async getOriginal(): Promise<Message<T>> {
        if (!this.originalID)
            throw new Error(
                "Couldn't get the original message from this interaction, " +
              "as it either does not exist or has not been cached."
            );

        return this.client.rest.channels.getMessage<T>(
            this.channelID,
            this.originalID,
            {
                originals: {
                    triggerID:  this.messageID,
                    responseID: this.originalID
                }
            }
        );
    }

    override toJSON(): JSONComponentInteraction {
        return {
            ...super.toJSON(),
            _lastMessageID: this._lastMessageID,
            acknowledged:   this.acknowledged,
            channelID:      this.channelID,
            data:           this.data,
            guildID:        this.guildID,
            memberID:       this.memberID,
            messageID:      this.messageID,
            originalID:     this.originalID
        };
    }
}
