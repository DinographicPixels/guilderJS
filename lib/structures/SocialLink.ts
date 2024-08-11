/** @module SocialLink */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";

import { User } from "./User";
import { JSONSocialLink, RawSocialLink } from "../types";
import { SocialLinkType } from "../types/misc";

/** User's social link. */
export class SocialLink {
    /** Client. */
    protected client: Client;
    /** Social media name `¯\_(ツ)_/¯`  */
    type: SocialLinkType;
    /** ID of the user having this social linked to their profile. */
    userID: string;
    /** The handle of the user within the external service */
    handle: string | null;
    /** The unique ID that represents this member's social link within the external service */
    serviceID: string | null;
    /** The date the social link was created at */
    createdAt: Date;

    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: RawSocialLink, client: Client) {
        this.client = client;
        this.type = data.type;
        this.userID = data.userId;
        this.handle = data.handle ?? null;
        this.serviceID = data.serviceId ?? null;
        this.createdAt = new Date(data.createdAt);
        this.update(data);
    }

    toJSON(): JSONSocialLink {
        return {
            type:      this.type,
            userID:    this.userID,
            handle:    this.handle,
            serviceID: this.serviceID,
            createdAt: this.createdAt
        };
    }

    protected update(data: RawSocialLink): void {
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.handle !== undefined) {
            this.handle = data.handle;
        }
        if (data.serviceId !== undefined) {
            this.serviceID = data.serviceId;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.userId !== undefined) {
            this.userID = data.userId;
        }
    }

    /** Retrieve cached user. */
    get user(): User | null {
        return this.client.users.get(this.userID) ?? null;
    }
}
