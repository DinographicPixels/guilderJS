/** @module AnnouncementHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { Announcement } from "../../structures/Announcement";
import { AnnouncementChannel } from "../../structures/AnnouncementChannel";
import { AnnouncementComment } from "../../structures/AnnouncementComment";
import { AnnouncementReactionInfo } from "../../structures/AnnouncementReactionInfo";
import {
    GatewayEvent_AnnouncementCommentCreated,
    GatewayEvent_AnnouncementCommentDeleted,
    GatewayEvent_AnnouncementCommentReactionCreated,
    GatewayEvent_AnnouncementCommentReactionDeleted,
    GatewayEvent_AnnouncementCommentUpdated,
    GatewayEvent_AnnouncementCreated,
    GatewayEvent_AnnouncementDeleted,
    GatewayEvent_AnnouncementReactionCreated,
    GatewayEvent_AnnouncementReactionDeleted,
    GatewayEvent_AnnouncementUpdated
} from "guildedapi-types.ts/v1";

/** Internal component, emitting announcement events. */
export class AnnouncementHandler extends GatewayEventHandler {
    private async addGuildChannel(guildID: string, channelID: string, announcementID?: string): Promise<void> {
        const guild = this.client.guilds.get(guildID);
        if (this.client.getChannel(guildID, channelID) === undefined) {
            const channel =
              await this.client.rest.channels.get(channelID)
                  .catch(err =>
                      this.client.emit(
                          "warn",
                          `Cannot register channel to cache due to: (${String(err)})`
                      )
                  );
            if (typeof channel !== "boolean") guild?.channels.add(channel);
        }
        const conditions = this.client.getChannel(guildID, channelID) !== undefined
          && this.client.getChannel<AnnouncementChannel>(guildID, channelID)?.announcements
              .get(announcementID as string) === undefined;
        if (guildID && channelID && announcementID && conditions) {
            const restAnnouncement =
              await this.client.rest.channels.getAnnouncement(channelID, announcementID)
                  .catch(err =>
                      this.client.emit(
                          "warn",
                          `Cannot register doc to cache due to: (${String(err)})`
                      )
                  );
            const channel = guild?.channels.get(channelID) as AnnouncementChannel;
            if (typeof restAnnouncement !== "boolean") channel?.announcements.add(restAnnouncement);
        }
    }
    async announcementCommentCreate(data: GatewayEvent_AnnouncementCommentCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.announcementComment.channelId,
                data.announcementComment.announcementId
            );
        else void this.addGuildChannel(
            data.serverId,
            data.announcementComment.channelId,
            data.announcementComment.announcementId
        );
        const channel =
          this.client.getChannel<AnnouncementChannel>(
              data.serverId,
              data.announcementComment.channelId);
        const comment =
          channel?.announcements.get(data.announcementComment.announcementId)?.comments
              .update(data.announcementComment)
          ?? new AnnouncementComment(
              data.announcementComment,
              this.client,
              { guildID: data.serverId }
          );
        this.client.emit("announcementCommentCreate", comment);
    }
    async announcementCommentDelete(data: GatewayEvent_AnnouncementCommentDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.announcementComment.channelId,
                data.announcementComment.announcementId
            );
        else void this.addGuildChannel(
            data.serverId,
            data.announcementComment.channelId,
            data.announcementComment.announcementId
        );
        const channel =
          this.client.getChannel<AnnouncementChannel>(
              data.serverId,
              data.announcementComment.channelId
          );
        const comment = channel?.announcements.get(data.announcementComment.announcementId)?.comments
            .update(data.announcementComment)
          ?? new AnnouncementComment(
              data.announcementComment,
              this.client,
              { guildID: data.serverId }
          );
        this.client.emit("announcementCommentDelete", comment);
    }
    async announcementCommentReactionAdd(data: GatewayEvent_AnnouncementCommentReactionCreated): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching) await this.addGuildChannel(
                data.serverId,
                data.reaction.channelId,
                data.reaction.announcementId
            );
            else void this.addGuildChannel(
                data.serverId,
                data.reaction.channelId,
                data.reaction.announcementId
            );
        const ReactionInfo = new AnnouncementReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }
    async announcementCommentReactionRemove(data: GatewayEvent_AnnouncementCommentReactionDeleted): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(
                    data.serverId,
                    data.reaction.channelId,
                    data.reaction.announcementId
                );
            else void this.addGuildChannel(
                data.serverId,
                data.reaction.channelId,
                data.reaction.announcementId
            );
        const ReactionInfo = new AnnouncementReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }
    async announcementCommentUpdate(data: GatewayEvent_AnnouncementCommentUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.announcementComment.channelId,
                data.announcementComment.announcementId
            );
        else void this.addGuildChannel(
            data.serverId,
            data.announcementComment.channelId,
            data.announcementComment.announcementId
        );
        const channel =
          this.client.getChannel<AnnouncementChannel>(
              data.serverId,
              data.announcementComment.channelId
          );
        const cachedComment =
          channel?.announcements.get(data.announcementComment.announcementId)?.comments
              .get(data.announcementComment.id)?.toJSON()
          ?? null;
        const comment =
          channel?.announcements.get(data.announcementComment.announcementId)?.comments
              .update(data.announcementComment)
          ?? new AnnouncementComment(
              data.announcementComment,
              this.client,
              { guildID: data.serverId }
          );
        this.client.emit("announcementCommentUpdate", comment, cachedComment);
    }
    async announcementCreate(data: GatewayEvent_AnnouncementCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.announcement.channelId);
        else void this.addGuildChannel(data.serverId, data.announcement.channelId);

        const channel = this.client.getChannel<AnnouncementChannel>(
            data.serverId,
            data.announcement.channelId
        );
        const AnnouncementComponent =
          channel?.announcements?.update(data.announcement)
          ?? new Announcement(data.announcement, this.client);

        this.client.emit("announcementCreate", AnnouncementComponent);
    }


    async announcementDelete(data: GatewayEvent_AnnouncementDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.announcement.channelId
            );
        else void this.addGuildChannel(data.serverId, data.announcement.channelId);

        const channel =
          this.client.getChannel<AnnouncementChannel>(
              data.serverId,
              data.announcement.channelId
          );
        const AnnouncementComponent =
          channel?.announcements?.update(data.announcement)
          ?? new Announcement(data.announcement, this.client);
        channel?.announcements.delete(data.announcement.id);
        this.client.emit("announcementDelete", AnnouncementComponent);
    }

    async announcementReactionAdd(data: GatewayEvent_AnnouncementReactionCreated): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(
                    data.serverId,
                    data.reaction.channelId,
                    data.reaction.announcementId
                );
            else void this.addGuildChannel(
                data.serverId,
                data.reaction.channelId,
                data.reaction.announcementId
            );
        const ReactionInfo = new AnnouncementReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }
    async announcementReactionRemove(data: GatewayEvent_AnnouncementReactionDeleted): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(
                    data.serverId,
                    data.reaction.channelId,
                    data.reaction.announcementId
                );
            else void this.addGuildChannel(
                data.serverId,
                data.reaction.channelId,
                data.reaction.announcementId
            );
        const ReactionInfo = new AnnouncementReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }
    async announcementUpdate(data: GatewayEvent_AnnouncementUpdated): Promise<void> {
        if (this.client.params.waitForCaching) await this.addGuildChannel(
            data.serverId,
            data.announcement.channelId
        );
        else void this.addGuildChannel(data.serverId, data.announcement.channelId);

        const channel =
          this.client.getChannel<AnnouncementChannel>(
              data.serverId,
              data.announcement.channelId
          );
        const CachedAnnouncement =
          channel?.announcements.get(data.announcement.id)?.toJSON() ?? null;
        const AnnouncementComponent =
          channel?.announcements?.update(data.announcement)
          ?? new Announcement(data.announcement, this.client);

        this.client.emit(
            "announcementUpdate",
            AnnouncementComponent,
            CachedAnnouncement
        );
    }


}
