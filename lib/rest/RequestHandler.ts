/** @module RequestHandler */
import type { RESTManager } from "./RESTManager";
import GuildedHTTPError from "./GuildedHTTPError";
import GuildedRESTError from "./GuildedRESTError";
import SequentialBucket from "./SequentialBucket";
import { RESTMethod, RESTMethods } from "../Constants";
import { LatencyRef, RequestOptions } from "../types/request-handler";
import { config as pkgconfig } from "../../pkgconfig";
import { RESTOptions } from "../types/client";
import { fetch, File, FormData } from "undici";

export class RequestHandler {
    #manager: RESTManager;
    options;
    globalBlock = false;
    latencyRef: LatencyRef;
    ratelimits: Record<string, SequentialBucket> = {};
    readyQueue: Array<() => void> = [];
    constructor(manager: RESTManager, options: RESTOptions = {}){
        this.#manager = manager;
        this.options = {
            agent:                      options.agent,
            baseURL:                    options.baseURL ?? pkgconfig.GuildedAPI.APIURL,
            disableLatencyCompensation: !!options.disableLatencyCompensation,
            host:                       options.host ?? (options.baseURL ? new URL(options.baseURL as string).host : new URL(pkgconfig.GuildedAPI.APIURL).host),
            latencyThreshold:           options.latencyThreshold ?? 30000,
            ratelimiterOffset:          options.ratelimiterOffset ?? 0,
            requestTimeout:             options.requestTimeout ?? 15000,
            userAgent:                  options.userAgent ?? undefined
        };
        this.latencyRef = {
            lastTimeOffsetCheck: 0,
            latency:             this.options.ratelimiterOffset ?? 0,
            raw:                 Array.from({ length: 10 }).fill(this.options.ratelimiterOffset) as Array<number>,
            timeOffsets:         Array.from({ length: 10 }).fill(0) as Array<number>,
            timeoffset:          0
        };
    }

    private globalUnblock(): void {
        this.globalBlock = false;
        while (this.readyQueue.length !== 0) {
            this.readyQueue.shift()!();
        }
    }

    async authRequest<T = unknown>(options: Omit<RequestOptions, "auth">): Promise<T> {
        return this.request<T>({
            ...options,
            auth: true
        });
    }

    async request<T = unknown>(options: RequestOptions): Promise<T> {
        options.method = options.method.toUpperCase() as RESTMethod;
        if (!RESTMethods.includes(options.method)) {
            throw new Error(`Invalid method "${options.method}.`);
        }
        const _stackHolder = {};
        Error.captureStackTrace(_stackHolder);
        if (!options.path.startsWith("/")) {
            options.path = `/${options.path}`;
        }
        const route = options.route ?? `${pkgconfig.GuildedAPI.APIURL}/${options.path}`;
        if (!this.ratelimits[route]) {
            this.ratelimits[route] = new SequentialBucket(1, this.latencyRef);
        }
        let attempts = 0;
        return new Promise<T>((resolve, reject) => {
            async function attempt(this: RequestHandler, cb: () => void): Promise<void> {
                const headers: Record<string, string> = options.headers ?? {};
                try {
                    // let latency = Date.now();
                    const controller = new AbortController();

                    headers["User-Agent"] = `TouchGuild ${pkgconfig.branch} (${pkgconfig.version}) Node.JS ${pkgconfig.NodeJSVersion}`;
                    headers["x-guilded-bot-api-use-official-markdown"] = String(this.#manager.client.params.isOfficialMarkdownEnabled ?? true); // temporary header

                    if (typeof options.auth === "string"){
                        const tokenArgs = options.auth.split(" ");
                        headers.Authorization = tokenArgs[0] === "Bearer" ? options.auth : `Bearer ${options.auth}`;
                    } else if (options.auth && this.#manager.token) {
                        const tokenArgs = this.#manager.token.split(" ");
                        headers.Authorization = tokenArgs[0] === "Bearer" ? this.#manager.token : `Bearer ${this.#manager.token}`;
                    }

                    options.method = options.method.toUpperCase() as RESTMethod;

                    let reqBody: string | FormData | undefined;
                    if (options.method !== "GET") {
                        let stringBody: string | undefined;
                        if (options.json) {
                            stringBody = JSON.stringify(options.json, (k, v: unknown) => typeof v === "bigint" ? v.toString() : v);
                        }
                        if (options.form || (options.files && options.files.length !== 0)) {
                            const data = options.form ?? new FormData();
                            if (options.files) for (const [index, file] of options.files.entries()) {
                                if (!file.contents) {
                                    continue;
                                }
                                data.set(`files[${index}]`, new File([file.contents], file.name));
                            }
                            if (stringBody) {
                                data.set("payload_json", stringBody);
                            }
                            reqBody = data;
                        } else if (options.json) {
                            reqBody = stringBody;
                            headers["Content-Type"] = "application/json";
                        }
                    }

                    if (this.options.host) {
                        headers.Host = this.options.host;
                    }

                    const url = `${options.editBaseURL ?? this.options.baseURL}${options.path}${options.query && Array.from(options.query.keys()).length !== 0 ? `?${options.query.toString()}` : ""}`;
                    let latency = Date.now();

                    let timeout: NodeJS.Timeout | undefined;
                    if (this.options.requestTimeout > 0 && this.options.requestTimeout !== Infinity) {
                        timeout = setTimeout(() => controller.abort(), this.options.requestTimeout);
                    }

                    const res = await fetch(url, {
                        method:     options.method,
                        headers,
                        body:       reqBody,
                        dispatcher: this.options.agent || undefined,
                        signal:     controller.signal
                    });
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    latency = Date.now() - latency;
                    if (!this.options.disableLatencyCompensation) {
                        this.latencyRef.raw.push(latency);
                        this.latencyRef.latency = this.latencyRef.latency - Math.trunc(this.latencyRef.raw.shift()! / 10) + Math.trunc(latency / 10);
                    }
                    // console.log("from reqhandler:", res);

                    let resBody: Buffer | string | Record<string, unknown> | null;
                    if (res.status === 204) {
                        resBody = null;
                    } else {
                        if (res.headers.get("content-type") === "application/json") {
                            const b = await res.text();
                            try {
                                resBody = JSON.parse(b) as Record<string, unknown>;
                            } catch (err) {
                                this.#manager.client.emit("error", err as Error);
                                resBody = b;
                            }
                        } else {
                            resBody = Buffer.from(await res.arrayBuffer());
                        }
                    }

                    const headerNow = Date.parse(res.headers.get("date")!);
                    const now = Date.now();
                    if (this.latencyRef.lastTimeOffsetCheck < (Date.now() - 5000)) {
                        const timeOffset = headerNow + 500 - (this.latencyRef.lastTimeOffsetCheck = Date.now());
                        if (this.latencyRef.timeoffset - this.latencyRef.latency >= this.options.latencyThreshold && timeOffset - this.latencyRef.latency >= this.options.latencyThreshold) {
                            this.#manager.client.emit("warn", `Your clock is ${this.latencyRef.timeoffset}ms behind Guilded's server clock. Please check your connection and system time.`);
                        }

                        this.latencyRef.timeoffset = this.latencyRef.timeoffset - Math.trunc(this.latencyRef.timeOffsets.shift()! / 10) + Math.trunc(timeOffset / 10);
                        this.latencyRef.timeOffsets.push(timeOffset);
                    }
                    if (res.headers.has("x-ratelimit-limit")) {
                        this.ratelimits[route].limit = Number(res.headers.get("x-ratelimit-limit"));
                    }
                    if (options.method !== "GET" && (!res.headers.has("x-ratelimit-remaining") || !res.headers.has("x-ratelimit-limit")) && this.ratelimits[route].limit !== 1) {
                        this.#manager.client.emit("debug", [`Missing ratelimit headers for SequentialBucket(${this.ratelimits[route].remaining}/${this.ratelimits[route].limit}) with non-default limit\n`,
                            `${res.status} ${res.headers.get("content-type") ?? "null"}: ${options.method} ${route} | ${res.headers.get("cf-ray") ?? "null"}\n`,
                            `content-type = ${res.headers.get("content-type") ?? "null"}\n`,
                            `x-ratelimit-remaining = ${res.headers.get("x-ratelimit-remaining") ?? "null"}\n`,
                            `x-ratelimit-limit = ${res.headers.get("x-ratelimit-limit") ?? "null"}\n`,
                            `x-ratelimit-reset = ${res.headers.get("x-ratelimit-reset") ?? "null"}\n`,
                            `x-ratelimit-global = ${res.headers.get("x-ratelimit-global") ?? "null"}`].join("\n"));
                    }
                    this.ratelimits[route].remaining = !res.headers.has("x-ratelimit-remaining") ? 1 : Number(res.headers.get("x-ratelimit-remaining")) ?? 0;
                    const retryAfter = Number(res.headers.get("x-ratelimit-reset-after") ?? res.headers.get("retry-after") ?? 0) * 1000;
                    if (retryAfter >= 0) {
                        if (res.headers.has("x-ratelimit-global")) {
                            this.globalBlock = true;
                            setTimeout(this.globalUnblock.bind(this), retryAfter ?? 1);
                        } else {
                            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/restrict-plus-operands
                            this.ratelimits[route].reset = (retryAfter ?? 1) + now;
                        }
                    }

                    if (res.status > 300) {
                        if (res.status === 429) {
                            let delay = retryAfter;
                            if (res.headers.get("x-ratelimit-scope") === "shared") {
                                try {
                                    delay = (resBody as { retry_after: number; }).retry_after * 1000;
                                } catch (err) {
                                    reject(err);
                                }
                            }

                            this.#manager.client.emit("debug", `${res.headers.has("x-ratelimit-global") ? "Global" : "Unexpected"} RateLimit: ${JSON.stringify(resBody)}\n${now} ${route} ${res.status}: ${latency}ms (${this.latencyRef.latency}ms avg) | ${this.ratelimits[route].remaining}/${this.ratelimits[route].limit} left | Reset ${delay} (${this.ratelimits[route].reset - now}ms left) | Scope ${res.headers.get("x-ratelimit-scope")!}`);
                            if (delay) {
                                setTimeout(() => {
                                    cb();
                                    this.request<T>(options).then(resolve).catch(reject);
                                }, delay);
                                return;
                            } else {
                                cb();
                                this.request<T>(options).then(resolve).catch(reject);
                                return;
                            }
                        } else if (res.status === 502 && ++attempts < 4) {
                            this.#manager.client.emit("debug", `Unexpected 502 on ${options.method} ${route}`);
                            setTimeout(() => {
                                this.request<T>(options).then(resolve).catch(reject);
                            }, Math.floor(Math.random() * 1900 + 100));
                            return cb();
                        }
                        cb();
                        let { stack } = _stackHolder as { stack: string; };
                        if (stack.startsWith("Error\n")) {
                            stack = stack.slice(6);
                        }
                        const err = resBody && typeof resBody === "object" && "code" in resBody ? new GuildedRESTError(res, resBody, options.method, stack) : new GuildedHTTPError(res, resBody, options.method, stack);
                        reject(err);
                        return;
                    }

                    cb();
                    resolve(resBody as T);
                } catch (err){
                    if (err instanceof Error && err.constructor.name === "DOMException" && err.name === "AbortError") {
                        cb();
                        reject(new Error(`Request Timed Out (>${this.options.requestTimeout}ms) on ${options.method} ${options.path}`));
                    }
                    this.#manager.client.emit("error", err as Error);
                }
            }
            if (this.globalBlock && options.auth) {
                (options.priority ? this.readyQueue.unshift.bind(this.readyQueue) : this.readyQueue.push.bind(this.readyQueue))(() => {
                    this.ratelimits[route].queue(attempt.bind(this), options.priority);
                });
            } else {
                this.ratelimits[route].queue(attempt.bind(this), options.priority);
            }
        });
    }
}

// Latency related things are borrowed from Oceanic.js.
