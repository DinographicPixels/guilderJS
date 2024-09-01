
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RawMentions, RawMessage } from "./channels";
import type { ApplicationCommand, PrivateApplicationCommand } from "./applications";
import type { InteractionOptionWrapper } from "../util/InteractionOptionWrapper";
import type { InteractionComponentType } from "../Constants";
import type { CommandInteraction } from "../structures/CommandInteraction";
import type { ComponentInteraction } from "../structures/ComponentInteraction";
import type { MessageReactionInfo } from "../structures/MessageReactionInfo";

export interface InteractionData {
    applicationCommand: ApplicationCommand | PrivateApplicationCommand;
    name: string;
    options: InteractionOptionWrapper;
    // resolved?: InteractionResolved;
}

export interface ComponentInteractionData {
    customID: string;
    emoteID: number;
    reactionInfo: MessageReactionInfo;
    userTriggerMessageID: string;
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

export interface InteractionConstructorParams {
    acknowledged?: boolean;
    originalID?: string;
}

export interface InteractionComponent {
    type: InteractionComponentType;
}

export interface InteractionButtonComponent extends InteractionComponent {
    customID: string;
    emoteID: number;
    type: InteractionComponentType.BUTTON;
}

export type AnyInteractionComponent = InteractionButtonComponent;
export type AnyInteraction = CommandInteraction | ComponentInteraction;
