/** @module Types */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RawEmote, RawMentions } from "./channels";
import { ForumThread } from "../structures/ForumThread";
import { Guild } from "../structures/Guild";
import { Member } from "../structures/Member";
import { Message } from "../structures/Message";
import type { MessageReactionInfo } from "../structures/MessageReactionInfo";
import type { ForumThreadReactionInfo } from "../structures/ForumThreadReactionInfo";
import { CalendarEvent } from "../structures/CalendarEvent";
import { CalendarReactionInfo } from "../structures/CalendarReactionInfo";
import { Doc } from "../structures/Doc";
import { DocReactionInfo } from "../structures/DocReactionInfo";
import { Announcement } from "../structures/Announcement";
import type { AnnouncementReactionInfo } from "../structures/AnnouncementReactionInfo";

export interface MessageReactionTypes {
    message: Message | {
        id: string;
        guild: Guild | {
            id?: string;
        };
        channelID: string;
    };
    emoji: RawEmote;
    reactor: Member | {
        id: string;
    };
}

export interface ForumThreadReactionTypes {
    thread: ForumThread | {
        id: number;
        guild: Guild | {
            id?: string;
        };
        channelID: string;
    };
    emoji: RawEmote;
    reactor: Member | {
        id: string;
    };
}

export interface CalendarReactionTypes {
    event: CalendarEvent | {
        id: number;
        guild: Guild | {
            id?: string;
        };
        channelID: string;
    };
    emoji: RawEmote;
    reactor: Member | {
        id: string;
    };
}

export interface DocReactionTypes {
    doc: Doc | {
        id: number;
        guild: Guild | {
            id?: string;
        };
        channelID: string;
    };
    emoji: RawEmote;
    reactor: Member | {
        id: string;
    };
}

export interface AnnouncementReactionTypes {
    announcement: Announcement | {
        id: string;
        guild: Guild | {
            id?: string;
        };
        channelID: string;
    };
    emoji: RawEmote;
    reactor: Member | {
        id: string;
    };
}

/** @deprecated No longer used. */
export interface UserClientTypes {
    /** Client's user. */
    user: {
        /** The ID of this user. */
        id: string;
        /** The Bot ID of this user. */
        appID: string;
        /** The user */
        username: string;
        /** When the user was created. */
        createdAt: Date;
        /** The owner of this bot. */
        ownerID: string;
    };
}

export interface ListItemNoteTypes {
    /** Date of the note's creation. */
    createdAt: Date;
    /** ID of the member who created this note. */
    memberID: string;
    /** Date of the note's last edition, if edited. */
    editedTimestamp: null | Date;
    /** ID of the member who edited this note, if edited. */
    editedBy: null | string;
    /** The mentions in this note. */
    mentions: null | RawMentions;
    /** The content of the note. */
    content: string;
}

/** DEPRECATED, use SocialLink. */
export interface GetSocialLink {
    memberUsername: string;
    serviceID: string;
    type: string;
}

export interface GuildCreateInfo {
    guild: Guild;
    /** The ID of the member who invited the client to the guild. */
    inviterID: string;
}

export interface GuildDeleteInfo {
    guild: Guild;
    /** The ID of the member who removed the client. */
    removerID: string;
}

/** [The CalendarEventSeries model from the Guilded API](https://www.guilded.gg/docs/api/calendarEventSeries/CalendarEventSeries) */
export interface CalendarEventSeries {
    /** ID of the event series. */
    id: string;
    /** ID of the guild. */
    guildID: string;
    /** ID of the channel. */
    channelID: string;
}

export interface UserStatus {
    content: string | null;
    emoteID: number;
}

export interface UserStatusDelete {
    userID: string;
    userStatus: UserStatus;
}

export interface UserStatusCreate extends UserStatusDelete {
    expiresAt: string | null;
}

export type AnyReactionInfo = MessageReactionInfo
| ForumThreadReactionInfo | CalendarReactionInfo | DocReactionInfo | AnnouncementReactionInfo;
export interface Uncached<ID = string | number> { id: ID; }
