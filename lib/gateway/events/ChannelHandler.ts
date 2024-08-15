/** @module ChannelHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import type {
    GatewayEvent_ChannelArchived,
    GatewayEvent_ChannelCategoryRolePermissionCreated,
    GatewayEvent_ChannelCategoryUserPermissionCreated,
    GatewayEvent_ChannelRestored,
    GatewayEvent_ChannelRolePermissionCreated,
    GatewayEvent_ChannelUserPermissionCreated,
    GatewayEvent_ChannelUserPermissionDeleted,
    GatewayEvent_ChannelUserPermissionUpdated,
    GatewayEvent_ServerChannelCreated,
    GatewayEvent_ServerChannelDeleted,
    GatewayEvent_ServerChannelUpdated
} from "../../Constants";
import type { AnyChannel } from "../../types";
import type { Permissions } from "guildedapi-types.ts/v1";

/** Internal component, emitting channel events. */
export class ChannelHandler extends GatewayEventHandler{
    private async addGuildChannel(guildID: string, channelID: string): Promise<void> {
        if (this.client.getChannel(guildID, channelID) !== undefined) return;
        const channel =
          await this.client.rest.channels.get(channelID)
              .catch(err =>
                  this.client.emit(
                      "warn",
                      `Cannot register channel to cache due to: (${String(err)})`)
              );
        const guild = this.client.guilds.get(guildID);
        if (typeof channel !== "boolean") guild?.channels?.add(channel);
    }
    async channelArchive(data: GatewayEvent_ChannelArchived): Promise<void> {
        const ChannelComponent = this.client.util.updateChannel(data.channel);
        this.client.emit("channelArchive", ChannelComponent);
    }
    async channelCategoryRolePermissionCreated(data: GatewayEvent_ChannelCategoryRolePermissionCreated): Promise<void> {
        this.client.emit(
            "channelCategoryRolePermissionCreated",
            {
                permission: (data.channelCategoryRolePermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelCategoryRolePermission.createdAt,
                updatedAt:  data.channelCategoryRolePermission.updatedAt,
                roleID:     data.channelCategoryRolePermission.roleId,
                categoryID: data.channelCategoryRolePermission.categoryId,
                guildID:    data.serverId
            });
    }
    async channelCategoryRolePermissionDeleted(data: GatewayEvent_ChannelCategoryRolePermissionCreated): Promise<void> {
        this.client.emit(
            "channelCategoryRolePermissionDeleted",
            {
                permission: (data.channelCategoryRolePermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelCategoryRolePermission.createdAt,
                updatedAt:  data.channelCategoryRolePermission.updatedAt,
                roleID:     data.channelCategoryRolePermission.roleId,
                categoryID: data.channelCategoryRolePermission.categoryId,
                guildID:    data.serverId
            });
    }
    async channelCategoryRolePermissionUpdated(data: GatewayEvent_ChannelCategoryRolePermissionCreated): Promise<void> {
        this.client.emit(
            "channelCategoryRolePermissionUpdated",
            {
                permission: (data.channelCategoryRolePermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelCategoryRolePermission.createdAt,
                updatedAt:  data.channelCategoryRolePermission.updatedAt,
                roleID:     data.channelCategoryRolePermission.roleId,
                categoryID: data.channelCategoryRolePermission.categoryId,
                guildID:    data.serverId
            });
    }
    async channelCategoryUserPermissionCreated(data: GatewayEvent_ChannelCategoryUserPermissionCreated): Promise<void> {
        this.client.emit(
            "channelCategoryUserPermissionCreated",
            {
                permission: (data.channelCategoryUserPermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelCategoryUserPermission.createdAt,
                updatedAt:  data.channelCategoryUserPermission.updatedAt,
                categoryID: data.channelCategoryUserPermission.categoryId,
                userID:     data.channelCategoryUserPermission.userId,
                guildID:    data.serverId
            });
    }

    async channelCategoryUserPermissionDeleted(data: GatewayEvent_ChannelCategoryUserPermissionCreated): Promise<void> {
        this.client.emit(
            "channelCategoryUserPermissionDeleted",
            {
                permission: (data.channelCategoryUserPermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelCategoryUserPermission.createdAt,
                updatedAt:  data.channelCategoryUserPermission.updatedAt,
                categoryID: data.channelCategoryUserPermission.categoryId,
                userID:     data.channelCategoryUserPermission.userId,
                guildID:    data.serverId
            });
    }
    async channelCategoryUserPermissionUpdated(data: GatewayEvent_ChannelCategoryUserPermissionCreated): Promise<void> {
        this.client.emit(
            "channelCategoryUserPermissionUpdated",
            {
                permission: (data.channelCategoryUserPermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelCategoryUserPermission.createdAt,
                updatedAt:  data.channelCategoryUserPermission.updatedAt,
                categoryID: data.channelCategoryUserPermission.categoryId,
                userID:     data.channelCategoryUserPermission.userId,
                guildID:    data.serverId
            });
    }
    async channelCreate(data: GatewayEvent_ServerChannelCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.channel.id);
        else void this.addGuildChannel(data.serverId, data.channel.id);
        const ChannelComponent = this.client.util.updateChannel(data.channel);
        this.client.emit("channelCreate", ChannelComponent);
    }


    async channelDelete(data: GatewayEvent_ServerChannelDeleted): Promise<void> {
        const guild = this.client.guilds.get(data.serverId);
        const ChannelComponent = this.client.util.updateChannel(data.channel);
        guild?.channels.delete(data.channel.id);
        this.client.emit("channelDelete", ChannelComponent);
    }
    async channelRestore(data: GatewayEvent_ChannelRestored): Promise<void> {
        const ChannelComponent = this.client.util.updateChannel(data.channel);
        this.client.emit("channelRestore", ChannelComponent);
    }
    async channelRolePermissionCreated(data: GatewayEvent_ChannelRolePermissionCreated): Promise<void> {
        this.client.emit(
            "channelRolePermissionCreated",
            {
                permission: (data.channelRolePermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelRolePermission.createdAt,
                updatedAt:  data.channelRolePermission.updatedAt,
                roleID:     data.channelRolePermission.roleId,
                channelID:  data.channelRolePermission.channelId,
                guildID:    data.serverId
            }
        );
    }
    async channelRolePermissionDeleted(data: GatewayEvent_ChannelRolePermissionCreated): Promise<void> {
        this.client.emit(
            "channelRolePermissionDeleted",
            {
                permission: (data.channelRolePermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelRolePermission.createdAt,
                updatedAt:  data.channelRolePermission.updatedAt,
                roleID:     data.channelRolePermission.roleId,
                channelID:  data.channelRolePermission.channelId,
                guildID:    data.serverId
            });
    }
    async channelRolePermissionUpdated(data: GatewayEvent_ChannelRolePermissionCreated): Promise<void> {
        this.client.emit(
            "channelRolePermissionUpdated",
            {
                permission: (data.channelRolePermission.permissions as never as Array<Permissions>),
                createdAt:  data.channelRolePermission.createdAt,
                updatedAt:  data.channelRolePermission.updatedAt,
                roleID:     data.channelRolePermission.roleId,
                channelID:  data.channelRolePermission.channelId,
                guildID:    data.serverId
            });
    }
    async channelUpdate(data: GatewayEvent_ServerChannelUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.channel.id);
        else void this.addGuildChannel(data.serverId, data.channel.id);
        const channel =
          this.client.getChannel<AnyChannel>(data.serverId, data.channel.id);
        const CachedChannel = channel ? channel.toJSON() : null;
        const ChannelComponent = this.client.util.updateChannel(data.channel);
        this.client.emit("channelUpdate", ChannelComponent, CachedChannel);
    }


    async channelUserPermissionCreated(data: GatewayEvent_ChannelUserPermissionCreated): Promise<void> {
        this.client.emit(
            "channelUserPermissionCreated",
            {
                channelID:  data.channelUserPermission.channelId,
                createdAt:  data.channelUserPermission.createdAt,
                updatedAt:  data.channelUserPermission.updatedAt,
                userID:     data.channelUserPermission.userId,
                guildID:    data.serverId,
                permission: data.channelUserPermission as never as Array<Permissions>
            });
    }

    async channelUserPermissionDeleted(data: GatewayEvent_ChannelUserPermissionDeleted): Promise<void> {
        this.client.emit(
            "channelUserPermissionDeleted",
            {
                channelID:  data.channelUserPermission.channelId,
                createdAt:  data.channelUserPermission.createdAt,
                updatedAt:  data.channelUserPermission.updatedAt,
                userID:     data.channelUserPermission.userId,
                guildID:    data.serverId,
                permission: data.channelUserPermission as never as Array<Permissions>
            });
    }
    async channelUserPermissionUpdated(data: GatewayEvent_ChannelUserPermissionUpdated): Promise<void> {
        this.client.emit(
            "channelUserPermissionUpdated",
            {
                channelID:  data.channelUserPermission.channelId,
                createdAt:  data.channelUserPermission.createdAt,
                updatedAt:  data.channelUserPermission.updatedAt,
                userID:     data.channelUserPermission.userId,
                guildID:    data.serverId,
                permission: data.channelUserPermission as never as Array<Permissions>
            });
    }
}
