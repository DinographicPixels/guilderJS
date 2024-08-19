/** @module User */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { Base } from "./Base";
import type { UserTypes } from "../Constants";
import type { JSONUser, RawMember, RawPartialUser, RawUser } from "../types";

/** Represents a user. */
export class User extends Base<string> {
    /** If true, the user is an app (aka: bot). */
    app: boolean;
    /** Current avatar url of the user. */
    avatarURL: string | null;
    /** Current banned url of the user. */
    bannerURL: string | null;
    /** When the user account was created. */
    createdAt: Date;
    /** User type */
    type: UserTypes | null;
    /** User's username. */
    username: string;

    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: RawUser, client: Client) {
        super(data.id, client);
        this.type = data.type === "bot" ? "app" : (data.type === "user" ? "user" : null);
        this.username = data.name;
        this.createdAt = new Date(data.createdAt);
        this.avatarURL = data.avatar ?? null;
        this.bannerURL = data.banner ?? null;

        if (!this.type) this.type = "user"; // as it is undefined when the user is an app.
        this.app = this.type === "app";

        this.update(data);
    }

    protected override update(
        d: RawUser
        | RawMember
        | RawPartialUser
    ): void {
        const data = d as RawUser;
        if (data.avatar !== undefined) {
            this.avatarURL = data.avatar ?? null;
        }
        if (data.banner !== undefined) {
            this.bannerURL = data.banner ?? null;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.name !== undefined) {
            this.username = data.name;
        }
        if (data.type !== undefined) {
            this.type = data.type === "bot" ? "app" : (data.type === "user" ? "user" : null);
            this.app = this.type === "app";
        }
    }

    override toJSON(): JSONUser {
        return {
            ...super.toJSON(),
            type:      this.type,
            username:  this.username,
            createdAt: this.createdAt,
            avatarURL: this.avatarURL,
            bannerURL: this.bannerURL,
            app:       this.app
        };
    }

}
