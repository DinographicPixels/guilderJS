/** @module AnnouncementChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";

import { GuildChannel } from "./GuildChannel";
import { Announcement } from "./Announcement";
import type { APIAnnouncement, APIGuildChannel } from "../Constants";
import TypedCollection from "../util/TypedCollection";
import { JSONAnnouncementChannel } from "../types";

/** Represents a guild announcement channel. */
export class AnnouncementChannel extends GuildChannel {
    /** Cached announcements. */
    announcements: TypedCollection<string, APIAnnouncement, Announcement>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: APIGuildChannel, client: Client){
        super(data, client);
        this.announcements = new TypedCollection(
            Announcement,
            client,
            client.params.collectionLimits?.announcements
        );
        this.update(data);
    }

    override toJSON(): JSONAnnouncementChannel {
        return {
            ...super.toJSON(),
            announcements: this.announcements.map(announcement => announcement.toJSON())
        };
    }
}
