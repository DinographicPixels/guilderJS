/** @module ListItem */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import type { Member } from "./Member";
import { Base } from "./Base";
import type { ListItemNoteTypes, JSONListItem, RawMentions, RawListItem } from "../types";
import type { PATCHListItemBody } from "../Constants";

/** Represents an item of a "Lists" channel. */
export class ListItem extends Base<string> {
    /** Raw data */
    _data: RawListItem;
    /** Guild id */
    guildID: string;
    /** ID of the 'docs' channel. */
    channelID: string;
    /** Content of the doc */
    content: string;
    mentions: RawMentions | null;
    /** When the item was created. */
    createdAt: Date | null;
    /** ID of the member who created the doc. */
    memberID: string;
    /** ID of the webhook that created the list item (if it was created by a webhook) */
    webhookID: string | null;
    /** Timestamp at which the item was updated. */
    editedTimestamp: Date | null;
    /** ID of the member who updated the doc. (if updated) */
    updatedBy: string | null;
    /** The ID of the parent list item if this list item is nested */
    parentListItemID: string | null;
    /** When the list item was marked as "completed". */
    completedAt: Date | null;
    /** ID of the member that completed the item, if completed. */
    completedBy: string | null;

    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: RawListItem, client: Client){
        super(data.id, client);
        this._data = data;
        this.guildID = data.serverId;
        this.channelID = data.channelId;
        this.content = data.message ?? null;
        this.mentions = data.mentions ??  null;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
        this.memberID = data.createdBy;
        this.webhookID = data.createdByWebhookId ?? null;
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.updatedBy = data.updatedBy ?? null;
        this.parentListItemID = data.parentListItemId ?? null;
        this.completedAt = data.completedAt ? new Date(data.completedAt) : null;
        this.completedBy = data.completedBy ?? null;
        this.update(data);
    }

    override toJSON(): JSONListItem {
        return {
            ...super.toJSON(),
            guildID:          this.guildID,
            channelID:        this.channelID,
            content:          this.content,
            mentions:         this.mentions,
            createdAt:        this.createdAt,
            memberID:         this.memberID,
            webhookID:        this.webhookID,
            editedTimestamp:  this.editedTimestamp,
            updatedBy:        this.updatedBy,
            parentListItemID: this.parentListItemID,
            completedAt:      this.completedAt,
            completedBy:      this.completedBy
        };
    }

    protected override update(data: RawListItem): void {
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.completedAt !== undefined) {
            this.completedAt = new Date(data.completedAt);
        }
        if (data.completedBy !== undefined) {
            this.completedBy = data.completedBy;
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
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.mentions !== undefined) {
            this.mentions = data.mentions;
        }
        if (data.message !== undefined) {
            this.content = data.message;
        }
        if (data.note !== undefined) {
            this._data.note = data.note;
        }
        if (data.parentListItemId !== undefined) {
            this.parentListItemID = data.parentListItemId;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.updatedAt !== undefined) {
            this.editedTimestamp = new Date(data.updatedAt);
        }
        if (data.updatedBy !== undefined) {
            this.updatedBy = data.updatedBy;
        }
    }

    /** Retrieve the member who executed this action.
     *
     * Note: If the item has been edited, the updatedBy id will be used to get you the member.
     */
    get member(): Member | Promise<Member> {
        return this.client.getGuild(this.guildID)?.members.get(this.updatedBy ?? this.memberID)
          ?? this.client.rest.guilds.getMember(this.guildID, this.updatedBy ?? this.memberID);
    }
    get note(): ListItemNoteTypes | null {
        return this._data.note ? {
            createdAt:       new Date(this._data.note.createdAt),
            memberID:        this._data.note.createdBy,
            editedTimestamp: this._data.note.updatedAt ? new Date(this._data.note.updatedAt) : null,
            editedBy:        this._data.note.updatedBy ?? null,
            mentions:        this._data.note.mentions ?? null,
            content:         this._data.note.content
        } as ListItemNoteTypes : null;
    }


    /** Set this item as "complete". */
    async complete(): Promise<void> {
        return this.client.rest.channels.completeListItem(this.channelID, this.id as string);
    }
    /** Delete this item. */
    async delete(): Promise<void> {
        return this.client.rest.channels.deleteListItem(this.channelID, this.id as string);
    }
    /** Edit this item.
     * @param options Edit options.
     */
    async edit(
        options?: { content?: PATCHListItemBody["message"]; note?: PATCHListItemBody["note"]; }
    ): Promise<ListItem> {
        return this.client.rest.channels.editListItem(
            this.channelID,
            this.id as string,
            options
        );
    }

    /** Set this item as "incomplete". */
    async uncomplete(): Promise<void> {
        return this.client.rest.channels.uncompleteListItem(this.channelID, this.id as string);
    }
}
