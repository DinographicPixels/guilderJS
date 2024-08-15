
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type {
    RawCalendarEvent,
    RawCalendarComment,
    RawDocComment,
    RawEmbed,
    RawMentions,
    CalendarRSVPStatus
} from "./channels";
import type { Member } from "../structures/Member";
import type { User } from "../structures/User";
import type { Guild } from "../structures/Guild";
import type { UserTypes } from "../Constants";
import type { Permissions } from "guildedapi-types.ts/v1";
import type { SocialLinkType } from "guildedapi-types.ts/typings/schemas/v1";

export interface JSONBase<ID= string | number> {
    // createdAt: number;
    id: ID;
}

export interface JSONMessage extends JSONBase<string> {
    /** Message type. */
    type: string;
    /** ID of the server on which the message was sent. */
    guildID: string | null;
    /** ID of the channel on which the message was sent. */
    channelID: string;
    /** Content of the message. */
    content: string | null;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    hiddenLinkPreviewUrls?: Array<string>;
    /** Array of message embed. */
    embeds?: Array<RawEmbed> | [];
    /** The IDs of the message replied by the message. */
    replyMessageIds: Array<string>;
    /** If true, the message appears as private. */
    isPrivate: boolean;
    /** If true, the message didn't mention anyone. */
    isSilent: boolean;
    /** object containing all mentioned users. */
    mentions: RawMentions;
    /** ID of the message author. */
    memberID: string;
    /** ID of the webhook used to send this message. (if sent by a webhook) */
    webhookID?: string | null;
    /** When the message was created. */
    createdAt: Date;
    /** Timestamp at which this message was last edited. */
    editedTimestamp: Date | null;
    /** When the message was deleted. */
    deletedAt: Date | null;
}

export interface JSONForumThreadComment extends JSONBase<number> {
    /** The content of the forum thread comment */
    content: string;
    /** The ISO 8601 timestamp that the forum thread comment was created at */
    createdAt: Date;
    /** The ISO 8601 timestamp that the forum thread comment was updated at, if relevant */
    updatedAt: Date | null;
    /** The ID of the forum thread */
    threadID: number;
    /** The ID of the user who sent this comment. */
    memberID: string;
    /** ID of the forum thread's server, if provided. */
    guildID: string | null;
    /** ID of the forum channel containing this thread. */
    channelID: string;
    /** Mentions in this thread comment. */
    mentions: RawMentions | null;
}

export interface JSONDoc extends JSONBase<number> {
    /** Guild/server id */
    guildID: string;
    /** ID of the 'docs' channel. */
    channelID: string;
    /** Doc name */
    name: string;
    /** Content of the doc */
    content: string;
    /** Doc mentions  */
    mentions: RawMentions;
    /** When the doc has been created. */
    createdAt: Date;
    /** ID of the member who created this doc. */
    memberID: string;
    /** When the doc has been updated. */
    editedTimestamp: Date | null;
    /** ID of the member who updated the doc. */
    updatedBy: string | null;
}

export interface JSONChannel extends JSONBase<string> {
    /** Channel type */
    type: string;
    /** Channel name */
    name: string | null;
}

export interface JSONGuildChannel extends JSONBase<string> {
    /** Channel type */
    type: string;
    /** Channel name */
    name: string;
    /** Channel description */
    description: string | null;
    /** When this channel was created. */
    createdAt: Date;
    /** ID of the member who created this channel. */
    creatorID: string;
    /** Timestamp at which this channel was last edited. */
    editedTimestamp: Date | null;
    /** Server ID */
    guildID: string;
    /** ID of the parent category. */
    parentID: string | null;
    /** ID of the category the channel is in. */
    categoryID: number | null;
    /** ID of the group the channel is in. */
    groupID: string;
    isPublic: boolean;
    /** ID of the member that archived the channel (if archived) */
    archivedBy: string | null;
    /** When the channel was last archived. */
    archivedAt: Date | null;
    /** Channel visibility */
    visibility: string;
}

export interface JSONTextChannel extends JSONGuildChannel {
    /** Cached messages. */
    messages: Array<JSONMessage>;
}

export interface JSONForumChannel extends JSONGuildChannel {
    /** Cached threads. */
    threads: Array<JSONForumThread>;
}

export interface JSONDocChannel extends JSONGuildChannel {
    /** Cached docs. */
    docs: Array<JSONDoc>;
}

export interface JSONCalendarChannel extends JSONGuildChannel {
    /** Cached scheduled events. */
    scheduledEvents: Array<JSONCalendarEvent>;
}

export interface JSONAnnouncementChannel extends JSONGuildChannel {
    /** Cached messages. */
    announcements: Array<JSONAnnouncement>;
}

export type AnyJSONChannel = JSONTextChannel | JSONDocChannel | JSONForumChannel | JSONGuildChannel | JSONCalendarChannel;

export interface JSONCalendarEvent extends JSONBase<number> {
    /** Raw data */
    data: RawCalendarEvent;
    /** Guild/server ID */
    guildID: string;
    /** ID of the channel the event was created on. */
    channelID: string;
    /** Name of the event */
    name: string;
    /** Event's description */
    description: string | null;
    /** Event user-specified location */
    location: string | null;
    /** Event user-specified url */
    url: string | null;
    /** Event color in calendar. */
    color: number | null;
    /** Limit of event entry. */
    rsvpLimit: number | null;
    /** Timestamp (unix epoch time) of the event starting time.*/
    startsAt: Date | null;
    /** Duration in *ms* of the event. */
    duration: number;
    /** If true, this event is private. */
    isPrivate: boolean;
    /** Mentions in this calendar event. */
    mentions: RawMentions | null;
    /** When the event was created. */
    createdAt: Date | null;
    /** ID of the owner of this event. */
    ownerID: string;
    /** Details about event cancelation (if canceled) */
    cancellation: RawCalendarEvent["cancellation"] | null;
    /** Cached RSVPS. */
    rsvps: Array<JSONCalendarRSVP>;
}

export interface JSONCalendarRSVP extends JSONBase<number> {
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
}

export interface JSONBannedMember extends JSONBase<string> {
    /** Server ID. */
    guildID: string;
    /** Information about the banned member (object) */
    ban: {
        /** Reason of the ban */
        reason?: string;
        /** When the member has been banned. */
        createdAt: Date | null;
        /** ID of the member who banned this member. */
        bannedBy: string;
    };
}

export interface JSONForumThread extends JSONBase<number> {
    /** Guild/server id */
    guildID: string;
    /** Forum channel id */
    channelID: string;
    /** Name of the thread */
    name: string;
    /** When this forum thread was created. */
    createdAt: Date;
    /** Owner of this thread, if cached. */
    owner: T extends Guild ? Member : Member | User | Promise<Member> | undefined;
    /** The ID of the owner of this thread. */
    ownerID: string;
    /** Timestamp at which this channel was last edited. */
    editedTimestamp: Date | null;
    /** Timestamp (unix epoch time) that the forum thread was bumped at. */
    bumpedAt: Date | null;
    /** Content of the thread */
    content: string;
    /** Thread mentions */
    mentions: RawMentions | null;
    /** Cached comments. */
    comments: Array<JSONForumThreadComment>;
    /** If true, the thread is locked. */
    isLocked: boolean;
    /** If true, the thread is pinned. */
    isPinned: boolean;
}

export interface JSONUser extends JSONBase<string> {
    /** User type */
    type: UserTypes | null;
    /** User's username. */
    username: string;
    /** Current avatar url of the user. */
    avatarURL: string | null;
    /** Current banned url of the user. */
    bannerURL: string | null;
    /** When the user account was created. */
    createdAt: Date; // user
    /** If true, the user is an app. */
    app: boolean;
}

export interface JSONMember extends JSONUser {
    /** When this member joined the guild. */
    joinedAt: Date | null;
    /** Array of member's roles. */
    roles: Array<number>;
    /** Member's server nickname. */
    nickname: string | null;
    /** Tells you if the member is the server owner. */
    isOwner: boolean;
    /** Server ID. */
    guildID: string; // member
}

export interface JSONGuild extends JSONBase<string> {
    /** ID of the guild owner. */
    ownerID: string;
    /** Guild type. */
    type?: string;
    /** The name of the guild. */
    name: string;
    /** The URL of the guild. */
    url?: string;
    /** Guild description. */
    description?: string;
    /** Guild icon URL. */
    iconURL?: string | null;
    /** Guild banner URL. */
    bannerURL?: string | null;
    /** Guild's timezone. */
    timezone?: string;
    /** Default channel of the guild. */
    defaultChannelID?: string;
    /** When this guild was created. */
    createdAt: Date;
    /** If true, the guild is verified. */
    verified: boolean;
    /** Cached guild channels. */
    channels: Array<AnyJSONChannel>;
    /** Cached guild members. */
    members: Array<JSONMember>;
}

export interface JSONAppUser extends JSONUser {
    /** Client User App ID */
    appID: string;
    /** When the app client was created. */
    createdAt: Date;
    /** ID of the app's owner. */
    ownerID: string;
}

export interface JSONWebhook extends JSONBase<string> {
    /** ID of the guild, where the webhook comes from. */
    guildID: string;
    /** ID of the channel, where the webhook comes from. */
    channelID: string;
    /** Username of the webhook. */
    username: string;
    /** When the webhook was created. */
    createdAt: Date;
    /** ID of the webhook's owner. */
    ownerID: string;
    /** When the webhook was deleted. */
    deletedAt: Date | null;
    /** Token of the webhook. */
    token: string | null;
}

export interface JSONListItem extends JSONBase<string> {
    /** Guild id */
    guildID: string;
    /** ID of the 'docs' channel. */
    channelID: string;
    /** Content of the doc */
    content: string;
    mentions: RawMentions | null;
    /** When the item was created. */
    createdAt: Date | null;
    /** ID of the member who created the doc. */
    memberID: string;
    /** ID of the webhook that created the list item (if it was created by a webhook) */
    webhookID: string | null;
    /** Timestamp at which the item was updated. */
    editedTimestamp: Date | null;
    /** ID of the member who updated the doc. (if updated) */
    updatedBy: string | null;
    /** The ID of the parent list item if this list item is nested */
    parentListItemID: string | null;
    /** When the list item was marked as "completed". */
    completedAt: Date | null;
    /** ID of the member that completed the item, if completed. */
    completedBy: string | null;
}

export interface JSONCalendarComment extends JSONBase<number> {
    /** Raw data */
    data: RawCalendarComment;
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
}

export interface JSONSocialLink {
    /** Social media name. */
    type: SocialLinkType | `${SocialLinkType}`;
    /** ID of the user having this social linked to their profile. */
    userID: string;
    /** The handle of the user within the external service */
    handle: string | null;
    /** The unique ID that represents this member's social link within the external service */
    serviceID: string | null;
    /** The date the social link was created at */
    createdAt: Date;
}

export interface JSONDocComment extends JSONBase<number> {
    /** Raw data */
    raw: RawDocComment;
    /** The content of the comment. */
    content: string;
    /** The date of the comment's creation. */
    createdAt: Date;
    /** ID of the member who created this comment. */
    memberID: string;
    /** The date when the comment was last updated. */
    updatedAt: Date | null;
    /** ID of the channel the comment is in. */
    channelID: string;
    /** The ID of the doc the comment is in. */
    docID: number;
    /** Mentions. */
    mentions: RawMentions | null;
    /** ID of the guild, if provided. */
    guildID: string | null;
}

export interface JSONAnnouncement extends JSONBase<string> {
    /** ID of the guild. */
    guildID: string;
    /** ID of the channel the announcement is in */
    channelID: string;
    /** The ISO 8601 timestamp that the announcement was created at */
    createdAt: Date;
    /** The ID of the member who created this announcement */
    memberID: string;
    /** The announcement's content */
    content: string;
    /** Mentions. */
    mentions: RawMentions | null;
    /** The announcement's title. */
    title: string;
}

export interface JSONAnnouncementComment extends JSONBase<number> {
    /** Announcement content */
    content: string;
    /** The date when the comment was created. */
    createdAt: Date;
    /** The date when the comment was edited, if edited. */
    editedTimestamp: Date | null;
    /** ID of the member who sent this announcement. */
    memberID: string;
    /** ID of the channel where the comment is in. */
    channelID: string;
    /** ID of the parent announcement. */
    announcementID: string;
    /** Mentions */
    mentions: RawMentions | null;
    /** ID of the guild, if received. */
    guildID: string | null;
}

export interface JSONRole extends JSONBase<number> {
    /** ID of the guild */
    guildID: string;
    /** Date of when the role was created. */
    createdAt: Date;
    /** Date of when role was last edited. */
    editedTimestamp: Date | null;
    /** The role's name */
    name: string;
    /** If set, the role will be displayed separately in the channel member */
    isDisplayedSeparately: boolean;
    /** If set, this roll will be self assigned*/
    isSelfAssignable: boolean;
    /** If set, this role can be mentioned */
    isMentionable: boolean;
    /** Array of permission (Permissions enum) */
    permissions: Array<Permissions>;
    /** An array of integer values corresponding to the decimal RGB representation for a color.
     * The first color is solid, and a second color indicates a gradient (min items 0; max items 2) */
    colors: Array<number> | null;
    /** The URL of the role icon */
    iconURL: string | null;
    /** The position the role will be in relation to the roles in the server */
    position: number | null;
    /** The default role users are given when joining the server. Base roles are tied directly to the server
     * and cannot be created or deleted */
    isBase: boolean;
    /** The app user ID this role has been defined for. Roles with this populated can only be deleted by kicking the app */
    appUserID: string | null;
}

export interface JSONGroup extends JSONBase<string> {
    /** ID of the guild */
    guildID: string;
    /** The group's name (min length 1; max length 80)  */
    name: string;
    /** The group description. */
    description: string | null;
    /** The avatar image associated with the group */
    avatarURL: string | null;
    /** If true, this is the server's home group */
    isHome: boolean;
    /** The emote to associate with the group */
    emoteID: number | null;
    /** Is this group open for anyone to join? */
    isPublic: boolean;
    /** The ISO 8601 timestamp that the group was created at */
    createdAt: Date;
    /** The ID of the user who created this group */
    createdBy: string;
    /** The date when the group was updated, if edited. */
    editedTimestamp: Date | null;
    /** The ID of the user who updated this group, if edited. */
    updatedBy: string | null;
    /** Date of when the group was archived, if archived. */
    archivedAt: Date | null;
    /** The ID of the user who archived this group, if archived. */
    archivedBy: string | null;
}

export interface JSONSubscription extends JSONBase<string> {
    /** Type of the subscription */
    type: string;
    /** ID of the guild */
    guildID: string;
    /** Description associated with the subscription */
    description: string | null;
    /** ID of the role associated to the subscription */
    roleID: number | null;
    /** Cost of the subscription */
    cost: number;
    /** The ISO 8601 timestamp that the group was created at */
    createdAt: Date;
}

export interface JSONCategory extends JSONBase<number> {
    /** The ID of the server */
    guildID: string;
    /** The ID of the group */
    groupID: string;
    /** Date of the creation of the category.  */
    createdAt: Date;
    /** The date of the last edition of the category. */
    updatedAt: Date | null;
    /** Name of the category (min length 1; max length 100) */
    name: string;
}

export type JSONPermission = Record<Permissions, boolean>;
