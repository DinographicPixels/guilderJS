/** @module CalendarChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";

import { CalendarEvent } from "./CalendarEvent";
import { GuildChannel } from "./GuildChannel";
import type { APICalendarEvent, APIGuildChannel, POSTCalendarEventBody } from "../Constants";
import TypedCollection from "../util/TypedCollection";
import { JSONCalendarChannel, CreateCalendarEventOptions, EditCalendarEventOptions } from "../types";

/** Represents a calendar channel. */
export class CalendarChannel extends GuildChannel {
    /** Cached scheduled events. */
    scheduledEvents: TypedCollection<number, APICalendarEvent, CalendarEvent>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: APIGuildChannel, client: Client){
        super(data, client);
        this.scheduledEvents = new TypedCollection(
            CalendarEvent,
            client,
            client.params.collectionLimits?.scheduledEvents
        );
        this.update(data);
    }

    /** Create an event in this channel.
     * @param options Event options.
     * @param createSeries (optional) Create a series. (event's repetition)
     */
    async createEvent(
        options: CreateCalendarEventOptions,
        createSeries?: POSTCalendarEventBody["repeatInfo"]
    ): Promise<CalendarEvent> {
        return this.client.rest.channels.createCalendarEvent(this.id, options, createSeries);
    }

    /** Edit an event from this channel.
     * @param eventID ID of a calendar event.
     * @param options Edit options.
     */
    async editEvent(eventID: number, options: EditCalendarEventOptions): Promise<CalendarEvent> {
        return this.client.rest.channels.editCalendarEvent(this.id, eventID, options);
    }

    /**
     * Edit an event series set in this channel.
     * @param eventID ID of the event.
     * @param seriesID ID of the series.
     * @param options Edit repetition options.
     */
    async editSeries(
        eventID: number,
        seriesID: string,
        options: POSTCalendarEventBody["repeatInfo"]
    ): Promise<void> {
        return this.client.rest.channels.editCalendarEventSeries(
            this.id,
            eventID,
            seriesID,
            options
        );
    }

    /**
     * Delete an event series set in this channel.
     * @param eventID ID of the event.
     * @param seriesID ID of the series.
     */
    async deleteSeries(eventID: number, seriesID: string): Promise<void> {
        return this.client.rest.channels.deleteCalendarEventSeries(this.id, eventID, seriesID);
    }

    /**
     * Delete an event from this channel.
     * @param eventID ID of the event to delete.
     */
    async deleteEvent(eventID: number): Promise<void> {
        return this.client.rest.channels.deleteCalendarEvent(this.id, eventID);
    }

    override toJSON(): JSONCalendarChannel {
        return {
            ...super.toJSON(),
            scheduledEvents: this.scheduledEvents.map(event => event.toJSON())
        };
    }
}
