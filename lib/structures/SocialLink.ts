/** @module SocialLink */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";

import type { User } from "./User";
import type { JSONSocialLink, RawSocialLink } from "../types";
import { type SocialLinkType } from "../Constants";

/** User's social link. */
export class SocialLink {
    /** Client. */
    protected client: Client;
    /** The date the social link was created at */
    createdAt: Date;
    /** The handle of the user within the external service */
    handle: string | null;
    /** The unique ID that represents this member's social link within the external service */
    serviceID: string | null;
    /** Social media name `¯\_(ツ)_/¯`  */
    type: SocialLinkType;
    /** ID of the user having this social linked to their profile. */
    userID: string;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: RawSocialLink, client: Client) {
        this.client = client;
        this.type = data.type as never as SocialLinkType;
        this.userID = data.userId;
        this.handle = data.handle ?? null;
        this.serviceID = data.serviceId ?? null;
        this.createdAt = new Date(data.createdAt);
        this.update(data);
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
            this.type = data.type as never as SocialLinkType;
        }
        if (data.userId !== undefined) {
            this.userID = data.userId;
        }
    }

    /** Retrieve cached user. */
    get user(): User | null {
        return this.client.users.get(this.userID) ?? null;
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
}
