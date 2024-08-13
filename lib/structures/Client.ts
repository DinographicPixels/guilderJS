/** @module Client */
/* eslint-disable @typescript-eslint/method-signature-style */

//
// TouchGuild Library
// Client structure class
// Main access component
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Message } from "./Message";

import { Member } from "./Member";
import { Guild } from "./Guild";


import { AppUser } from "./AppUser";
import { User } from "./User";
import { TextChannel } from "./TextChannel";
import { BannedMember } from "./BannedMember";
import { Doc } from "./Doc";
import { DocComment } from "./DocComment";
import { CalendarEventRSVP } from "./CalendarRSVP";
import { Announcement } from "./Announcement";
import { AnnouncementComment } from "./AnnouncementComment";
import { CalendarComment } from "./CalendarComment";
import { CalendarEvent } from "./CalendarEvent";
import { Permission } from "./Permission";
import { ForumThreadComment } from "./ForumThreadComment";
import { ForumChannel } from "./ForumChannel";
import { ForumThread } from "./ForumThread";
import { Category } from "./Category";
import { Group } from "./Group";
import { Role } from "./Role";
import { ListItem } from "./ListItem";
import { Webhook } from "./Webhook";
import { Subscription } from "./Subscription";
import { WSManager } from "../gateway/WSManager";
import { GatewayHandler } from "../gateway/GatewayHandler";
import { RESTManager } from "../rest/RESTManager";
import TypedCollection from "../util/TypedCollection";
import TypedEmitter from "../types/TypedEmitter";
import { ChannelReactionTypeBulkDeleteSupported, ChannelReactionTypes, ChannelSubcategoryReactionTypes, GATEWAY_EVENTS } from "../Constants";
import {
    ClientEvents,
    ClientOptions,
    AnyChannel,
    AnyTextableChannel,
    RawGuild,
    RawUser,
    GetDocsFilter,
    CreateChannelOptions,
    EditChannelOptions,
    BulkXPOptions,
    EditCalendarRSVPOptions,
    CreateCalendarCommentOptions,
    CreateCalendarEventOptions,
    CreateDocOptions,
    CreateDocCommentOptions,
    CreateForumCommentOptions,
    CreateForumThreadOptions,
    CreateMessageOptions,
    GetCalendarEventsFilter,
    GetForumThreadsFilter,
    EditMessageOptions,
    EditForumCommentOptions,
    EditForumThreadOptions,
    EditCalendarEventOptions,
    EditDocOptions,
    EditDocCommentOptions,
    EditCalendarCommentOptions,
    EditMemberOptions,
    EditWebhookOptions,
    WebhookExecuteOptions,
    WebhookMessageDetails
} from "../types";
import { Util } from "../util/Util";
import { config } from "../../pkgconfig";
import { fetch } from "undici";
import {
    APIChannelCategories,
    PATCHChannelCategoryUserPermissionBody,
    PATCHGuildRolePermissionUpdateBody,
    Permissions,
    POSTChannelCategoryUserPermissionBody
} from "guildedapi-types.ts/v1";
import { PATCHListItemBody, POSTListItemBody } from "guildedapi-types.ts/typings/REST/v1/ListItems";
import { POSTBulkAwardXPResponse, PUTBulkSetXPResponse } from "guildedapi-types.ts/typings/REST/v1/Members";
import { DELETEMessageReactionQuery } from "guildedapi-types.ts/typings/REST/v1/Reactions";
import {
    GETChannelAnnouncementsQuery,
    PATCHChannelAnnouncementBody,
    PATCHChannelAnnouncementCommentBody,
    POSTChannelAnnouncementBody,
    POSTChannelAnnouncementCommentBody
} from "guildedapi-types.ts/typings/REST/v1/Chat";
import { POSTCalendarEventBody } from "guildedapi-types.ts/typings/REST/v1/Calendars";
import { PATCHChannelRolePermissionBody, POSTChannelRolePermissionBody, POSTChannelUserPermissionBody } from "guildedapi-types.ts/typings/REST/v1/Channels";
import {
    PATCHGuildGroupBody,
    PATCHGuildRoleBody,
    PATCHUpdateCategoryBody,
    POSTCreateCategoryBody,
    POSTGuildGroupBody,
    POSTGuildRoleBody
} from "guildedapi-types.ts/typings/REST/v1/Guilds";
import { PUTUserStatusBody } from "guildedapi-types.ts/typings/REST/v1/Users";

/** Represents the application client,
 * enabling you to perform actions, detect events,
 * get data that is automatically managed for you,
 * configure internal properties, and way more.
 *
 * It is the root of the creation of your application.
 *
 * That's where everything begins.*/
export class Client extends TypedEmitter<ClientEvents> {
    /** Client's params, including app's token & rest options. */
    params: ClientOptions;
    /** Websocket Manager. */
    ws: WSManager;
    /** Application/Client User. */
    user?: AppUser;
    /** REST methods. */
    rest: RESTManager;
    /** Gateway Handler. */
    #gateway: GatewayHandler;
    /** Cached guilds. */
    guilds: TypedCollection<string, RawGuild, Guild>;
    /** Cached users. */
    users: TypedCollection<string, RawUser, User>;
    /** Utils */
    util: Util;
    /** Time at which the connection started in ms. */
    startTime: number;
    /** Timestamp at which the last check for update happened. */
    lastCheckForUpdate: number | null;
    /** @param params Client's parameters, this includes app's token & rest options. */
    constructor(params: ClientOptions) {
        if (typeof params !== "object") throw new Error("The token isn't provided in an object.");
        if (!params?.token) throw new Error("Cannot create client without token, no token is provided.");
        super();
        this.params = {
            token:                     params.token,
            ForceDisableREST:          params.ForceDisableREST ?? false,
            RESTOptions:               params.RESTOptions,
            connectionMessage:         params.connectionMessage ?? true,
            updateWarning:             params.updateWarning ?? true,
            waitForCaching:            params.waitForCaching ?? true,
            isOfficialMarkdownEnabled: params.isOfficialMarkdownEnabled ?? true,
            wsReconnect:               params.wsReconnect,
            collectionLimits:          {
                messages:             params.collectionLimits?.messages             ?? 100,
                threads:              params.collectionLimits?.threads              ?? 100,
                threadComments:       params.collectionLimits?.threadComments       ?? 100,
                docs:                 params.collectionLimits?.docs                 ?? 100,
                scheduledEvents:      params.collectionLimits?.scheduledEvents      ?? 100,
                scheduledEventsRSVPS: params.collectionLimits?.scheduledEventsRSVPS ?? 100,
                calendarComments:     params.collectionLimits?.calendarComments     ?? 100,
                docComments:          params.collectionLimits?.docComments          ?? 100,
                announcements:        params.collectionLimits?.announcements        ?? 100,
                announcementComments: params.collectionLimits?.announcementComments ?? 100
            },
            deprecations: {
                independentMessageBehavior: params.deprecations?.independentMessageBehavior
            },
            restMode: false
        };
        this.ws = new WSManager(this, { token: this.token, client: this, reconnect: params.wsReconnect });
        this.guilds = new TypedCollection(Guild, this);
        this.users = new TypedCollection(User, this);
        this.rest = (
            !this.params.ForceDisableREST
                ? new RESTManager(this, params.RESTOptions)
                : null
        ) as RESTManager;
        this.#gateway = new GatewayHandler(this);
        this.util = new Util(this);
        this.startTime = 0;
        this.lastCheckForUpdate = null;
    }

    private async checkForUpdate(): Promise<void> {
        this.lastCheckForUpdate = Date.now();
        interface jsonRes {
            version: string;
        }
        if (config.branch.toLowerCase().includes("stable")) {
            if (!this.params.updateWarning) return;
            const res = await fetch("https://registry.npmjs.org/touchguild/latest");
            const json = await res.json() as jsonRes;

            if (config.version !== json.version)
                console.log("█ TouchGuild WARN: " +
                  "You are no longer running the latest version. " +
                  "\n█ Update to the latest version to benefit from new, " +
                  "improved features, bug fixes, security patches, and more.");
            return;
        }

        if (config.branch.toLowerCase().includes("development")) {
            console.log("TouchGuild Development Build (v" + config.version + ")");
            if (!this.params.updateWarning) return;
            if (!config.version.includes("dev")) {
                console.log("█ This is a fork or copy of the TouchGuild library, " +
                  "make sure to respect the license associated to the it.\n" +
                  "█ If this fork was made to contribute, we thank you for your commitment!");
                return;
            }
            const res = await fetch("https://registry.npmjs.org/touchguild");
            const json = await res.json() as { time: Record<string, string>; };
            if (Object.keys(json.time)[Object.keys(json.time).length - 1] !== config.version)
                console.log("█ TouchGuild WARN: You are no longer running the latest development build.\n" +
                  "█ It is highly recommended to update to the latest development build as they can include major bug fixes," +
                  " brand new and improved features, and more.\n" +
                  "Note: If you need a more stable environment, " +
                  "we recommend switching back to the Stable build once the features you used and need are available in it");
            return;
        }
        return;
    }
    private get shouldCheckForUpdate(): boolean {
        return !this.lastCheckForUpdate
          || Date.now() - this.lastCheckForUpdate > 1800 * 1000;
    }
    /** Get the application token you initially passed into the constructor.
     * @note If "gapi_" is not present in the token, it is automatically
     * added for you, enabling TouchGuild to connect in proper conditions.*/
    get token(): string {
        return this.params.token.includes("gapi_") ? this.params.token : "gapi_" + this.params.token;
    }
    /** Application Uptime */
    get uptime(): number {
        return this.startTime ? Date.now() - this.startTime : 0;
    }
    /**
     * Archive a channel.
     * @param channelID ID of the channel to archive.
     * @deprecated Use Client.rest.channels#archive
     */
    async archiveChannel(channelID: string): Promise<void> {
        return this.rest.channels.archive(channelID);
    }
    /** Award a member using the built-in EXP system.
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param amount Amount of experience.
     * @deprecated Use Client.rest.guilds#awardMember
     */
    async awardMember(guildID: string, memberID: string, amount: number): Promise<number> {
        return this.rest.guilds.awardMember(guildID, memberID, amount);
    }
    /** Award every member of a guild having a role using the built-in EXP system.
     * @param guildID ID of a guild.
     * @param roleID ID of a role.
     * @param amount Amount of experience.
     * @deprecated Use Client.rest.guilds#awardRole
     */
    async awardRole(guildID: string, roleID: number, amount: number): Promise<void> {
        return this.rest.guilds.awardRole(guildID, roleID, amount);
    }
    /**
     * Bulk XP Awards Members.
     * @param guildID ID of the guild.
     * @param options Bulk XP options.
     * @deprecated Use Client.rest.guilds#bulkAwardXP
     */
    async bulkAwardXPMembers(guildID: string, options: BulkXPOptions): Promise<POSTBulkAwardXPResponse> {
        return this.rest.guilds.bulkAwardXP(guildID, options);
    }
    /**
     * Bulk create/update calendar rsvps.
     * @param channelID ID of the Calendar channel.
     * @param eventID ID of a calendar event.
     * @param memberIDs List of multiple member ids.
     * @param options Update options.
     * @deprecated Use Client.rest.channels#bulkCalendarRSVPUpdate
     */
    async bulkCalendarRSVPUpdate(
        channelID: string,
        eventID: number,
        memberIDs: Array<string>,
        options: EditCalendarRSVPOptions
    ): Promise<void> {
        return this.rest.channels.bulkCalendarRSVPUpdate(
            channelID,
            eventID,
            memberIDs,
            options
        );
    }
    /**
     * Bulk delete every reaction from a target.
     * @param channelID ID of a channel.
     * @param channelType Type of channel.
     * @param targetID Target to remove reactions from it.
     * @param filter Filter options
     * @deprecated Use Client.rest.channels#bulkDeleteReactions
     */
    async bulkDeleteReactions(
        channelID: string,
        channelType: ChannelReactionTypeBulkDeleteSupported,
        targetID: string | number,
        filter?: DELETEMessageReactionQuery
    ): Promise<void> {
        return this.rest.channels.bulkDeleteReactions(
            channelID,
            channelType,
            targetID,
            filter
        );
    }
    /**
     * Bulk XP Set Members.
     * @param guildID ID of the guild.
     * @param options Bulk XP options.
     * @deprecated Use Client.rest.guilds#bulkSetMembersXP
     */
    async bulkSetMembersXP(guildID: string, options: BulkXPOptions): Promise<PUTBulkSetXPResponse> {
        return this.rest.guilds.bulkSetXP(guildID, options);
    }
    /** Mark a list item as completed.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     * @deprecated Use Client.rest.channels#completeListItem
     */
    async completeListItem(channelID: string, itemID: string): Promise<void> {
        return this.rest.channels.completeListItem(channelID, itemID);
    }


    /** Connect to Guilded. */
    connect(): void {
        if (this.shouldCheckForUpdate) void this.checkForUpdate();
        if (this.params.restMode)
            throw new Error("REST mode has been enabled; you can no longer connect to the gateway.");
        this.ws.connect();
        this.ws.on("GATEWAY_WELCOME", async data => {
            this.user = new AppUser(data, this);
            if (this.params.connectionMessage) console.log("> Connection established.");
            await this.rest.misc.getUserGuilds("@me").catch(() => [])
                .then(guilds => {
                    if (!guilds) guilds = [];
                    for (const guild of guilds) this.guilds.add(guild);
                });
            this.startTime = Date.now();
            this.emit("ready");
        });

        this.ws.on("disconnect", err => {
            this.startTime = 0;
            this.emit("error", err);
        });

        this.ws.on("GATEWAY_PARSED_PACKET", (type, data) => {
            void this.#gateway.handleMessage(type as keyof GATEWAY_EVENTS, data);
        });
    }

    /**
     * Create a new announcement within an announcement channel.
     * @param channelID ID of the Announcement channel.
     * @param options Announcement creation options.
     * @deprecated Use Client.rest.channels#createAnnouncement
     */
    async createAnnouncement(channelID: string, options: POSTChannelAnnouncementBody): Promise<Announcement> {
        return this.rest.channels.createAnnouncement(channelID, options);
    }
    /**
     * Create a comment inside an announcement.
     * @param channelID ID of the Announcement channel.
     * @param announcementID ID of the announcement to create the comment in.
     * @param options Comment creation options.
     * @deprecated Use Client.rest.channels#createAnnouncementComment
     */
    async createAnnouncementComment(
        channelID: string,
        announcementID: string,
        options: POSTChannelAnnouncementCommentBody
    ): Promise<AnnouncementComment> {
        return this.rest.channels.createAnnouncementComment(
            channelID,
            announcementID,
            options
        );
    }
    /** Ban a guild member.
     * @param guildID ID of the guild the member is in.
     * @param memberID ID of the member to ban.
     * @param reason The reason of the ban.
     * @deprecated Use Client.rest.guilds#createBan
     */
    async createBan(guildID: string, memberID: string, reason?: string): Promise<BannedMember> {
        return this.rest.guilds.createBan(guildID, memberID, reason);
    }
    /** Create a comment inside a calendar event.
     * @param channelID The ID of a "Calendar" channel.
     * @param eventID The ID of a calendar event.
     * @param options Comment options, includes content, and more.
     * @deprecated Use Client.rest.channels#createCalendarComment
     */
    async createCalendarComment(
        channelID: string,
        eventID: number,
        options: CreateCalendarCommentOptions
    ): Promise<CalendarComment> {
        return this.rest.channels.createCalendarComment(channelID, eventID, options);
    }
    /** Create an event into a "Calendar" channel.
     * @param channelID ID of a "Calendar" channel.
     * @param options Event options.
     * @param createSeries (optional) Create a series. (event's repetition)
     * @deprecated Use Client.rest.channels#createCalendarEvent
     */
    async createCalendarEvent(
        channelID: string,
        options: CreateCalendarEventOptions,
        createSeries?: POSTCalendarEventBody["repeatInfo"]
    ): Promise<CalendarEvent> {
        return this.rest.channels.createCalendarEvent(channelID, options, createSeries);
    }
    /**
     * The Guilded API only allows series on the event's creation.
     *
     * **Use createCalendarEvent and set the createSeries property to create a series.**
     * @deprecated Use Client.rest.channels#createCalendarEventSeries
     */
    createCalendarEventSeries(): Error {
        return this.rest.channels.createCalendarEventSeries();
    }
    /**
     * Create a channel category permission assigned to a user or role.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category
     * @param targetID ID of the user (string) or role (number) to assign the permission to
     * @param options Permission options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     * @deprecated Use Client.rest.guilds#createCategoryPermission
     */
    async createCategoryPermission(
        guildID: string,
        categoryID: number,
        targetID: string | number,
        options: POSTChannelCategoryUserPermissionBody
    ): Promise<Permission> {
        return this.rest.guilds.createCategoryPermission(
            guildID,
            categoryID,
            targetID,
            options);
    }
    /** Create a channel in a specified guild.
     * @param guildID ID of a guild.
     * @param name Name of the new channel.
     * @param type Type of the new channel. (e.g: chat)
     * @param options New channel's additional options.
     * @deprecated Use Client.rest.guilds#createChannel
     */
    async createChannel<T extends AnyChannel = AnyChannel>(
        guildID: string,
        name: string,
        type: APIChannelCategories,
        options?: CreateChannelOptions
    ): Promise<T> {
        return this.rest.guilds.createChannel<T>(guildID, name, type, options);
    }
    /**
     * Add a new user permission to a channel.
     * @param guildID ID of the guild the channel is in
     * @param channelID ID of the channel
     * @param targetID ID of the user or role to assign the permission to
     * @param options Create options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     * @deprecated Use Client.rest.channels#createPermission
     */
    async createChannelPermission(
        guildID: string,
        channelID: string,
        targetID: string | number,
        options:
        POSTChannelUserPermissionBody
        | POSTChannelRolePermissionBody
    ): Promise<Permission> {
        return this.rest.channels.createPermission(
            guildID,
            channelID,
            targetID,
            options
        );
    }
    /** Create a doc in a "Docs" channel.
     * @param channelID ID pf a "Docs" channel.
     * @param options Doc's options.
     * @deprecated Use Client.rest.channels#createDoc
     */
    async createDoc(channelID: string, options: CreateDocOptions): Promise<Doc> {
        return this.rest.channels.createDoc(channelID, options);
    }
    /**
     * Create a comment in a doc.
     * @param channelID ID of the docs channel.
     * @param docID ID of the doc.
     * @param options Create options.
     * @deprecated Use Client.rest.channels#createDocComment
     */
    async createDocComment(
        channelID: string,
        docID: number,
        options: CreateDocCommentOptions
    ): Promise<DocComment> {
        return this.rest.channels.createDocComment(channelID, docID, options);
    }
    /** Add a comment to a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param options Comment's options.
     * @deprecated Use Client.rest.channels#createForumComment
     */
    async createForumComment(
        channelID: string,
        threadID: number,
        options: CreateForumCommentOptions
    ): Promise<ForumThreadComment> {
        return this.rest.channels.createForumComment(channelID, threadID, options);
    }
    /** Create a forum thread in a specified forum channel.
     * @param channelID ID of a "Forums" channel.
     * @param options Thread's options including title & content.
     * @deprecated Use Client.rest.channels#createForumThread
     */
    async createForumThread<T extends ForumChannel = ForumChannel>(
        channelID: string,
        options: CreateForumThreadOptions
    ): Promise<ForumThread<T>> {
        return this.rest.channels.createForumThread<T>(channelID, options);
    }
    /**
     * Create a guild category
     * @param guildID ID of the guild.
     * @param options Create options.
     * @deprecated Use Client.rest.guilds#createCategory
     */
    async createGuildCategory(guildID: string, options: POSTCreateCategoryBody): Promise<Category> {
        return this.rest.guilds.createCategory(guildID, options);
    }
    /**
     * Create a guild group.
     * @param guildID The ID of the guild to create a group in.
     * @param options Create options
     * @deprecated Use Client.rest.guilds#createGroup
     */
    async createGuildGroup(guildID: string, options: POSTGuildGroupBody): Promise<Group> {
        return this.rest.guilds.createGroup(guildID, options);
    }
    /**
     * Create a guild role.
     * @param guildID ID of the server you want to create the role in.
     * @param options Create options
     * @deprecated Use Client.rest.guilds#createRole
     */
    async createGuildRole(guildID: string, options: POSTGuildRoleBody): Promise<Role> {
        return this.rest.guilds.createRole(guildID, options);
    }
    /** Create a new item in a list channel.
     * @param channelID ID of a "Lists" channel.
     * @param content String content of the new item.
     * @param note Add a note to the new item.
     * @deprecated Use Client.rest.channels#createListItem
     */
    async createListItem(
        channelID: string,
        content: POSTListItemBody["message"],
        note?: POSTListItemBody["note"]
    ): Promise<ListItem> {
        return this.rest.channels.createListItem(channelID, content, note);
    }
    /** Send a message in a specified channel.
     * @param channelID ID of the channel.
     * @param options Message options
     * @deprecated Use Client.rest.channels#createMessage
     */
    async createMessage<T extends AnyTextableChannel = AnyTextableChannel>(
        channelID: string,
        options: CreateMessageOptions
    ): Promise<Message<T>> {
        return this.rest.channels.createMessage<T>(channelID, options);
    }
    /** Add a reaction to a specified target.
     * @param channelID ID of a channel that supports reaction.
     * @param channelType Type of the selected channel. (e.g: "ChannelMessage")
     * @param targetID ID of the target you'd like to add the reaction to. (e.g: a message id)
     * @param reaction ID of the reaction.
     * @deprecated Use Client.rest.channels#createReaction
     */
    async createReaction(
        channelID: string,
        channelType: ChannelReactionTypes,
        targetID: string | number,
        reaction: number
    ): Promise<void> {
        return this.rest.channels.createReaction(
            channelID,
            channelType,
            targetID,
            reaction
        );
    }
    /** Add a reaction to a target from a subcategory (e.g: a comment from Forum Thread)
     * @param channelID ID of a channel that supports reaction.
     * @param subcategoryType Type of the selected subcategory. (e.g: "CalendarEvent")
     * @param subcategoryID ID of the subcategory you selected.
     * @param targetID ID of the target you'd like to add the reaction to. (e.g: a comment id)
     * @param reaction ID of the reaction to add.
     * @deprecated Use Client.rest.channels#createReactionToSubcategory
     */
    async createReactionToSubcategory(
        channelID: string,
        subcategoryType: ChannelSubcategoryReactionTypes,
        subcategoryID: string | number,
        targetID: string | number,
        reaction: number
    ): Promise<void> {
        return this.rest.channels.createReactionToSubcategory(
            channelID,
            subcategoryType,
            subcategoryID,
            targetID,
            reaction
        );
    }
    /** Create a webhook
     * @param guildID ID of a guild.
     * @param channelID ID of a channel.
     * @param name Name of the new webhook.
     * @deprecated Use Client.rest.webhooks#create
     */
    async createWebhook(guildID: string, channelID: string, name: string): Promise<Webhook> {
        return this.rest.webhooks.create(guildID, channelID, name);
    }
    /**
     * Delete an announcement.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement to delete.
     * @deprecated Use Client.rest.channels#deleteAnnouncement
     */
    async deleteAnnouncement(channelID: string, announcementID: string): Promise<void> {
        return this.rest.channels.deleteAnnouncement(channelID, announcementID);
    }
    /**
     * Delete an announcement comment.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement where the comment is in.
     * @param commentID ID of the comment to delete.
     * @deprecated Use Client.rest.channels#deleteAnnouncementComment
     */
    async deleteAnnouncementComment(channelID: string, announcementID: string, commentID: number): Promise<void> {
        return this.rest.channels.deleteAnnouncementComment(
            channelID,
            announcementID,
            commentID
        );
    }
    /** Delete a comment from a calendar event.
     * @param channelID ID of the channel containing the event.
     * @param eventID ID of the event containing the comment.
     * @param commentID ID of the comment to delete.
     * @deprecated Use Client.rest.channels#deleteCalendarComment
     */
    async deleteCalendarComment(channelID: string, eventID: number, commentID: number): Promise<void> {
        return this.rest.channels.deleteCalendarComment(channelID, eventID, commentID);
    }
    /** Delete an event from a "Calendar" channel.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @deprecated Use Client.rest.channels#deleteCalendarEvent
     */
    async deleteCalendarEvent(channelID: string, eventID: number): Promise<void> {
        return this.rest.channels.deleteCalendarEvent(channelID, eventID);
    }
    /**
     * Delete a CalendarEventSeries.
     * @param channelID ID of the channel.
     * @param eventID ID of the event.
     * @param seriesID ID of the series.
     * @deprecated Use Client.rest.channels#deleteCalendarEventSeries
     */
    async deleteCalendarEventSeries(channelID: string, eventID: number, seriesID: string): Promise<void> {
        return this.rest.channels.deleteCalendarEventSeries(channelID, eventID, seriesID);
    }
    /** Delete an RSVP from a calendar event.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @param memberID ID of a member.
     * @deprecated Use Client.rest.channels#deleteCalendarRSVP
     */
    async deleteCalendarRSVP(channelID: string, eventID: number, memberID: string): Promise<void> {
        return this.rest.channels.deleteCalendarRSVP(channelID, eventID, memberID);
    }
    /**
     * Delete a category permission.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category
     * @param targetID ID of the user or role to delete the permission from
     * @deprecated Use Client.rest.guilds#deleteCategoryPermission
     */
    async deleteCategoryPermission(guildID: string, categoryID: number, targetID: string | number): Promise<void> {
        return this.rest.guilds.deleteCategoryPermission(guildID, categoryID, targetID);
    }
    /** Delete a channel.
     * @param channelID ID of the channel you'd like to delete.
     * @deprecated Use Client.rest.channels#delete
     */
    async deleteChannel(channelID: string): Promise<void> {
        return this.rest.channels.delete(channelID);
    }
    /**
     * Delete a channel permission.
     * @param guildID ID of the guild where the channel is in
     * @param channelID ID of the channel
     * @param targetID ID of the target user (string) or role (number)
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     * @deprecated Use Client.rest.channels#deletePermission
     */
    async deleteChannelPermission(guildID: string, channelID: string, targetID: string | number): Promise<void> {
        return this.rest.channels.deletePermission(guildID, channelID, targetID);
    }
    /** Delete a doc from a "Docs" channel.
     * @param channelID ID of a "Docs" channel.
     * @param docID ID of a doc.
     * @deprecated Use Client.rest.channels#deleteDoc
     */
    async deleteDoc(channelID: string, docID: number): Promise<void> {
        return this.rest.channels.deleteDoc(channelID, docID);
    }
    /**
     * Delete a doc comment.
     * @param channelID ID of the docs channel.
     * @param docID ID of the doc.
     * @param commentID ID of the comment to delete.
     * @deprecated Use Client.rest.channels#deleteDocComment
     */
    async deleteDocComment(channelID: string, docID: number, commentID: number): Promise<void> {
        return this.rest.channels.deleteDocComment(channelID, docID, commentID);
    }
    /** Delete a forum thread comment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param commentID ID of a forum thread comment.
     * @deprecated Use Client.rest.channels#deleteForumComment
     */
    async deleteForumComment(channelID: string, threadID: number, commentID: number): Promise<void> {
        return this.rest.channels.deleteForumComment(channelID, threadID, commentID);
    }
    /** Delete a forum thread from a specific forum channel
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @deprecated Use Client.rest.channels#deleteForumThread
     */
    async deleteForumThread(channelID: string, threadID: number): Promise<void> {
        return this.rest.channels.deleteForumThread(channelID, threadID);
    }
    /**
     * Delete a guild category.
     * @param guildID ID of the guild to create a category in.
     * @param categoryID ID of the category you want to read.
     * @deprecated Use Client.rest.guilds#deleteCategory
     */
    async deleteGuildCategory(guildID: string, categoryID: number): Promise<Category> {
        return this.rest.guilds.deleteCategory(guildID, categoryID);
    }

    /**
     * Delete a guild group
     * @param guildID ID of the guild where the group is in.
     * @param groupID ID of the group to delete.
     * @deprecated Use Client.rest.guilds#deleteGroup
     */
    async deleteGuildGroup(guildID: string, groupID: string): Promise<void> {
        return this.rest.guilds.deleteGroup(guildID, groupID);
    }
    /**
     * Delete a guild role.
     * @param guildID ID of the guild where the role to delete is in
     * @param roleID ID of the role to delete
     * @deprecated Use Client.rest.guilds#deleteRole
     */
    async deleteGuildRole(guildID: string, roleID: number): Promise<void> {
        return this.rest.guilds.deleteRole(guildID, roleID);
    }
    /** Delete an item from a list channel.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     * @deprecated Use Client.rest.channels#deleteListItem
     */
    async deleteListItem(channelID: string, itemID: string): Promise<void> {
        return this.rest.channels.deleteListItem(channelID, itemID);
    }
    /** Delete a specific message.
     * @param channelID ID of the channel containing the message.
     * @param messageID ID of the message you'd like to delete.
     * @deprecated Use Client.rest.channels#deleteMessage
     */
    async deleteMessage(channelID: string, messageID: string): Promise<void> {
        return this.rest.channels.deleteMessage(channelID, messageID);
    }
    /** Remove a reaction from a specified message.
     * @param channelID ID of a channel that supports reaction.
     * @param channelType Type of the selected channel. (e.g: "ChannelMessage")
     * @param targetID ID of the target you'd like to add the reaction from. (e.g: a message id)
     * @param reaction ID of the reaction.
     * @param targetUserID ID of the user to remove reaction from.
     * (works only on Channel Messages | default: @me)
     * @deprecated Use Client.rest.channels#deleteReaction
     */
    async deleteReaction(
        channelID: string,
        channelType: ChannelReactionTypes,
        targetID: string | number,
        reaction: number,
        targetUserID?: "@me" | string
    ): Promise<void> {
        return this.rest.channels.deleteReaction(
            channelID,
            channelType,
            targetID,
            reaction,
            targetUserID
        );
    }
    /** Remove a reaction from a target from a subcategory (e.g: a comment from Forum Thread)
     * @param channelID ID of a channel that supports reaction.
     * @param subcategoryType Type of the selected subcategory. (e.g: "CalendarEvent")
     * @param subcategoryID ID of the subcategory you selected.
     * @param targetID ID of the target you'd like to remove the reaction to. (e.g: a comment id)
     * @param reaction ID of the reaction to add.
     * @deprecated Use Client.rest.channels#deleteReactionFromSubcategory
     */
    async deleteReactionFromSubcategory(
        channelID: string,
        subcategoryType: ChannelSubcategoryReactionTypes,
        subcategoryID: string | number,
        targetID: string | number,
        reaction: number
    ): Promise<void> {
        return this.rest.channels.deleteReactionFromSubcategory(
            channelID,
            subcategoryType,
            subcategoryID,
            targetID,
            reaction
        );
    }
    /**
     * Delete a user's status, this includes the app's one.
     * @param userID User ID (@me can be used).
     * @deprecated Use Client.rest.misc#deleteUserStatus
     */
    async deleteUserStatus(userID: string | "@me"): Promise<void> {
        return this.rest.misc.deleteUserStatus(userID);
    }
    /** Delete a webhook
     * @param guildID ID of a guild.
     * @param webhookID ID of an existent webhook.
     * @deprecated Use Client.rest.webhooks#delete
     */
    async deleteWebhook(guildID: string, webhookID: string): Promise<void> {
        return this.rest.webhooks.delete(guildID, webhookID);
    }
    disconnect(crashOnDisconnect?: boolean): void {
        if (this.ws.alive === false) return console.warn("There is no open connection.");
        this.ws.disconnect(false); // closing all connections.
        console.log("The connection has been terminated.");
        if (crashOnDisconnect) throw new Error("Connection closed.");
    }
    /**
     * Edit an existing announcement.
     * @param channelID ID of the Announcement channel.
     * @param announcementID ID of the announcement to edit.
     * @param options Edit options
     * @deprecated Use Client.rest.channels#editAnnouncement
     */
    async editAnnouncement(
        channelID: string,
        announcementID: string,
        options: PATCHChannelAnnouncementBody
    ): Promise<Announcement> {
        return this.rest.channels.editAnnouncement(channelID, announcementID, options);
    }

    /**
     * Edit an announcement comment.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of an announcement where the comment is in.
     * @param commentID ID of the comment to edit.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editAnnouncementComment
     */
    async editAnnouncementComment(
        channelID: string,
        announcementID: string,
        commentID: number,
        options: PATCHChannelAnnouncementCommentBody
    ): Promise<AnnouncementComment> {
        return this.rest.channels.editAnnouncementComment(
            channelID,
            announcementID,
            commentID,
            options
        );
    }
    /** Edit an existing calendar event comment.
     * @param channelID The ID of a "Calendar" channel.
     * @param eventID The ID of an event from the channel.
     * @param commentID The ID of the comment to edit.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editCalendarComment
     */
    async editCalendarComment(
        channelID: string,
        eventID: number,
        commentID: number,
        options: EditCalendarCommentOptions
    ): Promise<CalendarComment> {
        return this.rest.channels.editCalendarComment(
            channelID,
            eventID,
            commentID,
            options
        );
    }
    /** Edit an event from a "Calendar" channel.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editCalendarEvent
     */
    async editCalendarEvent(
        channelID: string,
        eventID: number,
        options: EditCalendarEventOptions
    ): Promise<CalendarEvent> {
        return this.rest.channels.editCalendarEvent(channelID, eventID, options);
    }
    /**
     * Edit a CalendarEventSeries.
     * @param channelID ID of the channel.
     * @param eventID ID of the event.
     * @param seriesID ID of the series.
     * @param options Edit repetition options.
     * @deprecated Use Client.rest.channels#editCalendarEventSeries
     */
    async editCalendarEventSeries(
        channelID: string,
        eventID: number,
        seriesID: string,
        options: POSTCalendarEventBody["repeatInfo"]
    ): Promise<void> {
        return this.rest.channels.editCalendarEventSeries(
            channelID,
            eventID,
            seriesID,
            options
        );
    }
    /** Add/Edit an RSVP in a calendar event.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @param memberID ID of a member.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editCalendarRSVP
     */
    async editCalendarRSVP(
        channelID: string,
        eventID: number,
        memberID: string,
        options: EditCalendarRSVPOptions
    ): Promise<CalendarEventRSVP> {
        return this.rest.channels.editCalendarRSVP(
            channelID,
            eventID,
            memberID,
            options
        );
    }
    /**
     * Update a category permission.
     * @param guildID ID of the server the category is in
     * @param categoryID ID of the category
     * @param targetID ID of the user (string) or role (number) to assign the permission to.
     * @param options Edit options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     * @deprecated Use Client.rest.guilds#editCategoryPermission
     */
    async editCategoryPermission(
        guildID: string,
        categoryID: number,
        targetID: string | number,
        options: PATCHChannelCategoryUserPermissionBody
    ): Promise<Permission> {
        return this.rest.guilds.editCategoryPermission(
            guildID,
            categoryID,
            targetID,
            options);
    }
    /** Edit a channel.
     * @param channelID ID of the channel you'd like to edit.
     * @param options Channel edit options.
     * @deprecated Use Client.rest.channels#edit
     */
    async editChannel<T extends AnyChannel = AnyChannel>(
        channelID: string,
        options: EditChannelOptions
    ): Promise<T> {
        return this.rest.channels.edit<T>(channelID, options);
    }
    /**
     * Update a channel permission.
     * @param guildID ID of the guild the channel is in
     * @param channelID ID of the channel
     * @param targetID ID of the target user (string) or role (number)
     * @param options Edit options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     * @deprecated Use Client.rest.channels#editPermission
     */
    async editChannelPermission(
        guildID: string,
        channelID: string,
        targetID: string | number,
        options: PATCHChannelRolePermissionBody
    ): Promise<Permission> {
        return this.rest.channels.editPermission(
            guildID,
            channelID,
            targetID,
            options
        );
    }
    /** Edit a doc from a "Docs" channel.
     * @param channelID ID of a "Docs" channel.
     * @param docID ID of a doc.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editDoc
     */
    async editDoc(channelID: string, docID: number, options: EditDocOptions): Promise<Doc> {
        return this.rest.channels.editDoc(channelID, docID, options);
    }
    /**
     * Edit a doc comment.
     * @param channelID ID of the docs channel.
     * @param docID ID of the doc.
     * @param commentID ID of the comment to edit.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editDocComment
     */
    async editDocComment(
        channelID: string,
        docID: number,
        commentID: number,
        options: EditDocCommentOptions
    ): Promise<DocComment> {
        return this.rest.channels.editDocComment(channelID, docID, commentID, options);
    }
    /** Edit a forum thread's comment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param commentID ID of a thread comment.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editForumComment
     */
    async editForumComment(
        channelID: string,
        threadID: number,
        commentID: number,
        options?: EditForumCommentOptions
    ): Promise<ForumThreadComment> {
        return this.rest.channels.editForumComment(
            channelID,
            threadID,
            commentID,
            options
        );
    }
    /** Edit a forum thread from a specified forum channel.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editForumThread
     */
    async editForumThread<T extends ForumChannel = ForumChannel>(
        channelID: string,
        threadID: number,
        options: EditForumThreadOptions
    ): Promise<ForumThread<T>> {
        return this.rest.channels.editForumThread<T>(channelID, threadID, options);
    }
    /**
     * Edit a guild category.
     * @param guildID ID of the guild to create a category in.
     * @param categoryID ID of the category you want to read.
     * @param options Options to update a category.
     * @deprecated Use Client.rest.guilds#editCategory
     */
    async editGuildCategory(
        guildID: string,
        categoryID: number,
        options: PATCHUpdateCategoryBody

    ): Promise<Category> {
        return this.rest.guilds.editCategory(guildID, categoryID, options);
    }
    /**
     * Edit a guild group.
     * @param guildID The ID of the guild where the group to edit is in
     * @param groupID The ID of the group to edit.
     * @param options Edit options
     * @deprecated Use Client.rest.guilds#editGroup
     */
    async editGuildGroup(guildID: string, groupID: string, options: PATCHGuildGroupBody): Promise<Group> {
        return this.rest.guilds.editGroup(guildID, groupID, options);
    }
    /**
     * Edit a guild role.
     * @param guildID ID of the server
     * @param roleID ID of the role to edit
     * @param options Edit options
     * @deprecated Use Client.rest.guilds#editRole
     */
    async editGuildRole(guildID: string, roleID: number, options: PATCHGuildRoleBody): Promise<Role> {
        return this.rest.guilds.editRole(guildID, roleID, options);
    }
    /**
     * Edit guild role permission.
     * @param guildID ID of the guild.
     * @param roleID ID of the role.
     * @param options Permission to edit.
     * @deprecated Use Client.rest.guilds#editRolePermission
     */
    async editGuildRolePermission(
        guildID: string,
        roleID: number,
        options: PATCHGuildRolePermissionUpdateBody
    ): Promise<Role> {
        return this.rest.guilds.editRolePermission(guildID, roleID, options);
    }
    /** Edit an item from a list channel.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     * @param options Edit options.
     * @deprecated Use Client.rest.channels#editListItem
     */
    async editListItem(
        channelID: string,
        itemID: string,
        options?: {
            content?: PATCHListItemBody["message"];
            note?: PATCHListItemBody["note"];
        }
    ): Promise<ListItem> {
        return this.rest.channels.editListItem(channelID, itemID, options);
    }
    /** Edit a member.
     * @param guildID ID of the guild the member is in.
     * @param memberID ID of the member to edit.
     * @param options Edit options.
     * @deprecated Use Client.rest.guilds#editMember
     */
    async editMember(guildID: string, memberID: string, options: EditMemberOptions): Promise<void> {
        return this.rest.guilds.editMember(guildID, memberID, options);
    }
    /** Edit a specific message coming from a specified channel.
     * @param channelID The ID of the channel.
     * @param messageID The ID of the message you'd like to edit.
     * @param newMessage object containing new message's options.
     * @deprecated Use Client.rest.channels#editMessage
     */
    async editMessage<T extends AnyTextableChannel>(
        channelID: string,
        messageID: string,
        newMessage: EditMessageOptions
    ): Promise<Message<T>> {
        return this.rest.channels.editMessage<T>(channelID, messageID, newMessage);
    }
    /** Update a webhook
     * @param guildID ID of a guild.
     * @param webhookID ID of an existent webhook.
     * @param options Edit options.
     * @deprecated Use Client.rest.webhooks#edit
     */
    async editWebhook(guildID: string, webhookID: string, options: EditWebhookOptions): Promise<Webhook> {
        return this.rest.webhooks.edit(guildID, webhookID, options);
    }
    /**
     * Execute a webhook.
     * @param webhookID ID of the webhook to execute.
     * @param token Token of the webhook, needed to execute it.
     * @param options Execute Options.
     * @deprecated Use Client.rest.webhooks#execute
     */
    async executeWebhook(
        webhookID: string,
        token: string,
        options: WebhookExecuteOptions
    ): Promise<WebhookMessageDetails> {
        return this.rest.webhooks.execute(webhookID, token, options);
    }
    /**
     * Get a specific announcement from a channel.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement to get.
     * @deprecated Use Client.rest.channels#getAnnouncement
     */
    async getAnnouncement(channelID: string, announcementID: string): Promise<Announcement> {
        return this.rest.channels.getAnnouncement(channelID, announcementID);
    }
    /**
     * Get a specific comment from an announcement.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement where the comment is in.
     * @param commentID ID of the comment to get.
     * @deprecated Use Client.rest.channels#getAnnouncementComment
     */
    async getAnnouncementComment(
        channelID: string,
        announcementID: string,
        commentID: number
    ): Promise<AnnouncementComment> {
        return this.rest.channels.getAnnouncementComment(
            channelID,
            announcementID,
            commentID
        );
    }
    /**
     * Get comments from an announcement.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of an announcement.
     * @deprecated Use Client.rest.channels#getAnnouncementComments
     */
    async getAnnouncementComments(channelID: string, announcementID: string): Promise<Array<AnnouncementComment>> {
        return this.rest.channels.getAnnouncementComments(channelID, announcementID);
    }
    /**
     * Get a list of announcements from a channel.
     * @param channelID ID of an Announcement channel.
     * @param filter Filter to apply.
     * @deprecated Use Client.rest.channels#getAnnouncements
     */
    async getAnnouncements(channelID: string, filter?: GETChannelAnnouncementsQuery): Promise<Array<Announcement>> {
        return this.rest.channels.getAnnouncements(channelID, filter);
    }
    /** Get a ban.
     * @param guildID ID of the guild.
     * @param memberID ID of the banned member.
     * @deprecated Use Client.rest.guilds#getBan
     */
    async getBan(guildID: string, memberID: string): Promise<BannedMember> {
        return this.rest.guilds.getBan(guildID, memberID);
    }
    /** This method is used to get a list of guild ban.
     * @param guildID ID of the guild.
     * @deprecated Use Client.rest.guilds#getBans
     */
    async getBans(guildID: string): Promise<Array<BannedMember>> {
        return this.rest.guilds.getBans(guildID);
    }
    /** This method is used to get a specific calendar event.
     *
     * Note: this method requires a "Calendar" channel.
     * @param channelID ID of a Calendar channel.
     * @param eventID ID of a Calendar event.
     * @deprecated Use Client.rest.channels#getCalendarEvent
     */
    async getCalendarEvent(channelID: string, eventID: number): Promise<CalendarEvent> {
        return this.rest.channels.getCalendarEvent(channelID, eventID);
    }
    /** This method is used to get a specific event comment coming from a calendar.
     * Note: this method doesn't cache scheduled events due to the API's restrictions.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of an event containing the comment to get.
     * @param commentID ID of the comment to get.
     * @deprecated Use Client.rest.channels#getCalendarEventComment
     */
    async getCalendarEventComment(
        channelID: string,
        eventID: number,
        commentID: number
    ): Promise<CalendarComment> {
        return this.rest.channels.getCalendarEventComment(channelID, eventID, commentID);
    }
    /** This method is used to get a list of CalendarEventComment
     * Note: due to API's restrictions, we're not able to cache scheduled events from this method.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of the event containing comments.
     * @deprecated Use Client.rest.channels#getCalendarEventComments
     */
    async getCalendarEventComments(channelID: string, eventID: number): Promise<Array<CalendarComment>> {
        return this.rest.channels.getCalendarEventComments(channelID, eventID);
    }
    /** This method is used to get a list of CalendarEvent
     * @param channelID ID of a "Calendar" channel.
     * @param filter Object to filter the output.
     * @deprecated Use Client.rest.channels#getCalendarEvents
     */
    async getCalendarEvents(channelID: string, filter?: GetCalendarEventsFilter): Promise<Array<CalendarEvent>> {
        return this.rest.channels.getCalendarEvents(channelID, filter);
    }
    /** This method is used to get a specific CalendarEventRSVP.
     *
     * Note: this method requires a Calendar channel.
     * @param channelID ID of a Calendar channel
     * @param eventID ID of a Calendar Event
     * @param memberID ID of a Guild Member
     * @deprecated Use Client.rest.channels#getCalendarRSVP
     */
    async getCalendarRSVP(channelID: string, eventID: number, memberID: string): Promise<CalendarEventRSVP> {
        return this.rest.channels.getCalendarRSVP(channelID, eventID, memberID);
    }
    /** This method is used to get a list of CalendarEventRSVP.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @deprecated Use Client.rest.channels#getCalendarRSVPs
     */
    async getCalendarRSVPs(channelID: string, eventID: number): Promise<Array<CalendarEventRSVP>> {
        return this.rest.channels.getCalendarRSVPs(channelID, eventID);
    }
    /**
     * Get permission coming from a category.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category the permission is in
     * @param targetID ID of the user (string) or role (number) to get the permission for
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     * @deprecated Use Client.rest.guilds#getCategoryPermission
     */
    async getCategoryPermission(guildID: string, categoryID: number, targetID: string | number): Promise<Permission> {
        return this.rest.guilds.getCategoryPermission(guildID, categoryID, targetID);
    }
    /**
     * Get permissions of a category.
     * @param guildID ID of the server the category is in.
     * @param categoryID ID of the category the permissions are in
     * @deprecated Use Client.rest.guilds#getCategoryPermissions
     */
    async getCategoryPermissions(guildID: string, categoryID: number): Promise<Array<Permission>> {
        return this.rest.guilds.getCategoryPermissions(guildID, categoryID);
    }
    /**
     * Get role permissions from a specified category.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category the permissions are in
     * @deprecated Use Client.rest.guilds#getCategoryRolePermissions
     */
    async getCategoryRolePermissions(guildID: string, categoryID: number): Promise<Array<Permission>> {
        return this.rest.guilds.getCategoryRolePermissions(guildID, categoryID);
    }
    /**
     * Get user permissions from a specified category.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category the permissions are in
     * @deprecated Use Client.rest.guilds#getCategoryUserPermissions
     */
    async getCategoryUserPermissions(guildID: string, categoryID: number): Promise<Array<Permission>> {
        return this.rest.guilds.getCategoryUserPermissions(guildID, categoryID);
    }
    /** This method is used to get a specific guild channel, if cached.
     *
     * Note: this method doesn't send a REST request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Channels)
     * @param guildID ID of the guild the channel is in.
     * @param channelID The ID of the channel to get from cache.
     */
    getChannel<T extends AnyChannel = AnyChannel>(guildID: string, channelID: string): T | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        if (!channelID) throw new Error("channelID is a required parameter.");
        return this.guilds.get(guildID)?.channels.get(channelID) as T;
    }
    /**
     * Get the permissions of a user or role for a specified channel.
     * @param guildID ID of the guild the channel is in
     * @param channelID ID of the channel
     * @param targetID ID of the user or role to get the permission
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     * @deprecated Use Client.rest.channels#getPermission
     */
    async getChannelPermission(guildID: string, channelID: string, targetID: string | number): Promise<Permission> {
        return this.rest.channels.getPermission(guildID, channelID, targetID);
    }
    /** @deprecated Use Client.rest.channels#getPermissions */
    async getChannelPermissions(guildID: string, channelID: string): Promise<Array<Permission>> {
        return this.rest.channels.getPermissions(guildID, channelID);
    }
    /**
     * Get existing channel permissions for a specified role.
     * @param guildID ID of the guild where the channel is in
     * @param channelID ID of the channel
     * @deprecated Use Client.rest.channels#getRolePermissions
     */
    async getChannelRolePermissions(guildID: string, channelID: string): Promise<Array<Permission>> {
        return this.rest.channels.getRolePermissions(guildID, channelID);
    }
    /**
     * Get the permissions of every user in the guild for a specified channel.
     * @param guildID ID of the guild where the channel is in
     * @param channelID ID of the channel
     * @deprecated Use Client.rest.channels#getUserPermissions
     */
    async getChannelUserPermissions(guildID: string, channelID: string): Promise<Array<Permission>> {
        return this.rest.channels.getUserPermissions(guildID, channelID);
    }
    /** This method is used to get a channel doc.
     *
     * Note: This method requires a "Docs" channel.
     * @param channelID ID of the Docs channel.
     * @param docID ID of the channel doc.
     * @deprecated Use Client.rest.channels#getDoc
     */
    async getDoc(channelID: string, docID: number): Promise<Doc> {
        return this.rest.channels.getDoc(channelID, docID);
    }
    /**
     * Get a specific comment from a doc.
     * @param channelID ID of the channel containing the doc.
     * @param docID ID of the doc the comment is in.
     * @param commentID ID of the comment to get.
     * @deprecated Use Client.rest.channels#getDocComment
     */
    async getDocComment(channelID: string, docID: number, commentID: number): Promise<DocComment> {
        return this.rest.channels.getDocComment(channelID, docID, commentID);
    }
    /**
     * Get every comment from a doc.
     * @param channelID ID of the channel containing the doc.
     * @param docID ID of the doc the comment is in.
     * @deprecated Use Client.rest.channels#getDocComments
     */
    async getDocComments(channelID: string, docID: number): Promise<Array<DocComment>> {
        return this.rest.channels.getDocComments(channelID, docID);
    }
    /** This method is used to get a list of "Channel" Doc.
     * @param channelID ID of a "Docs" channel.
     * @param filter Object to filter the output.
     * @deprecated Use Client.rest.channels#getDocs
     */
    async getDocs(channelID: string, filter?: GetDocsFilter): Promise<Array<Doc>> {
        return this.rest.channels.getDocs(channelID, filter);
    }
    /** This method is used to get a specific forum thread comment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a Forum thread.
     * @param commentID ID of a Forum thread comment.
     * @deprecated Use Client.rest.channels#getForumComment
     */
    async getForumComment(channelID: string, threadID: number, commentID: number): Promise<ForumThreadComment> {
        return this.rest.channels.getForumComment(channelID, threadID, commentID);
    }
    /** This method is used to get a list of ForumThreadComment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a Forum Thread.
     * @deprecated Use Client.rest.channels#getForumComments
     */
    async getForumComments(channelID: string, threadID: number): Promise<Array<ForumThreadComment>> {
        return this.rest.channels.getForumComments(channelID, threadID);
    }
    /** This method is used to get a specific forum thread.
     *
     * Note: This method requires a "Forum" channel.
     * @param channelID ID of a specific Forum channel.
     * @param threadID ID of the specific Forum Thread.
     * @deprecated Use Client.rest.channels#getForumThread
     */
    async getForumThread(channelID: string, threadID: number): Promise<ForumThread<ForumChannel>> {
        return this.rest.channels.getForumThread(channelID, threadID);
    }
    /** This method is used to get a list of ForumThread.
     * @param channelID ID of a "Forum" channel.
     * @param filter Object to filter the output.
     * @deprecated Use Client.rest.channels#getForumThreads
     */
    async getForumThreads(channelID: string, filter?: GetForumThreadsFilter): Promise<Array<ForumThread<ForumChannel>>> {
        return this.rest.channels.getForumThreads(channelID, filter);
    }
    /** Get a cached Guild, returns `undefined` if not cached.
     * Note: this method doesn't send a rest request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Guilds)
     * @param guildID The ID of the guild to get.
     */
    getGuild(guildID: string): Guild | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        return this.guilds.get(guildID);
    }
    /**
     * Read a guild category.
     * @param guildID ID of the guild to create a category in.
     * @param categoryID ID of the category you want to read.
     * @deprecated Use Client.rest.guilds#getCategory
     */
    async getGuildCategory(guildID: string, categoryID: number): Promise<Category> {
        return this.rest.guilds.getCategory(guildID, categoryID);
    }
    /**
     * Get a guild group.
     * @param guildID ID of the guild.
     * @param groupID ID of the group to get.
     * @deprecated Use Client.rest.guilds#getGroup
     */
    async getGuildGroup(guildID: string, groupID: string): Promise<Group> {
        return this.rest.guilds.getGroup(guildID, groupID);
    }
    /**
     * Get guild groups.
     * @param guildID ID of the guild.
     * @deprecated Use Client.rest.guilds#getGroups
     */
    async getGuildGroups(guildID: string): Promise<Array<Group>> {
        return this.rest.guilds.getGroups(guildID);
    }
    /**
     * Get a guild role.
     * @param guildID ID of the guild where the role is.
     * @param roleID ID of the role to get.
     * @deprecated Use Client.rest.guilds#getRole
     */
    async getGuildRole(guildID: string, roleID: number): Promise<Role> {
        return this.rest.guilds.getRole(guildID, roleID);
    }
    /**
     * Get every guild roles from a guild.
     * @param guildID ID of the guild where roles are.
     * @deprecated Use Client.rest.guilds#getRoles
     */
    async getGuildRoles(guildID: string): Promise<Array<Role>> {
        return this.rest.guilds.getRoles(guildID);
    }
    /**
     * Get guild subscriptions.
     * @param guildID ID of the guild.
     * @param subscriptionID ID of the subscription to get.
     * @deprecated Use Client.rest.guilds#getSubscription
     */
    async getGuildSubscription(guildID: string, subscriptionID: string): Promise<Subscription> {
        return this.rest.guilds.getSubscription(guildID, subscriptionID);
    }
    /**
     * Get guild subscriptions.
     * @param guildID ID of the guild.
     * @deprecated Use Client.rest.guilds#getSubscriptions
     */
    async getGuildSubscriptions(guildID: string): Promise<Array<Subscription>> {
        return this.rest.guilds.getSubscriptions(guildID);
    }
    /** This method is used to get a specific list item.
     * @param channelID ID of a "List" channel.
     * @param itemID ID of a list item.
     * @deprecated Use Client.rest.channels#getListItem
     */
    async getListItem(channelID: string, itemID: string): Promise<ListItem> {
        return this.rest.channels.getListItem(channelID, itemID);
    }
    /** This method is used to get a list of ListItem.
     * @param channelID ID of a "List" channel.
     * @deprecated Use Client.rest.channels#getListItems
     */
    async getListItems(channelID: string): Promise<Array<ListItem>> {
        return this.rest.channels.getListItems(channelID);
    }
    /** This method is used to get a specific guild member, if cached.
     *
     * Note: this method doesn't send a rest request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Guilds)
     * @param guildID The ID of the guild the member is in.
     * @param memberID The ID of the member to get.
     */
    getMember(guildID: string, memberID: string): Member | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        if (!memberID) throw new Error("memberID is a required parameter.");
        return this.getGuild(guildID)?.members.get(memberID);
    }
    /**
     * Get guild member permissions.
     * @param guildID ID of the guild.
     * @param memberID ID of the member.
     * @deprecated Use Client.rest.guilds#getMemberPermission.
     */
    async getMemberPermission(guildID: string, memberID: string): Promise<Array<Permissions>> {
        return this.rest.guilds.getMemberPermission(guildID, memberID);
    }
    /**
     * Get a list of role IDs of a specific member within a guild.
     * @param guildID ID of the guild the member is in.
     * @param memberID ID of the member to get roles from.
     * @deprecated Use Client.rest.guilds#getMemberRoles
     */
    async getMemberRoles(guildID: string, memberID: string): Promise<Array<number>> {
        return this.rest.guilds.getMemberRoles(guildID, memberID);
    }
    /** This method is used to get a list of cached guild member.
     *
     * Note: this method doesn't send a REST request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Guilds)
     * @param guildID ID of the guild to get members.
     */
    getMembers(guildID: string): Array<Member> | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        return this.getGuild(guildID)?.members.map(member => member);
    }
    /** Get a channel's message, if cached.
     *
     * Note: this method doesn't send a rest request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Channels)
     * @param guildID ID of the guild.
     * @param channelID ID of the channel containing the message.
     * @param messageID ID of the message you'd like to get.
     */
    getMessage(guildID: string, channelID: string, messageID: string): Message<AnyTextableChannel> | undefined {
        const channel = this.getChannel(guildID, channelID);
        if (channel instanceof TextChannel) {
            return channel?.messages.get(messageID);
        }
    }
    /** This method is used to get cached messages from a channel.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Channels)
     * @param guildID ID of the guild.
     * @param channelID ID of a "Chat" channel.
     */
    getMessages(guildID: string, channelID: string): Array<Message<AnyTextableChannel>> | undefined {
        const channel = this.getChannel(guildID, channelID);
        if (channel instanceof TextChannel) {
            return channel?.messages.map(msg => msg);
        }
    }
    /**
     * Get a user.
     *
     * Note: when getting the app's user, only the information specific to 'User' will be returned.
     * If you'd like to get the AppUser (the app itself), use Client#user.
     * @param userID The ID of the user to get.
     */
    async getUser(userID: string): Promise<User> {
        return this.rest.misc.getUser(userID);
    }
    /**
     * Retrieve user's joined servers.
     * @param userID ID of the user. (`@me` can be used to select your instance)
     * @deprecated Use Client.rest.misc#getUserGuilds
     */
    async getUserGuilds(userID: string): Promise<Array<Guild>> {
        return this.rest.misc.getUserGuilds(userID);
    }
    /** This method is used to get a specific webhook.
     * @param guildID ID of a guild.
     * @param webhookID ID of a webhook.
     * @deprecated Use Client.rest.webhooks#get
     */
    async getWebhook(guildID: string, webhookID: string): Promise<Webhook> {
        return this.rest.webhooks.get(guildID, webhookID);
    }
    /** This method is used to get a list of Webhook.
     * @param guildID ID of a guild.
     * @param channelID ID of a channel.
     * @deprecated Use Client.rest.webhooks#getWebhooks
     */
    async getWebhooks(guildID: string, channelID: string): Promise<Array<Webhook>> {
        return this.rest.webhooks.getWebhooks(guildID, channelID);
    }
    /** Lock a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @deprecated Use Client.rest.channels#lockForumThread
     */
    async lockForumThread(channelID: string, threadID: number): Promise<void> {
        return this.rest.channels.lockForumThread(channelID, threadID);
    }
    /** Add a member to a group
     * @param groupID ID of a guild group.
     * @param memberID ID of a member.
     * @deprecated Use Client.rest.guilds#memberAddGroup
     */
    async memberAddGroup(groupID: string, memberID: string): Promise<void> {
        return this.rest.guilds.memberAddGroup(groupID, memberID);
    }
    /** Add a role to a member
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param roleID ID of a role.
     * @deprecated Use Client.rest.guilds#memberAddRole
     */
    async memberAddRole(guildID: string, memberID: string, roleID: number): Promise<void> {
        return this.rest.guilds.memberAddRole(guildID, memberID, roleID);
    }
    /** Remove a member from a group
     * @param groupID ID of a guild group.
     * @param memberID ID of a member.
     * @deprecated Use Client.rest.guilds#memberRemoveGroup
     */
    async memberRemoveGroup(groupID: string, memberID: string): Promise<void> {
        return this.rest.guilds.memberRemoveGroup(groupID, memberID);
    }
    /** Remove a role from a member
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param roleID ID of a role.
     * @deprecated Use Client.rest.guilds#memberRemoveRole
     */
    async memberRemoveRole(guildID: string, memberID: string, roleID: number): Promise<void> {
        return this.rest.guilds.memberRemoveRole(guildID, memberID, roleID);
    }
    /** Pin a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @deprecated Use Client.rest.channels#pinForumThread
     */
    async pinForumThread(channelID: string, threadID: number): Promise<void> {
        return this.rest.channels.pinForumThread(channelID, threadID);
    }
    /**
     * Pin a message.
     * @param channelID ID of the channel where the message is.
     * @param messageID ID of the message to pin.
     * @deprecated Use Client.rest.channels#pinMessage
     */
    async pinMessage(channelID: string, messageID: string): Promise<void> {
        return this.rest.channels.pinMessage(channelID, messageID);
    }
    /** Unban a guild member.
     * @param guildID ID of the guild the member was in.
     * @param memberID ID of the member to unban.
     * @deprecated Use Client.rest.guilds#removeBan
     */
    async removeBan(guildID: string, memberID: string): Promise<void> {
        return this.rest.guilds.removeBan(guildID, memberID);
    }
    /** Remove a member from a guild.
     * @param guildID The ID of the guild the member is in.
     * @param memberID The ID of the member to kick.
     * @deprecated Use Client.rest.guilds#removeMember
     */
    async removeMember(guildID: string, memberID: string): Promise<void> {
        return this.rest.guilds.removeMember(guildID, memberID);
    }
    /**
     * Use REST methods (Client#rest) without connecting to the gateway.
     * @param fakeReady Emit a fake "ready" event (default: true).
     */
    restMode(fakeReady = true): void {
        if (this.shouldCheckForUpdate) void this.checkForUpdate();
        this.params.restMode = true;
        if (this.params.connectionMessage) console.log("> REST Mode has been enabled.");
        void this.rest.misc.getAppUser().then(async () => {
            await this.rest.misc.getUserGuilds("@me").catch(() => [])
                .then(guilds => {
                    if (!guilds) guilds = [];
                    for (const guild of guilds) this.guilds.add(guild);
                });
            if (fakeReady) this.emit("ready");
        });
    }
    /**
     * Restore an archived channel.
     * @param channelID ID of the archived channel to restore.
     * @deprecated Use Client.rest.channels#restore
     */
    async restoreChannel(channelID: string): Promise<void> {
        return this.rest.channels.restore(channelID);
    }
    /** Set a member's xp using the built-in EXP system.
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param amount Total amount of experience.
     * @deprecated Use Client.rest.guilds#setMemberXP
     */
    async setMemberXP(guildID: string, memberID: string, amount: number): Promise<number> {
        return this.rest.guilds.setMemberXP(guildID, memberID, amount);
    }
    /** Mark a list item as uncompleted.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     * @deprecated Use Client.rest.channels#uncompleteListItem
     */
    async uncompleteListItem(channelID: string, itemID: string): Promise<void> {
        return this.rest.channels.uncompleteListItem(channelID, itemID);
    }
    /** Unlock a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @deprecated Use Client.rest.channels#unlockForumThread
     */
    async unlockForumThread(channelID: string, threadID: number): Promise<void> {
        return this.rest.channels.unlockForumThread(channelID, threadID);
    }


    /** Unpin a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @deprecated Use Client.rest.channels#unpinForumThread
     */
    async unpinForumThread(channelID: string, threadID: number): Promise<void> {
        return this.rest.channels.unpinForumThread(channelID, threadID);
    }

    /**
     * Unpin a message.
     * @param channelID ID of the channel where the message is.
     * @param messageID ID of the message to unpin.
     * @deprecated Use Client.rest.channels#unpinMessage
     */
    async unpinMessage(channelID: string, messageID: string): Promise<void> {
        return this.rest.channels.unpinMessage(channelID, messageID);
    }
    /**
     * Change a user's status, this includes the app's one.
     * @param userID User ID (@me can be used).
     * @param options Status options
     * @deprecated Use Client.rest.misc#updateUserStatus
     */
    async updateUserStatus(userID: string | "@me", options: PUTUserStatusBody): Promise<void> {
        return this.rest.misc.updateUserStatus(userID, options);
    }
}
