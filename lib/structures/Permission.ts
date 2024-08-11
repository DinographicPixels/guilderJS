/** @module Permission */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { JSONPermission } from "../types";
import {
    APIGuildCategoryRolePermission,
    APIGuildCategoryUserPermission,
    APIChannelRolePermission,
    APIChannelUserPermission,
    Permissions
} from "guildedapi-types.ts/v1";

/** Class representing a Permission */
export class Permission {
    /** raw data */
    data: APIChannelUserPermission
    | APIChannelRolePermission
    | APIGuildCategoryUserPermission
    | APIGuildCategoryRolePermission;
    /** Date of the creation of the permission */
    createdAt: Date;
    /** Date of the last edition of the permission */
    updatedAt: Date | null;
    /** Permission target */
    target: string;
    /** Permission target ID */
    targetID: string | number | null;
    /** Parent object, where the permission is applied. */
    parentID: string | number | null;

    constructor(
        data: APIChannelUserPermission
        | APIChannelRolePermission
        | APIGuildCategoryUserPermission
        | APIGuildCategoryRolePermission
    ) {
        this.data = data;
        this.createdAt = new Date(data.createdAt);
        this.updatedAt = typeof data.updatedAt === "string" ? new Date(data.updatedAt) : data.updatedAt ?? null;
        this.target = data["userId" as keyof object] ? "user" : (data["roleId" as keyof object] ? "role" : "unknown");
        this.targetID = data["userId" as keyof object] ?? data["roleId" as keyof object] ?? null;
        this.parentID = data["channelId" as keyof object] ?? data["categoryId" as keyof object] ?? null;
        this.update(data);
    }

    has(...permissions: Array<Permissions>): boolean {
        for (const permission of permissions) {
            if (this.data.permissions[permission]) return false;
        }
        return true;
    }

    toJSON(): JSONPermission {
        return this.data.permissions as Record<Permissions, boolean>;
    }

    toString(): string {
        let result = "";
        for (const permission of Object.entries(this.data.permissions)) {
            result += `${permission[0]} : ${permission[1].toString()}\n`;
        }
        return result;
    }

    protected update(
        data: APIChannelUserPermission
        | APIChannelRolePermission
        | APIGuildCategoryUserPermission
        | APIGuildCategoryRolePermission
    ): void {
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.updatedAt !== undefined) {
            this.updatedAt = new Date(data.updatedAt) ?? null;
        }
    }
}
