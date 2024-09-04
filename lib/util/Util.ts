/** @module Util */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "../structures/Client";
import { Member } from "../structures/Member";
import type {
    AnyChannel,
    AnyTextableChannel,
    Embed,
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
    RawEmbed,
    MessageAttachment,
    AnyInteractionComponent
} from "../types";
import { Channel } from "../structures/Channel";
import { ForumThread } from "../structures/ForumThread";
import type { ForumChannel } from "../structures/ForumChannel";
import { Guild } from "../structures/Guild";
import { User } from "../structures/User";
import { Role } from "../structures/Role";
import { Group } from "../structures/Group";
import { Subscription } from "../structures/Subscription";
import { Category } from "../structures/Category";
import { Message } from "../structures/Message";
import { GatewayLayerIntent, InteractionComponentType } from "../Constants";
import type { DataCollectionProfile } from "../types/misc";
import { config } from "../../pkgconfig";
import type { APIURLSignature } from "guildedapi-types.ts/v1";
import { fetch } from "undici";

export class Util {
    #client: Client;
    constructor(client: Client) {
        this.#client = client;
    }

    /** This is the Data Collection Profile, sent if dataCollection is enabled. */
    private async getDataCollectionProfile(): Promise<Partial<DataCollectionProfile>> {
        await this.waitForAppUser();
        return {
            appID:        this.#client.user?.appID,
            appName:      this.#client.user?.username,
            appShortname: this.#client.application.appShortname,
            appUserID:    this.#client.user?.id,
            build:        config.branch.toLowerCase().includes("development") ? "dev" : "stable",
            buildVersion: config.version,
            guildCount:   this.#client.guilds.size,
            ownerID:      this.#client.user?.ownerID
        };
    }

    private waitForAppUser(ms = 5000): Promise<void> {
        return new Promise(resolve => {
            const checkUser = (): void => {
                if (this.#client.user) {
                    resolve();
                } else {
                    setTimeout(checkUser, ms);
                }
            };
            checkUser();
        });
    }

    async bulkAddComponents<T extends AnyTextableChannel = AnyTextableChannel>(
        channelID: string,
        components: Array<AnyInteractionComponent>,
        message: Message<T>,
        pushComponents = true
    ): Promise<Message<T>> {
        for (const component of components) {
            if (component.type === InteractionComponentType.BUTTON) {
                const regExpCheck = /^[\w-]{1,32}$/;
                if (!regExpCheck.test(component.customID))
                    throw new Error(
                        "Invalid component, customID property is considered invalid, " +
                      "requirements: \"1-32 characters containing no spaces, or symbols other than - and _\"."
                    );
                await this.#client.rest.channels
                    .createReaction(
                        channelID,
                        "ChannelMessage",
                        message.id,
                        component.emoteID)
                    .catch((err: Error): void => {
                        this.#client.emit("error", err);
                        throw new Error(
                            "Invalid component error, please check formatting, " +
                        "emote availability or any other issue that could cause this error."
                        );
                    });
                if (pushComponents) {
                    message.components.push(component);
                    void this.#client.util.requestDataCollection({ event: "button_component_add" });
                } else {
                    void this.#client.util.requestDataCollection({ event: "button_component_update" });
                }
            }
        }
        return message;
    }

    embedsToParsed(embeds: Array<RawEmbed>): Array<Embed> {
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
    embedsToRaw(embeds: Array<Embed>): Array<RawEmbed> {
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
    generateNumericID(length = 18): string {
        let id = "";
        for (let i = 0; i < length; i++) {
            id += Math.floor(Math.random() * 10).toString();
        }
        return id;
    }
    async getAttachments(attachmentURLs: Array<string>): Promise<Array<MessageAttachment>> {
        const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"]);
        const MessageAttachments: Array<MessageAttachment> = [];

        // Signing URLs
        let signedURLs: Array<APIURLSignature> = [];
        try {
            signedURLs =
              (await this.#client.rest.misc.signURL({
                  urls: attachmentURLs
              })).urlSignatures;
        } catch {
            this.#client.emit(
                "error",
                new Error("Couldn't automatically sign attachment CDN URL.")
            );
        }

        for (const attachmentURL of attachmentURLs) {
            const URLObject = new URL(attachmentURL);
            const pathName = URLObject.pathname;
            const extension = pathName.split(".").pop()?.toLowerCase() || "";
            const isImage = imageExtensions.has(extension);

            let arrayBuffer: ArrayBuffer | null = null;

            try {
                if (isImage) {
                    const fetchData = await fetch(attachmentURL);
                    arrayBuffer = await fetchData.arrayBuffer();
                }
            } catch {
                throw new Error("Couldn't get image ArrayBuffer data.");
            }

            // Array supposed to include only one URL, the target one.
            const signedURL = signedURLs
                .find(urlSignatureObj =>
                    urlSignatureObj.url === attachmentURL
                );

            MessageAttachments.push({
                originalURL:   attachmentURL,
                signedURL:     signedURL?.signature ?? null,
                isImage,
                arrayBuffer,
                fileExtension: extension
            });
        }
        return MessageAttachments;
    }
    isIntentEnabled(intents: Array<GatewayLayerIntent>): boolean {
        return this.#client.params.intents?.includes(GatewayLayerIntent.ALL)
          || intents.some(intent => this.#client.params.intents?.includes(intent) ?? false);
    }
    async requestDataCollection(
        collect: {
            data?: object;
            event: string;
        }
    ): Promise<void> {
        if (this.#client.params.dataCollection === false) return;
        if (this.#client.params.dataCollection === undefined && (await this.getDataCollectionProfile()).build !== "dev") return;

        return void this.#client.rest.request<Buffer>({
            auth:   false,
            method: "POST",
            route:  "https://dinographicpixels.com/",
            path:   "api/science",
            json:   {
                profile: await this.getDataCollectionProfile(),
                collect
            }
        }).catch(err => this.#client.emit("error", err as Error));
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
    updateGuildCategory(data: RawCategory): Category {
        return new Category(data, this.#client);
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
    updateGuildSubscription(data: RawSubscription): Subscription {
        return new Subscription(data, this.#client);
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
    updateUser(user: RawUser): User {
        return this.#client.users.has(user.id)
            ? this.#client.users.update(user)
            : this.#client.users.add(new User(user, this.#client));
    }
}

export function is<T>(input: unknown): input is T {
    return true;
}
