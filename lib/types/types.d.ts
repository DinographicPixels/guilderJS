/** @module Types */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { AnyTextableChannel, RawEmote, RawMentions } from "./channels";
import type { ForumThread } from "../structures/ForumThread";
import type { Guild } from "../structures/Guild";
import type { Member } from "../structures/Member";
import type { Message } from "../structures/Message";
import type { MessageReactionInfo } from "../structures/MessageReactionInfo";
import type { ForumThreadReactionInfo } from "../structures/ForumThreadReactionInfo";
import type { CalendarEvent } from "../structures/CalendarEvent";
import type { CalendarReactionInfo } from "../structures/CalendarReactionInfo";
import type { Doc } from "../structures/Doc";
import type { DocReactionInfo } from "../structures/DocReactionInfo";
import type { Announcement } from "../structures/Announcement";
import type { AnnouncementReactionInfo } from "../structures/AnnouncementReactionInfo";
import type { ForumChannel } from "../structures/ForumChannel";

export interface MessageReactionTypes {
    emoji: RawEmote;
    message: Message<AnyTextableChannel> | {
        channelID: string;
        guild: Guild | {
            id?: string;
        };
        id: string;
    };
    reactor: Member | {
        id: string;
    };
}

export interface ForumThreadReactionTypes {
    emoji: RawEmote;
    reactor: Member | {
        id: string;
    };
    thread: ForumThread<ForumChannel> | {
        channelID: string;
        guild: Guild | {
            id?: string;
        };
        id: number;
    };
}

export interface CalendarReactionTypes {
    emoji: RawEmote;
    event: CalendarEvent | {
        channelID: string;
        guild: Guild | {
            id?: string;
        };
        id: number;
    };
    reactor: Member | {
        id: string;
    };
}

export interface DocReactionTypes {
    doc: Doc | {
        channelID: string;
        guild: Guild | {
            id?: string;
        };
        id: number;
    };
    emoji: RawEmote;
    reactor: Member | {
        id: string;
    };
}

export interface AnnouncementReactionTypes {
    announcement: Announcement | {
        channelID: string;
        guild: Guild | {
            id?: string;
        };
        id: string;
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
        /** The Bot ID of this user. */
        appID: string;
        /** When the user was created. */
        createdAt: Date;
        /** The ID of this user. */
        id: string;
        /** The owner of this bot. */
        ownerID: string;
        /** The user */
        username: string;
    };
}

export interface ListItemNoteTypes {
    /** The content of the note. */
    content: string;
    /** Date of the note's creation. */
    createdAt: Date;
    /** ID of the member who edited this note, if edited. */
    editedBy: null | string;
    /** Date of the note's last edition, if edited. */
    editedTimestamp: null | Date;
    /** ID of the member who created this note. */
    memberID: string;
    /** The mentions in this note. */
    mentions: null | RawMentions;
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
    /** ID of the channel. */
    channelID: string;
    /** ID of the guild. */
    guildID: string;
    /** ID of the event series. */
    id: string;
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
