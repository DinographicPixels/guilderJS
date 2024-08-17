/** @module GuildedHTTPError */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RESTMethod } from "../Constants";
import type { Headers, Response } from "undici";

/** An HTTP error received from Guilded. */
/** Credits to Oceanic.js  */
export default class GuildedHTTPError extends Error {
    method: RESTMethod;
    override name = "GuildedHTTPError";
    resBody: Record<string, unknown> | null;
    response: Response;
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
    constructor(res: Response, resBody: unknown | null, method: RESTMethod, stack?: string) {
        super();
        this.method = method;
        this.response = res;
        this.resBody = resBody as GuildedHTTPError["resBody"];

        let message = `${res.status} ${res.statusText} on ${this.method} ${this.path}`;
        const errors = GuildedHTTPError.flattenErrors(resBody as Record<string, unknown>);
        if (errors.length !== 0) {
            message += `\n  ${errors.join("\n  ")}`;
        }
        Object.defineProperty(this, "message", {
            enumerable: false,
            value:      message
        });
        if (stack) {
            this.stack = this.name + ": " + this.message + "\n" + stack;
        } else {
            Error.captureStackTrace(this, GuildedHTTPError);
        }
    }

    static flattenErrors(errors: Record<string, unknown>, keyPrefix = ""): Array<string> {
        let messages: Array<string> = [];
        for (const fieldName in errors) {
            if (!Object.hasOwn(errors, fieldName) || fieldName === "message" || fieldName === "code") {
                continue;
            }
            if (Array.isArray(errors[fieldName])) {
                messages = messages.concat((errors[fieldName] as Array<string>)
                    .map(str => `${keyPrefix}${fieldName}: ${str}`));
            }
        }
        return messages;
    }

    get headers(): Headers {
        return this.response.headers;
    }
    get path(): string {
        return new URL(this.response.url).pathname;
    }
    get status(): number {
        return this.response.status;
    }
    get statusText(): string {
        return this.response.statusText;
    }

    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    toJSON() {
        return {
            message: this.message,
            method:  this.method,
            name:    this.name,
            resBody: this.resBody,
            stack:   this.stack ?? ""
        };
    }
}
