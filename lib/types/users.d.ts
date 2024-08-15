/** @module Types/Users */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { APIBotUser, APIUser } from "guildedapi-types.ts/v1";
import type { APISocialLink } from "guildedapi-types.ts/typings/payloads/v1/Users";

export type RawUser = APIUser;
export type RawAppUser = APIBotUser;
export type RawSocialLink = APISocialLink;
