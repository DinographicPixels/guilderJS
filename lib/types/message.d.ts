export interface MessageConstructorParams {
    originalMessageID?: string | null;
}

export interface MessageAttachment {
    originalURL: string;
    signedURL: string | null;
    arrayBuffer: ArrayBuffer | null;
    isImage: boolean;
    fileExtension: string;
}
