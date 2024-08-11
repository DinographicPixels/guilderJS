/** @module Channel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "./Client";

import { Base } from "./Base";
import { GuildChannel } from "./GuildChannel";
import { CalendarChannel } from "./CalendarChannel";
import { DocChannel } from "./DocChannel";
import { ForumChannel } from "./ForumChannel";
import { TextChannel } from "./TextChannel";
import { AnnouncementChannel } from "./AnnouncementChannel";
import type { APIGuildChannel } from "../Constants";
import { AnyChannel, EditChannelOptions, JSONChannel } from "../types";

/** Represents a channel. */
export class Channel extends Base<string> {
    /** Channel type */
    type: string;
    /** Channel name */
    name: string | null;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: APIGuildChannel, client: Client){
        super(data.id, client);
        this.type = data.type;
        this.name = data.name;
    }

    static from<T extends AnyChannel = AnyChannel>(data: APIGuildChannel, client: Client): T {
        switch (data.type) {
            case "announcements": {
                return new AnnouncementChannel(data, client) as T;
            }
            case "calendar": {
                return new CalendarChannel(data, client) as T;
            }
            case "chat": {
                return new TextChannel(data, client) as T;
            }
            case "docs": {
                return new DocChannel(data, client) as T;
            }
            case "forums": {
                return new ForumChannel(data, client) as T;
            }
            case "list": {
                return new GuildChannel(data, client) as T;
            }
            case "media": {
                return new GuildChannel(data, client) as T;
            }
            case "scheduling": {
                return new GuildChannel(data, client) as T;
            }
            case "stream": {
                return new TextChannel(data, client) as T;
            }
            case "voice": {
                return new TextChannel(data, client) as T;
            }
            default: {
                return new Channel(data, client) as T;
            }
        }
    }

    override toJSON(): JSONChannel {
        return {
            ...super.toJSON(),
            type: this.type,
            name: this.name
        };
    }

    /** Edit the channel. */
    async edit(options: EditChannelOptions): Promise<Channel>{
        return this.client.rest.guilds.editChannel(this.id as string, options);
    }

    /** Delete the channel. */
    async delete(): Promise<void>{
        return this.client.rest.guilds.deleteChannel(this.id as string);
    }
}
