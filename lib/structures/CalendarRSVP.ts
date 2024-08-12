/** @module CalendarRSVP */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Base } from "./Base";
import { JSONCalendarRSVP, EditCalendarRSVPOptions, RawCalendarRSVP, CalendarRSVPStatus } from "../types";

/** CalendarEventRSVP represents a guild member's event RSVP.
 * It gives information about a member's set presence to an event.
 */
export class CalendarEventRSVP extends Base<number> {
    /** Raw data */
    #data: RawCalendarRSVP;
    /** Guild/server ID. */
    guildID: string;
    /** Calendar channel id. */
    channelID: string;
    /** ID of the entity assigned to this Event RSVP. */
    entityID: string;
    /** Status of the RSVP */
    status: CalendarRSVPStatus;
    /** When the RSVP was created. */
    createdAt: Date | null;
    /** ID of the user who created this RSVP. */
    creatorID: string;
    /** When the RSVP was updated. */
    updatedAt: Date | null;
    /** ID of the member who updated the rsvp, if updated. */
    updatedBy?: string | null;

    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: RawCalendarRSVP, client: Client){
        super(data.calendarEventId, client);
        this.#data = data;
        this.guildID = data.serverId;
        this.channelID = data.channelId;
        this.entityID = data.userId;
        this.status = data.status;
        this.creatorID = data.createdBy ?? null;
        this.updatedBy = data.updatedBy ?? null;
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
        this.createdAt = data.createdAt ? new Date(data.createdAt) : null;
        this.update(data);
    }

    override toJSON(): JSONCalendarRSVP {
        return {
            ...super.toJSON(),
            guildID:   this.guildID,
            channelID: this.channelID,
            entityID:  this.entityID,
            status:    this.status,
            creatorID: this.creatorID,
            updatedBy: this.updatedBy,
            updatedAt: this.updatedAt,
            createdAt: this.createdAt
        };
    }
    protected override update(data: RawCalendarRSVP): void {
        if (data.calendarEventId !== undefined) {
            this.id = data.calendarEventId;
        }
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.creatorID = data.createdBy;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.status !== undefined) {
            this.status = data.status;
        }
        if (data.updatedAt !== undefined) {
            this.updatedAt = new Date(data.updatedAt);
        }
        if (data.updatedBy !== undefined) {
            this.updatedBy = data.updatedBy;
        }
        if (data.userId !== undefined) {
            this.entityID = data.userId;
        }
    }
    /** Delete this RSVP. */
    async delete(): Promise<void>{
        return this.client.rest.channels.deleteCalendarRSVP(
            this.channelID,
            this.id as number,
            this.entityID
        );
    }

    /** Edit this RSVP. */
    async edit(options: EditCalendarRSVPOptions): Promise<CalendarEventRSVP>{
        return this.client.rest.channels.editCalendarRSVP(
            this.channelID,
            this.id as number,
            this.entityID,
            options
        );
    }
}
