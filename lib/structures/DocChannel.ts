/** @module DocChannel */
import { Client } from "./Client";

import { Doc } from "./Doc";
import { GuildChannel } from "./GuildChannel";
import type { APIDoc, APIGuildChannel } from "../Constants";
import TypedCollection from "../util/TypedCollection";
import { JSONDocChannel } from "../types/json";
import { CreateDocOptions, EditDocOptions } from "../types/doc";

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

/** Represents a "docs" channel. */
export class DocChannel extends GuildChannel {
    /** Cached docs. */
    docs: TypedCollection<number, APIDoc, Doc>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: APIGuildChannel, client: Client){
        super(data, client);
        this.docs = new TypedCollection(Doc, client, client.params.collectionLimits?.docs);
        this.update(data);
    }

    /** Create a doc in this channel.
     * @param options Doc's options.
     */
    async createDoc(options: CreateDocOptions): Promise<Doc> {
        return this.client.rest.channels.createDoc(this.id, options);
    }

    /** Edit a doc from this channel.
     * @param docID ID of a doc.
     * @param options Edit options.
     */
    async editDoc(docID: number, options: EditDocOptions): Promise<Doc> {
        return this.client.rest.channels.editDoc(this.id, docID, options);
    }

    /** Delete a doc from this channel.
     * @param docID ID of a doc.
     */
    async deleteDoc(docID: number): Promise<void> {
        return this.client.rest.channels.deleteDoc(this.id, docID);
    }

    override toJSON(): JSONDocChannel {
        return {
            ...super.toJSON(),
            docs: this.docs.map(doc => doc.toJSON())
        };
    }
}
