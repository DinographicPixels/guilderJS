/** @module Types/Gateway */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RawAppUser } from "./users";
import type { GatewayOPCodes } from "../Constants";

export type AnyPacket = RawPacket | WelcomePacket;

export interface RawPacket {
    d: object | null;
    op: GatewayOPCodes;
    s: string | null;
    t: string | null;
}

export interface WelcomePacket {
    d: RawAppUser;
    op: GatewayOPCodes;
    s: string | null;
    t: string | null;
}

