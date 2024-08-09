/** @module Util */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { Client } from "../structures/Client";
import { Member } from "../structures/Member";
import { AnyChannel, AnyTextableChannel, MessageEmbedOptions } from "../types/channel";
import { Channel } from "../structures/Channel";
import { ForumThread } from "../structures/ForumThread";
import { ForumChannel } from "../structures/ForumChannel";
import { Guild } from "../structures/Guild";
import { User } from "../structures/User";
import { GuildRole } from "../structures/GuildRole";
import { GuildGroup } from "../structures/GuildGroup";
import { GuildSubscription } from "../structures/GuildSubscription";
import { GuildCategory } from "../structures/GuildCategory";
import { Message } from "../structures/Message";
import { MessageConstructorParams } from "../types/message";
import {
    APIForumTopic,
    APIForumTopicSummary,
    APIGuild,
    APIGuildChannel,
    APIGuildGroup,
    APIGuildMember,
    APIGuildRole,
    APIGuildSubscription,
    APIUser,
    APIGuildCategory,
    APIChatMessage,
    APIEmbedOptions
} from "guildedapi-types.ts/v1";

export class Util {
    #client: Client;
    constructor(client: Client) {
        this.#client = client;
    }

    updateUser(user: APIUser): User {
        return this.#client.users.has(user.id)
            ? this.#client.users.update(user)
            : this.#client.users.add(new User(user, this.#client));
    }

    updateMember(guildID: string, memberID: string, member: APIGuildMember): Member {
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

    updateForumThread(data: APIForumTopic | APIForumTopicSummary): ForumThread<ForumChannel> {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            const channel = guild?.channels.get(data.channelId) as ForumChannel;
            if (guild && channel) {
                const thread = channel.threads.has(data.id)
                    ? channel.threads.update(data)
                    : channel.threads.add(new ForumThread(data as APIForumTopic, this.#client));
                return thread;
            }
        }
        return new ForumThread(data as APIForumTopic, this.#client);
    }

    updateGuild(data: APIGuild): Guild {
        if (data.id) {
            return this.#client.guilds.has(data.id)
                ? this.#client.guilds.update(data)
                : this.#client.guilds.add(new Guild(data, this.#client));
        }
        return new Guild(data, this.#client);
    }

    updateRole(data: APIGuildRole): GuildRole {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            if (guild) {
                const role = guild.roles.has(data.id)
                    ? guild.roles.update(data as APIGuildRole)
                    : guild.roles.add(new GuildRole(data, this.#client));
                return role;
            }
        }
        return new GuildRole(data, this.#client);
    }

    updateGuildGroup(data: APIGuildGroup): GuildGroup {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            if (guild) {
                const group = guild.groups.has(data.id)
                    ? guild.groups.update(data as APIGuildGroup)
                    : guild.groups.add(new GuildGroup(data, this.#client));
                return group;
            }
        }
        return new GuildGroup(data, this.#client);
    }

    updateChannel<T extends AnyChannel>(data: APIGuildChannel): T {
        if (data.serverId) {
            const guild = this.#client.guilds.get(data.serverId);
            if (guild) {
                const channel = guild.channels.has(data.id)
                    ? guild.channels.update(data as APIGuildChannel)
                    : guild.channels.add(Channel.from<AnyChannel>(data, this.#client));
                return channel as T;
            }
        }
        return Channel.from<T>(data, this.#client);
    }

    updateGuildSubscription(data: APIGuildSubscription): GuildSubscription {
        return new GuildSubscription(data, this.#client);
    }

    updateGuildCategory(data: APIGuildCategory): GuildCategory {
        return new GuildCategory(data, this.#client);
    }

    updateMessage<T extends AnyTextableChannel = AnyTextableChannel>(
        data: APIChatMessage,
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

    embedsToParsed(embeds: Array<APIEmbedOptions>): Array<MessageEmbedOptions> {
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

    embedsToRaw(embeds: Array<MessageEmbedOptions>): Array<APIEmbedOptions> {
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
