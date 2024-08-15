/** @module AnnouncementChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";

import { GuildChannel } from "./GuildChannel";
import { Announcement } from "./Announcement";
import TypedCollection from "../util/TypedCollection";
import type { JSONAnnouncementChannel, RawAnnouncement, RawChannel } from "../types";

/** Represents a guild announcement channel. */
export class AnnouncementChannel extends GuildChannel {
    /** Cached announcements. */
    announcements: TypedCollection<string, RawAnnouncement, Announcement>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: RawChannel, client: Client){
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
