/** @module Guild */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { Base } from "./Base";
import type { Channel } from "./Channel";
import { Member } from "./Member";
import type { User } from "./User";
import type { BannedMember } from "./BannedMember";
import type { Subscription } from "./Subscription";
import { GuildChannel } from "./GuildChannel";
import { Group } from "./Group";
import { Role } from "./Role";
import type { Category } from "./Category";
import type { POSTBulkAwardXPResponse, POSTCreateCategoryBody, PATCHUpdateCategoryBody } from "../Constants";
import TypedCollection from "../util/TypedCollection";
import type {
    JSONGuild,
    AnyChannel,
    BulkXPOptions,
    RawGroup,
    RawChannel,
    RawMember,
    RawRole,
    RawGuild
} from "../types";

/** Represents a Guild, also called server. */
export class Guild extends Base<string> {
    private _clientMember?: Member;
    /** Guild banner URL. */
    bannerURL?: string | null;
    /** Cached guild channels. */
    channels: TypedCollection<string, RawChannel, AnyChannel>;
    /** When this guild was created. */
    createdAt: Date;
    /** Default channel of the guild. */
    defaultChannelID?: string;
    /** Guild description. */
    description?: string;
    /** Cached guild groups */
    groups: TypedCollection<string, RawGroup, Group>;
    /** Guild icon URL. */
    iconURL?: string | null;
    /** Cached guild members. */
    members: TypedCollection<string, RawMember, Member, [guildID: string]>;
    /** The name of the guild. */
    name: string;
    /** ID of the guild owner. */
    ownerID: string;
    /** Cached guild roles. */
    roles: TypedCollection<number, RawRole, Role>;
    /** Guild's timezone. */
    timezone?: string;
    /** Guild type. */
    type?: string;
    /** The URL of the guild. */
    url?: string;
    /** If true, the guild is verified. */
    verified: boolean;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: RawGuild, client: Client){
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
        this.groups = new TypedCollection(Group, client);
        this.channels = new TypedCollection(GuildChannel, client);
        this.members = new TypedCollection(Member, client);
        this.roles = new TypedCollection(Role, client);
        this.update(data);
    }

    protected override update(data: RawGuild): void {
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

    /** Award a member using the built-in EXP system.
     * @param memberID ID of the member to award.
     * @param amount Amount of experience to give.
     */
    async awardMember(memberID: string, amount: number): Promise<number>{
        return this.client.rest.guilds.awardMember(this.id as string, memberID, amount);
    }

    /** Award every member of a guild having a role using the built-in EXP system.
     * @param roleID ID of a role.
     * @param amount Amount of experience.
     */
    async awardRole(roleID: number, amount: number): Promise<void> {
        return this.client.rest.guilds.awardRole(this.id as string, roleID, amount);
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

    /** Ban a member.
     * @param memberID ID of the member to ban.
     * @param reason The reason of the ban.
     */
    async createBan(memberID: string, reason?: string): Promise<BannedMember> {
        return this.client.rest.guilds.createBan(this.id as string, memberID, reason);
    }

    /**
     * Create a category
     * @param options Create options.
     */
    async createCategory(options: POSTCreateCategoryBody): Promise<Category> {
        return this.client.rest.guilds.createCategory(this.id as string, options);
    }

    /**
     * Delete a category.
     * @param categoryID ID of the category you want to read.
     */
    async deleteCategory(categoryID: number): Promise<Category> {
        return this.client.rest.guilds.deleteCategory(this.id as string, categoryID);
    }

    /**
     * Edit a category.
     * @param categoryID ID of the category you want to read.
     * @param options Options to update a category.
     */
    async editCategory(categoryID: number, options: PATCHUpdateCategoryBody): Promise<Category> {
        return this.client.rest.guilds.editCategory(this.id as string, categoryID, options);
    }

    /**
     * Read a guild category.
     * @param categoryID ID of the category you want to read.
     */
    async getCategory(categoryID: number): Promise<Category> {
        return this.client.rest.guilds.getCategory(this.id as string, categoryID);
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

    /** Get Subscription
     * @param subscriptionID ID of the subscription to get.
     */
    async getSubscription(subscriptionID: string): Promise<Subscription> {
        return this.client.rest.guilds.getSubscription(this.id as string, subscriptionID);
    }

    /** Get Subscriptions */
    async getSubscriptions(): Promise<Array<Subscription>> {
        return this.client.rest.guilds.getSubscriptions(this.id as string);
    }

    /** Unban a member.
     * @param memberID ID of the member to unban.
     */
    async removeBan(memberID: string): Promise<void> {
        return this.client.rest.guilds.removeBan(this.id as string, memberID);
    }

    /** Set member's experience using the built-in EXP system.
     * @param memberID ID of the member to award.
     * @param amount Amount of experience to set.
     */
    async setMemberXP(memberID: string, amount: number): Promise<number>{
        return this.client.rest.guilds.setMemberXP(this.id as string, memberID, amount);
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
}
