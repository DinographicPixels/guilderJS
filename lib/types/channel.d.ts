
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Message } from "../structures/Message";
import { GuildChannel } from "../structures/GuildChannel";
import { TextChannel } from "../structures/TextChannel";
import { ForumChannel } from "../structures/ForumChannel";
import { DocChannel } from "../structures/DocChannel";
import { CalendarChannel } from "../structures/CalendarChannel";
import { AnnouncementChannel } from "../structures/AnnouncementChannel";
import type { APIEmbedField } from "guildedapi-types.ts/v1";

export interface CreateMessageOptions {
    /** The content of the message (min length 1; max length 4000) */
    content?: string;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    hiddenLinkPreviewURLs?: Array<string>;
    /** Embeds */
    embeds?: Array<MessageEmbedOptions>;
    /** Message IDs to reply to (min items 1; max items 5) */
    replyMessageIDs?: Array<string>;
    /** If set, this message will not notify any mentioned users or roles (default `false`) */
    isSilent?: boolean;
    /** If set, this message will only be seen by those mentioned or replied to */
    isPrivate?: boolean;
}

export interface EditMessageOptions {
    /** The content of the message (min length 1; max length 4000) */
    content?: string;
    /** Links in content to prevent unfurling as a link preview when displaying in Guilded
     * (min items 1; must have unique items true) */
    hiddenLinkPreviewURLs?: Array<string>;
    /** Embeds */
    embeds?: Array<MessageEmbedOptions>;
    // /** Message IDs to reply to (min items 1; max items 5) */
    // replyMessageIds?: Array<string>;
    // /** If set, this message will not notify any mentioned users or roles (default `false`) */
    // isSilent?: boolean;
    // /** If set, this message will only be seen by those mentioned or replied to */
    // isPrivate?: boolean;
}

export interface MessageEmbedOptions {
    /** Main header of the embed (max length 256) */
    title?: string;
    /** Subtext of the embed (max length 2048) */
    description?: string;
    /** URL to linkify the title field with (max length 1024; regex ^(?!attachment)) */
    url?: string;
    /** Embed's color, decimal number (base 16),
     *
     * To convert to HEX use: `parseInt("HEX", 16)`,
     * don't forget to remove the hashtag.
     */
    color?: number ;
    /** A small section at the bottom of the embed */
    footer?: {
        /** URL of a small image to put in the footer (max length 1024) */
        iconURL?: string;
        /** Text of the footer (max length 2048) */
        text: string;
    };
    /** A timestamp to put in the footer */
    timestamp?: string;
    /** An image to the right of the embed's content */
    thumbnail?: {
        /** URL of the image (max length 1024) */
        url?: string;
    };
    /** The main picture to associate with the embed */
    image?: {
        /** URL of the image (max length 1024) */
        url?: string;
    };
    /** A small section above the title of the embed */
    author?: {
        /** Name of the author (max length 256) */
        name?: string;
        /** URL to linkify the author's name field (max length 1024; regex ^(?!attachment)) */
        url?: string;
        /** URL of a small image to display to the left of the author's name (max length 1024) */
        iconURL?: string;
    };
    /** Table-like cells to add to the embed (max items 25) */
    fields?: Array<APIEmbedField>;
}

export interface CreateChannelOptions {
    /** Description of the channel. */
    description?: string;
    /** Set the channel as public or not. */
    isPublic?: boolean;
    /** Place the channel in a specific category. */
    categoryID?: number;
    /** Place the channel in a guild group. */
    groupID?: string;
}

export interface EditChannelOptions {
    /** The name of the channel or thread (min length 1; max length 100) */
    name?: string;
    /** The description of the channel. Not applicable to threads (min length 1; max length 512) */
    description?: string;
    /** Whether the channel can be accessed from users who are not member of the server. Not applicable to threads */
    isPublic?: boolean;
}

export interface GetChannelMessagesFilter {
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** Order will be reversed when compared to before or when omitting this parameter altogether */
    after?: string;
    /** The max size of the page (default `50`; min `1`; max `100`) */
    limit?: number;
    /** Whether to include private messages between all users in response (default `false`) */
    includePrivate?: boolean;
}

export type PossiblyUncachedMessage = Message<AnyTextableChannel> | {
    /** The ID of the message. */
    id: string;
    /** ID of the server on which the message was sent. */
    guildID: string;
    /** ID of the channel where the message was sent. */
    channelID: string;
    /** When the message was deleted. */
    deletedAt: Date;
    /** If true, the message is private. */
    isPrivate: boolean | null;
};

export interface ChannelMessageReactionBulkRemove {
    /** The ID of the server */
    guildID: string;
    /** The ID of the channel */
    channelID: string;
    /** The ID of the message */
    messageID: string;
    /** The ID of the user who deleted this reaction */
    deletedBy: string;
    /** The count of reactions that were removed */
    count: number;
    /** If present, only reactions of this emote were bulk removed from the message */
    emote: APIEmote | null;
}

export interface ChannelRolePermission {
    permission: Array<Permissions>;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
    /** The ID of the role */
    roleID: number;
    /** The ID of the channel */
    channelID: string;
}

export interface ChannelUserPermission {
    permission: Array<Permissions>;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
    /** The ID of the role */
    userID: number;
    /** The ID of the channel */
    channelID: string;
}

export interface ChannelCategoryUserPermission {
    permission: Array<Permissions>;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
    /** The ID of the role */
    userID: number;
    /** The ID of the channel */
    categoryID: string;
}

export interface ChannelCategoryRolePermission {
    permission: Array<Permissions>;
    /** The ISO 8601 timestamp that the permission override was created at */
    createdAt: string;
    /** The ISO 8601 timestamp that the permission override was updated at, if relevant */
    updatedAt?: string;
    /** The ID of the role */
    roleID: number;
    /** The ID of the channel */
    categoryID: string;
}

export type AnyTextableChannel = TextChannel;
export type AnyChannel = GuildChannel | TextChannel | ForumChannel | DocChannel | CalendarChannel | AnnouncementChannel;
export type AnyGuildChannel = Exclude<AnyChannel, GuildChannel>;
