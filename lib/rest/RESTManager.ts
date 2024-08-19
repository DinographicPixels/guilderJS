/** @module RESTManager */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { RequestHandler } from "./RequestHandler";
import type { Client } from "../structures/Client";
import type { RequestOptions, RESTOptions } from "../types";
import { Guilds } from "../routes/Guilds";
import { Channels } from "../routes/Channels";
import { Miscellaneous } from "../routes/Misc";
import { Webhooks } from "../routes/Webhooks";

export class RESTManager {
    /** Channel routes */
    channels: Channels;
    /** Client */
    client: Client;
    /** Guild routes. */
    guilds: Guilds;
    /** Request Handler */
    handler: RequestHandler;
    /** Misc routes */
    misc: Miscellaneous;
    /** Client Token */
    token: Client["ws"]["token"];
    /** Webhook routes */
    webhooks: Webhooks;
    /** Websocket Manager */
    #ws: Client["ws"];
    constructor(client: Client, options?: RESTOptions){
        this.#ws = client.ws;
        this.client = client;
        this.token = this.#ws.token;
        this.handler = new RequestHandler(this, options);
        this.guilds = new Guilds(this);
        this.channels = new Channels(this);
        this.webhooks = new Webhooks(this);
        this.misc = new Miscellaneous(this);
    }

    /** Send an authenticated request.
     * @param options Request options.
     */
    async authRequest<T = unknown>(options: Omit<RequestOptions, "auth">): Promise<T> {
        return this.handler.authRequest<T>(options);
    }

    /** Send a request.
     * @param options Request options.
     */
    async request<T = unknown>(options: RequestOptions): Promise<T> {
        return this.handler.request<T>(options);
    }
}
