/** @module Util */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "../structures/Client";
import { Member } from "../structures/Member";
import {
    AnyChannel,
    AnyTextableChannel,
    MessageEmbedOptions,
    MessageConstructorParams,
    RawUser,
    RawMember,
    RawForumThread,
    RawPartialForumThread,
    RawGuild,
    RawRole,
    RawGroup,
    RawChannel,
    RawSubscription,
    RawCategory,
    RawMessage,
    RawEmbed
} from "../types";
import { Channel } from "../structures/Channel";
import { ForumThread } from "../structures/ForumThread";
import { ForumChannel } from "../structures/ForumChannel";
import { Guild } from "../structures/Guild";
import { User } from "../structures/User";
import { Role } from "../structures/Role";
import { Group } from "../structures/Group";
import { Subscription } from "../structures/Subscription";
import { Category } from "../structures/Category";
import { Message } from "../structures/Message";

export class Util {
    #client: Client;
    constructor(client: Client) {
        this.#client = client;
    }

    updateUser(user: RawUser): User {
        return this.#client.users.has(user.id)
            ? this.#client.users.update(user)
            : this.#client.users.add(new User(user, this.#client));
    }

    updateMember(guildID: string, memberID: string, member: RawMember): Member {
        const guild = this.#client.guilds.get(guildID);
        if (guild && this.#client.user?.id === memberID) {
            if (guild["_clientMember"]) {
                guild["_clientMember"]["update"](member);
            } else {
                guild["_clientMember"] = guild.members.update({ ...member, id: memberID }, guildID);
            }
            return guild["_clientMember"];
        }
        return guild ? guild.members.update({ ...member, id: memberID }, guildID)
            : new Member({ ...member }, this.#client, guildID);
    }

    updateForumThread(data: RawForumThread | RawPartialForumThread): ForumThread<ForumChannel> {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            const channel = guild?.channels.get(data.channelId) as ForumChannel;
            if (guild && channel) {
                const thread = channel.threads.has(data.id)
                    ? channel.threads.update(data)
                    : channel.threads.add(new ForumThread(data as RawForumThread, this.#client));
                return thread;
            }
        }
        return new ForumThread(data as RawForumThread, this.#client);
    }

    updateGuild(data: RawGuild): Guild {
        if (data.id) {
            return this.#client.guilds.has(data.id)
                ? this.#client.guilds.update(data)
                : this.#client.guilds.add(new Guild(data, this.#client));
        }
        return new Guild(data, this.#client);
    }

    updateRole(data: RawRole): Role {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            if (guild) {
                const role = guild.roles.has(data.id)
                    ? guild.roles.update(data as RawRole)
                    : guild.roles.add(new Role(data, this.#client));
                return role;
            }
        }
        return new Role(data, this.#client);
    }

    updateGuildGroup(data: RawGroup): Group {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            if (guild) {
                const group = guild.groups.has(data.id)
                    ? guild.groups.update(data as RawGroup)
                    : guild.groups.add(new Group(data, this.#client));
                return group;
            }
        }
        return new Group(data, this.#client);
    }

    updateChannel<T extends AnyChannel>(data: RawChannel): T {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            if (guild) {
                const channel = guild.channels.has(data.id)
                    ? guild.channels.update(data as RawChannel)
                    : guild.channels.add(Channel.from<AnyChannel>(data, this.#client));
                return channel as T;
            }
        }
        return Channel.from<T>(data, this.#client);
    }

    updateGuildSubscription(data: RawSubscription): Subscription {
        return new Subscription(data, this.#client);
    }

    updateGuildCategory(data: RawCategory): Category {
        return new Category(data, this.#client);
    }

    updateMessage<T extends AnyTextableChannel = AnyTextableChannel>(
        data: RawMessage,
        params?: MessageConstructorParams
    ): Message<T> {
        const channel = this.#client.getChannel<T>(data.serverId ?? "", data.channelId);
        if (channel) {
            const message =
              channel.messages.has(data.id)
                  ? channel.messages.update(data)
                  : channel.messages.add(new Message<T>(data, this.#client, params));
            return message as Message<T>;
        }
        return new Message<T>(data, this.#client, params);
    }

    embedsToParsed(embeds: Array<RawEmbed>): Array<MessageEmbedOptions> {
        return embeds.map(embed => ({
            author: embed.author === undefined ? undefined : {
                name:    embed.author.name,
                iconURL: embed.author.icon_url
            },
            color:       embed.color,
            description: embed.description,
            fields:      embed.fields?.map(field => ({
                inline: field.inline,
                name:   field.name,
                value:  field.value
            })),
            footer: embed.footer === undefined ? undefined : {
                text:    embed.footer.text,
                iconURL: embed.footer.icon_url
            },
            timestamp: embed.timestamp,
            title:     embed.title,
            image:     embed.image === undefined ? undefined : {
                url: embed.image.url
            },
            thumbnail: embed.thumbnail === undefined ? undefined : {
                url: embed.thumbnail.url
            },
            url: embed.url
        }));
    }

    embedsToRaw(embeds: Array<MessageEmbedOptions>): Array<RawEmbed> {
        return embeds.map(embed => ({
            author: embed.author === undefined ? undefined :  {
                name:     embed.author.name,
                icon_url: embed.author.iconURL,
                url:      embed.author.url
            },
            color:       embed.color,
            description: embed.description,
            fields:      embed.fields?.map(field => ({
                inline: field.inline,
                name:   field.name,
                value:  field.value
            })),
            footer: embed.footer === undefined ? undefined : {
                text:     embed.footer.text,
                icon_url: embed.footer.iconURL
            },
            timestamp: embed.timestamp,
            title:     embed.title,
            image:     embed.image === undefined ? undefined : { url: embed.image.url },
            thumbnail: embed.thumbnail === undefined ? undefined : { url: embed.thumbnail.url },
            url:       embed.url
        }));
    }
}

export function is<T>(input: unknown): input is T {
    return true;
}
