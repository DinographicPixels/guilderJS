/** @module ForumThreadReactionInfo */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { ReactionInfo } from "./ReactionInfo";
import { Client } from "./Client";
import { ForumChannel } from "./ForumChannel";
import { ForumThreadReactionTypes } from "../types";
import { GatewayEvent_ForumTopicCommentReactionCreated, GatewayEvent_ForumTopicCommentReactionDeleted, GatewayEvent_ForumTopicReactionCreated, GatewayEvent_ForumTopicReactionDeleted } from "../Constants";

/** Information about a ForumThread's reaction. */
export class ForumThreadReactionInfo extends ReactionInfo {
    /** ID of the thread where the reaction is. */
    threadID: number;
    /** ID of the thread comment, if reaction was added/removed from a comment. */
    commentID: number | null;
    /** The type of the parent entity. */
    type: string;
    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(
        data: GatewayEvent_ForumTopicReactionCreated
        | GatewayEvent_ForumTopicReactionDeleted
        | GatewayEvent_ForumTopicCommentReactionCreated
        | GatewayEvent_ForumTopicCommentReactionDeleted,
        client: Client
    ){
        super(data, client);
        this.threadID = data.reaction.forumTopicId;
        this.commentID = data.reaction["forumTopicCommentId" as keyof object] ?? null;
        this.type = data.reaction["forumTopicCommentId" as keyof object] ? "comment" : "thread";
    }

    /** The forum thread where the reaction has been added.
     * If the thread is cached, it'll return a ForumThread component,
     * otherwise it'll return basic information about this thread.
     */
    get thread(): ForumThreadReactionTypes["thread"] {
        return this.client.getChannel<ForumChannel>(
            this.raw.serverId as string,
            this.raw.reaction.channelId
        )?.threads.get(this.threadID)
          ?? {
              id:    this.threadID,
              guild: this.client.guilds.get(this.raw.serverId as string) ?? {
                  id: this.raw.serverId
              },
              channelID: this.raw.reaction.channelId
          };
    }
}
