/** @module GuildChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";

import { Base } from "./Base";
import { Channel } from "./Channel";
import { EditChannelOptions } from "../types/channel";
import type { APIGuildChannel } from "../Constants";
import { JSONGuildChannel } from "../types/json";

/** Represents a guild channel. */
export class GuildChannel extends Base<string> {
    /** Channel type */
    type: string;
    /** Channel name */
    name: string;
    /** Channel description */
    description: string | null;
    /** When this channel was created. */
    createdAt: Date;
    /** ID of the member who created this channel. */
    creatorID: string;
    /** Timestamp at which this channel was last edited. */
    editedTimestamp: Date | null;
    /** Server ID */
    guildID: string;
    /** ID of the parent category. */
    parentID: string | null;
    /** ID of the category the channel is in. */
    categoryID: number | null;
    /** ID of the group the channel is in. */
    groupID: string;
    isPublic: boolean;
    /** ID of the member that archived the channel (if archived) */
    archivedBy: string | null;
    /** When the channel was last archived. */
    archivedAt: Date | null;
    /** Channel visibility */
    visibility: string;
    // /** Cached messages. */
    // messages: TypedCollection<string, APIChatMessage, Message<AnyTextableChannel>>;
    // /** Cached threads. */
    // threads: TypedCollection<number, APIForumTopic, ForumThread<AnyTextableChannel>>;
    // /** Cached docs. */
    // docs: TypedCollection<number, APIDoc, Doc>;
    // /** Cached scheduled events. */
    // scheduledEvents: TypedCollection<number, APICalendarEvent, CalendarEvent>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: APIGuildChannel, client: Client){
        super(data.id, client);
        this.type = data.type;
        this.name = data.name;
        this.description = data.topic ?? null;
        this.createdAt = new Date(data.createdAt);
        this.creatorID = data.createdBy;
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.guildID = data.serverId;
        this.parentID = data.parentId ?? null;
        this.categoryID = data.categoryId ?? null;
        this.groupID = data.groupId;
        this.archivedBy = data.archivedBy ?? null;
        this.archivedAt = data.archivedAt ? new Date(data.archivedAt) : null;
        this.visibility = data.visibility ?? "public";
        this.isPublic = this.visibility === "public";
        // this.messages = new TypedCollection(Message, client, client.params.collectionLimits?.messages);
        // this.threads = new TypedCollection(ForumThread, client, client.params.collectionLimits?.threads);
        // this.docs = new TypedCollection(Doc, client, client.params.collectionLimits?.docs);
        // this.scheduledEvents = new TypedCollection(
        //   CalendarEvent,
        //   client,
        //   client.params.collectionLimits?.scheduledEvents
        // );
        this.update(data);
    }

    override toJSON(): JSONGuildChannel {
        return {
            ...super.toJSON(),
            type:            this.type,
            name:            this.name,
            description:     this.description,
            createdAt:       this.createdAt,
            creatorID:       this.creatorID,
            editedTimestamp: this.editedTimestamp,
            guildID:         this.guildID,
            parentID:        this.parentID,
            categoryID:      this.categoryID,
            groupID:         this.groupID,
            isPublic:        this.isPublic,
            archivedBy:      this.archivedBy,
            archivedAt:      this.archivedAt,
            visibility:      this.visibility
        };
    }

    protected override update(data: APIGuildChannel): void {
        if (data.archivedAt !== undefined) {
            this.archivedAt = new Date(data.archivedAt);
        }
        if (data.archivedBy !== undefined) {
            this.archivedBy = data.archivedBy;
        }
        if (data.categoryId !== undefined) {
            this.categoryID = data.categoryId;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.creatorID = data.createdBy;
        }
        if (data.groupId !== undefined) {
            this.groupID = data.groupId;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.isPublic !== undefined) {
            this.isPublic = data.isPublic;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.parentId !== undefined) {
            this.parentID = data.parentId;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.topic !== undefined) {
            this.description = data.topic;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.updatedAt !== undefined) {
            this.editedTimestamp = new Date(data.updatedAt);
        }
        if (data.visibility !== undefined) {
            this.visibility = data.visibility;
        }
    }

    /** Edit the channel. */
    async edit(options: EditChannelOptions): Promise<Channel>{
        return this.client.rest.guilds.editChannel(this.id as string, options);
    }

    /** Delete the channel. */
    async delete(): Promise<void>{
        return this.client.rest.guilds.deleteChannel(this.id as string);
    }

    /** Archive the channel */
    async archive(): Promise<void>{
        return this.client.rest.channels.archiveChannel(this.id as string);
    }

    /** Restore the archived channel */
    async restore(): Promise<void>{
        return this.client.rest.channels.restoreChannel(this.id as string);
    }
}
