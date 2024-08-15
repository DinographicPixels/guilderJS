/** @module Types/Webhooks */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Embed } from "./channels";

export interface WebhookEditOptions {
    /** New name of the webhook. */
    name: string;
    /** New webhook's parent channel. */
    channelID?: string;
}

export interface EditWebhookOptions {
    /** The name of the webhook (min length `1`; max length `128`) */
    name: string;
    /** The ID of the channel */
    channelID?: string;
}

export interface WebhookExecuteOptions {
    content?: string;
    username?: string;
    avatarURL?: string;
    embeds?: Array<Embed>;
}

export interface WebhookMessageDetails {
    id: string;
    channelID: string;
    webhookProfile: {
        name: string;
        profilePicture: string;
    };
    type: string;
    createdBy: string;
    createdAt: string;
    webhookID: string;
}
