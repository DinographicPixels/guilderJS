/** @module GuildedRESTError */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RESTMethod } from "../Constants";
import type { Headers, Response } from "undici";

/** A REST error received from Discord. */
/** Credits to Ocanic.js  */
export default class GuildedRESTError extends Error {
    code: number | null;
    method: RESTMethod;
    override name = "GuildedRESTError";
    resBody: Record<string, unknown> | null;
    response: Response;
    constructor(res: Response, resBody: Record<string, unknown>, method: RESTMethod, stack?: string) {
        super();
        this.code = Number(resBody.code) ?? null;
        this.method = method;
        this.response = res;
        this.resBody = resBody as GuildedRESTError["resBody"];

        let message = "message" in resBody
            ? `${(resBody as {message: string; }).message} on ${this.method} ${this.path}`
            : `Unknown Error on ${this.method} ${this.path}`;
        if ("errors" in resBody) {
            message += `\n ${GuildedRESTError.flattenErrors((resBody as { errors: Record<string, unknown>;}).errors).join("\n ")}`;
        } else {
            const errors = GuildedRESTError.flattenErrors(resBody);
            if (errors.length !== 0) {
                message += `\n ${errors.join("\n ")}`;
            }
        }
        Object.defineProperty(this, "message", {
            enumerable: false,
            value:      message
        });
        if (stack) {
            this.stack = `${this.name}: ${this.message}\n${stack}`;
        } else {
            Error.captureStackTrace(this, GuildedRESTError);
        }
    }

    static flattenErrors(errors: Record<string, unknown>, keyPrefix = ""): Array<string> {
        let messages: Array<string> = [];
        for (const fieldName in errors) {
            if (!Object.hasOwn(errors, fieldName) || fieldName === "message" || fieldName === "code") {
                continue;
            }
            if ("_errors" in (errors[fieldName] as object)) {
                messages = messages.concat((errors[fieldName] as { _errors: Array<{ message: string; }>; })._errors.map((err: { message: string; }) => `${`${keyPrefix}${fieldName}`}: ${err.message}`));
            } else if (Array.isArray(errors[fieldName])) {
                messages = messages.concat((errors[fieldName] as Array<string>).map(str => `${`${keyPrefix}${fieldName}`}: ${str}`));
            } else if (typeof errors[fieldName] === "object") {
                messages = messages.concat(GuildedRESTError.flattenErrors(errors[fieldName] as Record<string, unknown>, `${keyPrefix}${fieldName}.`));
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
