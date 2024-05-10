/** REST/Endpoints */
/* eslint-disable @typescript-eslint/quotes */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint no-use-before-define: 0 */

export const CHANNELS = () => `/channels`;
export const CHANNEL = (channelID: string) => `/channels/${channelID}`;
export const CHANNEL_ARCHIVE = (channelID: string) => `/channels/${channelID}/archive`;

export const GUILD = (guildID: string) => `/servers/${guildID}`;
export const USER = (userID: string) => `/users/${userID}`;
export const USER_SERVERS = (userID: string) => `/users/${userID}/servers`;
export const USER_STATUS = (userID: string) => `/users/${userID}/status`;

export const CHANNEL_MESSAGES = (channelID: string) => `/channels/${channelID}/messages`;
export const CHANNEL_MESSAGE = (channelID: string, messageID: string) => `/channels/${channelID}/messages/${messageID}`;
export const CHANNEL_MESSAGE_PIN = (channelID: string, messageID: string) => `/channels/${channelID}/messages/${messageID}/pin`;
export const CHANNEL_MESSAGE_EMOTES = (channelID: string, messageID: string) => `/channels/${channelID}/messages/${messageID}/emotes`;
export const CHANNEL_MESSAGE_EMOTE = (channelID: string, messageID: string, emoteID: number) => `/channels/${channelID}/messages/${messageID}/emotes/${emoteID}`;
export const CHANNEL_ANNOUNCEMENTS = (channelID: string) => `/channels/${channelID}/announcements`;
export const CHANNEL_ANNOUNCEMENT = (channelID: string, announcementID: string) => `/channels/${channelID}/announcements/${announcementID}`;
export const CHANNEL_ANNOUNCEMENT_EMOTES = (channelID: string, announcementID: string) => `/channels/${channelID}/announcements/${announcementID}/emotes`;
export const CHANNEL_ANNOUNCEMENT_EMOTE = (channelID: string, announcementID: string, emoteID: number) => `/channels/${channelID}/announcements/${announcementID}/emotes/${emoteID}`;
export const CHANNEL_ANNOUNCEMENT_COMMENTS = (channelID: string, announcementID: string) => `/channels/${channelID}/announcements/${announcementID}/comments`;
export const CHANNEL_ANNOUNCEMENT_COMMENT = (channelID: string, announcementID: string, commentID: number) => `/channels/${channelID}/announcements/${announcementID}/comments/${commentID}`;
export const CHANNEL_ANNOUNCEMENT_COMMENT_EMOTES = (channelID: string, announcementID: string, commentID: number) => `/channels/${channelID}/announcements/${announcementID}/comments/${commentID}/emotes`;
export const CHANNEL_ANNOUNCEMENT_COMMENT_EMOTE = (channelID: string, announcementID: string, commentID: number, emoteID: number) => `/channels/${channelID}/announcements/${announcementID}/comments/${commentID}/emotes/${emoteID}`;

export const MEMBER_NICKNAME = (guildID: string, memberID: string) => `/servers/${guildID}/members/${memberID}/nickname`;

export const GUILD_MEMBER = (guildID: string, memberID: string) => `/servers/${guildID}/members/${memberID}`;
export const GUILD_MEMBER_PERMISSION = (guildID: string, memberID: string) => `/servers/${guildID}/members/${memberID}/permissions`;
export const GUILD_MEMBER_XP = (guildID: string, memberID: string) => `/servers/${guildID}/members/${memberID}/xp`;
export const GUILD_MEMBER_BULK_XP = (guildID: string) => `/servers/${guildID}/xp`;
export const GUILD_MEMBERS = (guildID: string) => `/servers/${guildID}/members`;
export const GUILD_MEMBER_SOCIALS = (guildID: string, memberID: string, type: string) => `/servers/${guildID}/members/${memberID}/social-links/${type}`;
export const GUILD_CHANNEL_ROLE_PERMISSION = (serverID: string, channelID: string, roleID: number) => `/servers/${serverID}/channels/${channelID}/permissions/roles/${roleID}`;
export const GUILD_CHANNEL_ROLE_PERMISSIONS = (serverID: string, channelID: string) => `/servers/${serverID}/channels/${channelID}/permissions/roles`;
export const GUILD_CHANNEL_USER_PERMISSION = (serverID: string, channelID: string, userID: string) => `/servers/${serverID}/channels/${channelID}/permissions/users/${userID}`;
export const GUILD_CHANNEL_USER_PERMISSIONS = (serverID: string, channelID: string) => `/servers/${serverID}/channels/${channelID}/permissions/users`;
export const GUILD_CATEGORY_USER_PERMISSION = (serverID: string, categoryID: number, userID: string) => `/servers/${serverID}/categories/${categoryID}/permissions/users/${userID}`;
export const GUILD_CATEGORY_USER_PERMISSIONS = (serverID: string, categoryID: number) => `/servers/${serverID}/categories/${categoryID}/permissions/users`;
export const GUILD_CATEGORY_ROLE_PERMISSION = (serverID: string, categoryID: number, roleID: number) => `/servers/${serverID}/categories/${categoryID}/permissions/roles/${roleID}`;
export const GUILD_CATEGORY_ROLE_PERMISSIONS = (serverID: string, categoryID: number) => `/servers/${serverID}/categories/${categoryID}/permissions/roles`;

export const GUILD_GROUPS = (guildID: string) => `/servers/${guildID}/groups`;
export const GUILD_GROUP = (guildID: string, groupID: string) => `/servers/${guildID}/groups/${groupID}`;
export const GUILD_GROUP_MEMBER = (groupID: string, memberID: string) => `/groups/${groupID}/members/${memberID}`;
export const GUILD_GROUP_MEMBERS = (groupID: string) => `/groups/${groupID}/members/`;
export const GUILD_GROUP_ALTERNATIVE = (groupID: string) => `/groups/${groupID}`;

export const GUILD_SUBSCRIPTIONS = (guildID: string) => `/servers/${guildID}/subscriptions/tiers`;
export const GUILD_SUBSCRIPTION = (guildID: string, subscriptionID: string) => `/servers/${guildID}/subscriptions/tiers/${subscriptionID}`;

export const GUILD_BAN = (guildID: string, memberID: string) => `/servers/${guildID}/bans/${memberID}`;
export const GUILD_BANS = (guildID: string) => `/servers/${guildID}/bans`;

export const GUILD_ROLES = (guildID: string) => `/servers/${guildID}/roles`;
export const GUILD_ROLE = (guildID: string, roleID: number) => `/servers/${guildID}/roles/${roleID}`;
export const GUILD_ROLE_UPDATE_PERMISSION = (guildID: string, roleID: number) => `/servers/${guildID}/roles/${roleID}/permissions`;
export const GUILD_MEMBER_ROLE = (guildID: string, memberID: string, roleID: number) => `/servers/${guildID}/members/${memberID}/roles/${roleID}`;
export const GUILD_MEMBER_ROLE_XP = (guildID: string, roleID: number) => `/servers/${guildID}/roles/${roleID}/xp`;
export const GUILD_MEMBER_ROLES = (guildID: string, memberID: string) => `/servers/${guildID}/members/${memberID}/roles`;

export const FORUM_TOPICS = (channelID: string) => `/channels/${channelID}/topics`;
export const FORUM_TOPIC = (channelID: string, topicID: number) => `/channels/${channelID}/topics/${topicID}`;
export const FORUM_TOPIC_PIN = (channelID: string, topicID: number) => `/channels/${channelID}/topics/${topicID}/pin`;
export const FORUM_TOPIC_LOCK = (channelID: string, topicID: number) => `/channels/${channelID}/topics/${topicID}/lock`;
export const FORUM_TOPIC_EMOTE = (channelID: string, topicID: number, emoteID: number) => `/channels/${channelID}/topics/${topicID}/emotes/${emoteID}`;
export const FORUM_TOPIC_COMMENTS = (channelID: string, topicID: number) => `/channels/${channelID}/topics/${topicID}/comments`;
export const FORUM_TOPIC_COMMENT = (channelID: string, topicID: number, commentID: number) => `/channels/${channelID}/topics/${topicID}/comments/${commentID}`;
export const FORUM_TOPIC_COMMENT_EMOTES = (channelID: string, topicID: number, commentID: number) => `/channels/${channelID}/topics/${topicID}/comments/${commentID}/emotes`;
export const FORUM_TOPIC_COMMENT_EMOTE = (channelID: string, topicID: number, commentID: number, emoteID: number) => `/channels/${channelID}/topics/${topicID}/comments/${commentID}/emotes/${emoteID}`;

export const LIST_ITEMS = (channelID: string)=> `/channels/${channelID}/items`;
export const LIST_ITEM = (channelID: string, itemID: string)=> `/channels/${channelID}/items/${itemID}`;
export const LIST_ITEM_COMPLETE = (channelID: string, itemID: string)=> `/channels/${channelID}/items/${itemID}/complete`;

export const CHANNEL_DOCS = (channelID: string)=> `/channels/${channelID}/docs`;
export const CHANNEL_DOC = (channelID: string, docID: number)=> `/channels/${channelID}/docs/${docID}`;
export const CHANNEL_DOC_EMOTES = (channelID: string, docID: number)=> `/channels/${channelID}/docs/${docID}/emotes`;
export const CHANNEL_DOC_EMOTE = (channelID: string, docID: number, emoteID: number)=> `/channels/${channelID}/docs/${docID}/emote/${emoteID}`;
export const CHANNEL_DOC_COMMENTS = (channelID: string, docID: number)=> `/channels/${channelID}/docs/${docID}/comments`;
export const CHANNEL_DOC_COMMENT = (channelID: string, docID: number, commentID: number)=> `/channels/${channelID}/docs/${docID}/comments/${commentID}`;
export const CHANNEL_DOC_COMMENT_EMOTES = (channelID: string, docID: number, commentID: number) => `/channels/${channelID}/docs/${docID}/comments/${commentID}/emotes`;
export const CHANNEL_DOC_COMMENT_EMOTE = (channelID: string, docID: number, commentID: number, emoteID: number) => `/channels/${channelID}/docs/${docID}/comments/${commentID}/emotes/${emoteID}`;

export const CHANNEL_EVENTS = (channelID: string)=> `/channels/${channelID}/events`;
export const CHANNEL_EVENT = (channelID: string, eventID: number)=> `/channels/${channelID}/events/${eventID}`;
export const CHANNEL_EVENT_EMOTES = (channelID: string, eventID: number)=> `/channels/${channelID}/events/${eventID}/emotes`;
export const CHANNEL_EVENT_EMOTE = (channelID: string, eventID: number, emoteID: number)=> `/channels/${channelID}/events/${eventID}/emotes/${emoteID}`;
export const CHANNEL_EVENT_RSVP = (channelID: string, eventID: number, memberID: string)=> `/channels/${channelID}/events/${eventID}/rsvps/${memberID}`;
export const CHANNEL_EVENT_RSVPS = (channelID: string, eventID: number) => `/channels/${channelID}/events/${eventID}/rsvps`;
export const CHANNEL_EVENT_COMMENTS = (channelID: string, eventID: number)=> `/channels/${channelID}/events/${eventID}/comments`;
export const CHANNEL_EVENT_COMMENT = (channelID: string, eventID: number, commentID: number)=> `/channels/${channelID}/events/${eventID}/comments/${commentID}`;
export const CHANNEL_EVENT_COMMENT_EMOTES = (channelID: string, eventID: number, commentID: number)=> `/channels/${channelID}/events/${eventID}/comments/${commentID}/emotes`;
export const CHANNEL_EVENT_COMMENT_EMOTE = (channelID: string, eventID: number, commentID: number, emoteID: number)=> `/channels/${channelID}/events/${eventID}/comments/${commentID}/emotes/${emoteID}`;
export const CHANNEL_EVENT_EVENT_SERIES = (channelID: string) => `/channels/${channelID}/event_series/`;
export const CHANNEL_EVENT_EVENT_SERIES_ENTITY = (channelID: string, seriesID: string) => `/channels/${channelID}/event_series/${seriesID}`;


export const GUILD_WEBHOOKS = (guildID: string)=> `/servers/${guildID}/webhooks`;
export const GUILD_WEBHOOK = (guildID: string, webhookID: string)=> `/servers/${guildID}/webhooks/${webhookID}`;

export const GUILD_CATEGORY_CREATE = (guildID: string) => `/servers/${guildID}/categories`;
export const GUILD_CATEGORY = (guildID: string, categoryID: number) => `/servers/${guildID}/categories/${categoryID}`;

export const URL_SIGNATURES = () => `/url-signatures`;
