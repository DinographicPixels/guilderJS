/** @module CalendarHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { CalendarEvent } from "../../structures/CalendarEvent";
import { CalendarEventRSVP } from "../../structures/CalendarRSVP";
import {
    GatewayEvent_CalendarEventCommentCreated,
    GatewayEvent_CalendarEventCommentDeleted,
    GatewayEvent_CalendarEventCommentReactionCreated,
    GatewayEvent_CalendarEventCommentReactionDeleted,
    GatewayEvent_CalendarEventCommentUpdated,
    GatewayEvent_CalendarEventCreated,
    GatewayEvent_CalendarEventDeleted,
    GatewayEvent_CalendarEventReactionCreated,
    GatewayEvent_CalendarEventReactionDeleted,
    GatewayEvent_CalendarEventRsvpDeleted,
    GatewayEvent_CalendarEventRsvpManyUpdated,
    GatewayEvent_CalendarEventRsvpUpdated,
    GatewayEvent_CalendarEventUpdated
} from "../../Constants";
import { CalendarChannel } from "../../structures/CalendarChannel";
import { CalendarReactionInfo } from "../../structures/CalendarReactionInfo";
import { CalendarEventComment } from "../../structures/CalendarEventComment";

/** Internal component, emitting calendar events. */
export class CalendarHandler extends GatewayEventHandler {
    async calendarEventCreate(data: GatewayEvent_CalendarEventCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.calendarEvent.channelId
            );
        else void this.addGuildChannel(data.serverId, data.calendarEvent.channelId);
        const channel =
          this.client.getChannel<CalendarChannel>(data.serverId, data.calendarEvent.channelId);
        const CalendarEventComponent =
          channel?.scheduledEvents.update(data.calendarEvent)
          ?? new CalendarEvent(data.calendarEvent, this.client);
        this.client.emit("calendarEventCreate", CalendarEventComponent);
    }

    async calendarEventUpdate(data: GatewayEvent_CalendarEventUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(data.serverId, data.calendarEvent.channelId);
        else void this.addGuildChannel(data.serverId, data.calendarEvent.channelId);
        const channel =
          this.client.getChannel<CalendarChannel>(
              data.serverId,
              data.calendarEvent.channelId
          );
        const CachedEvent =
          channel?.scheduledEvents.get(data.calendarEvent.id)?.toJSON() ?? null;
        const CalendarEventComponent =
          channel?.scheduledEvents.update(data.calendarEvent)
          ?? new CalendarEvent(data.calendarEvent, this.client);
        this.client.emit("calendarEventUpdate", CalendarEventComponent, CachedEvent);
    }

    async calendarEventDelete(data: GatewayEvent_CalendarEventDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.calendarEvent.channelId
            );
        else void this.addGuildChannel(data.serverId, data.calendarEvent.channelId);
        const channel =
          this.client.getChannel<CalendarChannel>(data.serverId, data.calendarEvent.channelId);
        const CalendarEventComponent =
          channel?.scheduledEvents.update(data.calendarEvent)
          ?? new CalendarEvent(data.calendarEvent, this.client);
        channel?.scheduledEvents.delete(data.calendarEvent.id);
        this.client.emit("calendarEventDelete", CalendarEventComponent);
    }

    async calendarEventReactionAdd(data: GatewayEvent_CalendarEventReactionCreated): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new CalendarReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }

    async calendarEventReactionRemove(data: GatewayEvent_CalendarEventReactionDeleted): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new CalendarReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }

    async calendarCommentCreate(data: GatewayEvent_CalendarEventCommentCreated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.calendarEventComment.channelId,
                Number(data.calendarEventComment.calendarEventId)
            );
        else void this.addGuildChannel(
            data.serverId,
            data.calendarEventComment.channelId,
            Number(data.calendarEventComment.calendarEventId)
        );
        const channel =
          this.client.getChannel<CalendarChannel>(
              data.serverId,
              data.calendarEventComment.channelId
          );
        const CalendarEventComponent =
          channel?.scheduledEvents.get(Number(data.calendarEventComment.calendarEventId));
        const CalendarComment =
          CalendarEventComponent?.comments.update(data.calendarEventComment)
          ?? new CalendarEventComment(
              data.calendarEventComment,
              this.client,
              { guildID: data.serverId }
          );
        this.client.emit("calendarCommentCreate", CalendarComment);
    }

    async calendarCommentUpdate(data: GatewayEvent_CalendarEventCommentUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.calendarEventComment.channelId,
                Number(data.calendarEventComment.calendarEventId)
            );
        else void this.addGuildChannel(
            data.serverId,
            data.calendarEventComment.channelId,
            Number(data.calendarEventComment.calendarEventId)
        );
        const channel =
          this.client.getChannel<CalendarChannel>(
              data.serverId,
              data.calendarEventComment.channelId
          );
        const CalendarEventComponent =
          channel?.scheduledEvents.get(Number(data.calendarEventComment.calendarEventId));
        const CachedComment =
          CalendarEventComponent?.comments.get(data.calendarEventComment.id)?.toJSON() ?? null;
        const CalendarComment =
          CalendarEventComponent?.comments.update(data.calendarEventComment)
          ?? new CalendarEventComment(
              data.calendarEventComment,
              this.client,
              { guildID: data.serverId }
          );
        this.client.emit("calendarCommentUpdate", CalendarComment, CachedComment);
    }

    async calendarCommentDelete(data: GatewayEvent_CalendarEventCommentDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.serverId,
                data.calendarEventComment.channelId,
                Number(data.calendarEventComment.calendarEventId)
            );
        else void this.addGuildChannel(
            data.serverId,
            data.calendarEventComment.channelId,
            Number(data.calendarEventComment.calendarEventId)
        );
        const channel =
          this.client.getChannel<CalendarChannel>(
              data.serverId,
              data.calendarEventComment.channelId
          );
        const CalendarEventComponent =
          channel?.scheduledEvents.get(Number(data.calendarEventComment.calendarEventId));
        const CalendarComment =
          CalendarEventComponent?.comments.update(data.calendarEventComment)
          ?? new CalendarEventComment(
              data.calendarEventComment,
              this.client,
              { guildID: data.serverId }
          );
        CalendarEventComponent?.comments.delete(data.calendarEventComment.id);
        this.client.emit("calendarCommentDelete", CalendarComment);
    }

    async calendarCommentReactionAdd(data: GatewayEvent_CalendarEventCommentReactionCreated): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new CalendarReactionInfo(data, this.client);
        this.client.emit("reactionAdd", ReactionInfo);
    }

    async calendarCommentReactionRemove(data: GatewayEvent_CalendarEventCommentReactionDeleted): Promise<void> {
        if (data.serverId)
            if (this.client.params.waitForCaching)
                await this.addGuildChannel(data.serverId, data.reaction.channelId);
            else void this.addGuildChannel(data.serverId, data.reaction.channelId);
        const ReactionInfo = new CalendarReactionInfo(data, this.client);
        this.client.emit("reactionRemove", ReactionInfo);
    }

    async calendarRsvpUpdate(data: GatewayEvent_CalendarEventRsvpUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.calendarEventRsvp.serverId,
                data.calendarEventRsvp.channelId,
                data.calendarEventRsvp.calendarEventId
            );
        else void this.addGuildChannel(
            data.calendarEventRsvp.serverId,
            data.calendarEventRsvp.channelId,
            data.calendarEventRsvp.calendarEventId
        );
        const channel =
          this.client.getChannel<CalendarChannel>(
              data.calendarEventRsvp.serverId,
              data.calendarEventRsvp.channelId
          );
        const CachedRSVP =
          channel?.scheduledEvents.get(data.calendarEventRsvp.calendarEventId)?.rsvps
              .get(data.calendarEventRsvp.calendarEventId)?.toJSON() ?? null;
        const updateFromCache =
          channel?.scheduledEvents
              .get(data.calendarEventRsvp.calendarEventId)?.rsvps
              .update(data.calendarEventRsvp);
        const CalendarERSVPComponent =
          updateFromCache ?? new CalendarEventRSVP(data.calendarEventRsvp, this.client);
        this.client.emit("calendarEventRsvpUpdate", CalendarERSVPComponent, CachedRSVP);
    }

    async calendarRsvpBulkUpdate(data: GatewayEvent_CalendarEventRsvpManyUpdated): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.calendarEventRsvps[0].serverId,
                data.calendarEventRsvps[0].channelId,
                data.calendarEventRsvps[0].calendarEventId
            );
        else void this.addGuildChannel(
            data.calendarEventRsvps[0].serverId,
            data.calendarEventRsvps[0].channelId,
            data.calendarEventRsvps[0].calendarEventId
        );
        const channel =
          this.client.getChannel<CalendarChannel>(
              data.calendarEventRsvps[0].serverId,
              data.calendarEventRsvps[0].channelId
          );
        const CachedRSVPS =
          data.calendarEventRsvps
              .map(rsvp =>
                  channel?.scheduledEvents
                      .get(rsvp.calendarEventId)?.rsvps
                      .get(rsvp.calendarEventId)?.toJSON()
                ?? null
              );
        const updateFromCache =
          data.calendarEventRsvps
              .map(rsvp =>
                  channel?.scheduledEvents
                      .get(rsvp.calendarEventId)?.rsvps
                      .update(rsvp)
                ?? new CalendarEventRSVP(rsvp, this.client)
              );
        const CalendarRSVPMap =
          updateFromCache
          ?? data.calendarEventRsvps
              .map(rsvp => new CalendarEventRSVP(rsvp, this.client));
        this.client.emit("calendarEventRsvpBulkUpdate", CalendarRSVPMap, CachedRSVPS);
    }

    async calendarRsvpDelete(data: GatewayEvent_CalendarEventRsvpDeleted): Promise<void> {
        if (this.client.params.waitForCaching)
            await this.addGuildChannel(
                data.calendarEventRsvp.serverId,
                data.calendarEventRsvp.channelId,
                data.calendarEventRsvp.calendarEventId
            );
        else void this.addGuildChannel(
            data.calendarEventRsvp.serverId,
            data.calendarEventRsvp.channelId,
            data.calendarEventRsvp.calendarEventId
        );
        const channel =
          this.client.getChannel<CalendarChannel>(
              data.calendarEventRsvp.serverId,
              data.calendarEventRsvp.channelId
          );
        const updateFromCache =
          channel?.scheduledEvents.get(data.calendarEventRsvp.calendarEventId)?.rsvps
              .update(data.calendarEventRsvp);
        const CalendarERSVPComponent =
          updateFromCache
          ?? new CalendarEventRSVP(data.calendarEventRsvp, this.client);
        this.client.emit("calendarEventRsvpDelete", CalendarERSVPComponent);
    }

    private async addGuildChannel(guildID: string, channelID: string, eventID?: number): Promise<void> {
        const guild = this.client.guilds.get(guildID);
        if (this.client.getChannel(guildID, channelID) === undefined) {
            const channel =
              await this.client.rest.channels.getChannel(channelID)
                  .catch(err =>
                      this.client.emit(
                          "warn",
                          `Cannot register channel to cache due to: (${String(err)})`)
                  );
            if (typeof channel !== "boolean") guild?.channels?.add(channel);
        }
        const conditions =
          this.client.getChannel(guildID, channelID) !== undefined
          && this.client.getChannel<CalendarChannel>(guildID, channelID)?.scheduledEvents
              .get(eventID as number) === undefined;
        if (guildID && channelID && eventID && conditions) {
            const restEvent =
              await this.client.rest.channels.getCalendarEvent(channelID, eventID)
                  .catch(err =>
                      this.client.emit(
                          "warn",
                          `Cannot register event to cache due to: (${String(err)})`
                      )
                  );
            if (typeof restEvent !== "boolean")
                (guild?.channels.get(channelID) as CalendarChannel)?.scheduledEvents.add(restEvent);
        }
    }
}
