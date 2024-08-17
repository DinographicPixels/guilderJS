/** @module Client */
/* eslint-disable @typescript-eslint/method-signature-style */

//
// TouchGuild Library
// Client structure class
// Main access component
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Message } from "./Message";

import type { Member } from "./Member";
import { Guild } from "./Guild";

import { AppUser } from "./AppUser";
import { User } from "./User";
import { TextChannel } from "./TextChannel";
import { WSManager } from "../gateway/WSManager";
import { GatewayHandler } from "../gateway/GatewayHandler";
import { RESTManager } from "../rest/RESTManager";
import TypedCollection from "../util/TypedCollection";
import TypedEmitter from "../util/TypedEmitter";
import { type GATEWAY_EVENTS, ApplicationCommandOptionType, ApplicationCommandType } from "../Constants";
import type {
    ClientEvents,
    ClientOptions,
    AnyChannel,
    AnyTextableChannel,
    RawGuild,
    RawUser,
    ApplicationCommand
} from "../types";
import { Util } from "../util/Util";
import { config } from "../../pkgconfig";
import { fetch } from "undici";

/** Represents the application client,
 * enabling you to perform actions, detect events,
 * get data that is automatically managed for you,
 * configure internal properties, and way more.
 *
 * It is the root of the creation of your application.
 *
 * That's where everything begins.*/
export class Client extends TypedEmitter<ClientEvents> {
    /** Client's params, including app's token & rest options. */
    params: ClientOptions;
    /** Websocket Manager. */
    ws: WSManager;
    /** Application/Client User. */
    user?: AppUser;
    /** REST methods. */
    rest: RESTManager;
    /** Gateway Handler. */
    #gateway: GatewayHandler;
    /** Cached guilds. */
    guilds: TypedCollection<string, RawGuild, Guild>;
    /** Cached users. */
    users: TypedCollection<string, RawUser, User>;
    /** Utils */
    util: Util;
    /** Time at which the connection started in ms. */
    startTime: number;
    /** Timestamp at which the last check for update happened. */
    lastCheckForUpdate: number | null;
    /** Application */
    application: (ClientOptions["setupApplication"] & { commands: Array<ApplicationCommand>; });
    /** @param params Client's parameters, this includes app's token & rest options. */
    constructor(params: ClientOptions) {
        if (typeof params !== "object") throw new Error("The token isn't provided in an object.");
        if (!params?.token) throw new Error("Cannot create client without token, no token is provided.");
        super();
        this.params = {
            token:                     params.token,
            ForceDisableREST:          params.ForceDisableREST ?? false,
            RESTOptions:               params.RESTOptions,
            connectionMessage:         params.connectionMessage ?? true,
            updateWarning:             params.updateWarning ?? true,
            waitForCaching:            params.waitForCaching ?? true,
            isOfficialMarkdownEnabled: params.isOfficialMarkdownEnabled ?? true,
            wsReconnect:               params.wsReconnect,
            collectionLimits:          {
                messages:             params.collectionLimits?.messages             ?? 100,
                threads:              params.collectionLimits?.threads              ?? 100,
                threadComments:       params.collectionLimits?.threadComments       ?? 100,
                docs:                 params.collectionLimits?.docs                 ?? 100,
                scheduledEvents:      params.collectionLimits?.scheduledEvents      ?? 100,
                scheduledEventsRSVPS: params.collectionLimits?.scheduledEventsRSVPS ?? 100,
                calendarComments:     params.collectionLimits?.calendarComments     ?? 100,
                docComments:          params.collectionLimits?.docComments          ?? 100,
                announcements:        params.collectionLimits?.announcements        ?? 100,
                announcementComments: params.collectionLimits?.announcementComments ?? 100
            },
            setupApplication: params.setupApplication,
            deprecations:     {
                independentMessageBehavior: params.deprecations?.independentMessageBehavior
            },
            restMode: false
        };
        this.ws = new WSManager(this, { token: this.token, client: this, reconnect: params.wsReconnect });
        this.guilds = new TypedCollection(Guild, this);
        this.users = new TypedCollection(User, this);
        this.rest = (
            this.params.ForceDisableREST
                ? null
                : new RESTManager(this, params.RESTOptions)
        ) as RESTManager;
        this.#gateway = new GatewayHandler(this);
        this.util = new Util(this);
        this.application = this.params.setupApplication
            ? Object.assign(this.params.setupApplication, { commands: [] })
            : {
                enabled:         false,
                appShortcutName: this.user?.id.toString() ?? "none",
                commands:        []
            };
        this.startTime = 0;
        this.lastCheckForUpdate = null;
    }

    private async checkForUpdate(): Promise<void> {
        this.lastCheckForUpdate = Date.now();
        interface jsonRes {
            version: string;
        }
        if (config.branch.toLowerCase().includes("stable")) {
            if (!this.params.updateWarning) return;
            const res = await fetch("https://registry.npmjs.org/touchguild/latest");
            const json = await res.json() as jsonRes;

            if (config.version !== json.version)
                console.log("█ TouchGuild WARN: " +
                  "You are no longer running the latest version. " +
                  "\n█ Update to the latest version to benefit from new, " +
                  "improved features, bug fixes, security patches, and more.");
            return;
        }

        if (config.branch.toLowerCase().includes("development")) {
            console.log("TouchGuild Development Build (v" + config.version + ")");
            if (!this.params.updateWarning) return;
            if (!config.version.includes("dev")) {
                console.log("█ This is a fork or copy of the TouchGuild library, " +
                  "make sure to respect the license associated to the it.\n" +
                  "█ If this fork was made to contribute, we thank you for your commitment!");
                return;
            }
            const res = await fetch("https://registry.npmjs.org/touchguild");
            const json = await res.json() as { time: Record<string, string>; };
            if (Object.keys(json.time)[Object.keys(json.time).length - 1] !== config.version)
                console.log("█ TouchGuild WARN: You are no longer running the latest development build.\n" +
                  "█ It is highly recommended to update to the latest development build as they can include major bug fixes," +
                  " brand new and improved features, and more.\n" +
                  "Note: If you need a more stable environment, " +
                  "we recommend switching back to the Stable build once the features you used and need are available in it");
            return;
        }
        return;
    }
    private get shouldCheckForUpdate(): boolean {
        return !this.lastCheckForUpdate
          || Date.now() - this.lastCheckForUpdate > 1800 * 1000;
    }
    /** Get the application token you initially passed into the constructor.
     * @note If "gapi_" is not present in the token, it is automatically
     * added for you, enabling TouchGuild to connect in proper conditions.*/
    get token(): string {
        return this.params.token.includes("gapi_") ? this.params.token : "gapi_" + this.params.token;
    }
    /** Application Uptime */
    get uptime(): number {
        return this.startTime ? Date.now() - this.startTime : 0;
    }

    bulkRegisterApplicationCommand(commands: Array<ApplicationCommand>): void {
        for (const command of commands) {
            this.registerApplicationCommand(command);
        }
    }

    /** Connect to Guilded. */
    connect(): void {
        if (this.shouldCheckForUpdate) void this.checkForUpdate();
        if (this.params.restMode)
            throw new Error("REST mode has been enabled; you can no longer connect to the gateway.");
        this.ws.connect();
        this.ws.on("GATEWAY_WELCOME", async data => {
            this.user = new AppUser(data, this);
            if (this.params.connectionMessage) console.log("> Connection established.");
            await this.rest.misc.getUserGuilds("@me").catch(() => [])
                .then(guilds => {
                    if (!guilds) guilds = [];
                    for (const guild of guilds) this.guilds.add(guild);
                });
            this.startTime = Date.now();
            this.emit("ready");
        });

        this.ws.on("disconnect", err => {
            this.startTime = 0;
            this.emit("error", err);
        });

        this.ws.on("GATEWAY_PARSED_PACKET", (type, data) => {
            void this.#gateway.handleMessage(type as keyof GATEWAY_EVENTS, data);
        });
    }

    disconnect(crashOnDisconnect?: boolean): void {
        if (this.ws.alive === false) return console.warn("There is no open connection.");
        this.ws.disconnect(false); // closing all connections.
        console.log("The connection has been terminated.");
        if (crashOnDisconnect) throw new Error("Connection closed.");
    }

    /** This method is used to get a specific guild channel, if cached.
     *
     * Note: this method doesn't send a REST request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Channels)
     * @param guildID ID of the guild the channel is in.
     * @param channelID The ID of the channel to get from cache.
     */
    getChannel<T extends AnyChannel = AnyChannel>(guildID: string, channelID: string): T | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        if (!channelID) throw new Error("channelID is a required parameter.");
        return this.guilds.get(guildID)?.channels.get(channelID) as T;
    }

    /** Get a cached Guild, returns `undefined` if not cached.
     * Note: this method doesn't send a rest request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Guilds)
     * @param guildID The ID of the guild to get.
     */
    getGuild(guildID: string): Guild | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        return this.guilds.get(guildID);
    }

    /** This method is used to get a specific guild member, if cached.
     *
     * Note: this method doesn't send a rest request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Guilds)
     * @param guildID The ID of the guild the member is in.
     * @param memberID The ID of the member to get.
     */
    getMember(guildID: string, memberID: string): Member | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        if (!memberID) throw new Error("memberID is a required parameter.");
        return this.getGuild(guildID)?.members.get(memberID);
    }

    /** This method is used to get a list of cached guild member.
     *
     * Note: this method doesn't send a REST request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Guilds)
     * @param guildID ID of the guild to get members.
     */
    getMembers(guildID: string): Array<Member> | undefined {
        if (!guildID) throw new Error("guildID is a required parameter.");
        return this.getGuild(guildID)?.members.map(member => member);
    }
    /** Get a channel's message, if cached.
     *
     * Note: this method doesn't send a rest request, it only returns cached entities.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Channels)
     * @param guildID ID of the guild.
     * @param channelID ID of the channel containing the message.
     * @param messageID ID of the message you'd like to get.
     */
    getMessage(guildID: string, channelID: string, messageID: string): Message<AnyTextableChannel> | undefined {
        const channel = this.getChannel(guildID, channelID);
        if (channel instanceof TextChannel) {
            return channel?.messages.get(messageID);
        }
    }
    /** This method is used to get cached messages from a channel.
     *
     * There is a similar method that uses REST to request the data
     * directly from the API, check out Client#rest (REST/Channels)
     * @param guildID ID of the guild.
     * @param channelID ID of a "Chat" channel.
     */
    getMessages(guildID: string, channelID: string): Array<Message<AnyTextableChannel>> | undefined {
        const channel = this.getChannel(guildID, channelID);
        if (channel instanceof TextChannel) {
            return channel?.messages.map(msg => msg);
        }
    }

    /**
     * Register your application command, enabling the delivery of a Command Interaction.
     * @param command
     */
    registerApplicationCommand(command: ApplicationCommand): void {
        if (command.name.includes(" "))
            throw new Error("Application command name cannot contain white spaces (name property).");
        if (!Object.values(ApplicationCommandType).includes(command.type))
            throw new Error("Application command type is invalid (type property).");

        if (command.options) {
            const wrongOptionTypeIndex =
              command.options.map(opt =>
                  Object.values(ApplicationCommandOptionType).includes(opt.type)).indexOf(false);
            if (wrongOptionTypeIndex !== -1)
                throw new Error(`Application command option type is invalid: options[${wrongOptionTypeIndex}].`);

            const wrongOptionNameIndex =
              command.options.map(opt => !opt.name.includes(" ")).indexOf(false);
            if (wrongOptionNameIndex !== -1)
                throw new Error(`Application command option name is invalid, it cannot contain white spaces: options[${wrongOptionNameIndex}].`);

            let firstOptionalFound = false;
            for (let i = 0; i < command.options.length; i++) {
                if (!command.options[i].required && !firstOptionalFound) firstOptionalFound = true;
                if (firstOptionalFound && command.options[i].required)
                    throw new Error(`Application command option cannot be required after setting an optional one: options[${i}].`);
            }
        }

        this.application.commands.push(command);
    }
    /**
     * Use REST methods (Client#rest) without connecting to the gateway.
     * @param fakeReady Emit a fake "ready" event (default: true).
     */
    restMode(fakeReady = true): void {
        if (this.shouldCheckForUpdate) void this.checkForUpdate();
        this.params.restMode = true;
        if (this.params.connectionMessage) console.log("> REST Mode has been enabled.");
        void this.rest.misc.getAppUser().then(async () => {
            await this.rest.misc.getUserGuilds("@me").catch(() => [])
                .then(guilds => {
                    if (!guilds) guilds = [];
                    for (const guild of guilds) this.guilds.add(guild);
                });
            if (fakeReady) this.emit("ready");
        });
    }
}
