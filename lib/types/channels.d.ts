/** @module Types/Channels */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Message } from "../structures/Message";
import type { GuildChannel } from "../structures/GuildChannel";
import type { TextChannel } from "../structures/TextChannel";
import type { ForumChannel } from "../structures/ForumChannel";
import type { DocChannel } from "../structures/DocChannel";
import type { CalendarChannel } from "../structures/CalendarChannel";
import type { AnnouncementChannel } from "../structures/AnnouncementChannel";
import type {
    APIChatMessage,
    APIEmbedField,
    APIForumTopic,
    APIForumTopicSummary,
    APIGuildChannel,
    APIAnnouncement,
    APIAnnouncementComment,
    APICalendarEventRSVPStatuses,
    APICalendarEvent,
    APICalendarEventComment,
    APIDoc,
    APICalendarEventRSVP,
    APIForumTopicComment,
    APIListItem,
    APIListItemSummary,
    APIEmbedOptions,
    APIMentions,
    Permissions,
    APIAnnouncementCommentReaction,
    APICalendarEventCommentReaction,
    APIDocCommentReaction,
    APIForumTopicCommentReaction,
    APIForumTopicReaction,
    APIListItemNote,
    APIListItemNoteSummary,
    APIDocComment,
    APIEmote
} from "guildedapi-types.ts/v1";

export type RawChannel = APIGuildChannel;
export type RawAnnouncement = APIAnnouncement;
export type RawAnnouncementComment = APIAnnouncementComment;
export type RawAnnouncementCommentReaction = APIAnnouncementCommentReaction;
export type RawCalendarEvent = APICalendarEvent;
export type RawCalendarRSVP = APICalendarEventRSVP;
export type RawCalendarComment = APICalendarEventComment;
export type RawCalendarCommentReaction = APICalendarEventCommentReaction;
export type CalendarRSVPStatus = APICalendarEventRSVPStatuses;
export type RawMessage = APIChatMessage;
export type RawForumThread = APIForumTopic;
export type RawPartialForumThread = APIForumTopicSummary;
export type RawForumThreadReaction = APIForumTopicReaction;
export type RawForumThreadComment = APIForumTopicComment;
export type RawForumThreadCommentReaction = APIForumTopicCommentReaction;
export type RawDoc = APIDoc;
export type RawDocComment = APIDocComment;
export type RawDocCommentReaction = APIDocCommentReaction;
export type RawListItem = APIListItem;
export type RawPartialListItem = APIListItemSummary;
export type RawListItemNote = APIListItemNote;
export type RawPartialListItemNote = APIListItemNoteSummary;
export type RawEmbed = APIEmbedOptions;
export type RawEmote = APIEmote;
export type RawMentions = APIMentions;

export interface MessageConstructorParams {
    acknowledged?: boolean;
    originals?: {
        responseID?: string | null;
        triggerID?: string | null;
    };
}

export interface MessageAttachment {
    arrayBuffer: ArrayBuffer | null;
    fileExtension: string;
    isImage: boolean;
    originalURL: string;
    signedURL: string | null;
}

export interface MessageOriginals {
    originalResponse: Message<AnyTextableChannel> | null;
    triggerMessage: Message<AnyTextableChannel> | null;
}

export interface CreateMessageOptions {
    /** The content of the message (min length 1; max length 4000) */
    content?: string;
    /** Embeds */
    embeds?: Array<Embed>;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    hiddenLinkPreviewURLs?: Array<string>;
    /** If set, this message will only be seen by those mentioned or replied to */
    isPrivate?: boolean;
    /** If set, this message will not notify any mentioned users or roles (default `false`) */
    isSilent?: boolean;
    /** Message IDs to reply to (min items 1; max items 5) */
    replyMessageIDs?: Array<string>;
}

export interface EditMessageOptions {
    /** The content of the message (min length 1; max length 4000) */
    content?: string;
    /** Embeds */
    embeds?: Array<Embed>;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    hiddenLinkPreviewURLs?: Array<string>;
    // /** Message IDs to reply to (min items 1; max items 5) */
    // replyMessageIds?: Array<string>;
    // /** If set, this message will not notify any mentioned users or roles (default `false`) */
    // isSilent?: boolean;
    // /** If set, this message will only be seen by those mentioned or replied to */
    // isPrivate?: boolean;
}

export interface Embed {
    /** A small section above the title of the embed */
    author?: {
        /** URL of a small image to display to the left of the author's name (max length 1024) */
        iconURL?: string;
        /** Name of the author (max length 256) */
        name?: string;
        /** URL to linkify the author's name field (max length 1024; regex ^(?!attachment)) */
        url?: string;
    };
    /** Embed's color, decimal number (base 16),
     *
     * To convert to HEX use: `parseInt("HEX", 16)`,
     * don't forget to remove the hashtag.
     */
    color?: number ;
    /** Subtext of the embed (max length 2048) */
    description?: string;
    /** A small section at the bottom of the embed */
    /** Table-like cells to add to the embed (max items 25) */
    fields?: Array<APIEmbedField>;
    footer?: {
        /** URL of a small image to put in the footer (max length 1024) */
        iconURL?: string;
        /** Text of the footer (max length 2048) */
        text: string;
    };
    image?: {
        /** URL of the image (max length 1024) */
        url?: string;
    };
    /** An image to the right of the embed's content */
    thumbnail?: {
    /** URL of the image (max length 1024) */
        url?: string;
    };
    /** A timestamp to put in the footer */
    timestamp?: string;
    /** Main header of the embed (max length 256) */
    title?: string;
    /** URL to linkify the title field with (max length 1024; regex ^(?!attachment)) */
    url?: string;
    /** The main picture to associate with the embed */
}

export interface CreateChannelOptions {
    /** Place the channel in a specific category. */
    categoryID?: number;
    /** Description of the channel. */
    description?: string;
    /** Place the channel in a guild group. */
    groupID?: string;
    /** Set the channel as public or not. */
    isPublic?: boolean;
}

export interface EditChannelOptions {
    /** The description of the channel. Not applicable to threads (min length 1; max length 512) */
    description?: string;
    /** Whether the channel can be accessed from users who are not member of the server. Not applicable to threads */
    isPublic?: boolean;
    /** The name of the channel or thread (min length 1; max length 100) */
    name?: string;
}

export interface GetChannelMessagesFilter {
    /** Order will be reversed when compared to before or when omitting this parameter altogether */
    after?: string;
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** Whether to include private messages between all users in response (default `false`) */
    includePrivate?: boolean;
    /** The max size of the page (default `50`; min `1`; max `100`) */
    limit?: number;
}

export type PossiblyUncachedMessage = Message<AnyTextableChannel> | {
    /** ID of the channel where the message was sent. */
    channelID: string;
    /** When the message was deleted. */
    deletedAt: Date;
    /** ID of the server on which the message was sent. */
    guildID: string;
    /** The ID of the message. */
    id: string;
    /** If true, the message is private. */
    isPrivate: boolean | null;
};

export interface ChannelMessageReactionBulkRemove {
    /** The ID of the channel */
    channelID: string;
    /** The count of reactions that were removed */
    count: number;
    /** The ID of the user who deleted this reaction */
    deletedBy: string;
    /** If present, only reactions of this emote were bulk removed from the message */
    emote: RawEmote | null;
    /** The ID of the server */
    guildID: string;
    /** The ID of the message */
    messageID: string;
}

export interface ChannelRolePermission {
    /** The ID of the channel */
    channelID: string;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** ID of the Guild **/
    guildID: string;
    permission: Array<Permissions>;
    /** The ID of the role */
    roleID: number;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
}

export interface ChannelUserPermission {
    /** The ID of the channel */
    channelID: string;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** ID of the Guild **/
    guildID: string;
    permission: Array<Permissions>;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
    /** The ID of the role */
    userID: string;
}

export interface ChannelCategoryUserPermission {
    /** The ID of the channel */
    categoryID: number;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** ID of the Guild **/
    guildID: string;
    permission: Array<Permissions>;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
    /** The ID of the role */
    userID: string;
}

export interface ChannelCategoryRolePermission {
    /** The ID of the channel */
    categoryID: number;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** ID of the Guild **/
    guildID: string;
    permission: Array<Permissions>;
    /** The ID of the role */
    roleID: number;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
}

export type AnyTextableChannel = TextChannel;
export type AnyChannel = GuildChannel | TextChannel | ForumChannel | DocChannel | CalendarChannel | AnnouncementChannel;
export type AnyGuildChannel = Exclude<AnyChannel, GuildChannel>;

// FORUM CHANNEL
export interface CreateForumThreadOptions {
    /** Content of the thread. */
    content: string;
    /** Forum thread's title. */
    title: string;
}

export interface EditForumThreadOptions {
    /** New content of the thread. */
    content?: string;
    /** New forum thread's title. */
    title?: string;
}

export interface GetForumThreadsFilter {
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** Limit the number of threads that will output. */
    limit?: number;
}


export interface ConstructorForumThreadOptions {
    /** ID of the "Forums" channel containing this ForumThreadComment. */
    channelID?: string | null;
    /** ID of the forum channel's parent guild. */
    guildID?: string | null;
}

export interface CreateForumCommentOptions {
    /** Content of the comment. */
    content: string;
}

export interface EditForumCommentOptions {
    /** New content of the comment. */
    content?: string;
}

export interface ConstructorForumThreadOptions {
    /** ID of the "Forums" channel containing this ForumThreadComment. */
    channelID?: string | null;
    /** ID of the forum channel's parent guild. */
    guildID?: string | null;
}

export interface CreateForumCommentOptions {
    /** Content of the comment. */
    content: string;
}

export interface EditForumCommentOptions {
    /** New content of the comment. */
    content?: string;
}

export interface ConstructorForumThreadOptions {
    /** ID of the "Forums" channel containing this ForumThreadComment. */
    channelID?: string | null;
    /** ID of the forum channel's parent guild. */
    guildID?: string | null;
}

export interface CreateForumCommentOptions {
    /** Content of the comment. */
    content: string;
}

export interface EditForumCommentOptions {
    /** New content of the comment. */
    content?: string;
}

// DOC CHANNEL
export interface CreateDocOptions {
    /** Content of the doc. */
    content: string;
    /** Title of the doc. */
    title: string;
}

export interface EditDocOptions {
    /** New doc content. */
    content?: string;
    /** New doc title. */
    title?: string;
}

export interface GetDocsFilter {
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** The max size of the page (default `25`; min `1`; max `100`) */
    limit?: number;
}

export interface ConstructorDocCommentOptions {
    guildID?: string;
}

export interface CreateDocCommentOptions {
    /** The content of the doc comment (min length 1; max length 10000) */
    content: string;
}

export interface EditDocCommentOptions {
    /** The content of the doc comment (min length 1; max length 10000) */
    content: string;
}

// CALENDAR CHANNEL
export interface CreateCalendarEventOptions {
    /** When `rsvpLimit` is set, users from the waitlist will be added as space becomes available in the event */
    autofillWaitlist?: boolean;
    /** Event card's color. */
    color?: number;
    /** The description of the event. */
    description?: string;
    /** Event's duration in ms. */
    duration?: number;
    /** Does the event last all day? If passed with duration,
     * duration will only be applied if it is an interval of minutes represented in days (e.g., duration: 2880) */
    isAllDay?: boolean;
    /** If the event is private or not. */
    isPrivate?: boolean;
    /** The location where the event will happen. */
    location?: string;
    /** The name of the event. */
    name: string;
    /** The role IDs to restrict the event to (min items 1; must have unique items true) */
    roleIDs?: Array<number>;
    /** Limit of member joining this event. */
    rsvpLimit?: number;
    /** The event's starting date. */
    startsAt?: string;
    /** Link a URL to the event. */
    url?: string;
}

export interface EditCalendarEventOptions {
    /** When `rsvpLimit` is set, users from the waitlist will be added as space becomes available in the event */
    autofillWaitlist?: boolean;
    cancellation?: {
        /** The description of event cancellation (min length 1; max length 140) */
        description?: string;
    };
    /** Event card's color. */
    color?: number;
    /** The description of the event. */
    description?: string;
    /** Event's duration in ms. */
    duration?: number;
    /** Does the event last all day? If passed with duration, duration will only be applied if it is an interval of
     * minutes represented in days (e.g., duration: 2880) */
    isAllDay?: boolean;
    /** If the event is private or not. */
    isPrivate?: boolean;
    /** The location where the event will happen. */
    location?: string;
    /** The name of the event. */
    name?: string;
    /** The role IDs to restrict the event to (min items 1; must have unique items true) */
    roleIDs?: Array<number>;
    /** Limit of member joining this event. */
    rsvpLimit?: number;
    /** The event's starting date. */
    startsAt?: string;
    /** Link a URL to the event. */
    url?: string;
}

export interface GetCalendarEventsFilter {
    /** Order will be reversed when compared to before or when omitting this parameter altogether */
    after?: string;
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** Limit the number of calendar event that will output. (default `50`; min `1`; max `100`) */
    limit?: number;
}

export interface EditCalendarRSVPOptions {
    /** The status of the RSVP */
    status: CalendarRSVPStatus;
}

export interface CreateCalendarCommentOptions {
    /** The content of the comment. */
    content: string;
}

export interface EditCalendarCommentOptions {
    /** The new content of the comment. */
    content: string;
}

export interface ConstructorCalendarCommentOptions {
    guildID?: string;
}

