/** @module GatewayEventHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "../../structures/Client";

/** Internal component, base of every event handlers. */
export abstract class GatewayEventHandler {
    constructor(readonly client: Client) {}
}
