
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

export interface CreateForumThreadOptions {
    /** Forum thread's title. */
    title: string;
    /** Content of the thread. */
    content: string;
}

export interface EditForumThreadOptions {
    /** New forum thread's title. */
    title?: string;
    /** New content of the thread. */
    content?: string;
}

export interface GetForumThreadsFilter {
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** Limit the number of threads that will output. */
    limit?: number;
}
