/** @module WebhookHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { Webhook } from "../../structures/Webhook";
import { type GatewayEvent_ServerWebhookCreated, type GatewayEvent_ServerWebhookUpdated, GatewayLayerIntent } from "../../Constants";

/** Internal component, emitting webhook events. */
export class WebhookHandler extends GatewayEventHandler{
    webhooksCreate(data: GatewayEvent_ServerWebhookCreated): void {
        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.GUILD_WEBHOOKS])) return;
        const WebhookComponent = new Webhook(data.webhook, this.client);
        this.client.emit("webhooksCreate", WebhookComponent);
    }

    webhooksUpdate(data: GatewayEvent_ServerWebhookUpdated): void {
        if (!this.client.util.isIntentEnabled([GatewayLayerIntent.GUILD_WEBHOOKS])) return;
        const WebhookComponent = new Webhook(data.webhook, this.client);
        this.client.emit("webhooksUpdate", WebhookComponent);
    }
}
