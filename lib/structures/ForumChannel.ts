/** @module ForumChannel */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { Client } from "./Client";

import { ForumThread } from "./ForumThread";
import { GuildChannel } from "./GuildChannel";
import TypedCollection from "../util/TypedCollection";
import type {
    JSONForumChannel,
    CreateForumThreadOptions,
    EditForumThreadOptions,
    RawForumThread,
    RawChannel
} from "../types";

/** Represents a forum channel. */
export class ForumChannel extends GuildChannel {
    /** Cached threads. */
    threads: TypedCollection<number, RawForumThread, ForumThread<ForumChannel>>;
    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: RawChannel, client: Client){
        super(data, client);
        this.threads = new TypedCollection(
            ForumThread,
            client,
            client.params.collectionLimits?.threads
        );
        this.update(data);
    }

    /** Create a thread in this channel.
     * @param options Thread's options including title & content.
     */
    async createThread(options: CreateForumThreadOptions): Promise<ForumThread<ForumChannel>> {
        return this.client.rest.channels.createForumThread(this.id, options);
    }

    /** Delete a thread from this channel.
     * @param threadID ID of a thread.
     */
    async deleteThread(threadID: number): Promise<void> {
        return this.client.rest.channels.deleteForumThread(this.id, threadID);
    }

    /** Edit a thread from this channel.
     * @param threadID ID of a thread.
     * @param options Edit options.
     */
    async editThread(threadID: number, options: EditForumThreadOptions): Promise<ForumThread<ForumChannel>> {
        return this.client.rest.channels.editForumThread(this.id, threadID, options);
    }

    /** Lock a thread.
     * @param threadID ID of a thread.
     */
    async lockThread(threadID: number): Promise<void> {
        return this.client.rest.channels.lockForumThread(this.id, threadID);
    }

    /** Pin a thread.
     * @param threadID ID of a thread.
     */
    async pinThread(threadID: number): Promise<void> {
        return this.client.rest.channels.pinForumThread(this.id, threadID);
    }

    override toJSON(): JSONForumChannel {
        return {
            ...super.toJSON(),
            threads: this.threads.map(thread => thread.toJSON())
        };
    }

    /** Unlock a thread.
     * @param threadID ID of a thread.
     */
    async unlockThread(threadID: number): Promise<void> {
        return this.client.rest.channels.unlockForumThread(this.id, threadID);
    }

    /** Unpin a thread.
     * @param threadID ID of a thread.
     */
    async unpinThread(threadID: number): Promise<void> {
        return this.client.rest.channels.unpinForumThread(this.id, threadID);
    }
}
