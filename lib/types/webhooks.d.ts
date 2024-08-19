/** @module Types/Webhooks */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Embed } from "./channels";

export interface WebhookEditOptions {
    /** New webhook's parent channel. */
    channelID?: string;
    /** New name of the webhook. */
    name: string;
}

export interface EditWebhookOptions {
    /** The ID of the channel */
    channelID?: string;
    /** The name of the webhook (min length `1`; max length `128`) */
    name: string;
}

export interface WebhookExecuteOptions {
    avatarURL?: string;
    content?: string;
    embeds?: Array<Embed>;
    username?: string;
}

export interface WebhookMessageDetails {
    channelID: string;
    createdAt: string;
    createdBy: string;
    id: string;
    type: string;
    webhookID: string;
    webhookProfile: {
        name: string;
        profilePicture: string;
    };
}
