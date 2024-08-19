/** @module CommandInteraction */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { type Client } from "./Client";
import { Guild } from "./Guild";

import { Base } from "./Base";

import { Message } from "./Message";
import { Member } from "./Member";
import type { TextChannel } from "./TextChannel";
import type {
    AnyTextableChannel,
    InteractionData,
    CommandInteractionData,
    CreateMessageOptions,
    RawMentions,
    EditMessageOptions,
    Embed,
    CommandInteractionConstructorParams,
    JSONCommandInteraction
} from "../types";
import { InteractionOptionWrapper } from "../util/InteractionOptionWrapper";

/** Represents a Command Interaction. */
export class CommandInteraction<T extends AnyTextableChannel> extends Base<string> {
    private _cachedChannel!: T extends AnyTextableChannel ? T : undefined;
    private _cachedGuild?: T extends Guild ? Guild : Guild | null;
    /** ID of the last message created with this interaction. */
    _lastMessageID: string | null;
    /** Interaction acknowledgement. */
    acknowledged: boolean;
    /** ID of the channel on which the interaction was sent. */
    channelID: string;
    /** When the interaction was created. */
    createdAt: Date;
    /** Raw data. */
    #data: CommandInteractionData;
    /** Interaction Data */
    data: InteractionData;
    /** ID of the server on which the interaction was sent. */
    guildID: string;
    /** If true, the interaction appears as private. */
    isPrivate: boolean;
    /** If true, the interaction didn't mention anyone. */
    isSilent: boolean;
    /** ID of the interaction author. */
    memberID: string;
    /** ID of the original message, responding to this interaction. */
    originalID: string | null;
    /** The IDs of the message replied by the interaction. */
    replyMessageIDs: Array<string>;
    constructor(
        data: CommandInteractionData,
        client: Client,
        params?: CommandInteractionConstructorParams
    ) {
        super(data.message.id, client);
        this.#data = data;
        this.guildID = data.message.serverId ?? data.guildID;
        this.channelID = data.message.channelId;
        this.replyMessageIDs = data.message.replyMessageIds ?? [];
        this.isPrivate = data.message.isPrivate ?? false;
        this.isSilent = data.message.isSilent ?? false;
        this.createdAt = new Date(data.message.createdAt);
        this.memberID = data.message.createdBy;
        this._lastMessageID = null;
        this.originalID = params?.originalID ?? null;
        this.acknowledged = params?.acknowledged ?? false;

        const appCmd =
      this.client.application.commands
          .find(cmd => cmd.name === data.name)!;

        this.data = {
            name:               data.name,
            applicationCommand: appCmd,
            options:            new InteractionOptionWrapper({
                guildID:            data.guildID,
                applicationCommand: appCmd,
                content:            data.message.content!,
                mentions:           data.message.mentions as RawMentions,
                directReply:        data.directReply,
                executionType:      data.executionType
            }, this.client)
        };

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

    protected override update(data: CommandInteractionData): void {
        if (data.message.channelId !== undefined) {
            this.channelID = data.message.channelId;
        }
        if (data.message.content !== undefined){
            this.#data.message.content = data.message.content;
        }
        if (data.message.createdAt !== undefined) {
            this.createdAt = new Date(data.message.createdAt);
        }
        if (data.message.createdBy !== undefined) {
            this.memberID = data.message.createdBy;
        }
        if (data.message.createdByWebhookId !== undefined) {
            this.#data.message.createdByWebhookId = data.message.createdByWebhookId;
        }
        if (data.message.isPrivate !== undefined) {
            this.isPrivate = data.message.isPrivate;
        }
        if (data.message.isSilent !== undefined) {
            this.isSilent = data.message.isSilent;
        }
        if (data.message.mentions !== undefined) {
            this.#data.message.mentions = data.message.mentions;
        }
        if (data.message.replyMessageIds !== undefined) {
            this.replyMessageIDs = data.message.replyMessageIds;
        }
        if (data.message.serverId !== undefined) {
            this.guildID = data.message.serverId;
        }
        if (data.message.type !== undefined) {
            this.#data.message.type = data.message.type;
        }
        if (data.message.updatedAt !== undefined) {
            this.#data.message.updatedAt = data.message.updatedAt;
        }
    }

    /** Retrieve interaction message's member.
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
            if (message instanceof Message && message?.guildID && message.memberID) {
                const restMember =
                  this.client.rest.guilds.getMember(message.guildID, message.memberID);
                void this.setCache(restMember);
                return restMember as T extends Guild ? Member : Member | Promise<Member> | undefined;
            }
            return undefined as T extends Guild ? Member : undefined;
        }
    }

    /** Create a follow-up message that replies to the original response.
     * (use CommandInteraction#createMessage if the interaction has not been acknowledged).
     * @param options Message options.
     */
    async createFollowup(options: CreateMessageOptions): Promise<Message<T>> {
        if (!this.acknowledged || !this.originalID)
            throw new Error(
                "Interaction has not been acknowledged, " +
              "please acknowledge the message using the createMessage method."
            );

        if (!options.replyMessageIDs) {
            options.replyMessageIDs = [this.id];
        } else if (!options.replyMessageIDs.includes(this.id)) {
            options.replyMessageIDs.push(this.id);
        }

        if (options.replyMessageIDs?.includes(this.id)) {
            options.replyMessageIDs[options.replyMessageIDs.length - 1] = this.originalID;
        }

        if (!options.isPrivate && this.isPrivate) options.isPrivate = true;

        const response =
          await this.client.rest.channels.createMessage<T>(
              this.channelID,
              options,
              {
                  originals: {
                      triggerID:  this.id,
                      responseID: this.originalID
                  },
                  acknowledged: true
              }
          );

        this._lastMessageID = response.id as string;
        if (!(this.originalID)) this.originalID = response.id;
        return response;
    }

    /** This method is used to create a message following this interaction
     * (use CommandInteraction#createFollowup on already acknowledged interactions).
     * @param options Message options.
     */
    async createMessage(options: CreateMessageOptions): Promise<Message<T>> {
        if (this.acknowledged)
            throw new Error(
                "Interaction has already been acknowledged, " +
          "please use the createFollowup method."
            );

        const idToUse = this.id;
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
                      triggerID:  this.id,
                      responseID: this.originalID
                  },
                  acknowledged: true
              }
          );
        this._lastMessageID = response.id as string;
        this.acknowledged = true;
        if (!(this.originalID)) this.originalID = response.id;
        return response;
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
                    triggerID:  this.id,
                    responseID: this.originalID
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
                    triggerID:  this.id,
                    responseID: this.originalID
                }
            }
        );
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
                    triggerID:  this.id,
                    responseID: this.originalID
                }
            }
        );
    }

    override toJSON(): JSONCommandInteraction {
        return {
            ...super.toJSON(),
            guildID:         this.guildID,
            channelID:       this.channelID,
            replyMessageIDs: this.replyMessageIDs,
            isPrivate:       this.isPrivate,
            isSilent:        this.isSilent,
            createdAt:       this.createdAt,
            memberID:        this.memberID,
            _lastMessageID:  this._lastMessageID,
            originalID:      this.originalID,
            acknowledged:    this.acknowledged,
            data:            this.data
        };
    }
}
