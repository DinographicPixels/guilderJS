/** @module WebhookHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { Webhook } from "../../structures/Webhook";
import { GatewayEvent_ServerWebhookCreated, GatewayEvent_ServerWebhookUpdated } from "../../Constants";

/** Internal component, emitting webhook events. */
export class WebhookHandler extends GatewayEventHandler{
    webhooksCreate(data: GatewayEvent_ServerWebhookCreated): void {
        const WebhookComponent = new Webhook(data.webhook, this.client);
        this.client.emit("webhooksCreate", WebhookComponent);
    }

    webhooksUpdate(data: GatewayEvent_ServerWebhookUpdated): void {
        const WebhookComponent = new Webhook(data.webhook, this.client);
        this.client.emit("webhooksUpdate", WebhookComponent);
    }
}
