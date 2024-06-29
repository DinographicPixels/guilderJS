/** @module Announcement */
import { Client } from "./Client";
import { Base } from "./Base";
import { AnnouncementComment } from "./AnnouncementComment";
import {
    APIAnnouncement,
    APIAnnouncementComment,
    APIMentions,
    PATCHChannelAnnouncementBody,
    POSTChannelAnnouncementBody
} from "../Constants";
import { JSONAnnouncement } from "../types/json";
import TypedCollection from "../util/TypedCollection";

/** Represents a channel announcement. */
export class Announcement extends Base<string> {
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
    mentions: APIMentions | null;
    /** The announcement's title. */
    title: string;
    /** Cached announcement's comments */
    comments: TypedCollection<number, APIAnnouncementComment, AnnouncementComment>;

    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: APIAnnouncement, client: Client) {
        super(data.id, client);
        this.guildID = data.serverId;
        this.channelID = data.channelId;
        this.createdAt = new Date(data.createdAt);
        this.memberID = data.createdBy;
        this.content = data.content;
        this.mentions = data.mentions ?? null;
        this.title = data.title;
        this.comments = new TypedCollection(
            AnnouncementComment,
            client,
            client.params.collectionLimits?.announcementComments
        );
        this.update(data);
    }

    override toJSON(): JSONAnnouncement {
        return {
            ...super.toJSON(),
            guildID:   this.guildID,
            channelID: this.channelID,
            createdAt: this.createdAt,
            memberID:  this.memberID,
            content:   this.content,
            mentions:  this.mentions,
            title:     this.title
        };
    }

    protected override update(data: APIAnnouncement): void {
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.content !== undefined) {
            this.content = data.content;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.memberID = data.createdBy;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.mentions !== undefined) {
            this.mentions = data.mentions;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.title !== undefined) {
            this.title = data.title;
        }
    }

    /**
     * Edit this announcement.
     * @param options Edit options
     */
    async edit(options: PATCHChannelAnnouncementBody): Promise<Announcement> {
        return this.client.rest.channels.editAnnouncement(
            this.channelID,
            this.id,
            options
        );
    }

    /**
     * Delete this announcement.
     */
    async delete(): Promise<void> {
        return this.client.rest.channels.deleteAnnouncement(this.channelID, this.id);
    }

    /**
     * Create an announcement in the same Announcement channel as this one.
     * @param options Create options.
     */
    async createAnnouncement(options: POSTChannelAnnouncementBody): Promise<Announcement> {
        return this.client.rest.channels.createAnnouncement(this.channelID, options);
    }

    /**
     * Add a reaction to this announcement.
     * @param emoteID ID of the emote to add
     */
    async createReaction(emoteID: number): Promise<void> {
        return this.client.rest.channels.createReaction(
            this.channelID,
            "ChannelAnnouncement",
            this.id,
            emoteID
        );
    }

    /**
     * Remove a reaction from this announcement.
     * @param emoteID ID of the emote to remove
     */
    async deleteReaction(emoteID: number): Promise<void> {
        return this.client.rest.channels.deleteReaction(
            this.channelID,
            "ChannelAnnouncement",
            this.id,
            emoteID
        );
    }
}
