/** @module Doc */
import { Client } from "./Client";
import { Member } from "./Member";
import { Base } from "./Base";

import { DocComment } from "./DocComment";
import {
    EditDocOptions,
    JSONDoc,
    RawDoc,
    RawDocComment,
    RawMentions
} from "../types";
import TypedCollection from "../util/TypedCollection";

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

/** Doc represents an item of a "Docs" channel. */
export class Doc extends Base<number> {
    /** Guild/server id */
    guildID: string;
    /** ID of the 'docs' channel. */
    channelID: string;
    /** Doc name */
    name: string;
    /** Content of the doc */
    content: string;
    /** Doc mentions  */
    mentions: RawMentions;
    /** When the doc has been created. */
    createdAt: Date;
    /** ID of the member who created this doc. */
    memberID: string;
    /** When the doc has been updated. */
    editedTimestamp: Date | null;
    /** ID of the member who updated the doc. */
    updatedBy: string | null;
    comments: TypedCollection<number, RawDocComment, DocComment>;

    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: RawDoc, client: Client) {
        super(data.id, client);
        this.guildID = data.serverId;
        this.channelID = data.channelId;
        this.name = data.title ?? null;
        this.content = data.content ?? null;
        this.mentions = data.mentions ?? {};
        this.createdAt = new Date(data.createdAt);
        this.memberID = data.createdBy;
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.updatedBy = data.updatedBy ?? null;
        this.comments = new TypedCollection(
            DocComment,
            client,
            client.params.collectionLimits?.docComments
        );
        this.update(data);
    }

    override toJSON(): JSONDoc {
        return {
            ...super.toJSON(),
            guildID:         this.guildID,
            channelID:       this.channelID,
            name:            this.name,
            content:         this.content,
            mentions:        this.mentions,
            createdAt:       this.createdAt,
            memberID:        this.memberID,
            editedTimestamp: this.editedTimestamp,
            updatedBy:       this.updatedBy
        };
    }

    protected override update(data: RawDoc): void {
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.content !== undefined) {
            this.content = data.content;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.memberID = data.createdBy;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.mentions !== undefined) {
            this.mentions = data.mentions;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.title !== undefined) {
            this.name = data.title;
        }
        if (data.updatedAt !== undefined) {
            this.editedTimestamp = new Date(data.updatedAt);
        }
        if (data.updatedBy !== undefined) {
            this.updatedBy = data.updatedBy;
        }
    }

    /** Retrieve the member who executed this action.
     * Note: If this doc has been edited, the updatedBy id will be used to get you the member.
     */
    get member(): Member | Promise<Member> {
        return this.client.getGuild(this.guildID)?.members.get(this.updatedBy ?? this.memberID)
          ?? this.client.rest.guilds.getMember(this.guildID, this.updatedBy ?? this.memberID);
    }
    /** Delete this doc. */
    async delete(): Promise<void> {
        return this.client.rest.channels.deleteDoc(this.channelID, this.id as number);
    }
    /** Edit this doc.
     * @param options Edit options.
     */
    async edit(options: EditDocOptions): Promise<Doc> {
        return this.client.rest.channels.editDoc(this.channelID, this.id as number, options);
    }


}
