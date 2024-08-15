/** @module UserHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import type { UserStatus, UserStatusCreate, UserStatusDelete } from "../../types";
import type { GatewayEvent_UserStatusCreated, GatewayEvent_UserStatusDeleted } from "guildedapi-types.ts/v1";

/** Internal component, emitting user events. */
export class UserHandler extends GatewayEventHandler {
    userStatusCreate(data: GatewayEvent_UserStatusCreated): void {
        const userStatus: UserStatus = {
            content: data.userStatus.content ?? null,
            emoteID: data.userStatus.emoteId
        };
        const result: UserStatusCreate = {
            expiresAt: data.expiresAt ?? null,
            userID:    data.userId,
            userStatus
        };
        this.client.emit("userStatusCreate", result);
    }

    userStatusDelete(data: GatewayEvent_UserStatusDeleted): void {
        const userStatus: UserStatus = {
            content: data.userStatus.content ?? null,
            emoteID: data.userStatus.emoteId
        };
        const result: UserStatusDelete = {
            userID: data.userId,
            userStatus
        };
        this.client.emit("userStatusDelete", result);
    }
}
