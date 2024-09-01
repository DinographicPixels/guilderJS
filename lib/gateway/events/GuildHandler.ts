/** @module GuildHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";

import {
    BannedMember,
    Guild,
    Role,
    Member,
    GatewayLayerIntent
} from "../../index";

import type { GuildCreateInfo, GuildDeleteInfo } from "../../types";
import type {
    GatewayEvent_BotServerMembershipCreated,
    GatewayEvent_BotServerMembershipDeleted,
    GatewayEvent_GroupCreated,
    GatewayEvent_GroupDeleted,
    GatewayEvent_GroupUpdated,
    GatewayEvent_RoleCreated,
    GatewayEvent_RoleDeleted,
    GatewayEvent_RoleUpdated,
    GatewayEvent_ServerMemberBanned,
    GatewayEvent_ServerMemberJoined,
    GatewayEvent_ServerMemberRemoved,
    GatewayEvent_ServerMemberSocialLinkCreated,
    GatewayEvent_ServerMemberSocialLinkDeleted,
    GatewayEvent_ServerMemberSocialLinkUpdated,
    GatewayEvent_ServerMemberUnbanned,
    GatewayEvent_ServerMemberUpdated,
    GatewayEvent_ServerRolesUpdated,
    GatewayEvent_CategoryCreated
} from "../../Constants";
import { MemberUpdateInfo } from "../../structures/MemberUpdateInfo";
import { MemberRemoveInfo } from "../../structures/MemberRemoveInfo";
import { Group } from "../../structures/Group";
import { Category } from "../../structures/Category";

/** Internal component, emitting guild events. */
export class GuildHandler extends GatewayEventHandler {
    get isGuildIntentEnabled(): boolean {
        return this.client.util.isIntentEnabled([GatewayLayerIntent.GUILDS]);
    }
    guildBanAdd(data: GatewayEvent_ServerMemberBanned): void {
        if (!this.isGuildIntentEnabled) return;
        const GuildMemberBanComponent =
          new BannedMember(data.serverId, data.serverMemberBan, this.client);
        this.client.emit("guildBanAdd", GuildMemberBanComponent);
    }
    guildBanRemove(data: GatewayEvent_ServerMemberUnbanned): void {
        if (!this.isGuildIntentEnabled) return;
        const GuildMemberBanComponent =
          new BannedMember(data.serverId, data.serverMemberBan, this.client);
        this.client.emit("guildBanRemove", GuildMemberBanComponent);
    }
    guildCategoryCreate(data: GatewayEvent_CategoryCreated): void {
        if (!this.isGuildIntentEnabled) return;
        const category = new Category(data.category, this.client);
        this.client.emit("guildCategoryCreate", category);
    }
    guildCategoryDelete(data: GatewayEvent_CategoryCreated): void {
        if (!this.isGuildIntentEnabled) return;
        const category = new Category(data.category, this.client);
        this.client.emit("guildCategoryDelete", category);
    }
    guildCategoryUpdate(data: GatewayEvent_CategoryCreated): void {
        if (!this.isGuildIntentEnabled) return;
        const category = new Category(data.category, this.client);
        this.client.emit("guildCategoryUpdate", category);
    }
    guildCreate(data: GatewayEvent_BotServerMembershipCreated): void {
        const GuildComponent = new Guild(data.server, this.client);
        this.client.guilds.add(GuildComponent);
        const output = {
            guild:     GuildComponent,
            inviterID: data.createdBy
        };
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildCreate", output as GuildCreateInfo);
    }
    guildDelete(data: GatewayEvent_BotServerMembershipDeleted): void {
        const GuildComponent = new Guild(data.server, this.client);
        this.client.guilds.delete(GuildComponent.id as string);
        const output = {
            guild:     GuildComponent,
            removerID: data.createdBy
        };
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildDelete", output as GuildDeleteInfo);
    }
    guildGroupCreate(data: GatewayEvent_GroupCreated): void {
        const GuildGroupComponent = new Group(data.group, this.client);
        this.client.guilds.get(data.serverId)?.groups.add(GuildGroupComponent);
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildGroupCreate", GuildGroupComponent);
    }
    guildGroupDelete(data: GatewayEvent_GroupDeleted): void {
        const guild = this.client.guilds.get(data.serverId);
        const GuildGroupComponent =
          guild?.groups.update(new Group(data.group, this.client))
          ?? new Group(data.group, this.client);
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildGroupDelete", GuildGroupComponent);
    }
    guildGroupUpdate(data: GatewayEvent_GroupUpdated): void {
        const guild = this.client.guilds.get(data.serverId);
        const CachedGroup = guild?.groups.get(data.group.id)?.toJSON() ?? null;
        const GuildGroupComponent =
          guild?.groups.update(new Group(data.group, this.client))
          ?? new Group(data.group, this.client);
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildGroupUpdate", GuildGroupComponent, CachedGroup);
    }
    guildMemberAdd(data: GatewayEvent_ServerMemberJoined): void {
        if (!this.isGuildIntentEnabled) return;
        const MemberComponent = new Member(data.member, this.client, data.serverId);
        this.client.emit("guildMemberAdd", MemberComponent, data.serverMemberCount);
    }


    guildMemberRemove(data: GatewayEvent_ServerMemberRemoved): void {
        if (!this.isGuildIntentEnabled) return;
        const output = new MemberRemoveInfo(data, data.userId, this.client);
        this.client.emit("guildMemberRemove", output);
    }


    guildMemberRoleUpdate(data: GatewayEvent_ServerRolesUpdated): void {
        if (!this.isGuildIntentEnabled) return;
        const output =
          new MemberUpdateInfo(data, data.memberRoleIds[0].userId, this.client);
        this.client.emit("guildMemberUpdate", output);
    }
    guildMemberSocialLinkCreate(data: GatewayEvent_ServerMemberSocialLinkCreated): void {
        if (!this.isGuildIntentEnabled) return;
        this.client.emit(
            "guildMemberUpdate",
            new MemberUpdateInfo(data, data.socialLink.userId, this.client)
        );
    }
    guildMemberSocialLinkDelete(data: GatewayEvent_ServerMemberSocialLinkDeleted): void {
        if (!this.isGuildIntentEnabled) return;
        this.client.emit(
            "guildMemberUpdate",
            new MemberUpdateInfo(data, data.socialLink.userId, this.client)
        );
    }
    guildMemberSocialLinkUpdate(data: GatewayEvent_ServerMemberSocialLinkUpdated): void {
        if (!this.isGuildIntentEnabled) return;
        this.client.emit(
            "guildMemberUpdate",
            new MemberUpdateInfo(data, data.socialLink.userId, this.client)
        );
    }
    guildMemberUpdate(data: GatewayEvent_ServerMemberUpdated): void {
        if (!this.isGuildIntentEnabled) return;
        const output = new MemberUpdateInfo(data, data.userInfo.id, this.client);
        this.client.emit("guildMemberUpdate", output);
    }
    guildRoleCreate(data: GatewayEvent_RoleCreated): void {
        const guild = this.client.guilds.get(data.serverId);
        const role =
          guild?.roles.add(new Role(data.role, this.client))
          ?? new Role(data.role, this.client);
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildRoleCreate", role);
    }

    guildRoleDelete(data: GatewayEvent_RoleDeleted): void {
        const guild = this.client.guilds.get(data.serverId);
        const role =
          guild?.roles.update(new Role(data.role, this.client))
          ?? new Role(data.role, this.client);
        guild?.roles.delete(data.role.id);
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildRoleDelete", role);
    }
    guildRoleUpdate(data: GatewayEvent_RoleUpdated): void {
        const guild = this.client.guilds.get(data.serverId);
        const cachedRole = guild?.roles.get(data.role.id)?.toJSON() ?? null;
        const role =
          guild?.roles.update(new Role(data.role, this.client))
          ?? new Role(data.role, this.client);
        if (!this.isGuildIntentEnabled) return;
        this.client.emit("guildRoleUpdate", role, cachedRole);
    }
}
