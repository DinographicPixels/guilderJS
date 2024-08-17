/** @module Subscription */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { Base } from "./Base";
import type { JSONSubscription, RawSubscription } from "../types";

/** Represents a Guild Subscription. */
export class Subscription extends Base<string> {
    /** Type of the subscription */
    type: string;
    /** ID of the guild */
    guildID: string;
    /** Description of the subscription (optional) */
    description: string | null;
    /** ID of the role associated with the subscription (optional) */
    roleID: number | null;
    /** Cost of the subscription */
    cost: number;
    /** The ISO 8601 timestamp that the subscription was created at */
    createdAt: Date;

    constructor(data: RawSubscription, client: Client) {
        super(data.serverId, client);
        this.type = data.type;
        this.guildID = data.serverId;
        this.description = (data.description === "" ? null : data.description) ?? null;
        this.roleID = data.roleId ?? null;
        this.cost = data.cost;
        this.createdAt = new Date(data.createdAt);
        this.update(data);
    }

    override toJSON(): JSONSubscription {
        return {
            ...super.toJSON(),
            type:        this.type,
            guildID:     this.guildID,
            description: this.description,
            roleID:      this.roleID,
            cost:        this.cost,
            createdAt:   this.createdAt
        };
    }

    protected override update(data: RawSubscription): void {
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.type !== undefined) {
            this.type = data.type;
        }
        if (data.description !== undefined) {
            this.description = data.description === "" ? null : data.description;
        }
        if (data.roleId !== undefined) {
            this.roleID = data.roleId;
        }
        if (data.cost !== undefined) {
            this.cost = data.cost;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
    }
}
