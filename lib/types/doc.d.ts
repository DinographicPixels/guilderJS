
//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

export interface CreateDocOptions {
    /** Title of the doc. */
    title: string;
    /** Content of the doc. */
    content: string;
}

export interface EditDocOptions {
    /** New doc title. */
    title?: string;
    /** New doc content. */
    content?: string;
}

export interface GetDocsFilter {
    /** An ISO 8601 timestamp that will be used to filter out results for the current page */
    before?: string;
    /** The max size of the page (default `25`; min `1`; max `100`) */
    limit?: number;
}
