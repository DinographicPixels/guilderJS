
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { ApplicationCommandType, ApplicationCommandOptionType } from "../Constants";

export interface ApplicationCommand {
    name: string;
    options?: Array<ApplicationCommandOption>;
    type: ApplicationCommandType;
}

export interface PrivateApplicationCommand extends ApplicationCommand {
    guildID?: string;
    private: true;
    userID?: string;
}

export interface ApplicationCommandOption {
    name: string;
    required: boolean;
    type: ApplicationCommandOptionType;
}

export interface ClientApplication {
    appShortname: string;
    commands: Array<ApplicationCommand | PrivateApplicationCommand>;
    enabled: boolean;
}
