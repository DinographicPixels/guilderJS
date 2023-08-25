/** @module Routes/Channels */
import type { RESTManager } from "../rest/RESTManager";
import * as endpoints from "../rest/endpoints";
import { Doc } from "../structures/Doc";
import { ForumThread } from "../structures/ForumThread";
import { CalendarEvent } from "../structures/CalendarEvent";
import { CalendarEventRSVP } from "../structures/CalendarRSVP";
import { Message } from "../structures/Message";
import { ForumThreadComment } from "../structures/ForumThreadComment";
import { ListItem } from "../structures/ListItem";
import {
    APIListItem,
    ChannelReactionTypeBulkDeleteSupported,
    ChannelReactionTypes,
    ChannelSubcategoryReactionTypes,
    DELETEMessageReactionQuery,
    GETCalendarEventCommentResponse,
    GETCalendarEventCommentsResponse,
    GETCalendarEventResponse,
    GETCalendarEventRSVPResponse,
    GETCalendarEventRSVPSResponse,
    GETCalendarEventsResponse,
    GETChannelAnnouncementCommentResponse,
    GETChannelAnnouncementCommentsResponse,
    GETChannelAnnouncementResponse,
    GETChannelAnnouncementsQuery,
    GETChannelAnnouncementsResponse,
    GETChannelListItemsResponse,
    GETChannelMessageResponse,
    GETChannelMessagesResponse,
    GETChannelResponse,
    GETDocCommentResponse,
    GETDocCommentsResponse,
    GETDocResponse,
    GETDocsResponse,
    GETForumTopicCommentResponse,
    GETForumTopicCommentsResponse,
    GETForumTopicResponse,
    GETForumTopicsResponse,
    GETListItemResponse,
    PATCHCalendarEventCommentResponse,
    PATCHCalendarEventResponse,
    PATCHChannelAnnouncementBody,
    PATCHChannelAnnouncementCommentBody,
    PATCHChannelAnnouncementCommentResponse,
    PATCHChannelAnnouncementResponse,
    PATCHDocCommentResponse,
    PATCHForumTopicCommentResponse,
    PATCHForumTopicResponse,
    PATCHListItemBody,
    PATCHListItemResponse,
    POSTCalendarEventBody,
    POSTCalendarEventCommentResponse,
    POSTCalendarEventResponse,
    POSTChannelAnnouncementBody,
    POSTChannelAnnouncementCommentBody,
    POSTChannelAnnouncementCommentResponse,
    POSTChannelAnnouncementResponse,
    POSTChannelMessageResponse,
    POSTDocCommentResponse,
    POSTDocResponse,
    POSTForumTopicCommentResponse,
    POSTForumTopicResponse,
    POSTListItemBody,
    POSTListItemResponse,
    PUTCalendarEventRSVPResponse,
    PUTDocResponse
} from "../Constants";
import {
    AnyChannel,
    AnyTextableChannel,
    CreateMessageOptions,
    EditMessageOptions,
    GetChannelMessagesFilter
} from "../types/channel";
import { CreateForumThreadOptions, EditForumThreadOptions, GetForumThreadsFilter } from "../types/forumThread";
import { CreateForumCommentOptions, EditForumCommentOptions } from "../types/forumThreadComment";
import { CreateDocOptions, EditDocOptions } from "../types/doc";
import {
    CreateCalendarCommentOptions,
    CreateCalendarEventOptions,
    EditCalendarCommentOptions,
    EditCalendarEventOptions,
    EditCalendarRSVPOptions,
    GetCalendarEventsFilter
} from "../types/calendarEvent";
import { DocChannel } from "../structures/DocChannel";
import { ForumChannel } from "../structures/ForumChannel";
import { CalendarChannel } from "../structures/CalendarChannel";
import { TextChannel } from "../structures/TextChannel";
import { CalendarEventComment } from "../structures/CalendarEventComment";
import { CreateDocCommentOptions, EditDocCommentOptions } from "../types/docComment";
import { DocComment } from "../structures/DocComment";
import { Announcement } from "../structures/Announcement";
import { AnnouncementComment } from "../structures/AnnouncementComment";

export class Channels {
    #manager: RESTManager;
    constructor(manager: RESTManager){
        this.#manager = manager;
    }

    /** This method is used to get a guild channel.
     * @param channelID The ID of the channel to get.
     */
    async getChannel(channelID: string): Promise<AnyChannel> {
        return this.#manager.authRequest<GETChannelResponse>({
            method: "GET",
            path:   endpoints.CHANNEL(channelID)
        }).then(data => this.#manager.client.util.updateChannel(data.channel));
    }

    /** This method is used to get a channel message.
     * @param channelID The ID of the channel containing the message.
     * @param messageID The ID of the message to get.
     * @param params Optional parameters.
     */
    async getMessage<T extends AnyTextableChannel = AnyTextableChannel>(channelID: string, messageID: string, params?: object): Promise<Message<T>> {
        return this.#manager.authRequest<GETChannelMessageResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_MESSAGE(channelID, messageID)
        }).then(data => this.#manager.client.getChannel<TextChannel>(data.message.serverId as string, channelID)?.messages.update(data.message) as Message<T> ?? new Message<T>(data.message, this.#manager.client, params));
    }

    /** This method is used to get a list of Message
     * @param channelID ID of a "Chat" channel.
     * @param filter Object to filter the output.
     */
    async getMessages(channelID: string, filter?: GetChannelMessagesFilter): Promise<Array<Message<AnyTextableChannel>>> {
        const query = new URLSearchParams();
        if (filter){
            if (filter.before) query.set("before", filter.before.toString());
            if (filter.after) query.set("after", filter.after.toString());
            if (filter.includePrivate) query.set("includePrivate", filter.includePrivate.toString());
            if (filter.limit) query.set("limit", filter.limit.toString());
        }
        return this.#manager.authRequest<GETChannelMessagesResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_MESSAGES(channelID),
            query
        }).then(data => data.messages.map(d => this.#manager.client.getChannel<TextChannel>(d.serverId as string, channelID)?.messages.update(d) ?? new Message(d, this.#manager.client)));
    }

    /** This method is used to get a channel doc.
     *
     * Note: This method requires a "Docs" channel.
     * @param channelID ID of the Docs channel.
     * @param docID ID of the channel doc.
     */
    async getDoc(channelID: string, docID: number): Promise<Doc> {
        return this.#manager.authRequest<GETDocResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_DOC(channelID, docID)
        }).then(data => this.#manager.client.getChannel<DocChannel>(data.doc.serverId, channelID)?.docs.update(data.doc) ?? new Doc(data.doc, this.#manager.client));
    }

    /** This method is used to get a list of "Channel" Doc.
     * @param channelID ID of a "Docs" channel.
     * @param filter Object to filter the output.
     */
    async getDocs(channelID: string, filter?: { before?: string; limit?: number; }): Promise<Array<Doc>> {
        const query = new URLSearchParams();
        if (filter){
            if (filter.before) query.set("before", filter.before.toString());
            if (filter.limit) query.set("limit", filter.limit.toString());
        }
        return this.#manager.authRequest<GETDocsResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_DOCS(channelID),
            query
        }).then(data => data.docs.map(d => this.#manager.client.getChannel<DocChannel>(d.serverId, channelID)?.docs.update(d) ?? new Doc(d, this.#manager.client)) as never);
    }

    /**
     * Get every comments from a doc.
     * @param channelID ID of the channel containing the doc.
     * @param docID ID of the doc the comment is in.
     */
    async getDocComments(channelID: string, docID: number): Promise<Array<DocComment>> {
        return this.#manager.authRequest<GETDocCommentsResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_DOC_COMMENTS(channelID, docID)
        }).then(data => data.docComments.map(d => new DocComment(d, this.#manager.client)));
    }

    /**
     * Get a specific comment from a doc.
     * @param channelID ID of the channel containing the doc.
     * @param docID ID of the doc the comment is in.
     * @param commentID ID of the comment to get.
     */
    async getDocComment(channelID: string, docID: number, commentID: number): Promise<DocComment> {
        return this.#manager.authRequest<GETDocCommentResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_DOC_COMMENT(channelID, docID, commentID)
        }).then(data => new DocComment(data.docComment, this.#manager.client));
    }

    /** This method is used to get a specific forum thread.
     *
     * Note: This method requires a "Forum" channel.
     * @param channelID ID of a speific Forum channel.
     * @param threadID ID of the specific Forum Thread.
     */
    async getForumThread(channelID: string, threadID: number): Promise<ForumThread<ForumChannel>> {
        return this.#manager.authRequest<GETForumTopicResponse>({
            method: "GET",
            path:   endpoints.FORUM_TOPIC(channelID, threadID)
        }).then(data => this.#manager.client.util.updateForumThread(data.forumTopic));
    }

    /** This method is used to get a list of ForumThread.
     * @param channelID ID of a "Forum" channel.
     * @param filter Object to filter the output.
     */
    async getForumThreads(channelID: string, filter?: GetForumThreadsFilter): Promise<Array<ForumThread<ForumChannel>>> {
        const query = new URLSearchParams();
        if (filter){
            if (filter.before) query.set("before", filter.before.toString());
            if (filter.limit) query.set("limit", filter.limit.toString());
        }
        return this.#manager.authRequest<GETForumTopicsResponse>({
            method: "GET",
            path:   endpoints.FORUM_TOPICS(channelID),
            query
        }).then(data => data.forumTopics.map(d => this.#manager.client.util.updateForumThread(d)));
    }

    /** This method is used to get a specific forum thread comment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a Forum thread.
     * @param commentID ID of a Forum thread comment.
     */
    async getForumComment(channelID: string, threadID: number, commentID: number): Promise<ForumThreadComment>{
        return this.#manager.authRequest<GETForumTopicCommentResponse>({
            method: "GET",
            path:   endpoints.FORUM_TOPIC_COMMENT(channelID, threadID, commentID)
        }).then(data => new ForumThreadComment(data.forumTopicComment, this.#manager.client));
    }

    /** This method is used to get a list of ForumThreadComment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a Forum Thread.
     */
    async getForumComments(channelID: string, threadID: number): Promise<Array<ForumThreadComment>>{
        return this.#manager.authRequest<GETForumTopicCommentsResponse>({
            method: "GET",
            path:   endpoints.FORUM_TOPIC_COMMENTS(channelID, threadID)
        }).then(data => data.forumTopicComments.map(d => new ForumThreadComment(d, this.#manager.client)) as never);
    }

    /** This method is used to get a specific calendar event.
     *
     * Note: this method requires a "Calendar" channel.
     * @param channelID ID of a Calendar channel.
     * @param eventID ID of a Calendar event.
     */
    async getCalendarEvent(channelID: string, eventID: number): Promise<CalendarEvent> {
        return this.#manager.authRequest<GETCalendarEventResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_EVENT(channelID, eventID)
        }).then(data => this.#manager.client.getChannel<CalendarChannel>(data.calendarEvent.serverId, data.calendarEvent.channelId)?.scheduledEvents.update(data.calendarEvent) ?? new CalendarEvent(data.calendarEvent, this.#manager.client));
    }

    /** This method is used to get a list of CalendarEvent
     * @param channelID ID of a "Calendar" channel.
     * @param filter Object to filter the output.
     */
    async getCalendarEvents(channelID: string, filter?: GetCalendarEventsFilter): Promise<Array<CalendarEvent>> {
        const query = new URLSearchParams();
        if (filter){
            if (filter.before) query.set("before", filter.before.toString());
            if (filter.after) query.set("after", filter.after.toString());
            if (filter.limit) query.set("limit", filter.limit.toString());
        }
        return this.#manager.authRequest<GETCalendarEventsResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_EVENTS(channelID),
            query
        }).then(data => data.calendarEvents.map(d => this.#manager.client.getChannel<CalendarChannel>(d.serverId, d.channelId)?.scheduledEvents.update(d) ?? new CalendarEvent(d, this.#manager.client)) as never);
    }

    /** This method is used to get a specific event comment coming from a calendar.
     * Note: this method doesn't cache scheduled events due to the API's restrictions.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of an event containing the comment to get.
     * @param commentID ID of the comment to get.
     */
    async getCalendarEventComment(channelID: string, eventID: number, commentID: number): Promise<CalendarEventComment> {
        return this.#manager.authRequest<GETCalendarEventCommentResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_EVENT_COMMENT(channelID, eventID, commentID)
        }).then(data => new CalendarEventComment(data.calendarEventComment, this.#manager.client));
    }

    /** This method is used to get a list of CalendarEventComment
     * Note: due to API's restrictions, we're not able to cache scheduled events from this method.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of the event containing comments.
     */
    async getCalendarEventComments(channelID: string, eventID: number): Promise<Array<CalendarEventComment>> {
        return this.#manager.authRequest<GETCalendarEventCommentsResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_EVENT_COMMENTS(channelID, eventID)
        }).then(data => data.calendarEventComments.map(d => new CalendarEventComment(d, this.#manager.client)));
    }

    /** This method is used to get a specific CalendarEventRSVP.
     *
     * Note: this method requires a Calendar channel.
     * @param channelID ID of a Calendar channel
     * @param eventID ID of a Calendar Event
     * @param memberID ID of a Guild Member
     */
    async getCalendarRsvp(channelID: string, eventID: number, memberID: string): Promise<CalendarEventRSVP> {
        return this.#manager.authRequest<GETCalendarEventRSVPResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_EVENT_RSVP(channelID, eventID, memberID)
        }).then(data => this.#manager.client.getChannel<CalendarChannel>(data.calendarEventRsvp.serverId, data.calendarEventRsvp.channelId)?.scheduledEvents.get(data.calendarEventRsvp.calendarEventId)?.rsvps.update(data.calendarEventRsvp) ?? new CalendarEventRSVP(data.calendarEventRsvp, this.#manager.client));
    }

    /** This method is used to get a list of CalendarEventRSVP.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     */
    async getCalendarRsvps(channelID: string, eventID: number): Promise<Array<CalendarEventRSVP>> {
        return this.#manager.authRequest<GETCalendarEventRSVPSResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_EVENT_RSVPS(channelID, eventID)
        }).then(data => data.calendarEventRsvps.map(d => this.#manager.client.getChannel<CalendarChannel>(d.serverId, d.channelId)?.scheduledEvents.get(d.calendarEventId)?.rsvps.update(d) ?? new CalendarEventRSVP(d, this.#manager.client)) as never);
    }

    /** This method is used to get a specific list item.
     * @param channelID ID of a "List" channel.
     * @param itemID ID of a list item.
     */
    async getListItem(channelID: string, itemID: string): Promise<ListItem> {
        return this.#manager.authRequest<GETListItemResponse>({
            method: "GET",
            path:   endpoints.LIST_ITEM(channelID, itemID)
        }).then(data => new ListItem(data.listItem, this.#manager.client));
    }

    /** This method is used to get a list of ListItem.
     * @param channelID ID of a "List" channel.
     */
    async getListItems(channelID: string): Promise<Array<ListItem>> {
        return this.#manager.authRequest<GETChannelListItemsResponse>({
            method: "GET",
            path:   endpoints.LIST_ITEMS(channelID)
        }).then(data => data.listItems.map(d => new ListItem(d as APIListItem, this.#manager.client)) as never);
    }

    // CREATE, EDIT & DELETE

    /** Send a message in a specified channel.
     * @param channelID ID of the channel.
     * @param options Message options
     * @param params Optional parameters.
     */
    async createMessage<T extends AnyTextableChannel = AnyTextableChannel>(channelID: string, options: CreateMessageOptions, params?: object): Promise<Message<T>> {
        if (typeof options !== "object") throw new Error("message options should be an object.");
        return this.#manager.authRequest<POSTChannelMessageResponse>({
            method: "POST",
            path:   endpoints.CHANNEL_MESSAGES(channelID),
            json:   options
        }).then(data => new Message<T>(data.message, this.#manager.client, params));
    }

    /** Edit a specific message coming from a specified channel.
     * @param channelID The ID of the channel.
     * @param messageID The ID of the message you'd like to edit.
     * @param newMessage object containing new message's options.
     * @param params Optional parameters.
     */
    async editMessage<T extends AnyTextableChannel = AnyTextableChannel>(channelID: string, messageID: string, newMessage: EditMessageOptions, params?: object): Promise<Message<T>> {
        if (typeof newMessage !== "object") throw new Error("newMessage should be an object.");
        return this.#manager.authRequest<POSTChannelMessageResponse>({
            method: "PUT",
            path:   endpoints.CHANNEL_MESSAGE(channelID, messageID),
            json:   newMessage
        }).then(data => new Message<T>(data.message, this.#manager.client, params));
    }

    /** Delete a specific message.
     * @param channelID ID of the channel containing the message.
     * @param messageID ID of the message you'd like to delete.
     */
    async deleteMessage(channelID: string, messageID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_MESSAGE(channelID, messageID)
        });
    }

    /** Add a reaction to a specified object from a channel.
     * @param channelID ID of a channel that supports reaction.
     * @param channelType Type of the selected channel. (e.g: "ChannelMessage")
     * @param targetID ID of the object you'd like to add the reaction to. (e.g: a message ID)
     * @param reaction ID of the reaction to add.
     */
    async createReaction(channelID: string, channelType: ChannelReactionTypes, targetID: string | number, reaction: number): Promise<void> {
        if (channelType !== "ChannelMessage" && channelType !== "ForumThread" && channelType !== "CalendarEvent" && channelType !== "Doc" && channelType !== "ChannelAnnouncement") throw new Error("Invalid channel type.");
        let endpointType: "CHANNEL_MESSAGE_EMOTE" | "FORUM_TOPIC_EMOTE" | "CHANNEL_EVENT_EMOTE" | "CHANNEL_DOC_EMOTE" | "CHANNEL_ANNOUNCEMENT_EMOTE" | undefined;
        if (channelType === "ChannelMessage") endpointType = "CHANNEL_MESSAGE_EMOTE";
        if (channelType === "ForumThread") endpointType = "FORUM_TOPIC_EMOTE";
        if (channelType === "CalendarEvent") endpointType = "CHANNEL_EVENT_EMOTE";
        if (channelType === "Doc") endpointType = "CHANNEL_DOC_EMOTE";
        if (channelType === "ChannelAnnouncement") endpointType = "CHANNEL_ANNOUNCEMENT_EMOTE";

        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints[endpointType as keyof typeof endpoints](channelID, targetID as never, reaction as never, 0)
        });
    }

    /** Remove a reaction from a specified message.
     * @param channelID ID of a channel that supports reaction.
     * @param channelType Type of the selected channel. (e.g: "ChannelMessage")
     * @param targetID ID of the target you'd like to add the reaction to. (e.g: a message ID)
     * @param reaction ID of the reaction.
     */
    async deleteReaction(channelID: string, channelType: ChannelReactionTypes, targetID: string | number, reaction: number): Promise<void> {
        if (channelType !== "ChannelMessage" && channelType !== "ForumThread" && channelType !== "CalendarEvent" && channelType !== "Doc" && channelType !== "ChannelAnnouncement") throw new Error("Invalid channel type.");
        let endpointType: "CHANNEL_MESSAGE_EMOTE" | "FORUM_TOPIC_EMOTE" | "CHANNEL_EVENT_EMOTE" | "CHANNEL_DOC_EMOTE" | "CHANNEL_ANNOUNCEMENT_EMOTE" | undefined;
        if (channelType === "ChannelMessage") endpointType = "CHANNEL_MESSAGE_EMOTE";
        if (channelType === "ForumThread") endpointType = "FORUM_TOPIC_EMOTE";
        if (channelType === "CalendarEvent") endpointType = "CHANNEL_EVENT_EMOTE";
        if (channelType === "Doc") endpointType = "CHANNEL_DOC_EMOTE";
        if (channelType === "ChannelAnnouncement") endpointType = "CHANNEL_ANNOUNCEMENT_EMOTE";

        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints[endpointType as keyof typeof endpoints](channelID, targetID as never, reaction as never, 0)
        });
    }

    /**
     * Bulk delete every reaction from a target.
     * @param channelID ID of a channel.
     * @param channelType Type of channel.
     * @param targetID Target to remove reactions from it.
     */
    async bulkDeleteReactions(channelID: string, channelType: ChannelReactionTypeBulkDeleteSupported, targetID: string | number, filter?: DELETEMessageReactionQuery): Promise<void> {
        if (channelType !== "ChannelMessage") throw new Error("Invalid channel type.");
        let endpointType: "CHANNEL_MESSAGE_EMOTES" | undefined;
        if (channelType === "ChannelMessage") endpointType = "CHANNEL_MESSAGE_EMOTES";

        const query = new URLSearchParams();
        if (filter?.emoteId) query.set("emoteId", filter.emoteId.toString());

        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints[endpointType as keyof typeof endpoints](channelID, targetID as never, 0 as never, 0),
            query
        });
    }

    /** Add a reaction to a target from a subcategory (e.g: a comment from Forum Thread)
     * @param channelID ID of a channel that supports reaction.
     * @param subcategoryType Type of the selected subcategory. (e.g: "CalendarEvent")
     * @param subcategoryID ID of the subcategory you selected.
     * @param targetID ID of the target you'd like to add the reaction to. (e.g: a comment id)
     * @param reaction ID of the reaction to add.
     */
    async createReactionToSubcategory(channelID: string, subcategoryType: ChannelSubcategoryReactionTypes, subcategoryID: string | number, targetID: string | number, reaction: number): Promise<void> {
        if (subcategoryType !== "CalendarEventComment" && subcategoryType !== "ForumThreadComment" && subcategoryType !== "DocComment" && subcategoryType !== "AnnouncementComment") throw new Error("Invalid channel subcategory.");
        let endpointType: "FORUM_TOPIC_COMMENT_EMOTE" | "CHANNEL_EVENT_COMMENT_EMOTE" | "CHANNEL_DOC_COMMENT_EMOTE" | "CHANNEL_ANNOUNCEMENT_COMMENT_EMOTE" | undefined;
        if (subcategoryType === "CalendarEventComment") endpointType = "CHANNEL_EVENT_COMMENT_EMOTE";
        if (subcategoryType === "ForumThreadComment") endpointType = "FORUM_TOPIC_COMMENT_EMOTE";
        if (subcategoryType === "DocComment") endpointType = "CHANNEL_DOC_COMMENT_EMOTE";
        if (subcategoryType === "AnnouncementComment") endpointType = "CHANNEL_ANNOUNCEMENT_COMMENT_EMOTE";

        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints[endpointType as keyof typeof endpoints](channelID, subcategoryID as never, targetID as never, reaction)
        });
    }

    /** Remove a reaction from a target from a subcategory (e.g: a comment from Forum Thread)
     * @param channelID ID of a channel that supports reaction.
     * @param subcategoryType Type of the selected subcategory. (e.g: "CalendarEvent")
     * @param subcategoryID ID of the subcategory you selected.
     * @param targetID ID of the target you'd like to remove the reaction from. (e.g: a comment id)
     * @param reaction ID of the reaction to add.
     */
    async deleteReactionFromSubcategory(channelID: string, subcategoryType: ChannelSubcategoryReactionTypes, subcategoryID: string | number, targetID: string | number, reaction: number): Promise<void> {
        if (subcategoryType !== "CalendarEventComment" && subcategoryType !== "ForumThreadComment" && subcategoryType !== "DocComment" && subcategoryType !== "AnnouncementComment") throw new Error("Invalid channel subcategory.");
        let endpointType: "FORUM_TOPIC_COMMENT_EMOTE" | "CHANNEL_EVENT_COMMENT_EMOTE" | "CHANNEL_DOC_COMMENT_EMOTE" | "CHANNEL_ANNOUNCEMENT_COMMENT_EMOTE" | undefined;
        if (subcategoryType === "CalendarEventComment") endpointType = "CHANNEL_EVENT_COMMENT_EMOTE";
        if (subcategoryType === "ForumThreadComment") endpointType = "FORUM_TOPIC_COMMENT_EMOTE";
        if (subcategoryType === "DocComment") endpointType = "CHANNEL_DOC_COMMENT_EMOTE";
        if (subcategoryType === "AnnouncementComment") endpointType = "CHANNEL_ANNOUNCEMENT_COMMENT_EMOTE";

        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints[endpointType as keyof typeof endpoints](channelID, subcategoryID as never, targetID as never, reaction)
        });
    }

    /** Create a forum thread in a specified forum channel.
     * @param channelID ID of a "Forums" channel.
     * @param options Thread's options including title & content.
     */
    async createForumThread<T extends ForumChannel = ForumChannel>(channelID: string, options: CreateForumThreadOptions): Promise<ForumThread<T>> {
        if (typeof options !== "object") throw new Error("thread options should be an object.");
        return this.#manager.authRequest<POSTForumTopicResponse>({
            method: "POST",
            path:   endpoints.FORUM_TOPICS(channelID),
            json:   options
        }).then(data => new ForumThread<T>(data.forumTopic, this.#manager.client));
    }

    /** Edit a forum thread from a specified forum channel.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param options Edit options.
     */
    async editForumThread<T extends ForumChannel = ForumChannel>(channelID: string, threadID: number, options: EditForumThreadOptions): Promise<ForumThread<T>> {
        if (typeof options !== "object") throw new Error("thread options should be an object.");
        return this.#manager.authRequest<PATCHForumTopicResponse>({
            method: "PATCH",
            path:   endpoints.FORUM_TOPIC(channelID, threadID),
            json:   options
        }).then(data => new ForumThread<T>(data.forumTopic, this.#manager.client));
    }

    /** Delete a forum thread from a specific forum channel
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     */
    async deleteForumThread(channelID: string, threadID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.FORUM_TOPIC(channelID, threadID)
        });
    }

    /** Pin a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     */
    async pinForumThread(channelID: string, threadID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints.FORUM_TOPIC_PIN(channelID, threadID)
        });
    }

    /** Unpin a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     */
    async unpinForumThread(channelID: string, threadID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.FORUM_TOPIC_PIN(channelID, threadID)
        });
    }

    /** Lock a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     */
    async lockForumThread(channelID: string, threadID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints.FORUM_TOPIC_LOCK(channelID, threadID)
        });
    }

    /** Unlock a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     */
    async unlockForumThread(channelID: string, threadID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.FORUM_TOPIC_LOCK(channelID, threadID)
        });
    }

    /** Add a comment to a forum thread.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param options Comment's options.
     */
    async createForumComment(channelID: string, threadID: number, options: CreateForumCommentOptions): Promise<ForumThreadComment> {
        if (typeof options !== "object") throw new Error("comment options should be an object.");
        return this.#manager.authRequest<POSTForumTopicCommentResponse>({
            method: "POST",
            path:   endpoints.FORUM_TOPIC_COMMENTS(channelID, threadID),
            json:   options
        }).then(data => new ForumThreadComment(data.forumTopicComment, this.#manager.client, { channelID }));
    }

    /** Edit a forum thread's comment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param commentID ID of a thread comment.
     * @param options Edit options.
     */
    async editForumComment(channelID: string, threadID: number, commentID: number, options?: EditForumCommentOptions): Promise<ForumThreadComment> {
        if (typeof options !== "object") throw new Error("comment options should be an object.");
        return this.#manager.authRequest<PATCHForumTopicCommentResponse>({
            method: "PATCH",
            path:   endpoints.FORUM_TOPIC_COMMENT(channelID, threadID, commentID),
            json:   options
        }).then(data => new ForumThreadComment(data.forumTopicComment, this.#manager.client, { channelID }));
    }

    /** Delete a forum thread comment.
     * @param channelID ID of a "Forums" channel.
     * @param threadID ID of a forum thread.
     * @param commentID ID of a forum thread comment.
     */
    async deleteForumComment(channelID: string, threadID: number, commentID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.FORUM_TOPIC_COMMENT(channelID, threadID, commentID)
        });
    }

    /** Create a doc in a "Docs" channel.
     * @param channelID ID pf a "Docs" channel.
     * @param options Doc's options.
     */
    async createDoc(channelID: string, options: CreateDocOptions): Promise<Doc> {
        if (typeof options !== "object") throw new Error("doc options should be an object.");
        return this.#manager.authRequest<POSTDocResponse>({
            method: "POST",
            path:   endpoints.CHANNEL_DOCS(channelID),
            json:   options
        }).then(data => new Doc(data.doc, this.#manager.client));
    }

    /** Edit a doc from a "Docs" channel.
     * @param channelID ID of a "Docs" channel.
     * @param docID ID of a doc.
     * @param options Edit options.
     */
    async editDoc(channelID: string, docID: number, options: EditDocOptions): Promise<Doc> {
        if (typeof options !== "object") throw new Error("doc options should be an object.");
        return this.#manager.authRequest<PUTDocResponse>({
            method: "PUT",
            path:   endpoints.CHANNEL_DOC(channelID, docID),
            json:   options
        }).then(data => new Doc(data.doc, this.#manager.client));
    }

    /** Delete a doc from a "Docs" channel.
     * @param channelID ID of a "Docs" channel.
     * @param docID ID of a doc.
     */
    async deleteDoc(channelID: string, docID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_DOC(channelID, docID)
        });
    }

    /**
     * Create a comment in a doc.
     * @param channelID ID of the docs channel.
     * @param docID ID of the doc.
     * @param options Create options.
     */
    async createDocComment(channelID: string, docID: number, options: CreateDocCommentOptions): Promise<DocComment> {
        return this.#manager.authRequest<POSTDocCommentResponse>({
            method: "POST",
            path:   endpoints.CHANNEL_DOC_COMMENTS(channelID, docID),
            json:   options
        }).then(data => new DocComment(data.docComment, this.#manager.client));
    }

    /**
     * Edit a doc comment.
     * @param channelID ID of the docs channel.
     * @param docID ID of the doc.
     * @param commentID ID of the comment to edit.
     * @param options Edit options.
     */
    async editDocComment(channelID: string, docID: number, commentID: number, options: EditDocCommentOptions): Promise<DocComment> {
        return this.#manager.authRequest<PATCHDocCommentResponse>({
            method: "PATCH",
            path:   endpoints.CHANNEL_DOC_COMMENT(channelID, docID, commentID),
            json:   options
        }).then(data => new DocComment(data.docComment, this.#manager.client));
    }

    /**
     * Delete a doc comment.
     * @param channelID ID of the docs channel.
     * @param docID ID of the doc.
     * @param commentID ID of the comment to delete.
     */
    async deleteDocComment(channelID: string, docID: number, commentID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_DOC_COMMENT(channelID, docID, commentID)
        });
    }

    /** Create an event into a "Calendar" channel.
     * @param channelID ID of a "Calendar" channel.
     * @param options Event options.
     * @param createSeries (optional) Create a series. (event's repetition)
     */
    async createCalendarEvent(channelID: string, options: CreateCalendarEventOptions, createSeries?: POSTCalendarEventBody["repeatInfo"]): Promise<CalendarEvent> {
        if (typeof options !== "object") throw new Error("event options should be an object.");
        if (options.duration && typeof options.duration === "number") {
            if (options.duration < 1000) throw new Error("The duration should be higher than 1000 ms.");
            options.duration = options.duration / 1000; // ms to min.
        }
        const reqOptions: object = options;
        if (createSeries) Object.assign(reqOptions, { repeatInfo: createSeries });
        return this.#manager.authRequest<POSTCalendarEventResponse>({
            method: "POST",
            path:   endpoints.CHANNEL_EVENTS(channelID),
            json:   options
        }).then(data => new CalendarEvent(data.calendarEvent, this.#manager.client));
    }

    /** Edit an event from a "Calendar" channel.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @param options Edit options.
     */
    async editCalendarEvent(channelID: string, eventID: number, options: EditCalendarEventOptions): Promise<CalendarEvent> {
        if (typeof options !== "object") throw new Error("event options should be an object.");
        if (options.duration && typeof options.duration === "number") {
            if (options.duration < 1000) throw new Error("The duration should be higher than 1000 ms.");
            options.duration = options.duration / 1000; // ms to min.
        }
        return this.#manager.authRequest<PATCHCalendarEventResponse>({
            method: "PATCH",
            path:   endpoints.CHANNEL_EVENT(channelID, eventID),
            json:   options
        }).then(data => new CalendarEvent(data.calendarEvent, this.#manager.client));
    }

    /**
     * The Guilded API only allows series on the event's creation.
     *
     * **Use createCalendarEvent and set the createSeries property to create a series.**
     */
    createCalendarEventSeries(): Error {
        return new Error("The Guilded API only allows series on the event's creation. Use createCalendarEvent and set the createSeries property to create a series.");
    }

    /**
     * Edit a CalendarEventSeries.
     * @param channelID ID of the channel.
     * @param eventID ID of the event.
     * @param seriesID ID of the series.
     * @param options Edit repetition options.
     */
    async editCalendarEventSeries(channelID: string, eventID: number, seriesID: string, options: POSTCalendarEventBody["repeatInfo"]): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "PATCH",
            path:   endpoints.CHANNEL_EVENT_EVENT_SERIES_ENTITY(channelID, seriesID),
            json:   { calendarEventId: eventID, repeatInfo: options }
        });
    }

    /**
     * Delete a CalendarEventSeries.
     * @param channelID ID of the channel.
     * @param eventID ID of the event.
     * @param seriesID ID of the series.
     */
    async deleteCalendarEventSeries(channelID: string, eventID: number, seriesID: string): Promise<void> {
        return this.#manager.authRequest({
            method: "DELETE",
            path:   endpoints.CHANNEL_EVENT_EVENT_SERIES_ENTITY(channelID, seriesID),
            json:   { calendarEventId: eventID }
        });
    }

    /** Create a comment inside a calendar event.
     * @param channelID The ID of a "Calendar" channel.
     * @param eventID The ID of a calendar event.
     * @param options Comment options, includes content, and more.
     */
    async createCalendarComment(channelID: string, eventID: number, options: CreateCalendarCommentOptions): Promise<CalendarEventComment> {
        if (typeof options !== "object") throw new Error("comment options should be an object.");
        return this.#manager.authRequest<POSTCalendarEventCommentResponse>({
            method: "POST",
            path:   endpoints.CHANNEL_EVENT_COMMENTS(channelID, eventID),
            json:   options
        }).then(data => new CalendarEventComment(data.calendarEventComment, this.#manager.client));
    }

    /** Edit an existing calendar event comment.
     * @param channelID The ID of a "Calendar" channel.
     * @param eventID The ID of an event from the channel.
     * @param commentID The ID of the comment to edit.
     * @param options Edit options.
     */
    async editCalendarComment(channelID: string, eventID: number, commentID: number, options: EditCalendarCommentOptions): Promise<CalendarEventComment> {
        if (typeof options !== "object") throw new Error("comment options should be an object.");
        return this.#manager.authRequest<PATCHCalendarEventCommentResponse>({
            method: "PATCH",
            path:   endpoints.CHANNEL_EVENT_COMMENT(channelID, eventID, commentID),
            json:   options
        }).then(data => new CalendarEventComment(data.calendarEventComment, this.#manager.client));
    }

    /** Delete a comment from a calendar event.
     * @param channelID ID of the channel containing the event.
     * @param eventID ID of the event containing the comment.
     * @param commentID ID of the comment to delete.
     */
    async deleteCalendarComment(channelID: string, eventID: number, commentID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_EVENT_COMMENT(channelID, eventID, commentID)
        });
    }

    /** Delete an event from a "Calendar" channel.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     */
    async deleteCalendarEvent(channelID: string, eventID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_EVENT(channelID, eventID)
        });
    }

    /** Add/Edit a RSVP in a calendar event.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @param memberID ID of a member.
     * @param options Edit options.
     */
    async editCalendarRsvp(channelID: string, eventID: number, memberID: string, options: EditCalendarRSVPOptions): Promise<CalendarEventRSVP> {
        if (typeof options !== "object") throw new Error("rsvp options should be an object.");
        return this.#manager.authRequest<PUTCalendarEventRSVPResponse>({
            method: "PUT",
            path:   endpoints.CHANNEL_EVENT_RSVP(channelID, eventID, memberID),
            json:   options
        }).then(data => new CalendarEventRSVP(data.calendarEventRsvp, this.#manager.client));
    }

    /** Delete a RSVP from a calendar event.
     * @param channelID ID of a "Calendar" channel.
     * @param eventID ID of a calendar event.
     * @param memberID ID of a member.
     */
    async deleteCalendarRsvp(channelID: string, eventID: number, memberID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_EVENT_RSVP(channelID, eventID, memberID)
        });
    }

    /**
     * Bulk create/update calendar rsvps.
     * @param channelID ID of the Calendar channel.
     * @param eventID ID of a calendar event.
     * @param memberIDs List of multiple member ids.
     * @param options Update options.
     */
    async bulkCalendarRsvpUpdate(channelID: string, eventID: number, memberIDs: Array<string>, options: EditCalendarRSVPOptions): Promise<void> {
        return this.#manager.authRequest({
            method: "PUT",
            path:   endpoints.CHANNEL_EVENT_RSVPS(channelID, eventID),
            json:   {
                userIds: memberIDs,
                status:  options.status
            }
        });
    }

    /** Create a new item in a list channel.
     * @param channelID ID of a "Lists" channel.
     * @param content String content of the new item.
     * @param note Add a note to the new item.
     */
    async createListItem(channelID: string, content: POSTListItemBody["message"], note?: POSTListItemBody["note"]): Promise<ListItem> {
        return this.#manager.authRequest<POSTListItemResponse>({
            method: "POST",
            path:   endpoints.LIST_ITEMS(channelID),
            json:   { message: content, note }
        }).then(data => new ListItem(data.listItem, this.#manager.client));
    }

    /** Edit an item from a list channel.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     * @param options Edit options.
     */
    async editListItem(channelID: string, itemID: string, options?: { content?: PATCHListItemBody["message"]; note?: PATCHListItemBody["note"]; }): Promise<ListItem> {
        return this.#manager.authRequest<PATCHListItemResponse>({
            method: "PATCH",
            path:   endpoints.LIST_ITEM(channelID, itemID),
            json:   { message: options?.content, note: options?.note }
        }).then(data => new ListItem(data.listItem, this.#manager.client));
    }

    /** Delete an item from a list channel.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     */
    async deleteListItem(channelID: string, itemID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.LIST_ITEM(channelID, itemID)
        });
    }

    /** Mark a list item as completed.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     */
    async completeListItem(channelID: string, itemID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "POST",
            path:   endpoints.LIST_ITEM_COMPLETE(channelID, itemID)
        });
    }

    /** Mark a list item as uncompleted.
     * @param channelID ID of a "Lists" channel.
     * @param itemID ID of a list item.
     */
    async uncompleteListItem(channelID: string, itemID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.LIST_ITEM_COMPLETE(channelID, itemID)
        });
    }

    /**
     * Create a new announcement within an announcement channel.
     * @param channelID ID of the Announcement channel.
     * @param options Announcement creation options.
     */
    async createAnnouncement(channelID: string, options: POSTChannelAnnouncementBody): Promise<Announcement> {
        return this.#manager.authRequest<POSTChannelAnnouncementResponse>({
            method: "POST",
            path:   endpoints.CHANNEL_ANNOUNCEMENTS(channelID),
            json:   options
        }).then(data => new Announcement(data.announcement, this.#manager.client));
    }

    /**
     * Edit an existing announcement.
     * @param channelID ID of the Announcement channel.
     * @param announcementID ID of the announcement to edit.
     * @param options Edit options
     */
    async editAnnouncement(channelID: string, announcementID: string, options: PATCHChannelAnnouncementBody): Promise<Announcement> {
        return this.#manager.authRequest<PATCHChannelAnnouncementResponse>({
            method: "PATCH",
            path:   endpoints.CHANNEL_ANNOUNCEMENT(channelID, announcementID),
            json:   options
        }).then(data => new Announcement(data.announcement, this.#manager.client));
    }

    /**
     * Delete an announcement.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement to delete.
     */
    async deleteAnnouncement(channelID: string, announcementID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_ANNOUNCEMENT(channelID, announcementID)
        });
    }

    /**
     * Get a list of announcements from a channel.
     * @param channelID ID of an Announcement channel.
     * @param filter Filter to apply.
     */
    async getAnnouncements(channelID: string, filter?: GETChannelAnnouncementsQuery): Promise<Array<Announcement>> {
        const query = new URLSearchParams();
        if (filter?.before) query.set("before", filter.before.toString());
        if (filter?.limit) query.set("limit", filter.limit.toString());
        return this.#manager.authRequest<GETChannelAnnouncementsResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_ANNOUNCEMENTS(channelID),
            query
        }).then(data => data.announcements.map(d => new Announcement(d, this.#manager.client)));
    }

    /**
     * Get a specific announcement from a channel.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement to get.
     */
    async getAnnouncement(channelID: string, announcementID: string): Promise<Announcement> {
        return this.#manager.authRequest<GETChannelAnnouncementResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_ANNOUNCEMENT(channelID, announcementID)
        }).then(data => new Announcement(data.announcement, this.#manager.client));
    }

    /**
     * Create a comment inside an announcement.
     * @param channelID ID of the Announcement channel.
     * @param announcementID ID of the announcement to create the comment in.
     * @param options Comment creation options.
     */
    async createAnnouncementComment(channelID: string, announcementID: string, options: POSTChannelAnnouncementCommentBody): Promise<AnnouncementComment> {
        return this.#manager.authRequest<POSTChannelAnnouncementCommentResponse>({
            method: "POST",
            path:   endpoints.CHANNEL_ANNOUNCEMENT_COMMENTS(channelID, announcementID),
            json:   options
        }).then(data => new AnnouncementComment(data.announcementComment, this.#manager.client));
    }

    /**
     * Edit an announcement comment.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of an announcement where the comment is in.
     * @param commentID ID of the comment to edit.
     * @param options Edit options.
     */
    async editAnnouncementComment(channelID: string, announcementID: string, commentID: number, options: PATCHChannelAnnouncementCommentBody): Promise<AnnouncementComment> {
        return this.#manager.authRequest<PATCHChannelAnnouncementCommentResponse>({
            method: "PATCH",
            path:   endpoints.CHANNEL_ANNOUNCEMENT_COMMENT(channelID, announcementID, commentID),
            json:   options
        }).then(data => new AnnouncementComment(data.announcementComment, this.#manager.client));
    }

    /**
     * Delete an announcement comment.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement where the comment is in.
     * @param commentID ID of the comment to delete.
     */
    async deleteAnnouncementComment(channelID: string, announcementID: string, commentID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_ANNOUNCEMENT_COMMENT(channelID, announcementID, commentID)
        });
    }

    /**
     * Get comments from an announcement.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of an announcement.
     */
    async getAnnouncementComments(channelID: string, announcementID: string): Promise<Array<AnnouncementComment>> {
        return this.#manager.authRequest<GETChannelAnnouncementCommentsResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_ANNOUNCEMENT_COMMENTS(channelID, announcementID)
        }).then(data => data.announcementComments.map(d => new AnnouncementComment(d, this.#manager.client)));
    }

    /**
     * Get a specific comment from an announcement.
     * @param channelID ID of an Announcement channel.
     * @param announcementID ID of the announcement where the comment is in.
     * @param commentID ID of the comment to get.
     */
    async getAnnouncementComment(channelID: string, announcementID: string, commentID: number): Promise<AnnouncementComment> {
        return this.#manager.authRequest<GETChannelAnnouncementCommentResponse>({
            method: "GET",
            path:   endpoints.CHANNEL_ANNOUNCEMENT_COMMENT(channelID, announcementID, commentID)
        }).then(data => new AnnouncementComment(data.announcementComment, this.#manager.client));
    }

    /**
     * Archive a channel.
     * @param guildID ID of the guild where the channel to archive is in
     * @param channelID ID of the channel to archive
     */
    async archiveChannel(channelID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints.CHANNEL_ARCHIVE(channelID)
        });
    }

    /**
     * Restore a channel.
     * @param guildID ID of the guild where the channel to restore is in
     * @param channelID ID of the channel to restore
     */
    async restoreChannel(channelID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_ARCHIVE(channelID)
        });
    }

    /**
     * Pin a message.
     * @param channelID ID of the channel where the message to pin is in
     * @param messageID ID of the message to pin
     */
    async pinMessage(channelID: string, messageID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "POST",
            path:   endpoints.CHANNEL_MESSAGE_PIN(channelID, messageID)
        });
    }

    /**
     * Unpin a message.
     * @param channelID ID of the channel where the message to unpin is in
     * @param messageID ID of the message to unpin
     */
    async unpinMessage(channelID: string, messageID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.CHANNEL_MESSAGE_PIN(channelID, messageID)
        });
    }
}
