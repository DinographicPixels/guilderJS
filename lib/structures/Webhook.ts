/** @module Webhook */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";
import { Base } from "./Base";
import { APIWebhook } from "../Constants";
import { WebhookEditOptions } from "../types/webhook";
import { JSONWebhook } from "../types/json";
import { WebhookExecuteOptions, WebhookMessageDetails } from "../types/webhooks";

/** Represents a Guild or channel webhook. */
export class Webhook extends Base<string> {
    /** ID of the guild, where the webhook comes from. */
    guildID: string;
    /** ID of the channel, where the webhook comes from. */
    channelID: string;
    /** Username of the webhook. */
    username: string;
    /** When the webhook was created. */
    createdAt: Date;
    /** ID of the webhook's owner. */
    ownerID: string;
    /** When the webhook was deleted. */
    deletedAt: Date | null;
    /** Token of the webhook. */
    token: string | null;

    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: APIWebhook, client: Client){
        super(data.id, client);
        this.guildID = data.serverId;
        this.channelID = data.channelId;
        this.username = data.name;
        this.createdAt = new Date(data.createdAt);
        this.deletedAt = data.deletedAt ? new Date(data.deletedAt) : null;
        this.ownerID = data.createdBy;
        this.token = data.token ?? null;
        this.update(data);
    }

    override toJSON(): JSONWebhook {
        return {
            ...super.toJSON(),
            guildID:   this.guildID,
            channelID: this.channelID,
            username:  this.username,
            createdAt: this.createdAt,
            deletedAt: this.deletedAt,
            ownerID:   this.ownerID,
            token:     this.token
        };
    }

    protected override update(data: APIWebhook): void {
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.ownerID = data.createdBy;
        }
        if (data.deletedAt !== undefined) {
            this.deletedAt = new Date(data.deletedAt);
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.name !== undefined) {
            this.username = data.name;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.token !== undefined) {
            this.token = data.token;
        }
    }

    /** Request Webhook Token if not provided.
     * @note This method sets this Webhook's token property as well as returning its token.
     */
    async requestToken(): Promise<string> {
        const webhook = await this.client.rest.guilds.getWebhook(this.guildID, this.id);
        if (webhook.token) return this.token = webhook.token;
        throw new Error("Guilded did not provide a token for this webhook.");
    }

    /**
     * Execute this Webhook.
     * @param options Execute Options.
     */
    async execute(
        options: WebhookExecuteOptions
    ): Promise<WebhookMessageDetails> {
        if (!this.token)
            throw new Error(
                "Token has not been provided by Guilded, " +
              "request it using Webhook#requestToken."
            );
        return this.client.rest.guilds.executeWebhook(
            this.id,
            this.token,
            options
        );
    }

    /** Update the webhook.
     * @param options Edit Options.
     */
    async edit(options: WebhookEditOptions): Promise<Webhook>{
        return this.client.rest.guilds.editWebhook(
            this.guildID,
            this.id,
            options
        );
    }

    /** Delete the webhook. */
    async delete(): Promise<void>{
        return this.client.rest.guilds.deleteWebhook(
            this.guildID,
            this.id
        );
    }
}
