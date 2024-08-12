/** @module ForumThreadHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { ForumThread } from "../../structures/ForumThread";
import { ForumThreadComment } from "../../structures/ForumThreadComment";
import { ForumThreadReactionInfo } from "../../structures/ForumThreadReactionInfo";
import {
    GatewayEvent_ForumTopicCommentCreated,
    GatewayEvent_ForumTopicCommentDeleted,
    GatewayEvent_ForumTopicCommentReactionCreated,
    GatewayEvent_ForumTopicCommentReactionDeleted,
    GatewayEvent_ForumTopicCommentUpdated,
    GatewayEvent_ForumTopicCreated,
    GatewayEvent_ForumTopicDeleted,
    GatewayEvent_ForumTopicLocked,
    GatewayEvent_ForumTopicPinned,
    GatewayEvent_ForumTopicReactionCreated,
    GatewayEvent_ForumTopicReactionDeleted,
    GatewayEvent_ForumTopicUnlocked,
    GatewayEvent_ForumTopicUnpinned,
    GatewayEvent_ForumTopicUpdated
} from "../../Constants";
import { ForumChannel } from "../../structures/ForumChannel";

/** Internal component, emitting forum thread events. */
export class ForumThreadHandler extends GatewayEventHandler {
    private async addGuildChannel(guildID: string, channelID: string, threadID?: number): Promise<void> {
        const guild = this.client.guilds.get(guildID);
        if (this.client.getChannel(guildID, channelID) === undefined) {
            const channel =
              await this.client.rest.channels.get(channelID)
                  .catch(err =>
                      this.client.emit(
                          "warn",
                          `Cannot register channel to cache due to: (${String(err)})`)
                  );
            if (typeof channel !== "boolean") guild?.channels?.add(channel);
        }
        const conditions = this.client.getChannel(guildID, channelID) !== undefined
          && this.client.getChannel<ForumChannel>(guildID, channelID)?.threads
              .get(threadID as number) === undefined;
        if (guildID && channelID && threadID && conditions) {
            const restThread =
              await this.client.rest.channels.getForumThread(channelID, threadID as number)
                  .catch(err => this.client.emit(
                      "warn",
                      `Cannot register thread to cache due to: (${String(err)})`)
                  );
            const channel = guild?.channels.get(channelID) as ForumChannel;
            if (typeof restThread !== "boolean") channel?.threads.add(restThread);
        }
        // const guild = this.client.guilds.get(guildID);
        // const restThread = await this.client.rest.channels.getForumThread(channelID, threadID as number);
        // guild?.channels.get(channelID)?.threads?.add(restThread);
    }
    async forumThreadCommentCreate(data: GatewayEvent_ForumTopicCommentCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.forumTopicComment.channelId,
                data.forumTopicComment.forumTopicId
            );
        else void this.addGuildChannel(
            data.serverId,
            data.forumTopicComment.channelId,
            data.forumTopicComment.forumTopicId
        );
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopicComment.channelId);
        const cachedTC =
          channel?.threads.get(data.forumTopicComment.forumTopicId)?.comments.update(data.forumTopicComment);
        const ThreadComment =
          cachedTC
          ?? new ForumThreadComment(
              data.forumTopicComment,
              this.client,
              { guildID: data.serverId }
          );
        channel?.threads?.get(data.forumTopicComment.forumTopicId)?.comments.add(ThreadComment);
        this.client.emit("forumCommentCreate", ThreadComment);
    }
    async forumThreadCommentDelete(data: GatewayEvent_ForumTopicCommentDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.forumTopicComment.channelId,
                data.forumTopicComment.forumTopicId
            );
        else void this.addGuildChannel(
            data.serverId,
            data.forumTopicComment.channelId,
            data.forumTopicComment.forumTopicId
        );
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopicComment.channelId);
        const cachedTC =
          channel?.threads.get(data.forumTopicComment.forumTopicId)?.comments.update(data.forumTopicComment);
        const ThreadComment =
          cachedTC
          ?? new ForumThreadComment(
              data.forumTopicComment,
              this.client,
              { guildID: data.serverId }
          );
        channel?.threads?.get(data.forumTopicComment.forumTopicId)?.comments.delete(ThreadComment.id);
        this.client.emit("forumCommentDelete", ThreadComment);
    }
    async forumThreadCommentReactionAdd(data: GatewayEvent_ForumTopicCommentReactionCreated): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new ForumThreadReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }
    async forumThreadCommentReactionRemove(data: GatewayEvent_ForumTopicCommentReactionDeleted): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new ForumThreadReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }
    async forumThreadCommentUpdate(data: GatewayEvent_ForumTopicCommentUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.forumTopicComment.channelId,
                data.forumTopicComment.forumTopicId
            );
        else void this.addGuildChannel(
            data.serverId,
            data.forumTopicComment.channelId,
            data.forumTopicComment.forumTopicId
        );
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopicComment.channelId);
        const CachedComment =
          channel?.threads.get(data.forumTopicComment.forumTopicId)?.comments
              .get(data.forumTopicComment.id)?.toJSON() ?? null;
        const cachedTC =
          channel?.threads.get(data.forumTopicComment.forumTopicId)?.comments.update(data.forumTopicComment);
        const ThreadComment =
          cachedTC
          ?? new ForumThreadComment(
              data.forumTopicComment,
              this.client,
              { guildID: data.serverId }
          );
        this.client.emit("forumCommentUpdate", ThreadComment, CachedComment);
    }
    async forumThreadCreate(data: GatewayEvent_ForumTopicCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        else void this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopic.channelId);
        const Thread =
          channel?.threads?.update(data.forumTopic) ?? new ForumThread(data.forumTopic, this.client);
        channel?.threads?.add(Thread);
        this.client.emit("forumThreadCreate", Thread);
    }


    async forumThreadDelete(data: GatewayEvent_ForumTopicDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        else void this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopic.channelId);
        const Thread =
          channel?.threads?.update(data.forumTopic)
          ?? new ForumThread(data.forumTopic, this.client);
        channel?.threads?.delete(Thread.id);
        this.client.emit("forumThreadDelete", Thread);
    }
    async forumThreadLock(data: GatewayEvent_ForumTopicLocked): Promise<void> {
        if (this.client.params.waitForCaching)
            void this.addGuildChannel(data.forumTopic.serverId, data.forumTopic.channelId);
        else void this.addGuildChannel(data.forumTopic.serverId, data.forumTopic.channelId);
        const channel =
          this.client.getChannel<ForumChannel>(data.forumTopic.serverId, data.forumTopic.channelId);
        const Thread =
          channel?.threads.update(data.forumTopic) ?? new ForumThread(data.forumTopic, this.client);
        this.client.emit("forumThreadLock", Thread);
    }
    async forumThreadPin(data: GatewayEvent_ForumTopicPinned): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        else void this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopic.channelId);
        const Thread =
          channel?.threads.update(data.forumTopic)
          ?? new ForumThread(data.forumTopic, this.client);
        this.client.emit("forumThreadPin", Thread);
    }
    async forumThreadReactionAdd(data: GatewayEvent_ForumTopicReactionCreated): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new ForumThreadReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }
    async forumThreadReactionRemove(data: GatewayEvent_ForumTopicReactionDeleted): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new ForumThreadReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }
    async forumThreadUnlock(data: GatewayEvent_ForumTopicUnlocked): Promise<void> {
        if (this.client.params.waitForCaching)
            void this.addGuildChannel(data.forumTopic.serverId, data.forumTopic.channelId);
        else void this.addGuildChannel(data.forumTopic.serverId, data.forumTopic.channelId);
        const channel =
          this.client.getChannel<ForumChannel>(data.forumTopic.serverId, data.forumTopic.channelId);
        const Thread =
          channel?.threads.update(data.forumTopic) ?? new ForumThread(data.forumTopic, this.client);
        this.client.emit("forumThreadUnlock", Thread);
    }
    async forumThreadUnpin(data: GatewayEvent_ForumTopicUnpinned): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        else void this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopic.channelId);
        const Thread =
          channel?.threads.update(data.forumTopic)
          ?? new ForumThread(data.forumTopic, this.client);
        this.client.emit("forumThreadUnpin", Thread);
    }
    async forumThreadUpdate(data: GatewayEvent_ForumTopicUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        else void this.addGuildChannel(data.serverId, data.forumTopic.channelId);
        const channel =
          this.client.getChannel<ForumChannel>(data.serverId, data.forumTopic.channelId);
        const CachedThread = channel?.threads.get(data.forumTopic.id)?.toJSON() ?? null;
        const Thread =
          channel?.threads?.update(data.forumTopic)
          ?? new ForumThread(data.forumTopic, this.client);
        this.client.emit("forumThreadUpdate", Thread, CachedThread);
    }


    // private async addChannelThread(guildID: string, channelID: string, threadID: number): Promise<void> {
    //     await this.addGuildChannel(guildID, channelID);
    //     if (this.client.getChannel(guildID, channelID)?.threads.get(threadID) !== undefined) return;
    //     const channel = this.client.guilds.get(guildID)?.channels.get(channelID);
    //     const restThread = await this.client.rest.channels.getForumThread(channelID, threadID);
    //     if (channel?.threads instanceof TypedCollection) channel.threads.add(channel.threads.update(restThread));
    // }
}
