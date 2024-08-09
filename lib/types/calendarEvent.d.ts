
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { APICalendarEventRSVPStatuses } from "../Constants";

export interface CreateCalendarEventOptions {
    /** The name of the event. */
    name: string;
    /** The description of the event. */
    description?: string;
    /** The location where the event will happen. */
    location?: string;
    /** The event's starting date. */
    startsAt?: string;
    /** Link a URL to the event. */
    url?: string;
    /** Event card's color. */
    color?: number;
    /** Does the event last all day? If passed with duration,
     * duration will only be applied if it is an interval of minutes represented in days (e.g., duration: 2880) */
    isAllDay?: boolean;
    /** Limit of member joining this event. */
    rsvpLimit?: number;
    /** When `rsvpLimit` is set, users from the waitlist will be added as space becomes available in the event */
    autofillWaitlist?: boolean;
    /** Event's duration in ms. */
    duration?: number;
    /** If the event is private or not. */
    isPrivate?: boolean;
    /** The role IDs to restrict the event to (min items 1; must have unique items true) */
    roleIDs?: Array<number>;
}

export interface EditCalendarEventOptions {
    /** The name of the event. */
    name?: string;
    /** The description of the event. */
    description?: string;
    /** The location where the event will happen. */
    location?: string;
    /** The event's starting date. */
    startsAt?: string;
    /** Link a URL to the event. */
    url?: string;
    /** Event card's color. */
    color?: number;
    /** Does the event last all day? If passed with duration, duration will only be applied if it is an interval of
     * minutes represented in days (e.g., duration: 2880) */
    isAllDay?: boolean;
    /** Limit of member joining this event. */
    rsvpLimit?: number;
    /** When `rsvpLimit` is set, users from the waitlist will be added as space becomes available in the event */
    autofillWaitlist?: boolean;
    /** Event's duration in ms. */
    duration?: number;
    /** If the event is private or not. */
    isPrivate?: boolean;
    /** The role IDs to restrict the event to (min items 1; must have unique items true) */
    roleIDs?: Array<number>;
    cancellation?: {
        /** The description of event cancellation (min length 1; max length 140) */
        description?: string;
    };
}

export interface GetCalendarEventsFilter {
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** Order will be reversed when compared to before or when omitting this parameter altogether */
    after?: string;
    /** Limit the number of calendar event that will output. (default `50`; min `1`; max `100`) */
    limit?: number;
}

export interface EditCalendarRSVPOptions {
    /** The status of the RSVP */
    status: APICalendarEventRSVPStatuses;
}

export interface CreateCalendarCommentOptions {
    /** The content of the comment. */
    content: string;
}

export interface EditCalendarCommentOptions {
    /** The new content of the comment. */
    content: string;
}
