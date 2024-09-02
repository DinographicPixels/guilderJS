/** @module TextChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";

import { Message } from "./Message";
import { GuildChannel } from "./GuildChannel";
import type { Permission } from "./Permission";
import { CommandInteraction } from "./CommandInteraction";
import type {
    AnyTextableChannel,
    InteractionConstructorParams,
    CommandInteractionData,
    CreateMessageOptions,
    EditMessageOptions,
    JSONTextChannel,
    MessageConstructorParams,
    RawChannel,
    RawMessage
} from "../types";
import type { PATCHChannelRolePermissionBody, POSTChannelRolePermissionBody } from "../Constants";
import TypedCollection from "../util/TypedCollection";

/** Represents a guild channel where you can chat with others. */
export class TextChannel extends GuildChannel {
    /** Cached interactions. */
    interactions: TypedCollection<
    string,
    CommandInteractionData,
    CommandInteraction<AnyTextableChannel>,
    [params?: InteractionConstructorParams]
    >;
    /** Cached messages. */
    messages: TypedCollection<string, RawMessage, Message<AnyTextableChannel>, [params?: MessageConstructorParams]>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: RawChannel, client: Client){
        super(data, client);
        this.interactions = new TypedCollection(
            CommandInteraction,
            client,
            client.params.collectionLimits?.interactions
        );
        this.messages = new TypedCollection(
            Message,
            client,
            client.params.collectionLimits?.messages
        );
        this.update(data);
    }

    /** Create a message in this channel.
     * @param options Message options.
     */
    async createMessage(options: CreateMessageOptions): Promise<Message<TextChannel>> {
        return this.client.rest.channels.createMessage<TextChannel>(this.id, options);
    }

    /** Create Channel Role Permissions
     * @param targetID ID of the target object (role or user) to assign the permission to.
     * @param options Create options.
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async createPermission(
        targetID: string | number,
        options: POSTChannelRolePermissionBody
    ): Promise<Permission> {
        return this.client.rest.channels.createPermission(
            this.guildID,
            this.id,
            targetID,
            options
        );
    }

    /** Delete a message from this channel.
     * @param messageID ID of the message to delete.
     */
    async deleteMessage(messageID: string): Promise<void> {
        return this.client.rest.channels.deleteMessage(this.id, messageID);
    }

    /**
     * Delete an existing permission set on this channel.
     * @param targetID ID of the target object (role or user) the permission is assigned to.
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async deletePermission(targetID: string | number): Promise<void> {
        return this.client.rest.channels.deletePermission(
            this.guildID,
            this.id,
            targetID
        );
    }

    /** Edit a message from this channel.
     * @param messageID ID of the message to edit.
     * @param options Message options.
     */
    async editMessage(
        messageID: string,
        options: EditMessageOptions
    ): Promise<Message<TextChannel>> {
        return this.client.rest.channels.editMessage<TextChannel>(
            this.id,
            messageID,
            options
        );
    }

    /**
     * Edit a channel permission.
     * @param targetID ID of the target object (role or user) the permission is assigned to.
     * @param options Edit options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async editPermission(
        targetID: string | number,
        options: PATCHChannelRolePermissionBody
    ): Promise<Permission> {
        return this.client.rest.channels.editPermission(
            this.guildID,
            this.id,
            targetID,
            options
        );
    }

    override toJSON(): JSONTextChannel {
        return {
            ...super.toJSON(),
            interactions: this.interactions.map(interaction => interaction.toJSON()),
            messages:     this.messages.map(message => message.toJSON())
        };
    }
}
