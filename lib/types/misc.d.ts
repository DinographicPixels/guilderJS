/** @module Types/Misc */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

export interface DataCollectionProfile {
    appID: string;
    appName: string;
    appShortname: string;
    appUserID: string;
    build: "stable" | "dev";
    buildVersion: string;
    ownerID: string;
}
