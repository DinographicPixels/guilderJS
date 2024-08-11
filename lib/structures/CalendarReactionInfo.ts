/** @module CalendarReactionInfo */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { ReactionInfo } from "./ReactionInfo";
import { Client } from "./Client";
import { CalendarChannel } from "./CalendarChannel";
import { CalendarReactionTypes } from "../types";
import { GatewayEvent_CalendarEventCommentReactionCreated, GatewayEvent_CalendarEventCommentReactionDeleted, GatewayEvent_CalendarEventReactionCreated, GatewayEvent_CalendarEventReactionDeleted } from "../Constants";

/** Information about a CalendarEvent's reaction. */
export class CalendarReactionInfo extends ReactionInfo {
    /** ID of the event where the reaction is added to. */
    eventID: number;
    /** ID of the event comment, if reaction was added/removed from a comment. */
    commentID: number | null;
    /** The type of the parent entity. */
    type: string;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(
        data: GatewayEvent_CalendarEventReactionCreated
        | GatewayEvent_CalendarEventReactionDeleted
        | GatewayEvent_CalendarEventCommentReactionCreated
        | GatewayEvent_CalendarEventCommentReactionDeleted,
        client: Client
    ){
        super(data, client);
        this.eventID = data.reaction.calendarEventId;
        this.commentID = data.reaction["calendarEventCommentId" as keyof object] ?? null;
        this.type = data.reaction["calendarEventCommentId" as keyof object] ? "comment" : "event";
    }

    /** The calendar event where the reaction has been added.
     * If the event is cached, it'll return a CalendarEvent component,
     * otherwise it'll return basic information about this event.
     */
    get event(): CalendarReactionTypes["event"] {
        return this.client.getChannel<CalendarChannel>(
            this.raw.serverId as string,
            this.raw.reaction.channelId
        )?.scheduledEvents.get(this.eventID)
          ?? {
              id:    this.eventID,
              guild: this.client.guilds.get(this.raw.serverId as string) ?? {
                  id: this.raw.serverId
              },
              channelID: this.raw.reaction.channelId
          };
    }
}
