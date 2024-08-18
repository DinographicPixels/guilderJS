
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RawMentions, RawMessage } from "./channels";
import type { ApplicationCommand, PrivateApplicationCommand } from "./applications";
import type { InteractionOptionWrapper } from "../util/InteractionOptionWrapper";

export interface InteractionData {
    name: string;
    applicationCommand: ApplicationCommand | PrivateApplicationCommand;
    options: InteractionOptionWrapper;
    // resolved?: InteractionResolved;
}

// export interface InteractionResolved {
//     users: TypedCollection<number, RawUser, User>;
// }

export interface InteractionOptionWrapperData {
    guildID: string;
    content: string;
    directReply: boolean;
    executionType: "simple" | "full";
    applicationCommand: ApplicationCommand | PrivateApplicationCommand;
    mentions: RawMentions | null;
}

export interface CommandInteractionData {
    guildID: string;
    /** Raw Message */
    message: RawMessage;
    /** Command name */
    name: string;
    directReply: boolean;
    executionType: "simple" | "full";
}

export interface CommandInteractionConstructorParams {
    originalID?: string;
    acknowledged?: boolean;
}
