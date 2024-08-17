/** @module Types/Misc */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { type PathsServersServerIdMembersUserIdSocialLinksSocialLinkTypeGetParametersPathSocialLinkType as APISocialLinkType } from "guildedapi-types.ts/typings/schemas/v1";

export type SocialLinkType = APISocialLinkType | `${APISocialLinkType}`;
