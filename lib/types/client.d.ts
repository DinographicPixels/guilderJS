/** @module Types/Client */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Agent } from "undici";

export interface ClientOptions {
    /**
     * **NOT RECOMMENDED, CAN BREAK THINGS**
     *
     * REST methods are used to communicate with the Guilded API by sending requests.
     * This feature was included in previous TouchGuild versions but we've changed how we manage REST requests.
     *
     * Forcing disabling REST methods may crash the library when receiving events, reorganizing cache hierarchy,
     * and more, they are used internally.
     * Though you can still force disable those methods by setting this boolean to `true`, be aware that **it isn't recommended** at all.
     * @defaultValue false
     */
    ForceDisableREST?: boolean;
    /**
     * REST Options are used for REST requests. You can change some properties there.
     * This includes some properties like the baseURL and much more.
     */
    RESTOptions?: RESTOptions;
    /**
     * Application short name,
     * enabling Commands & Interactions (uses slash commands).
     * @usage /applicationShortname command_name
     * @note Please register commands using Client#registerApplicationCommand
     * or bulkRegisterApplicationCommands.
     */
    applicationShortname?: string;
    /** Set your own limit to how much messages, threads, comments, events.. should be stored in cache before deletion. */
    collectionLimits?: {
        announcementComments?: number;
        announcements?: number;
        calendarComments?: number;
        docComments?: number;
        docs?: number;
        messages?: number;
        scheduledEvents?: number;
        scheduledEventsRSVPS?: number;
        threadComments?: number;
        threads?: number;
    };
    /**
     * This boolean is used to enable or disable the `> Connection established.` message when
     * connection is successfully established.
     */
    connectionMessage?: boolean;
    /**
     * Fixes & improves Guilded API markdown and makes it Commonmark compliant.
     *
     * Enabled by default, can be disabled to use old version of the Guilded markdown. (if facing issues for example)
     */
    isOfficialMarkdownEnabled?: boolean;
    /** REST-Only mode, does not initialize a gateway connection. */
    restMode?: boolean;
    /**
     * The app's bearer token, required to connect to the API.
     */
    token: string;
    /**
     * This boolean is used to enable or disable the update warning you receive when your version of TouchGuild
     * is no longer the latest anymore.
     */
    updateWarning?: boolean;
    /**
     * If true, will wait for caching before emitting the event.
     *
     * This will increase the event emit latency, but ensure that you receive the cached items in time.
     *
     * By disabling this, you reduce latency between you & Guilded, and won't receive cached items in time.
     * @default true
     */
    waitForCaching?: boolean;
    /** Websocket auto reconnect on connection loss.
     * @default true
     */
    wsReconnect?: boolean;
}

export interface RESTOptions {
    /**
     * The agent to use for requests.
     * @defaultValue null
     */
    agent?: Agent | null;
    /**
     * The base URL used for requests.
     * @defaultValue
     */
    baseURL?: string;
    /**
     * Built-in latency compensator.
     * @defaultValue false
     */
    disableLatencyCompensation?: boolean;
    /**
     * The `Host` header to use for requests.
     * @defaultValue Parsed from `baseURL`
     */
    host?: string;
    /**
     * In milliseconds, the average request latency at which to start emitting latency errors.
     * @defaultValue 30000
     */
    latencyThreshold?: number;
    /**
     * In milliseconds, the time to offset ratelimit calculations by.
     * @defaultValue 0
     */
    ratelimiterOffset?: number;
    /**
     * In milliseconds, how long to wait until a request is timed out.
     * @defaultValue 15000
     */
    requestTimeout?: number;
    /**
     * User-Agent header to use for requests.
     */
    userAgent?: string;
}
