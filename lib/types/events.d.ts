/** @module Events */
import type {
    AnyReactionInfo,
    GuildCreateInfo,
    GuildDeleteInfo,
    UserStatusCreate,
    UserStatusDelete
} from "./types";
import { AnyChannel, AnyTextableChannel, ChannelMessageReactionBulkRemove, PossiblyUncachedMessage } from "./channel";
import type { AnyPacket, WelcomePacket } from "./gateway-raw";
import {
    JSONAnnouncement,
    JSONAnnouncementComment,
    JSONCalendarChannel,
    JSONCalendarEvent,
    JSONCalendarEventComment,
    JSONCalendarEventRSVP,
    JSONChannel,
    JSONDoc,
    JSONDocChannel,
    JSONDocComment,
    JSONForumChannel,
    JSONForumThread,
    JSONForumThreadComment,
    JSONGuildChannel,
    JSONGuildGroup,
    JSONGuildRole,
    JSONMessage,
    JSONTextChannel
} from "./json";
import type { BannedMember } from "../structures/BannedMember";
import type { ForumThread } from "../structures/ForumThread";
import type { ForumThreadComment } from "../structures/ForumThreadComment";
import type { Message } from "../structures/Message";
import type { MemberRemoveInfo } from "../structures/MemberRemoveInfo";
import type { MemberUpdateInfo } from "../structures/MemberUpdateInfo";
import type { ListItem } from "../structures/ListItem";
import type { CalendarEventRSVP } from "../structures/CalendarRSVP";
import type { CalendarEvent } from "../structures/CalendarEvent";
import type { Doc } from "../structures/Doc";
import type { Member } from "../structures/Member";
import type { Webhook } from "../structures/Webhook";
import { TextChannel } from "../structures/TextChannel";
import { ForumChannel } from "../structures/ForumChannel";
import { CalendarChannel } from "../structures/CalendarChannel";
import { DocChannel } from "../structures/DocChannel";
import { GuildChannel } from "../structures/GuildChannel";
import { Channel } from "../structures/Channel";
import { CalendarEventComment } from "../structures/CalendarEventComment";
import { DocComment } from "../structures/DocComment";
import { Announcement } from "../structures/Announcement";
import type { AnnouncementComment } from "../structures/AnnouncementComment";
import { GuildGroup } from "../structures/GuildGroup";
import { GuildRole } from "../structures/GuildRole";
import { GuildCategory } from "../structures/GuildCategory";
import type { APIBotUser } from "guildedapi-types.ts/v1";

/** Every client events. */
export interface ClientEvents {
    // message: [message: string];
    /** @event Emitted after getting an error. */
    error: [error: Error];
    /** @event Emitted when something goes a little wrong. */
    warn: [message: string];
    /** @event Emitted when things needs to be debugged. */
    debug: [message: string | object];
    /** @event Emitted when the bot is ready. */
    ready: [];
    /** @event Emitted when a message is created in a "chat" channel. */
    messageCreate: [message: Message<AnyTextableChannel>];
    /** @event Emitted when a message coming from a "chat" channel is edited. */
    messageUpdate: [message: Message<AnyTextableChannel>, oldMessage: JSONMessage | null];
    /** @event Emitted when a message coming from a "chat" channel is deleted. */
    messageDelete: [message: PossiblyUncachedMessage];
    /** @event Emitted when a message coming from a "chat" channel is pinned. */
    messagePin: [message: Message<AnyTextableChannel>];
    /** @event Emitted when a message coming from a "chat" channel is unpinned. */
    messageUnpin: [message: Message<AnyTextableChannel>];
    /** @event Emitted when a reaction is added to anything. */
    reactionAdd: [reactionInfo: AnyReactionInfo];
    /** @event Emitted when a reaction is removed from anything. */
    reactionRemove: [reactionInfo: AnyReactionInfo];
    /** @event Emitted when a bulk reaction remove is performed. */
    reactionBulkRemove: [bulkInfo: ChannelMessageReactionBulkRemove];
    /** @event Emitted when a guild channel is created. */
    channelCreate: [channel: AnyChannel];
    /** @event Emitted when a guild channel is updated. */
    channelUpdate: [channel: TextChannel, oldChannel: JSONTextChannel | null]
    | [channel: ForumChannel, oldChannel: JSONForumChannel | null]
    | [channel: CalendarChannel, oldChannel: JSONCalendarChannel | null]
    | [channel: DocChannel, oldChannel: JSONDocChannel | null]
    | [channel: GuildChannel, oldChannel: JSONGuildChannel | null]
    | [channel: Channel, oldChannel: JSONChannel | null];
    /** @event Emitted when a guild channel is deleted. */
    channelDelete: [channel: AnyChannel];
    /** @event Emitted when a channel role permission is created. */
    channelRolePermissionCreated: [channelRolePermission: ChannelRolePermission];
    /** @event Emitted when a channel role permission is updated. */
    channelRolePermissionUpdated: [channelRolePermission: ChannelRolePermission];
    /** @event Emitted when a channel role permission is deleted. */
    channelRolePermissionDeleted: [channelRolePermission: ChannelRolePermission];
    /** @event Emitted when a channel user permission is created. */
    channelUserPermissionCreated: [channelUserPermission: ChannelUserPermission];
    /** @event Emitted when a channel user permission is updated. */
    channelUserPermissionUpdated: [channelUserPermission: ChannelUserPermission];
    /** @event Emitted when a channel user permission is deleted. */
    channelUserPermissionDeleted: [channelUserPermission: ChannelUserPermission];
    /** @event Emitted when a channel category role permission is created. */
    channelCategoryRolePermissionCreated: [channelCategoryUserPermission: ChannelCategoryRolePermission];
    /** @event Emitted when a channel category roke permission is updated. */
    channelCategoryRolePermissionUpdated: [channelCategoryUserPermission: ChannelCategoryRolePermission];
    /** @event Emitted when a channel category role permission is deleted. */
    channelCategoryRolePermissionDeleted: [channelCategoryUserPermission: ChannelCategoryRolePermission];
    /** @event Emitted when a channel category user permission is created. */
    channelCategoryUserPermissionCreated: [channelCategoryUserPermission: ChannelCategoryUserPermission];
    /** @event Emitted when a channel category user permission is updated. */
    channelCategoryUserPermissionUpdated: [channelCategoryUserPermission: ChannelCategoryUserPermission];
    /** @event Emitted when a channel category user permission is deleted. */
    channelCategoryUserPermissionDeleted: [channelCategoryUserPermission: ChannelCategoryUserPermission];
    /** @event Emitted when a guild channel is archived. */
    channelArchive: [channel: AnyChannel];
    /** @event Emitted when a guild channel is restored. */
    channelRestore: [channel: AnyChannel];
    /** @event Emitted when a forum thread is created. */
    forumThreadCreate: [thread: ForumThread<ForumChannel>];
    /** @event Emitted when a forum thread is edited. */
    forumThreadUpdate: [thread: ForumThread<ForumChannel>, oldThread: JSONForumThread | null];
    /** @event Emitted when a forum thread is deleted. */
    forumThreadDelete: [thread: ForumThread<ForumChannel>];
    /** @event Emitted when a forum thread is pinned. */
    forumThreadPin: [thread: ForumThread<ForumChannel>];
    /** @event Emitted when a forum thread is unpinned. */
    forumThreadUnpin: [thread: ForumThread<ForumChannel>];
    /** @event Emitted when a thread comment is created. */
    forumCommentCreate: [comment: ForumThreadComment];
    /** @event Emitted when forum thread comment is edited. */
    forumCommentUpdate: [comment: ForumThreadComment, oldComment: JSONForumThreadComment | null];
    /** @event Emitted when forum thread is deleted. */
    forumCommentDelete: [comment: ForumThreadComment];
    /** @event Emitted when forum thread got locked. */
    forumThreadLock: [ForumThread: ForumThread<ForumChannel>];
    /** @event Emitted when forum thread got unlocked. */
    forumThreadUnlock: [ForumThread: ForumThread<ForumChannel>];
    /** @event Emitted when a guild member got banned. */
    guildBanAdd: [BannedMember: BannedMember];
    /** @event Emitted when guild member got unbanned. */
    guildBanRemove: [BannedMember: BannedMember];
    /** @event Emitted when a member joined the server. */
    guildMemberAdd: [Member: Member, guildMemberCount: number];
    /** @event Emitted when a member left the server. */
    guildMemberRemove: [MemberRemoveInfo: MemberRemoveInfo];
    /** @event Emitted when a member updated their guild profile.
     * It does include role changes, nickname & more.
     */
    guildMemberUpdate: [MemberUpdateInfo: MemberUpdateInfo];
    /** @event Emitted when the client joins a guild. */
    guildCreate: [GuildCreateInfo: GuildCreateInfo];
    /** @event Emitted when the client leaves a guild. */
    guildDelete: [GuildDeleteInfo: GuildDeleteInfo];
    /** @event Emitted when a guild group is created. */
    guildGroupCreate: [guildGroup: GuildGroup];
    /** @event Emitted when a guild group is updated. */
    guildGroupUpdate: [guildGroup: GuildGroup, oldGuildGroup: JSONGuildGroup | null];
    /** @event Emitted when a guild group is deleted. */
    guildGroupDelete: [guildGroup: GuildGroup];
    /** @event Emitted when a guild role is created. */
    guildRoleCreate: [role: GuildRole];
    /** @event Emitted when a guild role is updated. */
    guildRoleUpdate: [role: GuildRole, oldRole: JSONGuildRole | null];
    /** @event Emitted when a guild role is deleted. */
    guildRoleDelete: [role: GuildRole];
    /** @event Emitted when a doc is created. */
    docCreate: [Doc: Doc];
    /** @event Emitted when a doc is edited. */
    docUpdate: [Doc: Doc , oldDoc: JSONDoc | null];
    /** @event Emitted when a doc is deleted. */
    docDelete: [DeletedDoc: Doc];
    /** @event Emitted when a doc comment is created. */
    docCommentCreate: [comment: DocComment];
    /** @event Emitted when a doc comment is edited. */
    docCommentUpdate: [comment: DocComment, oldComment: JSONDocComment | null];
    /** @event Emitted when a doc comment is deleted. */
    docCommentDelete: [comment: DocComment];
    /** @event Emitted when an event was added to a calendar. */
    calendarEventCreate: [CalendarEvent: CalendarEvent];
    /** @event Emitted when a calendar event got updated. */
    calendarEventUpdate: [CalendarEvent: CalendarEvent, oldEvent: JSONCalendarEvent | null];
    /** @event Emitted when a calendar event is deleted. */
    calendarEventDelete: [CalendarEvent: CalendarEvent];
    /** @event Emitted when an event RSVP is updated. */
    calendarEventRsvpUpdate: [CalendarRSVP: CalendarEventRSVP, oldRSVP: JSONCalendarEventRSVP | null];
    /** @event Emitted when multiple event RSVPs are updated. */
    calendarEventRsvpBulkUpdate: [CalendarRSVPs: Array<CalendarEventRSVP>, oldRSVPs: Array<JSONCalendarEventRSVP | null>];
    /** @event Emitted when an event RSVP is deleted. */
    calendarEventRsvpDelete: [CalendarRSVP: CalendarEventRSVP];
    /** @event Emitted when a calendar event comment is created. */
    calendarCommentCreate: [comment: CalendarEventComment];
    /** @event Emitted when a calendar event comment is edited. */
    calendarCommentUpdate: [comment: CalendarEventComment, oldComment: JSONCalendarEventComment | null];
    /** @event Emitted when a calendar event comment is deleted. */
    calendarCommentDelete: [comment: CalendarEventComment];
    /** @event Emitted when a list item is created. */
    listItemCreate: [item: ListItem];
    /** @event Emitted when a list item is edited. */
    listItemUpdate: [item: ListItem];
    /** @event Emitted when a list item is deleted. */
    listItemDelete: [item: ListItem];
    /** @event Emitted when a list item is completed. */
    listItemComplete: [item: ListItem];
    /** @event Emitted when a list item is uncompleted. */
    listItemUncomplete: [item: ListItem];
    /** @event Emitted when an announcement coming from an Announcement channel is created. */
    announcementCreate: [announcement: Announcement];
    /** @event Emitted when an announcement coming from an Announcement channel is updated. */
    announcementUpdate: [announcement: Announcement, oldAnnouncement: JSONAnnouncement | null];
    /** @event Emitted when an announcement coming from an Announcement channel is deleted. */
    announcementDelete: [announcement: Announcement];
    /** @event Emitted when a comment is created inside an announcement. */
    announcementCommentCreate: [comment: AnnouncementComment];
    /** @event Emitted when a comment within an announcement is updated. */
    announcementCommentUpdate: [comment: AnnouncementComment, oldComment: JSONAnnouncementComment | null];
    /** @event Emitted when a comment within an announcement is deleted. */
    announcementCommentDelete: [comment: AnnouncementComment];
    /** @event Emitted when a webhook is being created. */
    webhooksCreate: [webhook: Webhook];
    /** @event Emitted when a webhook is definitely created, or has been updated. */
    webhooksUpdate: [webhook: Webhook];
    /** @event Emitted when a user updates their user status. */
    userStatusCreate: [userStatus: UserStatusCreate];
    /** @event Emitted when a user delete their user status. */
    userStatusDelete: [userStatus: UserStatusDelete];
    /** @event Emitted when a category is created. */
    guildCategoryCreate: [category: GuildCategory];
    /** @event Emitted when a category is updated. */
    guildCategoryUpdate: [category: GuildCategory];
    /** @event Emitted when a category is deleted. */
    guildCategoryDelete: [category: GuildCategory];
    /** @event Emitted on process exit. */
    exit: [message: string];
}

/** Internal websocket events. */
export interface WebsocketEvents {
    /** @event Emitted after getting an error. */
    error: [error: Error];
    /** @event Emitted to debug. */
    debug: [message: string | object];
    /** @event Emitted when process exit. */
    exit: [message: string | Error];
    /** @event Emitted when a packet is parsed. */
    GATEWAY_PARSED_PACKET: [type: string | null, data: object];
    /** @event Emitted when a packet is sent. */
    GATEWAY_PACKET: [packet: AnyPacket];
    /** @event Emitted when connected to gateway. */
    GATEWAY_WELCOME: [data: APIBotUser];
    /** @event Emitted when connected to gateway. */
    GATEWAY_WELCOME_PACKET: [packet: WelcomePacket];
    /** @event Emitted when a packet isn't recognized. */
    GATEWAY_UNKNOWN_PACKET: [message: string, packet: AnyPacket];
    /** @event Emitted when disconnected from gateway. */
    disconnect: [error: Error];
}
