
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RawMentions, RawMessage } from "./channels";
import type { ApplicationCommand, PrivateApplicationCommand } from "./applications";
import type { InteractionOptionWrapper } from "../util/InteractionOptionWrapper";

export interface InteractionData {
    applicationCommand: ApplicationCommand | PrivateApplicationCommand;
    name: string;
    options: InteractionOptionWrapper;
    // resolved?: InteractionResolved;
}

// export interface InteractionResolved {
//     users: TypedCollection<number, RawUser, User>;
// }

export interface InteractionOptionWrapperData {
    applicationCommand: ApplicationCommand | PrivateApplicationCommand;
    content: string;
    directReply: boolean;
    executionType: "simple" | "full";
    guildID: string;
    mentions: RawMentions | null;
}

export interface CommandInteractionData {
    directReply: boolean;
    executionType: "simple" | "full";
    guildID: string;
    /** Raw Message */
    message: RawMessage;
    /** Command name */
    name: string;
}

export interface CommandInteractionConstructorParams {
    acknowledged?: boolean;
    originalID?: string;
}
