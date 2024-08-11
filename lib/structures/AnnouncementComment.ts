/** @module AnnouncementComment */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Base } from "./Base";

import { Member } from "./Member";
import { PATCHChannelAnnouncementCommentBody, POSTChannelAnnouncementCommentBody } from "../Constants";
import { ConstructorCalendarCommentOptions, JSONAnnouncementComment, RawAnnouncementComment, RawMentions } from "../types";

/** AnnouncementComment represents a comment from an Announcement channel. */
export class AnnouncementComment extends Base<number> {
    /** Announcement content */
    content: string;
    /** The date when the comment was created. */
    createdAt: Date;
    /** The date when the comment was edited, if edited. */
    editedTimestamp: Date | null;
    /** ID of the member who sent this announcement. */
    memberID: string;
    /** ID of the channel where the comment is in. */
    channelID: string;
    /** ID of the parent announcement. */
    announcementID: string;
    /** Mentions */
    mentions: RawMentions | null;
    /** ID of the guild, if received. */
    guildID: string | null;
    /**
     * @param data raw data.
     * @param client client.
     * @param options Optional parameters that can be added
     */
    constructor(
        data: RawAnnouncementComment,
        client: Client,
        options?: ConstructorCalendarCommentOptions
    ) {
        super(data.id, client);
        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.memberID = data.createdBy;
        this.channelID = data.channelId;
        this.announcementID = data.announcementId;
        this.mentions = data.mentions ?? null;
        this.guildID = options?.guildID ?? null;
        this.update(data);
    }

    override toJSON(): JSONAnnouncementComment {
        return {
            ...super.toJSON(),
            content:         this.content,
            createdAt:       this.createdAt,
            editedTimestamp: this.editedTimestamp,
            memberID:        this.memberID,
            channelID:       this.channelID,
            announcementID:  this.announcementID,
            mentions:        this.mentions,
            guildID:         this.guildID
        };
    }

    protected override update(data: RawAnnouncementComment): void {
        if (data.announcementId !== undefined) {
            this.announcementID = data.announcementId;
        }
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
        if (data.updatedAt !== undefined) {
            this.editedTimestamp = new Date(data.updatedAt);
        }
    }


    /**
     * Retrieve the member who sent this comment, if cached.
     * If there is no cached member, this will make a rest request which returns a Promise.
     * If the request fails, it'll return undefined or throw an error that you can catch.
     */
    get member(): Member | Promise<Member> | undefined {
        if (this.guildID === null) throw new Error("Couldn't get member, API did not return guildID.");
        return this.client.getGuild(this.guildID as string)?.members
            .get(this.memberID)
        ?? this.guildID
            ? this.client.rest.guilds.getMember(this.guildID as string, this.memberID) : undefined;
    }

    /**
     * Edit this comment.
     * @param options Edit options
     */
    async edit(options: PATCHChannelAnnouncementCommentBody): Promise<AnnouncementComment> {
        return this.client.rest.channels.editAnnouncementComment(
            this.channelID,
            this.announcementID,
            this.id,
            options
        );
    }

    /**
     * Delete this comment.
     */
    async delete(): Promise<void> {
        return this.client.rest.channels.deleteAnnouncementComment(
            this.channelID,
            this.announcementID,
            this.id
        );
    }

    /**
     * Create a comment in the same announcement as this one.
     * @param options Create options.
     */
    async createComment(options: POSTChannelAnnouncementCommentBody): Promise<AnnouncementComment> {
        return this.client.rest.channels.createAnnouncementComment(
            this.channelID,
            this.announcementID,
            options
        );
    }

    /**
     * Add a reaction to this comment.
     * @param emoteID ID of the emote to add
     */
    async createReaction(emoteID: number): Promise<void> {
        return this.client.rest.channels.createReactionToSubcategory(
            this.channelID,
            "AnnouncementComment",
            this.announcementID,
            this.id,
            emoteID
        );
    }

    /**
     * Remove a reaction from this comment.
     * @param emoteID ID of the emote to remove
     */
    async deleteReaction(emoteID: number): Promise<void> {
        return this.client.rest.channels.deleteReactionFromSubcategory(
            this.channelID,
            "AnnouncementComment",
            this.announcementID,
            this.id,
            emoteID
        );
    }
}
