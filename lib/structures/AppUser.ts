/** @module AppUser */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { User } from "./User";
import type { RawAppUser, JSONAppUser } from "../types";

/** AppUser represents the logged app user. */
export class AppUser extends User {
    /** Client User App ID (aka botID) */
    appID: string;
    /** ID of the app owner. */
    ownerID: string;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: RawAppUser, client: Client) {
        super(data, client);
        this.appID = data.botId;
        this.type = "app";
        this.app = true;
        this.ownerID = data.createdBy;
        this.update(data);
    }

    override toJSON(): JSONAppUser {
        return {
            ...super.toJSON(),
            appID:     this.appID,
            createdAt: this.createdAt,
            ownerID:   this.ownerID
        };
    }
}
