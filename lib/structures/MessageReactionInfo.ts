/** @module MessageReactionInfo */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { ReactionInfo } from "./ReactionInfo";
import { TextChannel } from "./TextChannel";
import { Client } from "./Client";
import { MessageReactionTypes } from "../types/types";
import { GatewayEvent_ChannelMessageReactionCreated, GatewayEvent_ChannelMessageReactionDeleted } from "../Constants";

/** Information about a Message's reaction. */
export class MessageReactionInfo extends ReactionInfo {
    /** ID of the message where the reaction was added/removed. */
    messageID: string;
    /** The type of the parent entity. */
    type: string;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(
        data: GatewayEvent_ChannelMessageReactionCreated
        | GatewayEvent_ChannelMessageReactionDeleted,
        client: Client
    ) {
        super(data, client);
        this.messageID = data.reaction.messageId;
        this.type = "message";
    }

    /** The message where the reaction has been added.
     * If the message is cached, it'll return a Message component,
     * otherwise it'll return basic information about this message.
     */
    get message(): MessageReactionTypes["message"] {
        const channel = this.client.getChannel<TextChannel>(
            this.raw.serverId as string,
            this.raw.reaction.channelId
        );
        return channel?.messages?.get(this.messageID) ?? {
            id:    this.messageID,
            guild: this.client.guilds.get(this.raw.serverId as string) ?? {
                id: this.raw.serverId
            },
            channelID: this.raw.reaction.channelId
        };
    }
}
