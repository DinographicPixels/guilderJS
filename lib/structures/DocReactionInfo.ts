/** @module DocReactionInfo */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { ReactionInfo } from "./ReactionInfo";
import type { Client } from "./Client";
import type { DocChannel } from "./DocChannel";
import type { DocReactionTypes } from "../types";
import type { GatewayEvent_DocReactionCreated as GW_DocRCRE, GatewayEvent_DocReactionDeleted as GW_DocRDEL, GatewayEvent_DocCommentReactionCreated as GW_DocCRCRE, GatewayEvent_DocCommentReactionDeleted as GW_DocCRDEL } from "../Constants";

/** Information about a Doc's reaction. */
export class DocReactionInfo extends ReactionInfo {
    /** ID of the doc where the reaction was added/removed. */
    docID: number;
    /** The type of the parent entity. */
    type: string;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(
        data: GW_DocRCRE
        | GW_DocRDEL
        | GW_DocCRCRE
        | GW_DocCRDEL,
        client: Client
    ){
        super(data, client);
        this.docID = data.reaction.docId;
        this.type = data["docCommentId" as keyof object] ? "comment" : "doc";
    }

    /** The doc where the reaction has been added.
     * If the doc is cached, it'll return a Doc component,
     * otherwise it'll return basic information about this doc.
     */
    get doc(): DocReactionTypes["doc"] {
        const channel =
          this.client.getChannel<DocChannel>(
              this.raw.serverId as string,
              this.raw.reaction.channelId
          );
        return channel?.docs?.get(this.docID) ?? {
            id:    this.docID,
            guild: this.client.guilds.get(this.raw.serverId as string) ?? {
                id: this.raw.serverId
            },
            channelID: this.raw.reaction.channelId
        };
    }
}
