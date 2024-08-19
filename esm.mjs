// MANUAL EXPORTING FOR ESM
// Alternative to current ESM exporting using gen-esm-wrapper.

// STRUCTURES
// Channel & Message MUST be at the top due to circular imports.
const Channel = (await import("./dist/lib/structures/Channel.js")).default.Channel;
const Message = (await import("./dist/lib/structures/Message.js")).default.Message;

const CommandInteraction = (await import("./dist/lib/structures/CommandInteraction.js")).default.CommandInteraction;
const Client = (await import("./dist/lib/structures/Client.js")).default.Client;
const Member = (await import("./dist/lib/structures/Member.js")).default.Member;
const Guild = (await import("./dist/lib/structures/Guild.js")).default.Guild;
const User = (await import("./dist/lib/structures/User.js")).default.User;
const AppUser = (await import("./dist/lib/structures/AppUser.js")).default.AppUser;

const BannedMember = (await import("./dist/lib/structures/BannedMember.js")).default.BannedMember;
const CalendarEvent = (await import("./dist/lib/structures/CalendarEvent.js")).default.CalendarEvent;
const CalendarRSVP = (await import("./dist/lib/structures/CalendarRSVP.js")).default.CalendarRSVP;
const Doc = (await import("./dist/lib/structures/Doc.js")).default.Doc;
const ForumThread = (await import("./dist/lib/structures/ForumThread.js")).default.ForumThread;
const ForumThreadComment = (await import("./dist/lib/structures/ForumThreadComment.js")).default.ForumThreadComment;
const ListItem = (await import("./dist/lib/structures/ListItem.js")).default.ListItem;
const Webhook = (await import("./dist/lib/structures/Webhook.js")).default.Webhook;
const Announcement = (await import("./dist/lib/structures/Announcement.js")).default.Announcement;
const AnnouncementChannel = (await import("./dist/lib/structures/AnnouncementChannel.js")).default.AnnouncementChannel;
const AnnouncementComment = (await import("./dist/lib/structures/AnnouncementComment.js")).default.AnnouncementComment;
const AnnouncementReactionInfo = (await import("./dist/lib/structures/AnnouncementReactionInfo.js")).default.AnnouncementReactionInfo;
const DocComment = (await import("./dist/lib/structures/DocComment.js")).default.DocComment;
const SocialLink = (await import("./dist/lib/structures/SocialLink.js")).default.SocialLink;
const CalendarComment = (await import("./dist/lib/structures/CalendarComment.js")).default.CalendarComment;
const ReactionInfo = (await import("./dist/lib/structures/ReactionInfo.js")).default.ReactionInfo;
const MessageReactionInfo = (await import("./dist/lib/structures/MessageReactionInfo.js")).default.MessageReactionInfo;
const ForumThreadReactionInfo = (await import("./dist/lib/structures/ForumThreadReactionInfo.js")).default.ForumThreadReactionInfo;
const MemberInfo = (await import("./dist/lib/structures/MemberInfo.js")).default.MemberInfo;
const DocReactionInfo = (await import("./dist/lib/structures/DocReactionInfo.js")).default.DocReactionInfo;
const MemberRemoveInfo = (await import("./dist/lib/structures/MemberRemoveInfo.js")).default.MemberRemoveInfo;
const MemberUpdateInfo = (await import("./dist/lib/structures/MemberUpdateInfo.js")).default.MemberUpdateInfo;
const CalendarReactionInfo = (await import("./dist/lib/structures/CalendarReactionInfo.js")).default.CalendarReactionInfo;
const Role = (await import("./dist/lib/structures/Role.js")).default.Role;
const Group = (await import("./dist/lib/structures/Group.js")).default.Group;
const Category = (await import("./dist/lib/structures/Category.js")).default.Category;
const Subscription = (await import("./dist/lib/structures/Subscription.js")).default.Subscription;
const Permission = (await import("./dist/lib/structures/Permission.js")).default.Permission;

// UTILITIES
const Collection = (await import("./dist/lib/util/Collection.js")).default.Collection;
const TypedCollection = (await import("./dist/lib/util/TypedCollection.js")).default.TypedCollection;
const InteractionOptionWrapper = (await import("./dist/lib/util/InteractionOptionWrapper.js")).default.InteractionOptionWrapper;

export * as APITypes from "guildedapi-types.ts/v1.mjs";
export * as Constants from "./dist/lib/Constants.js";

export {
    Channel,
    Message,
    CommandInteraction,
    Client,
    Member,
    Guild,
    User,
    AppUser,
    BannedMember,
    CalendarEvent,
    CalendarRSVP,
    Doc,
    ForumThread,
    ForumThreadComment,
    ListItem,
    Webhook,
    Announcement,
    AnnouncementChannel,
    AnnouncementComment,
    AnnouncementReactionInfo,
    DocComment,
    SocialLink,
    CalendarComment,
    ReactionInfo,
    MessageReactionInfo,
    ForumThreadReactionInfo,
    MemberInfo,
    DocReactionInfo,
    MemberRemoveInfo,
    MemberUpdateInfo,
    CalendarReactionInfo,
    Role,
    Group,
    Category,
    Subscription,
    Permission,
    Collection,
    TypedCollection,
    InteractionOptionWrapper
};
