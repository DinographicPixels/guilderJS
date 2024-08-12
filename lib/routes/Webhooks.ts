/** @module Routes/Webhooks */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RESTManager } from "../rest/RESTManager";
import { Webhook } from "../structures/Webhook";
import { GETGuildWebhookResponse, GETGuildWebhooksResponse, POSTGuildWebhookResponse, PUTGuildWebhookResponse } from "../Constants";
import * as endpoints from "../rest/endpoints";
import { EditWebhookOptions, WebhookExecuteOptions, WebhookMessageDetails } from "../types";
import { POSTExecuteWebhookResponse } from "guildedapi-types.ts/typings/REST/v1/Webhooks";

/** Webhook routes. */
export class Webhooks {
    #manager: RESTManager;
    /**
     * @param manager REST Manager needed to execute request.
     */
    constructor(manager: RESTManager){
        this.#manager = manager;
    }

    /** Create a webhook
     * @param guildID ID of a guild.
     * @param channelID ID of a channel.
     * @param name Name of the new webhook.
     */
    async create(guildID: string, channelID: string, name: string): Promise<Webhook> {
        if (!guildID) throw new Error("You need to insert the guild id, guildID is not defined.");
        if (!channelID) throw new Error("You need to insert a webhook name.");
        if (!channelID) throw new Error("You need to insert a channelID.");
        return this.#manager.authRequest<POSTGuildWebhookResponse>({
            method: "POST",
            path:   endpoints.GUILD_WEBHOOKS(guildID),
            json:   { name, channelId: channelID }
        }).then(data => new Webhook(data.webhook, this.#manager.client));
    }

    /** Delete a webhook
     * @param guildID ID of a guild.
     * @param webhookID ID of an existent webhook.
     */
    async delete(guildID: string, webhookID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.GUILD_WEBHOOK(guildID, webhookID)
        });
    }
    /** Update a webhook
     * @param guildID ID of a guild.
     * @param webhookID ID of an existent webhook.
     * @param options Edit options.
     */
    async edit(guildID: string, webhookID: string, options: EditWebhookOptions): Promise<Webhook> {
        if (typeof options !== "object") throw new Error("webhook options must be an object.");
        return this.#manager.authRequest<PUTGuildWebhookResponse>({
            method: "PUT",
            path:   endpoints.GUILD_WEBHOOK(guildID, webhookID),
            json:   {
                name:      options.name,
                channelId: options.channelID
            }
        }).then(data => new Webhook(data.webhook, this.#manager.client));
    }


    /**
     * Execute a webhook.
     * @param webhookID ID of the webhook to execute.
     * @param token Token of the webhook, needed to execute it.
     * @param options Execute Options.
     */
    async execute(
        webhookID: string,
        token: string,
        options: WebhookExecuteOptions
    ): Promise<WebhookMessageDetails> {
        return this.#manager.request<POSTExecuteWebhookResponse>({
            method: "POST",
            route:  "https://media.guilded.gg",
            path:   `webhooks/${webhookID}/${token}`,
            json:   {
                content:    options.content,
                username:   options.username,
                avatar_url: options.avatarURL,
                embeds:     options.embeds
            }
        }).then(data =>
            ({
                id:             data?.id,
                channelID:      data?.channelId,
                webhookProfile: data?.content?.document?.data?.profile,
                type:           data?.type,
                createdBy:      data?.createdBy,
                createdAt:      data?.createdAt,
                webhookID:      data?.webhookId
            }));
    }
    /** This method is used to get a specific webhook.
     * @param guildID ID of a guild.
     * @param webhookID ID of a webhook.
     */
    async get(guildID: string, webhookID: string): Promise<Webhook>{
        return this.#manager.authRequest<GETGuildWebhookResponse>({
            method: "GET",
            path:   endpoints.GUILD_WEBHOOK(guildID, webhookID)
        }).then(data => new Webhook(data.webhook, this.#manager.client));
    }

    /** This method is used to get a list of Webhook.
     * @param guildID ID of a guild.
     * @param channelID ID of a channel.
     */
    async getWebhooks(guildID: string, channelID: string): Promise<Array<Webhook>>{
        const query = new URLSearchParams();
        if (channelID){
            query.set("channelId", channelID.toString());
        }
        return this.#manager.authRequest<GETGuildWebhooksResponse>({
            method: "GET",
            path:   endpoints.GUILD_WEBHOOKS(guildID),
            query
        }).then(data =>
            data.webhooks.map(d =>
                new Webhook(d, this.#manager.client)) as never
        );
    }


}
