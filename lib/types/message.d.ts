import { AnyTextableChannel } from "./channel";
import { Message } from "../structures/Message";

export interface MessageConstructorParams {
    originals?: {
        responseID?: string | null;
        triggerID?: string | null;
    };
}

export interface MessageAttachment {
    originalURL: string;
    signedURL: string | null;
    arrayBuffer: ArrayBuffer | null;
    isImage: boolean;
    fileExtension: string;
}

export interface MessageOriginals {
    triggerMessage: Message<AnyTextableChannel> | null;
    originalResponse: Message<AnyTextableChannel> | null;
}
