
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { ApplicationCommandType, ApplicationCommandOptionType } from "../Constants";

export interface ApplicationCommand {
    type: ApplicationCommandType;
    name: string;
    options?: Array<ApplicationCommandOption>;
}

export interface PrivateApplicationCommand extends ApplicationCommand {
    private: true;
    guildID?: string;
    userID?: string;
}

export interface ApplicationCommandOption {
    type: ApplicationCommandOptionType;
    name: string;
    required: boolean;
}

export interface ClientApplication {
    enabled: boolean;
    appShortname: string;
    commands: Array<ApplicationCommand | PrivateApplicationCommand>;
}
