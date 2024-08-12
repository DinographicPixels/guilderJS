/** @module DocComment */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Base } from "./Base";

import { Member } from "./Member";
import {
    JSONDocComment,
    ConstructorDocCommentOptions,
    CreateDocCommentOptions,
    EditDocCommentOptions,
    RawDocComment,
    RawMentions
} from "../types";

/** DocComment represents a doc comment coming from a Docs channel. */
export class DocComment extends Base<number> {
    /** Raw data */
    raw: RawDocComment;
    /** The content of the comment. */
    content: string;
    /** The date of the comment's creation. */
    createdAt: Date;
    /** ID of the member who created this comment. */
    memberID: string;
    /** The date when the comment was last updated. */
    updatedAt: Date | null;
    /** ID of the channel the comment is in. */
    channelID: string;
    /** The ID of the doc the comment is in. */
    docID: number;
    /** Mentions. */
    mentions: RawMentions | null;
    /** ID of the guild, if provided. */
    guildID: string | null;

    /**
     * @param data raw data.
     * @param client client.
     * @param options Additional properties that can be added.
     */
    constructor(data: RawDocComment, client: Client, options?: ConstructorDocCommentOptions) {
        super(data.id, client);
        this.raw = data;
        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.memberID = data.createdBy;
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
        this.channelID = data.channelId;
        this.docID = data.docId;
        this.mentions = data.mentions ?? null;
        this.guildID = options?.guildID ?? null;
        this.update(data);
    }

    override toJSON(): JSONDocComment {
        return {
            ...super.toJSON(),
            raw:       this.raw,
            content:   this.content,
            createdAt: this.createdAt,
            memberID:  this.memberID,
            updatedAt: this.updatedAt,
            channelID: this.channelID,
            docID:     this.docID,
            mentions:  this.mentions,
            guildID:   this.guildID
        };
    }

    protected override update(data: RawDocComment): void {
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
        if (data.docId !== undefined) {
            this.docID = data.docId;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.mentions !== undefined) {
            this.mentions = data.mentions;
        }
        if (data.updatedAt !== undefined) {
            this.updatedAt = new Date(data.updatedAt);
        }
    }

    /** Retrieve the member who sent this comment, if cached.
     * If there is no cached member, this will make a rest request which returns a Promise.
     * If the request fails, it'll return undefined or throw an error that you can catch.
     */
    get member(): Member | Promise<Member> | undefined {
        if (this.guildID === null) throw new Error("Couldn't get member, API did not return guildID.");
        return this.client.getGuild(this.guildID as string)?.members.get(this.memberID)
        ?? this.guildID
            ? this.client.rest.guilds.getMember(this.guildID as string, this.memberID) : undefined;
    }
    /** Create a comment in the same doc as this one.
     * @param options Create options.
     */
    async createDocComment(options: CreateDocCommentOptions): Promise<DocComment> {
        return this.client.rest.channels.createDocComment(this.channelID, this.docID, options);
    }
    /** Add a reaction to this comment.
     * @param reaction ID of the reaction to add.
     */
    async createReaction(reaction: number): Promise<void> {
        return this.client.rest.channels.createReactionToSubcategory(
            this.channelID,
            "DocComment",
            this.docID,
            this.id,
            reaction
        );
    }
    /** Delete this comment */
    async delete(): Promise<void>{
        return this.client.rest.channels.deleteDocComment(this.channelID, this.docID, this.id);
    }
    /** Remove a reaction from this comment.
     * @param reaction ID of the reaction to remove.
     */
    async deleteReaction(reaction: number): Promise<void> {
        return this.client.rest.channels.deleteReactionFromSubcategory(
            this.channelID,
            "DocComment",
            this.docID,
            this.id,
            reaction
        );
    }
    /** Edit this comment */
    async edit(options: EditDocCommentOptions): Promise<DocComment>{
        return this.client.rest.channels.editDocComment(
            this.channelID,
            this.docID,
            this.id,
            options
        );
    }


}
