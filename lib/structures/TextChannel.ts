/** @module TextChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";

import { Message } from "./Message";
import { GuildChannel } from "./GuildChannel";
import { Permission } from "./Permission";
import { AnyTextableChannel, EditMessageOptions } from "../types/channel";
import type {
    APIChatMessage,
    APIGuildChannel,
    APIMessageOptions,
    PATCHChannelRolePermissionBody,
    POSTChannelRolePermissionBody
} from "../Constants";
import TypedCollection from "../util/TypedCollection";
import { JSONTextChannel } from "../types/json";

/** Represents a guild channel where you can chat with others. */
export class TextChannel extends GuildChannel {
    /** Cached messages. */
    messages: TypedCollection<string, APIChatMessage, Message<AnyTextableChannel>>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: APIGuildChannel, client: Client){
        super(data, client);
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
    async createMessage(options: APIMessageOptions): Promise<Message<TextChannel>> {
        return this.client.rest.channels.createMessage<TextChannel>(this.id, options);
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

    /** Delete a message from this channel.
     * @param messageID ID of the message to delete.
     */
    async deleteMessage(messageID: string): Promise<void> {
        return this.client.rest.channels.deleteMessage(this.id, messageID);
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

    override toJSON(): JSONTextChannel {
        return {
            ...super.toJSON(),
            messages: this.messages.map(message => message.toJSON())
        };
    }
}
