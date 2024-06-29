/** @module BannedMember */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { User } from "./User";
import { Guild } from "./Guild";
import { Base } from "./Base";
import { Member } from "./Member";
import { APIGuildMemberBan, APIUser } from "../Constants";
import { JSONBannedMember } from "../types/json";

/** BannedMember represents a banned guild member. */
export class BannedMember extends Base<string> {
    /** Server ID. */
    guildID: string;
    /** Information about the banned member (object) */
    ban: {
        /** Reason of the ban */
        reason?: string;
        /** When the member has been banned. */
        createdAt: Date | null;
        /** ID of the member who banned this member. */
        bannedBy: string;
    };
    /** Banned user. */
    user: User;
    /** Banned member, if cached. */
    member: Member | null;
    /**
     * @param guildID ID of the guild.
     * @param data raw data.
     * @param client client.
     */
    constructor(guildID: string, data: APIGuildMemberBan, client: Client){
        super(data.user.id, client);
        this.guildID = guildID;
        this.ban = {
            reason:    data.reason,
            createdAt: data.createdAt ? new Date(data.createdAt) : null,
            bannedBy:  data.createdBy
        };
        this.user = client.users.update(data.user) ?? new User(data.user as APIUser, client);
        this.member = client.getGuild(guildID)?.members.get(data.user.id) ?? null;
        this.update(data);
    }

    override toJSON(): JSONBannedMember {
        return {
            ...super.toJSON(),
            guildID: this.guildID,
            ban:     this.ban
        };
    }

    protected override update(data: APIGuildMemberBan): void {
        if (data.createdAt !== undefined) {
            this.ban.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.ban.bannedBy = data.createdBy;
        }
        if (data.reason !== undefined) {
            this.ban.reason = data.reason;
        }
        if (data.user !== undefined && this.client.users.update(data.user)) {
            this.user = this.client.users.update(data.user);
        }
    }

    /** Getter used to get the message's guild
     *
     * Note: this can return a promise, make sure to await it before.
     */
    get guild(): Guild | Promise<Guild> {
        return this.client.guilds.get(this.guildID) ?? this.client.rest.guilds.getGuild(this.guildID);
    }
}
