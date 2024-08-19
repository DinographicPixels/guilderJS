/** @module Member */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { User } from "./User";
import type { Guild } from "./Guild";
import type { BannedMember } from "./BannedMember";
import type { SocialLink } from "./SocialLink";
import type { Permissions } from "../Constants";
import type { EditMemberOptions, JSONMember, RawMember } from "../types";

/** Represents a guild user. */
export class Member extends User {
    private _data: RawMember;
    /** Guild ID. */
    guildID: string;
    /** Tells you if the member is the server owner. */
    isOwner: boolean;
    /** When this member joined the guild. */
    joinedAt: Date | null;
    /** Member's server nickname. */
    nickname: string | null;
    /** Array of member's roles. */
    roles: Array<number>;
    /**
     * @param data raw data.
     * @param client client.
     * @param guildID ID of the guild.
     */
    constructor(data: RawMember, client: Client, guildID: string) {
        super(data.user, client);
        this._data = data;
        this.roles = data.roleIds ?? null;
        this.nickname = data.nickname ?? null;
        this.joinedAt = data.joinedAt ? new Date(data.joinedAt) : null;
        this.isOwner = data.isOwner ?? false;
        this.guildID = guildID;
        this.update(data);
    }

    protected override update(data: RawMember): void {
        if (data.isOwner !== undefined) {
            this.isOwner = data.isOwner ?? false;
        }
        if (data.joinedAt !== undefined) {
            this.joinedAt = data.joinedAt ? new Date(data.joinedAt) : null;
        }
        if (data.nickname !== undefined) {
            this.nickname = data.nickname ?? null;
        }
        if (data.roleIds !== undefined) {
            this.roles = data.roleIds ?? null;
        }
        if (data.user !== undefined) {
            super.update(data.user);
            this.client.users.update(data.user);
        }
    }

    /** Guild where the user comes from, returns Guild or a promise.
     * If guild isn't cached & the request failed, this will return you undefined.
     */
    get guild(): Guild | Promise<Guild> {
        return this.client.guilds.get(this.guildID) ?? this.client.rest.guilds.get(this.guildID);
    }

    /** Member's user, shows less information. */
    get user(): User {
        if (this.client.users.get(this.id)) {
            return this.client.users.update(this._data.user);
        } else {
            const USER = new User(this._data.user, this.client);
            this.client.users.add(USER); return USER;
        }
    }

    /** Add this member to a guild group.
     * @param groupID ID of the guild group.
     */
    async addGroup(groupID: string): Promise<void>{
        return this.client.rest.guilds.memberAddGroup(groupID, this.id as string);
    }

    /** Add a role to this member.
     * @param roleID ID of the role to be added.
     */
    async addRole(roleID: number): Promise<void>{
        return this.client.rest.guilds.memberAddRole(this.guildID, this.id as string, roleID);
    }

    /** Award the member using the built-in EXP system.
     * @param amount Amount of experience to give.
     */
    async award(amount: number): Promise<number>{
        return this.client.rest.guilds.awardMember(this.guildID, this.id as string, amount);
    }

    /** Ban this member.
     * @param reason The reason of the ban.
     */
    async ban(reason?: string): Promise<BannedMember> {
        return this.client.rest.guilds.createBan(this.guildID, this.id as string, reason);
    }

    /** Edit this member.
     * @param options Edit options.
     */
    async edit(options: EditMemberOptions): Promise<void> {
        return this.client.rest.guilds.editMember(this.guildID, this.id as string, options);
    }

    /** Get member permission */
    async getPermission(): Promise<Array<Permissions>> {
        return this.client.rest.guilds.getMemberPermission(this.guildID, this.id as string);
    }

    /** Get a specified social link from the member, if member is connected to them through Guilded.
     * @param socialMediaName Name of a social media linked to this member.
     */
    async getSocialLink(socialMediaName: string): Promise<SocialLink>{
        return this.client.rest.misc.getSocialLink(
            this.guildID,
            this.id as string,
            socialMediaName
        );
    }

    /** Kick this member. */
    async kick(): Promise<void> {
        return this.client.rest.guilds.removeMember(this.guildID, this.id as string);
    }

    /** Remove this member from a guild group.
     * @param groupID ID of the guild group.
     */
    async removeGroup(groupID: string): Promise<void>{
        return this.client.rest.guilds.memberRemoveGroup(groupID, this.id as string);
    }

    /** Remove a role from this member.
     * @param roleID ID of the role to be added.
     */
    async removeRole(roleID: number): Promise<void>{
        return this.client.rest.guilds.memberRemoveRole(this.guildID, this.id as string, roleID);
    }

    /** Set member's experience using the built-in EXP system.
     * @param amount Amount of experience to set.
     */
    async setXP(amount: number): Promise<number>{
        return this.client.rest.guilds.setMemberXP(this.guildID, this.id as string, amount);
    }

    override toJSON(): JSONMember {
        return {
            ...super.toJSON(),
            roles:    this.roles,
            nickname: this.nickname,
            joinedAt: this.joinedAt,
            isOwner:  this.isOwner,
            guildID:  this.guildID
        };
    }

    /** Unban this member. */
    async unban(): Promise<void> {
        return this.client.rest.guilds.removeBan(this.guildID, this.id as string);
    }
}

