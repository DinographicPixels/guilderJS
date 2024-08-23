/** @module Types/JSON */

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
import type { InteractionData } from "./interactions";
import type { RawSocialLink } from "./users";
import type { Member } from "../structures/Member";
import type { User } from "../structures/User";
import type { Guild } from "../structures/Guild";
import type { UserTypes } from "../Constants";
import type { ForumChannel } from "../structures/ForumChannel";
import type { Permissions } from "guildedapi-types.ts/v1";

export interface JSONBase<ID= string | number> {
    // createdAt: number;
    id: ID;
}

export interface JSONMessage extends JSONBase<string> {
    /** ID of the channel on which the message was sent. */
    channelID: string;
    /** Content of the message. */
    content: string | null;
    /** When the message was created. */
    createdAt: Date;
    /** When the message was deleted. */
    deletedAt: Date | null;
    /** Timestamp at which this message was last edited. */
    editedTimestamp: Date | null;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    /** Array of message embed. */
    embeds?: Array<RawEmbed> | [];
    /** ID of the server on which the message was sent. */
    guildID: string | null;
    hiddenLinkPreviewUrls?: Array<string>;
    /** If true, the message appears as private. */
    isPrivate: boolean;
    /** If true, the message didn't mention anyone. */
    isSilent: boolean;
    /** ID of the message author. */
    memberID: string;
    /** object containing all mentioned users. */
    mentions: RawMentions | null;
    /** The IDs of the message replied by the message. */
    replyMessageIds: Array<string>;
    /** Message type. */
    type: string;
    /** ID of the webhook used to send this message. (if sent by a webhook) */
    webhookID?: string | null;
}

export interface JSONCommandInteraction extends JSONBase<string> {
    /** ID of the last message created with this interaction. */
    _lastMessageID: string | null;
    /** Interaction acknowledgement. */
    acknowledged: boolean;
    /** ID of the channel on which the interaction was sent. */
    channelID: string;
    /** When the interaction was created. */
    createdAt: Date;
    /** Interaction Data */
    data: InteractionData;
    /** ID of the server on which the interaction was sent. */
    guildID: string;
    /** If true, the interaction appears as private. */
    isPrivate: boolean;
    /** If true, the interaction didn't mention anyone. */
    isSilent: boolean;
    /** ID of the interaction author. */
    memberID: string;
    /** ID of the original message, responding to this interaction. */
    originalID: string | null;
    /** The IDs of the messages replied by the interaction. */
    replyMessageIDs: Array<string>;
}

export interface JSONForumThreadComment extends JSONBase<number> {
    /** ID of the forum channel containing this thread. */
    channelID: string;
    /** The content of the forum thread comment */
    content: string;
    /** The ISO 8601 timestamp that the forum thread comment was created at */
    createdAt: Date;
    /** ID of the forum thread's server, if provided. */
    guildID: string | null;
    /** The ID of the user who sent this comment. */
    memberID: string;
    /** Mentions in this thread comment. */
    mentions: RawMentions | null;
    /** The ID of the forum thread */
    threadID: number;
    /** The ISO 8601 timestamp that the forum thread comment was updated at, if relevant */
    updatedAt: Date | null;
}

export interface JSONDoc extends JSONBase<number> {
    /** ID of the 'docs' channel. */
    channelID: string;
    /** Content of the doc */
    content: string;
    /** When the doc has been created. */
    createdAt: Date;
    /** When the doc has been updated. */
    editedTimestamp: Date | null;
    /** Guild/server id */
    guildID: string;
    /** ID of the member who created this doc. */
    memberID: string;
    /** Doc mentions  */
    mentions: RawMentions;
    /** Doc name */
    name: string;
    /** ID of the member who updated the doc. */
    updatedBy: string | null;
}

export interface JSONChannel extends JSONBase<string> {
    /** Channel name */
    name: string | null;
    /** Channel type */
    type: string;
}

export interface JSONGuildChannel extends JSONBase<string> {
    /** When the channel was last archived. */
    archivedAt: Date | null;
    /** ID of the member that archived the channel (if archived) */
    archivedBy: string | null;
    /** ID of the category the channel is in. */
    categoryID: number | null;
    /** When this channel was created. */
    createdAt: Date;
    /** ID of the member who created this channel. */
    creatorID: string;
    /** Channel description */
    description: string | null;
    /** Timestamp at which this channel was last edited. */
    editedTimestamp: Date | null;
    /** ID of the group the channel is in. */
    groupID: string;
    /** Server ID */
    guildID: string;
    /** Is the channel public */
    isPublic: boolean;
    /** Channel name */
    name: string;
    /** ID of the parent category. */
    parentID: string | null;
    /** Channel type */
    type: string;
    /** Channel visibility */
    visibility: string;
}

export interface JSONTextChannel extends JSONGuildChannel {
    /** Cached messages. */
    messages: Array<JSONMessage>;
}

export interface JSONForumChannel extends JSONGuildChannel {
    /** Cached threads. */
    threads: Array<JSONForumThread<ForumChannel>>;
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
    /** Details about event cancellation (if canceled) */
    cancellation: RawCalendarEvent["cancellation"] | null;
    /** ID of the channel the event was created on. */
    channelID: string;
    /** Event color in calendar. */
    color: number | null;
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
    rsvps: Array<JSONCalendarRSVP>;
    /** Timestamp (unix epoch time) of the event starting time.*/
    startsAt: Date | null;
    /** Event user-specified url */
    url: string | null;
}

export interface JSONCalendarRSVP extends JSONBase<number> {
    /** Calendar channel id. */
    channelID: string;
    /** When the RSVP was created. */
    createdAt: Date | null;
    /** ID of the user who created this RSVP. */
    creatorID: string;
    /** ID of the entity assigned to this Event RSVP. */
    entityID: string;
    /** Guild/server ID. */
    guildID: string;
    /** Status of the RSVP */
    status: CalendarRSVPStatus;
    /** When the RSVP was updated. */
    updatedAt: Date | null;
    /** ID of the member who updated the rsvp, if updated. */
    updatedBy?: string | null;
}

export interface JSONBannedMember extends JSONBase<string> {
    /** Information about the banned member (object) */
    ban: {
        /** ID of the member who banned this member. */
        bannedBy: string;
        /** When the member has been banned. */
        createdAt: Date | null;
        /** Reason of the ban */
        reason?: string;
    };
    /** Server ID. */
    guildID: string;
}

export interface JSONForumThread<T> extends JSONBase<number> {
    /** Timestamp (unix epoch time) that the forum thread was bumped at. */
    bumpedAt: Date | null;
    /** Forum channel id */
    channelID: string;
    /** Cached comments. */
    comments: Array<JSONForumThreadComment>;
    /** Content of the thread */
    content: string;
    /** When this forum thread was created. */
    createdAt: Date;
    /** Timestamp at which this channel was last edited. */
    editedTimestamp: Date | null;
    /** Guild/server id */
    guildID: string;
    /** If true, the thread is locked. */
    isLocked: boolean;
    /** If true, the thread is pinned. */
    isPinned: boolean;
    /** Thread mentions */
    mentions: RawMentions | null;
    /** Name of the thread */
    name: string;
    /** Owner of this thread, if cached. */
    owner: T extends Guild ? Member : Member | User | Promise<Member> | undefined;
    /** The ID of the owner of this thread. */
    ownerID: string;
}

export interface JSONUser extends JSONBase<string> {
    /** If true, the user is an app. */
    app: boolean;
    /** Current avatar url of the user. */
    avatarURL: string | null;
    /** Current banned url of the user. */
    bannerURL: string | null;
    /** When the user account was created. */
    createdAt: Date;
    /** User type */
    type: UserTypes | null;
    /** User's username. */
    username: string;
}

export interface JSONMember extends JSONUser {
    /** Server ID. */
    guildID: string;
    /** Tells you if the member is the server owner. */
    isOwner: boolean;
    /** When this member joined the guild. */
    joinedAt: Date | null;
    /** Member's server nickname. */
    nickname: string | null;
    /** Array of member's roles. */
    roles: Array<number>;
}

export interface JSONGuild extends JSONBase<string> {
    /** Guild banner URL. */
    bannerURL?: string | null;
    /** Cached guild channels. */
    channels: Array<AnyJSONChannel>;
    /** When this guild was created. */
    createdAt: Date;
    /** Default channel of the guild. */
    defaultChannelID?: string;
    /** Guild description. */
    description?: string;
    /** Guild icon URL. */
    iconURL?: string | null;
    /** Cached guild members. */
    members: Array<JSONMember>;
    /** The name of the guild. */
    name: string;
    /** ID of the guild owner. */
    ownerID: string;
    /** Guild's timezone. */
    timezone?: string;
    /** Guild type. */
    type?: string;
    /** The URL of the guild. */
    url?: string;
    /** If true, the guild is verified. */
    verified: boolean;
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
    /** ID of the channel, where the webhook comes from. */
    channelID: string;
    /** When the webhook was created. */
    createdAt: Date;
    /** When the webhook was deleted. */
    deletedAt: Date | null;
    /** ID of the guild, where the webhook comes from. */
    guildID: string;
    /** ID of the webhook's owner. */
    ownerID: string;
    /** Token of the webhook. */
    token: string | null;
    /** Username of the webhook. */
    username: string;
}

export interface JSONListItem extends JSONBase<string> {
    /** ID of the 'docs' channel. */
    channelID: string;
    /** When the list item was marked as "completed". */
    completedAt: Date | null;
    /** ID of the member that completed the item, if completed. */
    completedBy: string | null;
    /** Content of the doc */
    content: string;
    /** When the item was created. */
    createdAt: Date | null;
    /** Timestamp at which the item was updated. */
    editedTimestamp: Date | null;
    /** Guild id */
    guildID: string;
    /** ID of the member who created the doc. */
    memberID: string;
    mentions: RawMentions | null;
    /** The ID of the parent list item if this list item is nested */
    parentListItemID: string | null;
    /** ID of the member who updated the doc. (if updated) */
    updatedBy: string | null;
    /** ID of the webhook that created the list item (if it was created by a webhook) */
    webhookID: string | null;
}

export interface JSONCalendarComment extends JSONBase<number> {
    /** The ID of the channel containing this comment. */
    channelID: string;
    /** The content of the comment. */
    content: string;
    /** The ISO 8601 timestamp that this comment was created at. */
    createdAt: Date;
    /** Raw data */
    data: RawCalendarComment;
    /** The ID of the event containing this comment. (parent) */
    eventID: number;
    /** The ID of the member who sent this comment. */
    memberID: string;
    /** The ISO 8601 timestamp that this comment was updated at. */
    updatedAt: Date | null;
}

export interface JSONSocialLink {
    /** The date the social link was created at */
    createdAt: Date;
    /** The handle of the user within the external service */
    handle: string | null;
    /** The unique ID that represents this member's social link within the external service */
    serviceID: string | null;
    /** Social media name. */
    type: RawSocialLink;
    /** ID of the user having this social linked to their profile. */
    userID: string;
}

export interface JSONDocComment extends JSONBase<number> {
    /** ID of the channel the comment is in. */
    channelID: string;
    /** The content of the comment. */
    content: string;
    /** The date of the comment's creation. */
    createdAt: Date;
    /** The ID of the doc the comment is in. */
    docID: number;
    /** ID of the guild, if provided. */
    guildID: string | null;
    /** ID of the member who created this comment. */
    memberID: string;
    /** Mentions. */
    mentions: RawMentions | null;
    /** Raw data */
    raw: RawDocComment;
    /** The date when the comment was last updated. */
    updatedAt: Date | null;
}

export interface JSONAnnouncement extends JSONBase<string> {
    /** ID of the channel the announcement is in */
    channelID: string;
    /** The announcement's content */
    content: string;
    /** The ISO 8601 timestamp that the announcement was created at */
    createdAt: Date;
    /** ID of the guild. */
    guildID: string;
    /** The ID of the member who created this announcement */
    memberID: string;
    /** Mentions. */
    mentions: RawMentions | null;
    /** The announcement's title. */
    title: string;
}

export interface JSONAnnouncementComment extends JSONBase<number> {
    /** ID of the parent announcement. */
    announcementID: string;
    /** ID of the channel where the comment is in. */
    channelID: string;
    /** Announcement content */
    content: string;
    /** The date when the comment was created. */
    createdAt: Date;
    /** The date when the comment was edited, if edited. */
    editedTimestamp: Date | null;
    /** ID of the guild, if received. */
    guildID: string | null;
    /** ID of the member who sent this announcement. */
    memberID: string;
    /** Mentions */
    mentions: RawMentions | null;
}

export interface JSONRole extends JSONBase<number> {
    /** The app user ID this role has been defined for. Roles with this populated can only be deleted by kicking the app */
    appUserID: string | null;
    /** An array of integer values corresponding to the decimal RGB representation for a color.
     * The first color is solid, and a second color indicates a gradient (min items 0; max items 2) */
    colors: Array<number> | null;
    /** Date of when the role was created. */
    createdAt: Date;
    /** Date of when role was last edited. */
    editedTimestamp: Date | null;
    /** ID of the guild */
    guildID: string;
    /** The URL of the role icon */
    iconURL: string | null;
    /** The default role users are given when joining the server. Base roles are tied directly to the server
     * and cannot be created or deleted */
    isBase: boolean;
    /** If set, the role will be displayed separately in the channel member */
    isDisplayedSeparately: boolean;
    /** If set, this role can be mentioned */
    isMentionable: boolean;
    /** If set, this roll will be self assigned*/
    isSelfAssignable: boolean;
    /** The role's name */
    name: string;
    /** Array of permission (Permissions enum) */
    permissions: Array<Permissions>;
    /** The position the role will be in relation to the roles in the server */
    position: number | null;
}

export interface JSONGroup extends JSONBase<string> {
    /** Date of when the group was archived, if archived. */
    archivedAt: Date | null;
    /** The ID of the user who archived this group, if archived. */
    archivedBy: string | null;
    /** The avatar image associated with the group */
    avatarURL: string | null;
    /** The ISO 8601 timestamp that the group was created at */
    createdAt: Date;
    /** The ID of the user who created this group */
    createdBy: string;
    /** The group description. */
    description: string | null;
    /** The date when the group was updated, if edited. */
    editedTimestamp: Date | null;
    /** The emote to associate with the group */
    emoteID: number | null;
    /** ID of the guild */
    guildID: string;
    /** If true, this is the server's home group */
    isHome: boolean;
    /** Is this group open for anyone to join? */
    isPublic: boolean;
    /** The group's name (min length 1; max length 80)  */
    name: string;
    /** The ID of the user who updated this group, if edited. */
    updatedBy: string | null;
}

export interface JSONSubscription extends JSONBase<string> {
    /** Cost of the subscription */
    cost: number;
    /** The ISO 8601 timestamp that the group was created at */
    createdAt: Date;
    /** Description associated with the subscription */
    description: string | null;
    /** ID of the guild */
    guildID: string;
    /** ID of the role associated to the subscription */
    roleID: number | null;
    /** Type of the subscription */
    type: string;
}

export interface JSONCategory extends JSONBase<number> {
    /** Date of the creation of the category.  */
    createdAt: Date;
    /** The ID of the group */
    groupID: string;
    /** The ID of the server */
    guildID: string;
    /** Name of the category (min length 1; max length 100) */
    name: string;
    /** The date of the last edition of the category. */
    updatedAt: Date | null;
}

export type JSONPermission = Record<Permissions, boolean>;
