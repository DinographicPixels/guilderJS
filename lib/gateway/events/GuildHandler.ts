/** @module GuildHandler */
import { GatewayEventHandler } from "./GatewayEventHandler";

import { BannedMember, Guild, GuildRole, Member } from "../../index";

import { GuildCreateInfo, GuildDeleteInfo } from "../../types/types";
import {
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
import { GuildGroup } from "../../structures/GuildGroup";
import { GuildCategory } from "../../structures/GuildCategory";

/** Internal component, emitting guild events. */
export class GuildHandler extends GatewayEventHandler {
    guildBanAdd(data: GatewayEvent_ServerMemberBanned): void{
        const GuildMemberBanComponent =
          new BannedMember(data.serverId, data.serverMemberBan, this.client);
        this.client.emit("guildBanAdd", GuildMemberBanComponent);
    }

    guildBanRemove(data: GatewayEvent_ServerMemberUnbanned): void{
        const GuildMemberBanComponent =
          new BannedMember(data.serverId, data.serverMemberBan, this.client);
        this.client.emit("guildBanRemove", GuildMemberBanComponent);
    }

    guildMemberAdd(data: GatewayEvent_ServerMemberJoined): void{
        const MemberComponent = new Member(data.member, this.client, data.serverId);
        this.client.emit("guildMemberAdd", MemberComponent, data.serverMemberCount);
    }

    guildMemberRemove(data: GatewayEvent_ServerMemberRemoved): void{
        const output = new MemberRemoveInfo(data, data.userId, this.client);
        this.client.emit("guildMemberRemove", output);
    }

    guildMemberUpdate(data: GatewayEvent_ServerMemberUpdated): void{
        const output = new MemberUpdateInfo(data, data.userInfo.id, this.client);
        this.client.emit("guildMemberUpdate", output);
    }

    guildMemberRoleUpdate(data: GatewayEvent_ServerRolesUpdated): void{
        const output =
          new MemberUpdateInfo(data, data.memberRoleIds[0].userId, this.client);
        this.client.emit("guildMemberUpdate", output);
    }

    guildCreate(data: GatewayEvent_BotServerMembershipCreated): void{
        const GuildComponent = new Guild(data.server, this.client);
        this.client.guilds.add(GuildComponent);
        const output = {
            guild:     GuildComponent,
            inviterID: data.createdBy
        };
        this.client.emit("guildCreate", output as GuildCreateInfo);
    }

    guildDelete(data: GatewayEvent_BotServerMembershipDeleted): void {
        const GuildComponent = new Guild(data.server, this.client);
        this.client.guilds.delete(GuildComponent.id as string);
        const output = {
            guild:     GuildComponent,
            removerID: data.createdBy
        };
        this.client.emit("guildDelete", output as GuildDeleteInfo);
    }

    guildMemberSocialLinkCreate(data: GatewayEvent_ServerMemberSocialLinkCreated): void {
        this.client.emit(
            "guildMemberUpdate",
            new MemberUpdateInfo(data, data.socialLink.userId, this.client)
        );
    }

    guildMemberSocialLinkUpdate(data: GatewayEvent_ServerMemberSocialLinkUpdated): void {
        this.client.emit(
            "guildMemberUpdate",
            new MemberUpdateInfo(data, data.socialLink.userId, this.client)
        );
    }

    guildMemberSocialLinkDelete(data: GatewayEvent_ServerMemberSocialLinkDeleted): void {
        this.client.emit(
            "guildMemberUpdate",
            new MemberUpdateInfo(data, data.socialLink.userId, this.client)
        );
    }

    guildGroupCreate(data: GatewayEvent_GroupCreated): void {
        const GuildGroupComponent = new GuildGroup(data.group, this.client);
        this.client.guilds.get(data.serverId)?.groups.add(GuildGroupComponent);
        this.client.emit("guildGroupCreate", GuildGroupComponent);
    }

    guildGroupUpdate(data: GatewayEvent_GroupUpdated): void {
        const guild = this.client.guilds.get(data.serverId);
        const CachedGroup = guild?.groups.get(data.group.id)?.toJSON() ?? null;
        const GuildGroupComponent =
          guild?.groups.update(new GuildGroup(data.group, this.client))
          ?? new GuildGroup(data.group, this.client);
        this.client.emit("guildGroupUpdate", GuildGroupComponent, CachedGroup);
    }

    guildGroupDelete(data: GatewayEvent_GroupDeleted): void {
        const guild = this.client.guilds.get(data.serverId);
        const GuildGroupComponent =
          guild?.groups.update(new GuildGroup(data.group, this.client))
          ?? new GuildGroup(data.group, this.client);
        this.client.emit("guildGroupDelete", GuildGroupComponent);
    }

    guildRoleCreate(data: GatewayEvent_RoleCreated): void {
        const guild = this.client.guilds.get(data.serverId);
        const role =
          guild?.roles.add(new GuildRole(data.role, this.client))
          ?? new GuildRole(data.role, this.client);
        this.client.emit("guildRoleCreate", role);
    }

    guildRoleUpdate(data: GatewayEvent_RoleUpdated): void {
        const guild = this.client.guilds.get(data.serverId);
        const cachedRole = guild?.roles.get(data.role.id)?.toJSON() ?? null;
        const role =
          guild?.roles.update(new GuildRole(data.role, this.client))
          ?? new GuildRole(data.role, this.client);
        this.client.emit("guildRoleUpdate", role, cachedRole);
    }

    guildRoleDelete(data: GatewayEvent_RoleDeleted): void {
        const guild = this.client.guilds.get(data.serverId);
        const role =
          guild?.roles.update(new GuildRole(data.role, this.client))
          ?? new GuildRole(data.role, this.client);
        guild?.roles.delete(data.role.id);
        this.client.emit("guildRoleDelete", role);
    }

    guildCategoryCreate(data: GatewayEvent_CategoryCreated): void {
        const category = new GuildCategory(data.category, this.client);
        this.client.emit("guildCategoryCreate", category);
    }

    guildCategoryUpdate(data: GatewayEvent_CategoryCreated): void {
        const category = new GuildCategory(data.category, this.client);
        this.client.emit("guildCategoryUpdate", category);
    }

    guildCategoryDelete(data: GatewayEvent_CategoryCreated): void {
        const category = new GuildCategory(data.category, this.client);
        this.client.emit("guildCategoryDelete", category);
    }
}
