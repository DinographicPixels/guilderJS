/** @module ForumThreadComment */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { Base } from "./Base";
import type { Member } from "./Member";
import type {
    CreateForumCommentOptions,
    EditForumCommentOptions,
    ConstructorForumThreadOptions,
    JSONForumThreadComment,
    RawMentions,
    RawForumThreadComment
} from "../types";

/** Represents a comment coming from a ForumThread. */
export class ForumThreadComment extends Base<number> {
    /** The content of the forum thread comment */
    content: string;
    /** The ISO 8601 timestamp that the forum thread comment was created at */
    createdAt: Date;
    /** The ISO 8601 timestamp that the forum thread comment was updated at, if relevant */
    updatedAt: Date | null;
    /** The ID of the forum thread */
    threadID: number;
    /** The ID of the user who sent this comment. */
    memberID: string;
    /** ID of the forum thread's server, if provided. */
    guildID: string | null;
    /** ID of the forum channel containing this thread. */
    channelID: string;
    /** Mentions in this thread comment. */
    mentions: RawMentions | null;

    constructor(
        data: RawForumThreadComment,
        client: Client,
        options?: ConstructorForumThreadOptions
    ){
        super(data.id, client);
        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
        this.channelID = data.channelId;
        this.threadID = data.forumTopicId;
        this.memberID = data.createdBy;
        this.guildID = options?.guildID ?? null;
        this.mentions = data.mentions ?? null;
        this.update(data);
    }

    override toJSON(): JSONForumThreadComment {
        return {
            ...super.toJSON(),
            content:   this.content,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            channelID: this.channelID,
            threadID:  this.threadID,
            memberID:  this.memberID,
            guildID:   this.guildID,
            mentions:  this.mentions
        };
    }
    protected override update(data: RawForumThreadComment): void {
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
        if (data.forumTopicId !== undefined) {
            this.threadID = data.forumTopicId;
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
        this.guildID = this.toJSON().guildID;
    }

    /** Retrieve the member who sent this comment, if cached.
     * If there is no cached member, this will make a rest request which returns a Promise.
     * If the request fails, it'll return you undefined as a value.
     */
    get member(): Member | Promise<Member> | undefined {
        return this.client.getGuild(this.guildID as string)?.members.get(this.memberID)
        ?? this.guildID
            ? this.client.rest.guilds.getMember(this.guildID as string, this.memberID)
            : undefined;
    }


    /** Add a comment to the same forum thread as this comment.
     * @param options New comment's options.
     */
    async createForumComment(options: CreateForumCommentOptions): Promise<ForumThreadComment> {
        return this.client.rest.channels.createForumComment(
            this.channelID,
            this.threadID,
            options
        );
    }
    /** Add a reaction to the comment.
     * @param reaction The ID of the reaction to add.
     */
    async createReaction(reaction: number): Promise<void> {
        return this.client.rest.channels.createReactionToSubcategory(
            this.channelID,
            "ForumThreadComment",
            this.threadID,
            this.id,
            reaction
        );
    }
    /** Delete this forum thread comment. */
    async delete(): Promise<void>{
        return this.client.rest.channels.deleteForumComment(
            this.channelID,
            this.threadID,
            this.id as number
        );
    }
    /** Remove a reaction from the comment.
     * @param reaction The ID of the reaction to remove.
     */
    async deleteReaction(reaction: number): Promise<void> {
        return this.client.rest.channels.deleteReactionFromSubcategory(
            this.channelID,
            "ForumThreadComment",
            this.threadID,
            this.id,
            reaction
        );
    }
    /** Edit this forum thread's comment.
     * @param options Edit options.
     */
    async edit(options?: EditForumCommentOptions): Promise<ForumThreadComment>{
        return this.client.rest.channels.editForumComment(
            this.channelID,
            this.threadID,
            this.id as number,
            { content: options?.content }
        );
    }
}
