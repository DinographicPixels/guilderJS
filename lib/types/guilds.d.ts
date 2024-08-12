
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type {
    APIGuild,
    APIGuildCategory,
    APIGuildGroup,
    APIGuildMember,
    APIGuildMemberBan,
    APIGuildRole,
    APIGuildSubscription,
    APIUserSummary
} from "guildedapi-types.ts/v1";

import { APIGuildMemberSummary } from "guildedapi-types.ts/typings/payloads/v1/Members";

export type RawGuild = APIGuild;
export type RawGroup = APIGuildGroup;
export type RawCategory = APIGuildCategory;
export type RawMember = APIGuildMember;
export type RawMemberBan = APIGuildMemberBan;
export type RawPartialMember = APIGuildMemberSummary;
export type RawRole = APIGuildRole;
export type RawSubscription = APIGuildSubscription;
export type RawPartialUser = APIUserSummary;

export interface EditMemberOptions {
    /** The nickname of the member. */
    nickname: string | null;
}

export interface BulkXPOptions {
    /** The amount of XP to award to each user */
    amount: number;
    /** The IDs of the users to award/set XP to */
    userIDs: Array<string>;
}
