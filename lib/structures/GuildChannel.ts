/** @module GuildChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";

import { Base } from "./Base";
import type { Channel } from "./Channel";
import type { EditChannelOptions, JSONGuildChannel, RawChannel } from "../types";

/** Represents a guild channel. */
export class GuildChannel extends Base<string> {
    /** When the channel was last archived. */
    archivedAt: Date | null;
    /** ID of the member that archived the channel (if archived) */
    archivedBy: string | null;
    /** ID of the category the channel is in. */
    categoryID: number | null;
    /** When this channel was created. */
    createdAt: Date;
    /** ID of the member who created this channel. */
    creatorID: string;
    /** Channel description */
    description: string | null;
    /** Timestamp at which this channel was last edited. */
    editedTimestamp: Date | null;
    /** ID of the group the channel is in. */
    groupID: string;
    /** Guild ID */
    guildID: string;
    /** If the channel is public, this boolean is set to true. */
    isPublic: boolean;
    /** Channel name */
    name: string;
    /** ID of the parent category. */
    parentID: string | null;
    /** Channel type */
    type: string;
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
    constructor(data: RawChannel, client: Client) {
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

    protected override update(data: RawChannel): void {
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
        if (data.visibility) {
            this.visibility = data.visibility;
            this.isPublic = data.visibility === "public";
        }
    }

    /** Archive the channel */
    async archive(): Promise<void>{
        return this.client.rest.channels.archive(this.id as string);
    }

    /** Delete the channel. */
    async delete(): Promise<void>{
        return this.client.rest.channels.delete(this.id as string);
    }
    /** Edit the channel. */
    async edit(options: EditChannelOptions): Promise<Channel>{
        return this.client.rest.channels.edit(this.id as string, options);
    }
    /** Restore the archived channel */
    async restore(): Promise<void>{
        return this.client.rest.channels.restore(this.id as string);
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
}
