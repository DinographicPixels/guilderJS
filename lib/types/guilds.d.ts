
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

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
