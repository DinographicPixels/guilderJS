import type { Agent } from "undici";

export interface ClientOptions {
    /**
     * The bot's bearer token, needed to connect to the bot.
     */
    token: string;
    /**
     * **NOT RECOMMENDED, CAN BREAK THINGS**
     *
     * REST methods are used to communicate with the Guilded by sending requests.
     * This feature was included in previous TouchGuild versions but we've changed how we manage REST requests.
     *
     * Forcing disabling REST methods may crash the library when receiving events, reorganizing cache hierarchy, which means that they are used internally,
     * you can still disable those methods by setting this boolean to `true`, be aware that **it isn't recommended**.
     * @defaultValue false
     */
    ForceDisableREST?: boolean;
    /**
     * REST Options are used for REST requests. You can change some properties there.
     * This includes some properties like the baseURL and much more.
     */
    RESTOptions?: RESTOptions;

    /**
     * This boolean is used to enable or disable the `> Connection established.` message when
     * connection is successfully established.
     */
    connectionMessage?: boolean;

    /**
     * If true, will wait for caching before emitting the event.
     *
     * This will increase the event emit latency, but ensure that you receive the cached items in time.
     *
     * By disabling this, you reduce latency between you & Guilded, and won't receive cached items in time.
     * @default true
     */
    waitForCaching?: boolean;

    /**
     * Fixes & improves Guilded API markdown and makes it Commonmark compliant.
     *
     * Enabled by default, can be disabled to use old version of the Guilded markdown. (if facing issues for example)
     */
    isOfficialMarkdownEnabled?: boolean;

    /** Set your own limit to how much messages, threads, comments, events.. will be stored in cache before deletion. */
    collectionLimits?: {
        messages?: number;
        threads?: number;
        threadComments?: number;
        docs?: number;
        scheduledEvents?: number;
        scheduledEventsRSVPS?: number;
        calendarComments?: number;
        docComments?: number;
        announcements?: number;
        announcementComments?: number;
    };
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
