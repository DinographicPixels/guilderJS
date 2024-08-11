/** @module Guild */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Base } from "./Base";
import { Channel } from "./Channel";
import { Member } from "./Member";
import { User } from "./User";
import { BannedMember } from "./BannedMember";
import { GuildSubscription } from "./GuildSubscription";
import { GuildChannel } from "./GuildChannel";
import { GuildGroup } from "./GuildGroup";
import { GuildRole } from "./GuildRole";
import { GuildCategory } from "./GuildCategory";
import {
    APIGuild,
    APIGuildChannel,
    APIGuildGroup,
    APIGuildMember,
    APIGuildRole,
    POSTBulkAwardXPResponse,
    POSTCreateCategoryBody,
    PATCHUpdateCategoryBody
} from "../Constants";
import TypedCollection from "../util/TypedCollection";
import { JSONGuild, AnyChannel, BulkXPOptions } from "../types";

/** Represents a Guild, also called server. */
export class Guild extends Base<string> {
    private _clientMember?: Member;
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
    /** Cached guild groups */
    groups: TypedCollection<string, APIGuildGroup, GuildGroup>;
    /** Cached guild channels. */
    channels: TypedCollection<string, APIGuildChannel, AnyChannel>;
    /** Cached guild members. */
    members: TypedCollection<string, APIGuildMember, Member, [guildID: string]>;
    /** Cached guild roles. */
    roles: TypedCollection<number, APIGuildRole, GuildRole>;

    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: APIGuild, client: Client){
        super(data.id, client);
        this.ownerID = data.ownerId;
        this.type = data.type;
        this.name = data.name;
        this.url = data.url;
        this.description = data.about;
        this.iconURL = data.avatar ?? null;
        this.bannerURL = data.banner ?? null;
        this.timezone = data.timezone;
        this.defaultChannelID = data.defaultChannelId;
        this.createdAt = new Date(data.createdAt);
        this.verified = data.isVerified ?? false;
        this.groups = new TypedCollection(GuildGroup, client);
        this.channels = new TypedCollection(GuildChannel, client);
        this.members = new TypedCollection(Member, client);
        this.roles = new TypedCollection(GuildRole, client);
        this.update(data);
    }

    override toJSON(): JSONGuild {
        return {
            ...super.toJSON(),
            ownerID:          this.ownerID,
            type:             this.type,
            name:             this.name,
            url:              this.url,
            description:      this.description,
            iconURL:          this.iconURL,
            bannerURL:        this.bannerURL,
            timezone:         this.timezone,
            defaultChannelID: this.defaultChannelID,
            createdAt:        this.createdAt,
            verified:         this.verified,
            channels:         this.channels.map(channel => channel.toJSON()),
            members:          this.members.map(member => member.toJSON())
        };
    }

    protected override update(data: APIGuild): void {
        if (data.about !== undefined) {
            this.description = data.about;
        }
        if (data.avatar !== undefined) {
            this.iconURL = data.avatar;
        }
        if (data.banner !== undefined) {
            this.bannerURL = data.banner;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.defaultChannelId !== undefined) {
            this.defaultChannelID = data.defaultChannelId;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.isVerified !== undefined) {
            this.verified = data.isVerified;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.ownerId !== undefined) {
            this.ownerID = data.ownerId;
        }
        if (data.timezone !== undefined) {
            this.timezone = data.timezone;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.url !== undefined) {
            this.url = data.url;
        }
    }

    /** Retrieve cached or rest guild's owner. */
    get owner(): Member | User | Promise<Member> {
        return this.client.getGuild(this.id)?.members.get(this.ownerID)
          ?? this.client.users.get(this.ownerID)
          ?? this.client.rest.guilds.getMember(this.id, this.ownerID);
    }

    /** Get a channel from this guild, if cached.
     * @param channelID The ID of the channel to get from cache.
     */
    getChannel(channelID: string): Channel | undefined {
        if (!channelID) throw new Error("channelID is a required parameter.");
        return this.channels.get(channelID);
    }

    /** Get a member from this guild, if cached.
     * @param memberID The ID of the member to get.
     */
    getMember(memberID: string): Member | undefined {
        if (!memberID) throw new Error("memberID is a required parameter.");
        return this.members.get(memberID);
    }

    /** Ban a member.
     * @param memberID ID of the member to ban.
     * @param reason The reason of the ban.
     */
    async createBan(memberID: string, reason?: string): Promise<BannedMember> {
        return this.client.rest.guilds.createBan(this.id as string, memberID, reason);
    }

    /** Unban a member.
     * @param memberID ID of the member to unban.
     */
    async removeBan(memberID: string): Promise<void> {
        return this.client.rest.guilds.removeBan(this.id as string, memberID);
    }

    /** Get Subscription
     * @param subscriptionID ID of the subscription to get.
     */
    async getSubscription(subscriptionID: string): Promise<GuildSubscription> {
        return this.client.rest.guilds.getSubscription(this.id as string, subscriptionID);
    }

    /** Get Subscriptions */
    async getSubscriptions(): Promise<Array<GuildSubscription>> {
        return this.client.rest.guilds.getSubscriptions(this.id as string);
    }

    /** Bulk Award XP Members
     * @param options Members to award XP and amount of XP to award.
     */
    async bulkAwardXPMembers(options: BulkXPOptions): Promise<POSTBulkAwardXPResponse> {
        return this.client.rest.guilds.bulkAwardXP(this.id as string, options);
    }

    /** Bulk set XP Members
     * @param options Members to set XP and amount of XP to set.
     */
    async bulkSetXPMembers(options: BulkXPOptions): Promise<POSTBulkAwardXPResponse> {
        return this.client.rest.guilds.bulkSetXP(this.id as string, options);
    }

    /**
     * Create a category
     * @param options Create options.
     */
    async createCategory(options: POSTCreateCategoryBody): Promise<GuildCategory> {
        return this.client.rest.guilds.createCategory(this.id as string, options);
    }
    /**
     * Read a guild category.
     * @param categoryID ID of the category you want to read.
     */
    async getCategory(categoryID: number): Promise<GuildCategory> {
        return this.client.rest.guilds.getCategory(this.id as string, categoryID);
    }
    /**
     * Edit a category.
     * @param categoryID ID of the category you want to read.
     * @param options Options to update a category.
     */
    async editCategory(categoryID: number, options: PATCHUpdateCategoryBody): Promise<GuildCategory> {
        return this.client.rest.guilds.editCategory(this.id as string, categoryID, options);
    }

    /**
     * Delete a category.
     * @param categoryID ID of the category you want to read.
     */
    async deleteCategory(categoryID: number): Promise<GuildCategory> {
        return this.client.rest.guilds.deleteCategory(this.id as string, categoryID);
    }

    /** Award a member using the built-in EXP system.
     * @param memberID ID of the member to award.
     * @param amount Amount of experience to give.
     */
    async awardMember(memberID: string, amount: number): Promise<number>{
        return this.client.rest.guilds.awardMember(this.id as string, memberID, amount);
    }

    /** Set member's experience using the built-in EXP system.
     * @param memberID ID of the member to award.
     * @param amount Amount of experience to set.
     */
    async setMemberXP(memberID: string, amount: number): Promise<number>{
        return this.client.rest.guilds.setMemberXP(this.id as string, memberID, amount);
    }

    /** Award every member of a guild having a role using the built-in EXP system.
     * @param roleID ID of a role.
     * @param amount Amount of experience.
     */
    async awardRole(roleID: number, amount: number): Promise<void> {
        return this.client.rest.guilds.awardRole(this.id as string, roleID, amount);
    }
}
