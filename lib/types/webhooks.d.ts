
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

export interface EditWebhookOptions {
    /** The name of the webhook (min length `1`; max length `128`) */
    name: string;
    /** The ID of the channel */
    channelId?: string;
}
