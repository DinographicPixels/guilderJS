// STRUCTURES
// Channel & Message MUST be at the top due to circular imports.
const Channel = (await import("./dist/lib/structures/Channel.js")).default.Channel;
const Message = (await import("./dist/lib/structures/Message.js")).default.Message;

const Client = (await import("./dist/lib/structures/Client.js")).default.Client;
const Member = (await import("./dist/lib/structures/Member.js")).default.Member;
const Guild = (await import("./dist/lib/structures/Guild.js")).default.Guild;
const User = (await import("./dist/lib/structures/User.js")).default.User;
const UserClient = (await import("./dist/lib/structures/AppUser.js")).default.UserClient;

const BannedMember = (await import("./dist/lib/structures/BannedMember.js")).default.BannedMember;
const CalendarEvent = (await import("./dist/lib/structures/CalendarEvent.js")).default.CalendarEvent;
const CalendarEventRSVP = (await import("./dist/lib/structures/CalendarRSVP.js")).default.CalendarEventRSVP;
const Doc = (await import("./dist/lib/structures/Doc.js")).default.Doc;
const ForumTopic = (await import("./dist/lib/structures/ForumThread.js")).default.ForumTopic;

const ListItem = (await import("./dist/lib/structures/ListItem.js")).default.ListItem;
const Webhook = (await import("./dist/lib/structures/Webhook.js")).default.Webhook;

const DevTools = (await import("./dist/lib/util/Util.js")).default;

export * as APITypes from "guildedapi-types.ts/v1.mjs";
// add constants

export {
    Channel,
    Message,
    Client,
    Member,
    Guild,
    User,
    UserClient,
    BannedMember,
    CalendarEvent,
    CalendarEventRSVP,
    Doc,
    ForumTopic,
    ListItem,
    Webhook,
    DevTools
};
