/** @module CalendarEventComment */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Base } from "./Base";

import { Member } from "./Member";
import { APICalendarEventComment } from "../Constants";
import { CreateCalendarCommentOptions, EditCalendarCommentOptions, JSONCalendarEventComment, ConstructorCalendarEventCommentOptions } from "../types";

/** CalendarEventComment represents an event comment coming from a calendar channel. */
export class CalendarEventComment extends Base<number> {
    /** Raw data */
    data: APICalendarEventComment;
    /** This property isn't always provided by the Guilded API, the value can be null,
     * which disable the ability to get member through this class. */
    guildID: string | null;
    /** The content of the comment. */
    content: string;
    /** The ISO 8601 timestamp that this comment was created at. */
    createdAt: Date;
    /** The ISO 8601 timestamp that this comment was updated at. */
    updatedAt: Date | null;
    /** The ID of the event containing this comment. (parent) */
    eventID: number;
    /** The ID of the channel containing this comment. */
    channelID: string;
    /** The ID of the member who sent this comment. */
    memberID: string;
    /**
     * @param data raw data.
     * @param client client.
     * @param options Additional properties that can be added.
     */
    constructor(
        data: APICalendarEventComment,
        client: Client,
        options?: ConstructorCalendarEventCommentOptions
    ) {
        super(data.id, client);
        this.data = data;
        this.guildID = options?.guildID ?? null;
        this.content = data.content;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
        this.eventID = Number(data.calendarEventId);
        this.channelID = data.channelId;
        this.memberID = data.createdBy;
        this.update(data);
    }

    override toJSON(): JSONCalendarEventComment {
        return {
            ...super.toJSON(),
            data:      this.data,
            content:   this.content,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            eventID:   this.eventID,
            channelID: this.channelID,
            memberID:  this.memberID
        };
    }

    protected override update(data: APICalendarEventComment): void {
        if (data.calendarEventId !== undefined) {
            this.eventID = Number(data.calendarEventId);
        }
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.content !== undefined) {
            this.content = data.content;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(this.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.memberID = data.createdBy;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.updatedAt !== undefined) {
            this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
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

    /** Create a comment in the same event as this one.
     * @param options Create options.
     */
    async createCalendarComment(options: CreateCalendarCommentOptions): Promise<CalendarEventComment> {
        return this.client.rest.channels.createCalendarComment(
            this.channelID,
            this.eventID,
            options
        );
    }

    /** Add a reaction to this comment.
     * @param reaction ID of the reaction to add.
     */
    async createReaction(reaction: number): Promise<void> {
        return this.client.rest.channels.createReactionToSubcategory(
            this.channelID,
            "CalendarEventComment",
            this.eventID,
            this.id,
            reaction
        );
    }

    /** Remove a reaction from this comment.
     * @param reaction ID of the reaction to remove.
     */
    async deleteReaction(reaction: number): Promise<void> {
        return this.client.rest.channels.deleteReactionFromSubcategory(
            this.channelID,
            "CalendarEventComment",
            this.eventID,
            this.id,
            reaction
        );
    }

    /** Edit this comment */
    async edit(options: EditCalendarCommentOptions): Promise<CalendarEventComment>{
        return this.client.rest.channels.editCalendarComment(
            this.channelID,
            this.eventID,
            this.id,
            options
        );
    }

    /** Delete this comment */
    async delete(): Promise<void>{
        return this.client.rest.channels.deleteCalendarComment(
            this.channelID,
            this.eventID,
            this.id
        );
    }
}
