/** @module Base */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";
import { JSONBase } from "../types";
import { inspect } from "node:util";

/** Default information that every other structure has. */
export abstract class Base<ID= string | number> {
    /** Bot's client. */
    client!: Client;
    /** Item ID */
    id: ID;
    constructor(id: ID, client: Client){
        this.id = id;
        Object.defineProperty(this, "client", {
            value:        client,
            enumerable:   false,
            writable:     false,
            configurable: false
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    protected update(data: unknown): void {}

    /** @hidden */
    [inspect.custom](): this {
        // https://stackoverflow.com/questions/5905492/dynamic-function-name-in-javascript
        const copy = new { [this.constructor.name]: class {} }[this.constructor.name]() as this;
        for (const key in this) {
            if (Object.hasOwn(this, key) && !key.startsWith("_") && this[key] !== undefined) {
                copy[key] = this[key];
            }
        }

        return copy;
    }

    toJSON(): JSONBase<ID> {
        return {
            id: this.id
        };
    }
}
