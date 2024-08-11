/** @module AnnouncementReactionInfo */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { ReactionInfo } from "./ReactionInfo";
import { Client } from "./Client";
import { AnnouncementChannel } from "./AnnouncementChannel";
import { AnnouncementReactionTypes } from "../types";
import { GatewayEvent_AnnouncementCommentReactionCreated, GatewayEvent_AnnouncementCommentReactionDeleted, GatewayEvent_AnnouncementReactionCreated, GatewayEvent_AnnouncementReactionDeleted } from "../Constants";

/** Information about a Announcement's reaction. */
export class AnnouncementReactionInfo extends ReactionInfo {
    /** ID of the announcement where the reaction is added to. */
    announcementID: string;
    /** ID of the announcement comment, if reaction was added/removed from a comment. */
    commentID: number | null;
    /** The type of the parent entity. */
    type: string;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(
        data: GatewayEvent_AnnouncementReactionCreated
        | GatewayEvent_AnnouncementReactionDeleted
        | GatewayEvent_AnnouncementCommentReactionCreated
        | GatewayEvent_AnnouncementCommentReactionDeleted,
        client: Client
    ){
        super(data, client);
        this.announcementID = data.reaction.announcementId;
        this.commentID = data.reaction["announcementCommentId" as keyof object] ?? null;
        this.type = data.reaction["announcementCommentId" as keyof object] ? "comment" : "announcement";
    }

    /** The announcement where the reaction has been added.
     * If the event is cached, it'll return a Announcement component,
     * otherwise it'll return basic information about this announcement.
     */
    get announcement(): AnnouncementReactionTypes["announcement"] {
        return this.client.getChannel<AnnouncementChannel>(
            this.raw.serverId as string, this.raw.reaction.channelId)?.announcements
            .get(this.announcementID)
          ?? {
              id:    this.announcementID,
              guild: this.client.guilds.get(this.raw.serverId as string) ?? {
                  id: this.raw.serverId
              },
              channelID: this.raw.reaction.channelId
          };
    }
}
