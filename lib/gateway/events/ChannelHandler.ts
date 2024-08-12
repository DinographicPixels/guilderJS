/** @module ChannelHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import {
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
import { AnyChannel } from "../../types";

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
        const ChannelComponent = data.channelCategoryRolePermission;
        this.client.emit("channelCategoryRolePermissionCreated", ChannelComponent);
    }
    async channelCategoryRolePermissionDeleted(data: GatewayEvent_ChannelCategoryRolePermissionCreated): Promise<void> {
        const ChannelComponent = data.channelCategoryRolePermission;
        this.client.emit("channelCategoryRolePermissionDeleted", ChannelComponent);
    }
    async channelCategoryRolePermissionUpdated(data: GatewayEvent_ChannelCategoryRolePermissionCreated): Promise<void> {
        const ChannelComponent = data.channelCategoryRolePermission;
        this.client.emit("channelCategoryRolePermissionUpdated", ChannelComponent);
    }
    async channelCategoryUserPermissionCreated(data: GatewayEvent_ChannelCategoryUserPermissionCreated): Promise<void> {
        const ChannelComponent = data.channelCategoryUserPermission;
        this.client.emit("channelCategoryUserPermissionCreated", ChannelComponent);
    }

    async channelCategoryUserPermissionDeleted(data: GatewayEvent_ChannelCategoryUserPermissionCreated): Promise<void> {
        const ChannelComponent = data.channelCategoryUserPermission;
        this.client.emit("channelCategoryUserPermissionDeleted", ChannelComponent);
    }
    async channelCategoryUserPermissionUpdated(data: GatewayEvent_ChannelCategoryUserPermissionCreated): Promise<void> {
        const ChannelComponent = data.channelCategoryUserPermission;
        this.client.emit("channelCategoryUserPermissionUpdated", ChannelComponent);
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
        const ChannelComponent = data.channelRolePermission;
        this.client.emit("channelRolePermissionCreated", ChannelComponent);
    }
    async channelRolePermissionDeleted(data: GatewayEvent_ChannelRolePermissionCreated): Promise<void> {
        const ChannelComponent = data.channelRolePermission;
        this.client.emit("channelRolePermissionDeleted", ChannelComponent);
    }
    async channelRolePermissionUpdated(data: GatewayEvent_ChannelRolePermissionCreated): Promise<void> {
        const ChannelComponent = data.channelRolePermission;
        this.client.emit("channelRolePermissionUpdated", ChannelComponent);
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
        const ChannelComponent = data.channelUserPermission;
        this.client.emit("channelUserPermissionCreated", ChannelComponent);
    }

    async channelUserPermissionDeleted(data: GatewayEvent_ChannelUserPermissionDeleted): Promise<void> {
        const ChannelComponent = data.channelUserPermission;
        this.client.emit("channelUserPermissionDeleted", ChannelComponent);
    }
    async channelUserPermissionUpdated(data: GatewayEvent_ChannelUserPermissionUpdated): Promise<void> {
        const ChannelComponent = data.channelUserPermission;
        this.client.emit("channelUserPermissionUpdated", ChannelComponent);
    }
}
