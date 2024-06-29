/** @module GuildRole */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Base } from "./Base";
import { Client } from "./Client";
import { JSONGuildRole } from "../types/json";
import { APIGuildRole, PATCHGuildRoleUpdateBody, Permissions } from "guildedapi-types.ts/v1";

/** Class representing a guild role. */
export class GuildRole extends Base<number> {
    /** ID of the guild */
    guildID: string;
    /** Date of when the role was created. */
    createdAt: Date;
    /** Date of when role was last edited. */
    editedTimestamp: Date | null;
    /** The role's name */
    name: string;
    /** If set, the role will be displayed separately in the channel member */
    isDisplayedSeparately: boolean;
    /** If set, this roll will be self-assigned*/
    isSelfAssignable: boolean;
    /** If set, this role can be mentioned */
    isMentionable: boolean;
    /** Array of permission (Permissions enum) */
    permissions: Array<Permissions>;
    /** An array of integer values corresponding to the decimal RGB representation for a color.
     * The first color is solid, and a second color indicates a gradient (min items 0; max items 2) */
    colors: Array<number> | null;
    /** The URL of the role icon */
    iconURL: string | null;
    /** The position the role will be in relation to the roles in the server */
    position: number;
    /** The default role users are given when joining the server.
     * Base roles are tied directly to the server and cannot be created or deleted */
    isBase: boolean;
    /** The bot user ID this role has been defined for.
     * Roles with this populated can only be deleted by kicking the bot */
    botUserID: string | null;
    constructor(data: APIGuildRole, client: Client) {
        super(data.id, client);
        this.guildID = data.serverId;
        this.createdAt = new Date(data.createdAt);
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.name = data.name;
        this.isDisplayedSeparately = data.isDisplayedSeparately ?? false;
        this.isSelfAssignable = data.isSelfAssignable ?? false;
        this.isMentionable = data.isMentionable ?? false;
        this.permissions = data.permissions;
        this.colors = data.colors ?? null;
        this.iconURL = data.icon ?? null;
        this.position = data.priority;
        this.isBase = data.isBase ?? false;
        this.botUserID = data.botUserId ?? null;
        this.update(data);
    }

    override toJSON(): JSONGuildRole {
        return {
            ...super.toJSON(),
            guildID:               this.guildID,
            createdAt:             this.createdAt,
            editedTimestamp:       this.editedTimestamp,
            name:                  this.name,
            isDisplayedSeparately: this.isDisplayedSeparately,
            isSelfAssignable:      this.isSelfAssignable,
            isMentionable:         this.isMentionable,
            permissions:           this.permissions,
            colors:                this.colors,
            iconURL:               this.iconURL,
            position:              this.position,
            isBase:                this.isBase,
            botUserID:             this.botUserID
        };
    }

    protected override update(data: APIGuildRole): void {
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.updatedAt !== undefined) {
            this.editedTimestamp = new Date(data.updatedAt);
        }
        if (data.name !== undefined) {
            this.name = data.name;
        }
        if (data.isDisplayedSeparately !== undefined) {
            this.isDisplayedSeparately = data.isDisplayedSeparately;
        }
        if (data.isSelfAssignable !== undefined) {
            this.isSelfAssignable = data.isSelfAssignable;
        }
        if (data.isMentionable !== undefined) {
            this.isMentionable = data.isMentionable;
        }
        if (data.permissions !== undefined) {
            this.permissions = data.permissions;
        }
        if (data.colors !== undefined) {
            this.colors = data.colors;
        }
        if (data.icon !== undefined) {
            this.iconURL = data.icon;
        }
        if (data.priority !== undefined) {
            this.position = data.priority;
        }
        if (data.isBase !== undefined) {
            this.isBase = data.isBase;
        }
    }

    /** Edit the role permission */
    async editPermission(options: PATCHGuildRoleUpdateBody): Promise<GuildRole>{
        return this.client.rest.guilds.editRolePermission(
            this.guildID as string,
            this.id as number,
            options
        );
    }
}
