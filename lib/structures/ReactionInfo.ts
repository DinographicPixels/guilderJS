/** @module ReactionInfo */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Member } from "./Member";
import type { Client } from "./Client";
import type {
    GatewayEvent_AnnouncementCommentReactionCreated,
    GatewayEvent_AnnouncementCommentReactionDeleted,
    GatewayEvent_AnnouncementReactionCreated,
    GatewayEvent_AnnouncementReactionDeleted,
    GatewayEvent_CalendarEventCommentReactionCreated,
    GatewayEvent_CalendarEventCommentReactionDeleted,
    GatewayEvent_CalendarEventReactionCreated,
    GatewayEvent_CalendarEventReactionDeleted,
    GatewayEvent_ChannelMessageReactionCreated,
    GatewayEvent_ChannelMessageReactionDeleted,
    GatewayEvent_DocCommentReactionCreated,
    GatewayEvent_DocCommentReactionDeleted,
    GatewayEvent_DocReactionCreated,
    GatewayEvent_DocReactionDeleted,
    GatewayEvent_ForumTopicReactionCreated,
    GatewayEvent_ForumTopicReactionDeleted
} from "../Constants";
import type { RawEmote } from "../types";

/** Default information every other reaction has. */
export class ReactionInfo {
    /** Channel where the reaction was added/removed. */
    channelID: string;
    client!: Client;
    /** Emote. */
    emoji: RawEmote;
    /** Guild ID */
    guildID: string | null;
    raw: GatewayEvent_ChannelMessageReactionCreated
    | GatewayEvent_ChannelMessageReactionDeleted
    | GatewayEvent_ForumTopicReactionCreated
    | GatewayEvent_ForumTopicReactionDeleted
    | GatewayEvent_CalendarEventReactionCreated
    | GatewayEvent_CalendarEventReactionDeleted
    | GatewayEvent_CalendarEventCommentReactionCreated
    | GatewayEvent_CalendarEventCommentReactionDeleted
    | GatewayEvent_DocReactionCreated
    | GatewayEvent_DocReactionDeleted
    | GatewayEvent_DocCommentReactionCreated
    | GatewayEvent_DocCommentReactionDeleted
    | GatewayEvent_AnnouncementReactionCreated
    | GatewayEvent_AnnouncementReactionDeleted
    | GatewayEvent_AnnouncementCommentReactionCreated
    | GatewayEvent_AnnouncementCommentReactionDeleted;
    /** ID of the user who added the reaction. */
    reactorID: string;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(
        data: GatewayEvent_ChannelMessageReactionCreated
        | GatewayEvent_ChannelMessageReactionDeleted
        | GatewayEvent_ForumTopicReactionCreated
        | GatewayEvent_ForumTopicReactionDeleted
        | GatewayEvent_CalendarEventReactionCreated
        | GatewayEvent_CalendarEventReactionDeleted
        | GatewayEvent_CalendarEventCommentReactionCreated
        | GatewayEvent_CalendarEventCommentReactionDeleted
        | GatewayEvent_DocReactionCreated
        | GatewayEvent_DocReactionDeleted
        | GatewayEvent_DocCommentReactionCreated
        | GatewayEvent_DocCommentReactionDeleted
        | GatewayEvent_AnnouncementReactionCreated
        | GatewayEvent_AnnouncementReactionDeleted
        | GatewayEvent_AnnouncementCommentReactionCreated
        | GatewayEvent_AnnouncementCommentReactionDeleted,
        client: Client
    ) {
        this.raw = data;
        this.channelID = data.reaction.channelId;
        this.guildID = data.serverId ?? null;
        this.reactorID = data.reaction.createdBy;
        this.emoji = {
            id:   data.reaction.emote.id,
            name: data.reaction.emote.name,
            url:  data.reaction.emote.url
        };
        Object.defineProperty(this, "client", {
            value:        client,
            enumerable:   false,
            writable:     false,
            configurable: false
        });
    }

    /** Cached member. If member isn't cached will return an object with the member's id. */
    get reactor(): Member | { id: string; } {
        return this.client.getGuild(this.raw.serverId as string)?.members
            .get(this.raw.reaction.createdBy)
          ?? {
              id: this.raw.reaction.createdBy
          };
    }
}
