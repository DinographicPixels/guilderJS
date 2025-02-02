/** @module CalendarEvent */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import type { Member } from "./Member";
import { Base } from "./Base";

import type { User } from "./User";
import { CalendarEventRSVP } from "./CalendarRSVP";
import { CalendarComment } from "./CalendarComment";
import type {
    EditCalendarEventOptions,
    JSONCalendarEvent,
    RawCalendarEvent,
    RawCalendarComment,
    RawCalendarRSVP,
    RawMentions
} from "../types";
import TypedCollection from "../util/TypedCollection";

/** CalendarEvent represents an event coming from a calendar channel. */
export class CalendarEvent extends Base<number> {
    /** Details about event cancellation (if canceled) */
    cancellation: RawCalendarEvent["cancellation"] | null;
    /** ID of the channel the event was created on. */
    channelID: string;
    /** Event color in calendar. */
    color: number | null;
    /** Cached Comments */
    comments: TypedCollection<number, RawCalendarComment, CalendarComment>;
    /** When the event was created. */
    createdAt: Date | null;
    /** Raw data */
    data: RawCalendarEvent;
    /** Event's description */
    description: string | null;
    /** Duration in *ms* of the event. */
    duration: number;
    /** Guild/server ID */
    guildID: string;
    /** If true, this event is private. */
    isPrivate: boolean;
    /** Event user-specified location */
    location: string | null;
    /** Mentions in this calendar event. */
    mentions: RawMentions | null;
    /** Name of the event */
    name: string;
    /** ID of the owner of this event. */
    ownerID: string;
    /** Limit of event entry. */
    rsvpLimit: number | null;
    /** Cached RSVPS. */
    rsvps: TypedCollection<number, RawCalendarRSVP, CalendarEventRSVP>;
    /** Timestamp (unix epoch time) of the event starting time.*/
    startsAt: Date | null;
    /** Event user-specified url */
    url: string | null;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: RawCalendarEvent, client: Client){
        super(data.id, client);
        this.data = data;
        this.id = data.id;
        this.guildID = data.serverId;
        this.channelID = data.channelId;
        this.name = data.name ?? null;
        this.description = data.description ?? null;
        this.location = data.location ?? null;
        this.url = data.url ?? null;
        this.color = data.color ?? null;
        this.rsvpLimit = data.rsvpLimit ?? null;
        this.startsAt = data.startsAt ? new Date(data.startsAt) : null;
        this.duration = data.duration ? data.duration * 60000 : NaN; // in ms.
        this.isPrivate = data.isPrivate ?? false;
        this.mentions = data.mentions ?? null;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
        this.ownerID = data.createdBy;
        this.cancellation = data.cancellation ?? null;
        this.rsvps = new TypedCollection(
            CalendarEventRSVP,
            client,
            client.params.collectionLimits?.scheduledEventsRSVPS
        );
        this.comments = new TypedCollection(
            CalendarComment,
            client,
            client.params.collectionLimits?.calendarComments
        );
        this.update(data);
    }

    protected override update(data: RawCalendarEvent): void {
        if (data.cancellation !== undefined) {
            this.cancellation = data.cancellation;
        }
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.color !== undefined) {
            this.color = data.color;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.ownerID = data.createdBy;
        }
        if (data.description !== undefined) {
            this.description = data.description;
        }
        if (data.duration !== undefined) {
            this.duration = data.duration;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.isPrivate !== undefined) {
            this.isPrivate = data.isPrivate;
        }
        if (data.location !== undefined) {
            this.location = data.location;
        }
        if (data.mentions !== undefined) {
            this.mentions = data.mentions;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.rsvpLimit !== undefined) {
            this.rsvpLimit = data.rsvpLimit;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.startsAt !== undefined) {
            this.startsAt = new Date(data.startsAt);
        }
        if (data.url !== undefined) {
            this.url = data.url;
        }
    }

    /** Retrieve the event's owner, if cached.
     *
     * Note: this getter can output: Member, User, Promise<Member> or undefined.
     */
    get owner(): Member | User | Promise<Member> | undefined {
        const guild = this.client.guilds.get(this.guildID);
        if (guild?.members?.get(this.ownerID) && this.ownerID){
            return guild?.members.get(this.ownerID);
        } else if (this.client.users.get(this.ownerID) && this.ownerID){
            return this.client.users.get(this.ownerID);
        } else if (this.ownerID && this.guildID){
            return this.client.rest.guilds.getMember(this.guildID, this.ownerID);
        }
    }

    /** Delete this event */
    async delete(): Promise<void>{
        return this.client.rest.channels.deleteCalendarEvent(this.channelID, this.id as number);
    }

    /** Edit this event */
    async edit(options: EditCalendarEventOptions): Promise<CalendarEvent>{
        return this.client.rest.channels.editCalendarEvent(
            this.channelID,
            this.id as number,
            options
        );
    }

    override toJSON(): JSONCalendarEvent {
        return {
            ...super.toJSON(),
            data:         this.data,
            id:           this.id,
            guildID:      this.guildID,
            channelID:    this.channelID,
            name:         this.name,
            description:  this.description,
            location:     this.location,
            url:          this.url,
            color:        this.color,
            rsvpLimit:    this.rsvpLimit,
            startsAt:     this.startsAt,
            duration:     this.duration,
            isPrivate:    this.isPrivate,
            mentions:     this.mentions,
            createdAt:    this.createdAt,
            ownerID:      this.ownerID,
            cancellation: this.cancellation,
            rsvps:        this.rsvps.map(rsvp => rsvp.toJSON())
        };
    }
}
