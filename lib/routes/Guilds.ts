/** @module Routes/Guilds */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RESTManager } from "../rest/RESTManager";
import * as endpoints from "../rest/endpoints";
import type { Guild } from "../structures/Guild";
import type { Member } from "../structures/Member";
import { Channel } from "../structures/Channel";
import type {
    APIChannelCategories,
    DELETEDeleteCategoryResponse,
    GETChannelCategoryRoleManyPermissionResponse,
    GETChannelCategoryRolePermissionResponse,
    GETChannelCategoryUserManyPermissionResponse,
    GETChannelCategoryUserPermissionResponse,
    GETGuildBanResponse,
    GETGuildBansResponse,
    GETGuildGroupResponse,
    GETGuildGroupsResponse,
    GETGuildMemberPermissionResponse,
    GETGuildMemberResponse,
    GETGuildMembersResponse,
    GETGuildResponse,
    GETGuildRoleResponse,
    GETGuildRolesResponse,
    GETGuildSubscriptionResponse,
    GETGuildSubscriptionsResponse,
    GETReadCategoryResponse,
    PATCHChannelCategoryRolePermissionResponse,
    PATCHChannelCategoryUserPermissionBody,
    PATCHChannelCategoryUserPermissionResponse,
    PATCHGuildGroupBody,
    PATCHGuildGroupResponse,
    PATCHGuildRoleBody,
    PATCHGuildRolePermissionUpdateBody,
    PATCHGuildRolePermissionUpdateResponse,
    PATCHUpdateCategoryBody,
    PATCHUpdateCategoryResponse,
    Permissions,
    POSTBulkAwardXPResponse,
    POSTChannelCategoryRolePermissionResponse,
    POSTChannelCategoryUserPermissionBody,
    POSTChannelCategoryUserPermissionResponse,
    POSTChannelResponse,
    POSTCreateCategoryBody,
    POSTCreateCategoryResponse,
    POSTGuildBanResponse,
    POSTGuildGroupBody,
    POSTGuildGroupResponse,
    POSTAwardGuildMemberXPResponse,
    POSTGuildRoleBody,
    POSTGuildRoleResponse,
    PUTBulkSetXPResponse,
    PUTAwardGuildMemberXPResponse
} from "../Constants";
import type {
    AnyChannel,
    CreateChannelOptions,
    BulkXPOptions,
    EditMemberOptions,
    RawMember
} from "../types";
import { BannedMember } from "../structures/BannedMember";
import type { Role } from "../structures/Role";
import type { Group } from "../structures/Group";
import type { Subscription } from "../structures/Subscription";
import type { Category } from "../structures/Category";
import { Permission } from "../structures/Permission";
import type { GETGuildMemberRolesResponse } from "guildedapi-types.ts/v1";

export class Guilds {
    #manager: RESTManager;
    constructor(manager: RESTManager){
        this.#manager = manager;
    }

    /** Award a member using the built-in EXP system.
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param amount Amount of experience.
     */
    async awardMember(guildID: string, memberID: string, amount: number): Promise<number>{
        if (typeof amount !== "number") // check for JS
            throw new TypeError("amount must be an integer/number.");
        return this.#manager.authRequest<POSTAwardGuildMemberXPResponse>({
            method: "POST",
            path:   endpoints.GUILD_MEMBER_XP(guildID, memberID),
            json:   { amount }
        }).then(data => Number(data.total));
    }
    /** Award every member of a guild having a role using the built-in EXP system.
     * @param guildID ID of a guild.
     * @param roleID ID of a role.
     * @param amount Amount of experience.
     */
    async awardRole(guildID: string, roleID: number, amount: number): Promise<void>{
        if (typeof amount !== "number") // check for JS
            throw new TypeError("amount must be an integer/number.");
        return this.#manager.authRequest<void>({
            method: "POST",
            path:   endpoints.GUILD_MEMBER_ROLE_XP(guildID, roleID),
            json:   { amount }
        });
    }
    /**
     * Bulk Award XP Members
     * @param guildID ID of the guild
     * @param options Members to award XP
     */
    async bulkAwardXP(guildID: string, options: BulkXPOptions): Promise<POSTBulkAwardXPResponse> {
        return this.#manager.authRequest<POSTBulkAwardXPResponse>({
            method: "POST",
            path:   endpoints.GUILD_MEMBER_BULK_XP(guildID),
            json:   options
        }).then(data => data);
    }
    /**
     * Bulk set XP Members
     * @param guildID ID of the guild
     * @param options Members to set XP
     */
    async bulkSetXP(guildID: string, options: BulkXPOptions): Promise<PUTBulkSetXPResponse> {
        return this.#manager.authRequest<PUTBulkSetXPResponse>({
            method: "PUT",
            path:   endpoints.GUILD_MEMBER_BULK_XP(guildID),
            json:   options
        }).then(data => data);
    }
    /** Ban a guild member.
     * @param guildID ID of the guild the member is in.
     * @param memberID ID of the member to ban.
     * @param reason The reason of the ban.
     */
    async createBan(guildID: string, memberID: string, reason?: string): Promise<BannedMember> {
        return this.#manager.authRequest<POSTGuildBanResponse>({
            method: "POST",
            path:   endpoints.GUILD_BAN(guildID, memberID),
            json:   { reason }
        }).then(data =>
            new BannedMember(guildID, data.serverMemberBan, this.#manager.client)
        );
    }


    /**
     * Create a guild category.
     * @param guildID ID of the guild to create a category in.
     * @param options Options to create a category.
     */
    async createCategory(guildID: string, options: POSTCreateCategoryBody): Promise<Category> {
        return this.#manager.authRequest<POSTCreateCategoryResponse>({
            method: "POST",
            path:   endpoints.GUILD_CATEGORY_CREATE(guildID),
            json:   options
        }).then(data => this.#manager.client.util.updateGuildCategory(data.category));
    }
    /**
     * Create a channel category permission assigned to a user or role.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category
     * @param targetID ID of the user (string) or role (number) to assign the permission to
     * @param options Permission options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async createCategoryPermission(
        guildID: string,
        categoryID: number,
        targetID: string | number,
        options: POSTChannelCategoryUserPermissionBody
    ): Promise<Permission> {
        return typeof targetID === "string"
            ? this.#manager.authRequest<POSTChannelCategoryUserPermissionResponse>({
                method: "POST",
                path:   endpoints.GUILD_CATEGORY_USER_PERMISSION(guildID, categoryID, targetID),
                json:   options
            }).then(data => new Permission(data.channelCategoryUserPermission))
            : this.#manager.authRequest<POSTChannelCategoryRolePermissionResponse>({
                method: "POST",
                path:   endpoints.GUILD_CATEGORY_ROLE_PERMISSION(guildID, categoryID, targetID),
                json:   options
            }).then(data => new Permission(data.channelCategoryRolePermission));
    }
    /** Create a channel in a specified guild.
     * @param guildID ID of a guild.
     * @param name Name of the new channel.
     * @param type Type of the new channel. (e.g: chat)
     * @param options New channel's additional options.
     */
    async createChannel<T extends AnyChannel = AnyChannel>(
        guildID: string,
        name: string,
        type: APIChannelCategories,
        options?: CreateChannelOptions
    ): Promise<T> {
        if (!guildID) throw new Error("guildID is a required parameter.");
        if (!name) throw new Error("name parameter is a required parameter.");
        if (!type) type = "chat" as APIChannelCategories;
        if (options?.categoryID && options?.groupID)
            throw new Error(
                "Only one channel location is needed," +
              " two are defined at the same time. [categoryID, groupID]"
            );
        return this.#manager.authRequest<POSTChannelResponse>({
            method: "POST",
            path:   endpoints.CHANNELS(),
            json:   {
                name,
                topic:      options?.description,
                isPublic:   options?.isPublic,
                type,
                serverId:   guildID,
                groupId:    options?.groupID,
                categoryId: options?.categoryID
            }
        }).then(data => Channel.from<T>(data.channel, this.#manager.client));
    }
    /**
     * Create a guild group.
     * @param guildID The ID of the guild to create a group in.
     * @param options Create options
     */
    async createGroup(guildID: string, options: POSTGuildGroupBody): Promise<Group> {
        return this.#manager.authRequest<POSTGuildGroupResponse>({
            method: "POST",
            path:   endpoints.GUILD_GROUPS(guildID),
            json:   options
        }).then(data => this.#manager.client.util.updateGuildGroup(data.group));
    }
    /**
     * Create a guild role.
     * @param guildID ID of the server you want to create the role in.
     * @param options Create options
     */
    async createRole(guildID: string, options: POSTGuildRoleBody): Promise<Role> {
        return this.#manager.authRequest<POSTGuildRoleResponse>({
            method: "POST",
            path:   endpoints.GUILD_ROLES(guildID),
            json:   options
        }).then(data => this.#manager.client.util.updateRole(data.role));
    }
    /**
     * Delete a guild category.
     * @param guildID ID of the guild to create a category in.
     * @param categoryID ID of the category you want to read.
     */
    async deleteCategory(guildID: string, categoryID: number): Promise<Category> {
        return this.#manager.authRequest<DELETEDeleteCategoryResponse>({
            method: "DELETE",
            path:   endpoints.GUILD_CATEGORY(guildID, categoryID)
        }).then(data => this.#manager.client.util.updateGuildCategory(data.category));
    }
    /**
     * Delete a category permission.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category
     * @param targetID ID of the user or role to delete the permission from
     */
    async deleteCategoryPermission(
        guildID: string,
        categoryID: number,
        targetID: string | number
    ): Promise<void> {
        return typeof targetID === "string"
            ? this.#manager.authRequest<void>({
                method: "DELETE",
                path:   endpoints.GUILD_CATEGORY_USER_PERMISSION(guildID, categoryID, targetID)
            })
            : this.#manager.authRequest<void>({
                method: "DELETE",
                path:   endpoints.GUILD_CATEGORY_ROLE_PERMISSION(guildID, categoryID, targetID)
            });
    }
    /**
     * Delete a guild group
     * @param guildID ID of the guild where the group is in.
     * @param groupID ID of the group to delete.
     */
    async deleteGroup(guildID: string, groupID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.GUILD_GROUP(guildID, groupID)
        });
    }
    /**
     * Delete a guild role.
     * @param guildID ID of the guild where the role to delete is in
     * @param roleID ID of the role to delete
     */
    async deleteRole(guildID: string, roleID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.GUILD_ROLE(guildID, roleID)
        });
    }
    /**
     * Edit a guild category.
     * @param guildID ID of the guild to create a category in.
     * @param categoryID ID of the category you want to read.
     * @param options Options to update a category.
     */
    async editCategory(guildID: string, categoryID: number, options: PATCHUpdateCategoryBody): Promise<Category> {
        return this.#manager.authRequest<PATCHUpdateCategoryResponse>({
            method: "PATCH",
            path:   endpoints.GUILD_CATEGORY(guildID, categoryID),
            json:   options
        }).then(data => this.#manager.client.util.updateGuildCategory(data.category));
    }
    /**
     * Update a category permission.
     * @param guildID ID of the server the category is in
     * @param categoryID ID of the category
     * @param targetID ID of the user (string) or role (number) to assign the permission to.
     * @param options Edit options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async editCategoryPermission(
        guildID: string,
        categoryID: number,
        targetID: string | number,
        options: PATCHChannelCategoryUserPermissionBody
    ): Promise<Permission> {
        return typeof targetID === "string"
            ? this.#manager.authRequest<PATCHChannelCategoryUserPermissionResponse>({
                method: "PATCH",
                path:   endpoints.GUILD_CATEGORY_USER_PERMISSION(guildID, categoryID, targetID),
                json:   options
            }).then(data => new Permission(data.channelCategoryUserPermission))
            : this.#manager.authRequest<PATCHChannelCategoryRolePermissionResponse>({
                method: "PATCH",
                path:   endpoints.GUILD_CATEGORY_ROLE_PERMISSION(guildID, categoryID, targetID),
                json:   options
            }).then(data => new Permission(data.channelCategoryRolePermission));
    }
    /**
     * Edit a guild group.
     * @param guildID The ID of the guild where the group to edit is in
     * @param groupID The ID of the group to edit.
     * @param options Edit options
     */
    async editGroup(guildID: string, groupID: string, options: PATCHGuildGroupBody): Promise<Group> {
        return this.#manager.authRequest<PATCHGuildGroupResponse>({
            method: "POST",
            path:   endpoints.GUILD_GROUP(guildID, groupID),
            json:   options
        }).then(data => this.#manager.client.util.updateGuildGroup(data.group));
    }
    /** Edit a member.
     * @param guildID ID of the guild the member is in.
     * @param memberID ID of the member to edit.
     * @param options Edit options.
     */
    async editMember(guildID: string, memberID: string, options: EditMemberOptions): Promise<void> {
        if (options.nickname) {
            return this.#manager.authRequest<void>({
                method: "PUT",
                path:   endpoints.MEMBER_NICKNAME(guildID, memberID),
                json:   {
                    nickname: options.nickname
                }
            });
        } else if (!options.nickname) {
            return this.#manager.authRequest<void>({
                method: "DELETE",
                path:   endpoints.MEMBER_NICKNAME(guildID, memberID)
            });
        }
    }


    /**
     * Edit a guild role.
     * @param guildID ID of the server
     * @param roleID ID of the role to edit
     * @param options Edit options
     */
    async editRole(guildID: string, roleID: number, options: PATCHGuildRoleBody): Promise<Role> {
        return this.#manager.authRequest<POSTGuildRoleResponse>({
            method: "PATCH",
            path:   endpoints.GUILD_ROLE(guildID, roleID),
            json:   options
        }).then(data => this.#manager.client.util.updateRole(data.role));
    }
    /**
     * Edit role permission.
     * @param guildID ID of the guild.
     * @param roleID ID of the role.
     * @param options Permission to edit.
     */
    async editRolePermission(guildID: string, roleID: number, options: PATCHGuildRolePermissionUpdateBody): Promise<Role> {
        return this.#manager.authRequest<PATCHGuildRolePermissionUpdateResponse>({
            method: "PATCH",
            path:   endpoints.GUILD_ROLE_UPDATE_PERMISSION(guildID, roleID),
            json:   options
        }).then(data => this.#manager.client.util.updateRole(data.role));
    }
    /** This method is used to get a specific Guild.
     *
     * Note: Guild = Server
     * @param guildID The ID of the guild you'd like to get.
     */
    async get(guildID: string): Promise<Guild> {
        return this.#manager.authRequest<GETGuildResponse>({
            method: "GET",
            path:   endpoints.GUILD(guildID)
        }).then(data => this.#manager.client.util.updateGuild(data.server));
    }
    /** Get a ban.
     * @param guildID ID of the guild.
     * @param memberID ID of the banned member.
     */
    async getBan(guildID: string, memberID: string): Promise<BannedMember> {
        return this.#manager.authRequest<GETGuildBanResponse>({
            method: "GET",
            path:   endpoints.GUILD_BAN(guildID, memberID)
        }).then(data =>
            new BannedMember(
                guildID,
                data.serverMemberBan,
                this.#manager.client
            )
        );
    }


    /** This method is used to get a list of guild ban.
     * @param guildID ID of the guild.
     */
    async getBans(guildID: string): Promise<Array<BannedMember>> {
        return this.#manager.authRequest<GETGuildBansResponse>({
            method: "GET",
            path:   endpoints.GUILD_BANS(guildID)
        }).then(data =>
            data.serverMemberBans.map(d =>
                new BannedMember(
                    guildID,
                    d,
                    this.#manager.client
                )
            )
        );
    }


    /**
     * Read a guild category.
     * @param guildID ID of the guild to create a category in.
     * @param categoryID ID of the category you want to read.
     */
    async getCategory(guildID: string, categoryID: number): Promise<Category> {
        return this.#manager.authRequest<GETReadCategoryResponse>({
            method: "GET",
            path:   endpoints.GUILD_CATEGORY(guildID, categoryID)
        }).then(data => this.#manager.client.util.updateGuildCategory(data.category));
    }
    /**
     * Get permission coming from a category.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category the permission is in
     * @param targetID ID of the user (string) or role (number) to get the permission for
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async getCategoryPermission(guildID: string, categoryID: number, targetID: string | number): Promise<Permission> {
        return typeof targetID === "string"
            ? this.#manager.authRequest<GETChannelCategoryUserPermissionResponse>({
                method: "GET",
                path:   endpoints.GUILD_CATEGORY_USER_PERMISSION(guildID, categoryID, targetID)
            }).then(data => new Permission(data.channelCategoryUserPermission))
            : this.#manager.authRequest<GETChannelCategoryRolePermissionResponse>({
                method: "GET",
                path:   endpoints.GUILD_CATEGORY_ROLE_PERMISSION(guildID, categoryID, targetID)
            }).then(data => new Permission(data.channelCategoryRolePermission));
    }
    /**
     * Get permissions of a category.
     * @param guildID ID of the server the category is in.
     * @param categoryID ID of the category the permissions are in
     */
    async getCategoryPermissions(guildID: string, categoryID: number): Promise<Array<Permission>> {
        const userPromise = this.getCategoryUserPermissions(guildID, categoryID);
        const rolePromise = this.getCategoryRolePermissions(guildID, categoryID);
        return Promise.all([userPromise, rolePromise])
            .then(([userPermissions, rolePermissions]) =>
                userPermissions.concat(rolePermissions))
            .catch(err => {
                throw err;
            });
    }
    /**
     * Get role permissions from a specified category.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category the permissions are in
     */
    async getCategoryRolePermissions(guildID: string, categoryID: number): Promise<Array<Permission>> {
        return this.#manager.authRequest<GETChannelCategoryRoleManyPermissionResponse>({
            method: "GET",
            path:   endpoints.GUILD_CATEGORY_ROLE_PERMISSIONS(guildID, categoryID)
        }).then(data =>
            data.channelCategoryRolePermissions.map(d =>
                new Permission(d)
            )
        );
    }
    /**
     * Get user permissions from a specified category.
     * @param guildID ID of the guild where the channel is in
     * @param categoryID ID of the category the permissions are in
     */
    async getCategoryUserPermissions(guildID: string, categoryID: number): Promise<Array<Permission>> {
        return this.#manager.authRequest<GETChannelCategoryUserManyPermissionResponse>({
            method: "GET",
            path:   endpoints.GUILD_CATEGORY_USER_PERMISSIONS(guildID, categoryID)
        }).then(data =>
            data.channelCategoryUserPermissions.map(d =>
                new Permission(d)
            )
        );
    }
    /**
     * Get a guild group.
     * @param guildID ID of the guild.
     * @param groupID ID of the group to get.
     */
    async getGroup(guildID: string, groupID: string): Promise<Group> {
        return this.#manager.authRequest<GETGuildGroupResponse>({
            method: "GET",
            path:   endpoints.GUILD_GROUP(guildID, groupID)
        }).then(data => this.#manager.client.util.updateGuildGroup(data.group));
    }
    /**
     * Get guild groups.
     * @param guildID ID of the guild.
     */
    async getGroups(guildID: string): Promise<Array<Group>> {
        return this.#manager.authRequest<GETGuildGroupsResponse>({
            method: "GET",
            path:   endpoints.GUILD_GROUPS(guildID)
        }).then(data =>
            data.groups.map(group =>
                this.#manager.client.util.updateGuildGroup(group)
            )
        );
    }


    /** This method is used to get a specific guild member.
     * @param guildID The ID of the Guild.
     * @param memberID The ID of the Guild Member to get.
     */
    async getMember(guildID: string, memberID: string): Promise<Member> {
        return this.#manager.authRequest<GETGuildMemberResponse>({
            method: "GET",
            path:   endpoints.GUILD_MEMBER(guildID, memberID)
        }).then(data =>
            this.#manager.client.util.updateMember(guildID, memberID, data.member)
        );
    }


    /**
     * Get guild member permissions.
     * @param guildID ID of the guild.
     * @param memberID ID of the member.
     */
    async getMemberPermission(guildID: string, memberID: string): Promise<Array<Permissions>> {
        return this.#manager.authRequest<GETGuildMemberPermissionResponse>({
            method: "GET",
            path:   endpoints.GUILD_MEMBER_PERMISSION(guildID, memberID)
        }).then(data => data.permissions as Array<Permissions>);
    }


    /**
     * Get a list of role IDs of a specific member within a guild.
     * @param guildID ID of the guild the member is in.
     * @param memberID ID of the member to get roles from.
     */
    async getMemberRoles(guildID: string, memberID: string): Promise<Array<number>> {
        return this.#manager.authRequest<GETGuildMemberRolesResponse>({
            method: "GET",
            path:   endpoints.GUILD_MEMBER_ROLES(guildID, memberID)
        }).then(data => data.roleIds);
    }


    /** This method is used to get a list of guild member.
     * @param guildID ID of the guild to get members.
     */
    async getMembers(guildID: string): Promise<Array<Member>> {
        return this.#manager.authRequest<GETGuildMembersResponse>({
            method: "GET",
            path:   endpoints.GUILD_MEMBERS(guildID)
        }).then(data =>
            data.members.map(d =>
                this.#manager.client.util.updateMember(
                    guildID,
                    d.user.id,
                    d as RawMember
                )
            )
        );
    }


    /**
     * Get a guild role.
     * @param guildID ID of the guild where the role is.
     * @param roleID ID of the role to get.
     */
    async getRole(guildID: string, roleID: number): Promise<Role> {
        return this.#manager.authRequest<GETGuildRoleResponse>({
            method: "GET",
            path:   endpoints.GUILD_ROLE(guildID, roleID)
        }).then(data => this.#manager.client.util.updateRole(data.role));
    }


    /**
     * Get every guild roles from a guild.
     * @param guildID ID of the guild where roles are.
     */
    async getRoles(guildID: string): Promise<Array<Role>> {
        return this.#manager.authRequest<GETGuildRolesResponse>({
            method: "GET",
            path:   endpoints.GUILD_ROLES(guildID)
        }).then(data =>
            data.roles.map(role =>
                this.#manager.client.util.updateRole(role)
            )
        );
    }


    /**
     * Get guild subscriptions.
     * @param guildID ID of the guild.
     * @param subscriptionID ID of the subscription to get.
     */
    async getSubscription(guildID: string, subscriptionID: string): Promise<Subscription> {
        return this.#manager.authRequest<GETGuildSubscriptionResponse>({
            method: "GET",
            path:   endpoints.GUILD_SUBSCRIPTION(guildID, subscriptionID)
        }).then(data =>
            this.#manager.client.util.updateGuildSubscription(data.serverSubscriptionTier)
        );
    }
    /**
     * Get guild subscriptions.
     * @param guildID ID of the guild.
     */
    async getSubscriptions(guildID: string): Promise<Array<Subscription>> {
        return this.#manager.authRequest<GETGuildSubscriptionsResponse>({
            method: "GET",
            path:   endpoints.GUILD_SUBSCRIPTIONS(guildID)
        }).then(data =>
            data.serverSubscriptionTiers.map(tiers =>
                this.#manager.client.util.updateGuildSubscription(tiers)
            )
        );
    }
    /** Add a member to a group
     * @param groupID ID of a guild group.
     * @param memberID ID of a member.
     */
    async memberAddGroup(groupID: string, memberID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints.GUILD_GROUP_MEMBER(groupID, memberID)
        });
    }


    /** Add a role to a member
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param roleID ID of a role.
     */
    async memberAddRole(guildID: string, memberID: string, roleID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID)
        });
    }


    /** Remove a member from a group
     * @param groupID ID of a guild group.
     * @param memberID ID of a member.
     */
    async memberRemoveGroup(groupID: string, memberID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.GUILD_GROUP_MEMBER(groupID, memberID)
        });
    }


    /** Remove a role from a member
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param roleID ID of a role.
     */
    async memberRemoveRole(guildID: string, memberID: string, roleID: number): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.GUILD_MEMBER_ROLE(guildID, memberID, roleID)
        });
    }


    /** Unban a guild member.
     * @param guildID ID of the guild the member was in.
     * @param memberID ID of the member to unban.
     */
    async removeBan(guildID: string, memberID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.GUILD_BAN(guildID, memberID)
        });
    }


    /** Remove a member from a guild.
     * @param guildID The ID of the guild the member is in.
     * @param memberID The ID of the member to kick.
     */
    async removeMember(guildID: string, memberID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.GUILD_MEMBER(guildID, memberID)
        });
    }


    /** Set a member's xp using the built-in EXP system.
     * @param guildID ID of a guild.
     * @param memberID ID of a member.
     * @param amount Total amount of experience.
     */
    async setMemberXP(guildID: string, memberID: string, amount: number): Promise<number>{
        if (typeof amount !== "number") // check for JS
            throw new TypeError("amount must be an integer/number.");
        return this.#manager.authRequest<PUTAwardGuildMemberXPResponse>({
            method: "PUT",
            path:   endpoints.GUILD_MEMBER_XP(guildID, memberID),
            json:   { total: amount }
        }).then(data => Number(data.total));
    }
}
