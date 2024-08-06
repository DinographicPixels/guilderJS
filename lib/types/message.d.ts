import { AnyTextableChannel } from "./channel";
import { Message } from "../structures/Message";

export interface MessageConstructorParams {
    originalResponseID?: string | null;
    originalTriggerID?: string | null;
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
