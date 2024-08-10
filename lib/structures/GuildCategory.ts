/** @module GuildCategory */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Base } from "./Base";
import { Permission } from "./Permission";
import { JSONGuildCategory } from "../types/json";
import { PATCHUpdateCategoryBody } from "../Constants";
import { APIGuildCategory, PATCHChannelCategoryUserPermissionBody, POSTChannelCategoryUserPermissionBody } from "guildedapi-types.ts/v1";

/** Class representing a guild group. */
export class GuildCategory extends Base<number> {
    /** Type of the subscription */
    override id: number;
    /** The ID of the server */
    guildID: string;
    /** The ID of the group */
    groupID: string;
    /** Date of the creation of the category.  */
    createdAt: Date;
    /** The date of the last edition of the category. */
    updatedAt: Date | null;
    /** Name of the category (min length 1; max length 100) */
    name: string;

    constructor(data: APIGuildCategory, client: Client) {
        super(data.id, client);
        this.id = data.id;
        this.guildID = data.serverId;
        this.groupID = data.groupId;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : null;
        this.name = data.name;
        this.update(data);
    }

    override toJSON(): JSONGuildCategory {
        return {
            ...super.toJSON(),
            guildID:   this.guildID,
            groupID:   this.groupID,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt ?? null,
            name:      this.name
        };
    }

    protected override update(data: APIGuildCategory): void {
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.groupId !== undefined) {
            this.groupID = data.groupId;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.updatedAt !== undefined) {
            this.updatedAt = new Date(data.updatedAt) ?? null;
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
    }

    /**
     * Update a guild category.
     * @param options Edit options.
     */
    async editCategory(options: PATCHUpdateCategoryBody): Promise<GuildCategory> {
        return this.client.rest.guilds.editCategory(
            this.guildID as string,
            this.id as number,
            options
        );
    }

    /**
     * Delete a guild category.
     */
    async deleteCategory(): Promise<GuildCategory> {
        return this.client.rest.guilds.deleteCategory(this.guildID as string, this.id as number);
    }

    /**
     * Create a channel category permission assigned to a user or role.
     * @param targetID ID of the user (string) or role (number) to assign the permission to
     * @param options Permission options
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async createPermission(
        targetID: string | number,
        options: POSTChannelCategoryUserPermissionBody
    ): Promise<Permission> {
        return this.client.rest.guilds.createCategoryPermission(
            this.guildID,
            this.id,
            targetID,
            options
        );
    }

    /**
     * Update a category permission.
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async editPermission(
        targetID: string | number,
        options: PATCHChannelCategoryUserPermissionBody
    ): Promise<Permission> {
        return this.client.rest.guilds.editCategoryPermission(
            this.guildID,
            this.id,
            targetID,
            options
        );
    }

    /**
     * Get permission coming from a category.
     * @param targetID ID of the user (string) or role (number) to get the permission for
     *
     * Warning: targetID must have the correct type (number=role, string=user).
     */
    async getPermission(targetID: string | number): Promise<Permission> {
        return this.client.rest.guilds.getCategoryPermission(
            this.guildID,
            this.id,
            targetID
        );
    }

    /**
     * Get permissions of a category.
     */
    async getPermissions(): Promise<Array<Permission>> {
        return this.client.rest.guilds.getCategoryPermissions(this.guildID, this.id);
    }

    /**
     * Get user permissions from a specified category.
     */
    async getUserPermissions(): Promise<Array<Permission>> {
        return this.client.rest.guilds.getCategoryUserPermissions(this.guildID, this.id);
    }

    /**
     * Get role permissions from a specified category.
     */
    async getRolePermissions(): Promise<Array<Permission>> {
        return this.client.rest.guilds.getCategoryRolePermissions(this.guildID, this.id);
    }

    /**
     * Delete a category permission.
     * @param targetID ID of the user or role to delete the permission from
     */
    async deletePermission(targetID: string | number): Promise<void> {
        return this.client.rest.guilds.deleteCategoryPermission(
            this.guildID,
            this.id,
            targetID
        );
    }
}
