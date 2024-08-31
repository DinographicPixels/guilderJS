import type { AnyChannel, ApplicationCommandOption, InteractionOptionWrapperData, MessageAttachment } from "../types";
import type { Client } from "../structures/Client";
import { ApplicationCommandOptionType } from "../Constants";
import { fetch } from "undici";
import type { APIURLSignature } from "guildedapi-types.ts/v1";

export class InteractionOptionWrapper {
    #client: Client;
    #data: InteractionOptionWrapperData;
    requiredOptions: Array<ApplicationCommandOption>;
    values: Array<string | number | boolean>;
    constructor(data: InteractionOptionWrapperData, client: Client) {
        this.#data = data;
        this.#client = client;
        this.values = this.extractValues(data.content);
        this.requiredOptions =
          data.applicationCommand.options ?
              data.applicationCommand.options
                  .filter(opt => opt.required)
              : [];
    }

    private extractValues(text: string): Array<string | number> {
        const quotedPattern = /"([^"]*)"/g;
        const quotedMatches: Array<string> = [];
        let match: RegExpExecArray | null;

        let textWithoutQuotes = text;
        while ((match = quotedPattern.exec(text)) !== null) {
            quotedMatches.push(match[1]);
            textWithoutQuotes = textWithoutQuotes.replace(match[0], "");
        }

        const segments = textWithoutQuotes
            .split(/(\s+)/)
            .filter(val => val.trim() !== "")
            .map(val => val
                .replace(/^<[#&@]([\w-]+)>$/, "$1")
                .replace(/^<@&([\w-]+)>$/, "$1")
            );

        let result: Array<string | number> = [];
        let segmentIndex = 0;

        for (const part of text.split(/("[^"]*")/)) {
            if (part.startsWith('"') && part.endsWith('"')) {
                result.push(part.slice(1, -1)); // Remove the surrounding quotes
            } else {
                for (const word of part.split(/\s+/)) {
                    if (word.trim() !== "") {
                        const cleanedWord = segments[segmentIndex++];
                        if (cleanedWord) result.push(cleanedWord);
                    }
                }
            }
        }

        while (segmentIndex < segments.length) {
            result.push(segments[segmentIndex++]);
        }

        result.shift();
        if (this.#data.executionType === "full")
            result.shift();

        result = result.map(val => isNaN(Number(val)) ? val : Number(val));

        return result;
    }
    private getMentionOptions<T = string | number | boolean>(name: string, type: ApplicationCommandOptionType): { name: string; value: T; } | undefined {
        if (!this.#data.applicationCommand) return;
        const optionIndex =
          this.#data.applicationCommand.options?.findIndex(opt =>
              opt.name === name
            && opt.type === type
          );

        if (!optionIndex && optionIndex !== 0 || this.values?.[optionIndex] === undefined) return;

        if (type === ApplicationCommandOptionType.CHANNEL
          && !this.#data.mentions?.channels?.map(channel => channel.id).includes(this.values[optionIndex].toString())
          || type === ApplicationCommandOptionType.ROLE
          && !this.#data.mentions?.roles?.map(channel => channel.id).includes(Number(this.values[optionIndex]))
          || type === ApplicationCommandOptionType.USER
          && !this.#data.mentions?.users?.map(channel => channel.id).includes(this.values[optionIndex].toString())
          || type === ApplicationCommandOptionType.STRING
          && typeof this.values[optionIndex] !== "string"
          || type === ApplicationCommandOptionType.INTEGER
          && (
              typeof this.values[optionIndex] !== "number"
              || !Number.isFinite(this.values[optionIndex])
              || !Number.isInteger(this.values[optionIndex])
          )
          || type === ApplicationCommandOptionType.NUMBER
          && (
              typeof this.values[optionIndex] !== "number"
              || !Number.isFinite(this.values[optionIndex])
          )
          || type === ApplicationCommandOptionType.FLOAT
          && (
              typeof this.values[optionIndex] !== "number"
            || !Number.isFinite(this.values[optionIndex])
            || Number.isInteger(this.values[optionIndex])
          )
          || type === ApplicationCommandOptionType.SIGNED_32_INTEGER
          && (
              typeof this.values[optionIndex] !== "number"
            || !Number.isFinite(this.values[optionIndex])
            || !Number.isInteger(this.values[optionIndex])
            || Number(this.values[optionIndex]) < -2147483648
            || Number(this.values[optionIndex]) > 2147483647
          )
          || type === ApplicationCommandOptionType.EMBEDDED_ATTACHMENT
          && (
              typeof this.values[optionIndex] !== "string"
            || !this.values[optionIndex].toString().includes("![](https://cdn.gilcdn.com/")
          )
          || type === ApplicationCommandOptionType.BOOLEAN
          && (
              typeof this.values[optionIndex] === "string"
            && ((this.values[optionIndex] as string)?.toLowerCase() !== "true"
            && (this.values[optionIndex] as string)?.toLowerCase() !== "false")
            || typeof this.values[optionIndex] === "number"
            && (this.values[optionIndex] !== 1
            && this.values[optionIndex] !== 0)
          )
          || type === ApplicationCommandOptionType.EMOTE
          && typeof this.values[optionIndex] !== "string"
          && (
              typeof this.values[optionIndex] !== "number"
            || this.values[optionIndex] > 9999999
            || this.values[optionIndex] < 1000000
          )
        ) return;
        if (type === ApplicationCommandOptionType.INTEGER)
            this.values[optionIndex] = Math.trunc(Number(this.values[optionIndex]));
        if (type === ApplicationCommandOptionType.EMBEDDED_ATTACHMENT) {
            const regExp = /!\[]\((https:\/\/[^)]+)\)/g;
            const regExpArray: Array<string> = regExp.exec(this.values[optionIndex].toString()) ?? [];
            this.values[optionIndex] = regExpArray[0];
        }
        if (type === ApplicationCommandOptionType.BOOLEAN)
            this.values[optionIndex] = Boolean(this.values[optionIndex]);
        if (type === ApplicationCommandOptionType.EMOTE && typeof this.values[optionIndex] !== "number") {
            const emoteID = Number((this.values[optionIndex] as string)?.match(/<:\w+:(\d+)>/)?.[1]);
            if (isNaN(emoteID)) return;
            this.values[optionIndex] = emoteID;
        }

        return {
            name,
            value: this.values[optionIndex] as T
        };
    }

    /**
     * Get attachments from this Message (using REST)
     * *(works for embedded content such as images).*
     */
    async getAttachment(name: string, required?: false): Promise<MessageAttachment | undefined>;
    async getAttachment(name: string, required: true): Promise<MessageAttachment>;
    async getAttachment(name: string, required?: boolean): Promise<MessageAttachment | undefined> {
        const imageExtensions = new Set(["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"]);

        const attachmentURL = this.getAttachmentOption(name)?.value;
        if (!attachmentURL && required) throw new Error("Couldn't get attachment.");
        if (!attachmentURL) return;

        // Signing URL
        let signedURL: APIURLSignature | null = null;
        try {
            signedURL = (await this.#client.rest.misc.signURL({
                urls: [attachmentURL]
            })).urlSignatures[0];
        } catch {
            this.#client.emit(
                "error",
                new Error("Couldn't automatically sign attachment CDN URL.")
            );
        }

        const URLObject = new URL(attachmentURL);
        const pathName = URLObject.pathname;
        const extension = pathName.split(".").pop()?.toLowerCase() || "";
        const isImage = imageExtensions.has(extension);

        let arrayBuffer: ArrayBuffer | null = null;

        try {
            if (isImage) {
                const fetchData = await fetch(attachmentURL);
                arrayBuffer = await fetchData.arrayBuffer();
            }
        } catch {
            throw new Error("Couldn't get image ArrayBuffer data.");
        }

        return {
            originalURL:   attachmentURL,
            signedURL:     signedURL?.signature ?? null,
            isImage,
            arrayBuffer,
            fileExtension: extension
        };
    }


    getAttachmentOption(name: string, required?: false): { name: string; value: string; } | undefined;
    getAttachmentOption(name: string, required: true): { name: string; value: string; };
    getAttachmentOption(name: string, required?: boolean): { name: string; value: string; } | undefined {
        const option = this.getMentionOptions<string>(
            name,
            ApplicationCommandOptionType.EMBEDDED_ATTACHMENT
        );
        if (option === undefined && required) throw new Error("Couldn't get embedded attachment option.");
        return option;
    }

    getBooleanOption(name: string, required?: false): { name: string; value: boolean; } | undefined;
    getBooleanOption(name: string, required: true): { name: string; value: boolean; };
    getBooleanOption(name: string, required?: boolean): { name: string; value: boolean; } | undefined {
        const option = this.getMentionOptions<boolean>(
            name,
            ApplicationCommandOptionType.BOOLEAN
        );
        if (option === undefined && required) throw new Error("Couldn't get boolean option.");
        return option;
    }

    getChannel<T extends AnyChannel = AnyChannel>(name: string, required?: false): T | undefined;
    getChannel<T extends AnyChannel = AnyChannel>(name: string, required: true): T;
    getChannel<T extends AnyChannel = AnyChannel>(name: string, required?: boolean): T | undefined {
        const option = this.getChannelOption(name, false);
        const channel = this.#client.getChannel<T>(this.#data.guildID, option?.value ?? "none");
        if (!channel || option === undefined && required) throw new Error("Couldn't get channel from cache.");
        return channel;
    }
    getChannelOption(name: string, required?: false): { name: string; value: string; } | undefined;
    getChannelOption(name: string, required: true): { name: string; value: string; };
    getChannelOption(name: string, required?: boolean): { name: string; value: string; } | undefined {
        const option = this.getMentionOptions<string>(
            name,
            ApplicationCommandOptionType.CHANNEL
        );
        if (option === undefined && required) throw new Error("Couldn't get channel option.");
        return option;
    }

    getEmoteOption(name: string, required?: false): { name: string; value: number; } | undefined;
    getEmoteOption(name: string, required: true): { name: string; value: number; };
    getEmoteOption(name: string, required?: boolean): { name: string; value: number; } | undefined {
        const option = this.getMentionOptions<number>(
            name,
            ApplicationCommandOptionType.EMOTE
        );
        if (option === undefined && required) throw new Error("Couldn't get emote option.");
        return option;
    }

    getFloatOption(name: string, required?: false): { name: string; value: number; } | undefined;
    getFloatOption(name: string, required: true): { name: string; value: number; };
    getFloatOption(name: string, required?: boolean): { name: string; value: number; } | undefined {
        const option = this.getMentionOptions<number>(
            name,
            ApplicationCommandOptionType.FLOAT
        );
        if (option === undefined && required) throw new Error("Couldn't get float option.");
        return option;
    }

    getIntegerOption(name: string, required?: false): { name: string; value: number; } | undefined;
    getIntegerOption(name: string, required: true): { name: string; value: number; };
    getIntegerOption(name: string, required?: boolean): { name: string; value: number; } | undefined {
        const option = this.getMentionOptions<number>(
            name,
            ApplicationCommandOptionType.INTEGER
        );
        if (option === undefined && required) throw new Error("Couldn't get integer option.");
        return option;
    }

    getNumberOption(name: string, required?: false): { name: string; value: number; } | undefined;
    getNumberOption(name: string, required: true): { name: string; value: number; };
    getNumberOption(name: string, required?: boolean): { name: string; value: number; } | undefined {
        const option = this.getMentionOptions<number>(
            name,
            ApplicationCommandOptionType.NUMBER
        );
        if (option === undefined && required) throw new Error("Couldn't get number option.");
        return option;
    }

    getRoleOption(name: string, required?: false): { name: string; value: number; } | undefined;
    getRoleOption(name: string, required: true): { name: string; value: number; };
    getRoleOption(name: string, required?: boolean): { name: string; value: number; } | undefined {
        const option = this.getMentionOptions<number>(
            name,
            ApplicationCommandOptionType.ROLE
        );
        if (option === undefined && required) throw new Error("Couldn't get role option.");
        return option;
    }

    getSigned32IntOption(name: string, required?: false): { name: string; value: number; } | undefined;
    getSigned32IntOption(name: string, required: true): { name: string; value: number; };
    getSigned32IntOption(name: string, required?: boolean): { name: string; value: number; } | undefined {
        const option = this.getMentionOptions<number>(
            name,
            ApplicationCommandOptionType.SIGNED_32_INTEGER
        );
        if (option === undefined && required) throw new Error("Couldn't get signed 32-bit integer option.");
        return option;
    }

    getStringOption(name: string, required?: false): { name: string; value: string; } | undefined;
    getStringOption(name: string, required: true): { name: string; value: string; };
    getStringOption(name: string, required?: boolean): { name: string; value: string; } | undefined {
        const option = this.getMentionOptions<string>(
            name,
            ApplicationCommandOptionType.STRING
        );
        if (option === undefined && required) throw new Error("Couldn't get string option.");
        return option;
    }


    getUserOption(name: string, required?: false): { name: string; value: string; } | undefined;
    getUserOption(name: string, required: true): { name: string; value: string; };
    getUserOption(name: string, required?: boolean): { name: string; value: string; } | undefined {
        const option = this.getMentionOptions<string>(
            name,
            ApplicationCommandOptionType.USER
        );
        if (option === undefined && required) throw new Error("Couldn't get user option.");
        return option;
    }

    hasMentionedEveryone(): boolean {
        return this.#data.mentions?.everyone ?? false;
    }

    hasMentionedHere(): boolean {
        return this.#data.mentions?.here ?? false;
    }

    verifyOptions(): { incorrect: Array<string>; missing: Array<string>; total: Array<string>; } {
        const missing = [];
        const incorrect = [];
        const total = [];
        for (const option of this.requiredOptions) {
            const optionIndex =
              this.requiredOptions.findIndex(opt =>
                  opt.name === option.name
                && opt.type === option.type
              );
            switch (option.type) {
                case ApplicationCommandOptionType.STRING: {
                    const value = this.getStringOption(option.name)?.value;
                    if (!value && !this.values[optionIndex]) missing.push(option.name);
                    if (!value && this.values[optionIndex]) incorrect.push(option.name);
                    if (!value) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.INTEGER: {
                    const value = this.getIntegerOption(option.name)?.value;
                    if (value === undefined && !this.values[optionIndex]) missing.push(option.name);
                    if (value === undefined && this.values[optionIndex]) incorrect.push(option.name);
                    if (value === undefined) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.FLOAT: {
                    const value = this.getFloatOption(option.name)?.value;
                    if (value === undefined && !this.values[optionIndex]) missing.push(option.name);
                    if (value === undefined && this.values[optionIndex]) incorrect.push(option.name);
                    if (value === undefined) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.SIGNED_32_INTEGER: {
                    const value = this.getSigned32IntOption(option.name)?.value;
                    if (value === undefined && !this.values[optionIndex]) missing.push(option.name);
                    if (value === undefined && this.values[optionIndex]) incorrect.push(option.name);
                    if (value === undefined) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.NUMBER: {
                    const value = this.getNumberOption(option.name)?.value;
                    if (value === undefined && !this.values[optionIndex]) missing.push(option.name);
                    if (value === undefined && this.values[optionIndex]) incorrect.push(option.name);
                    if (value === undefined) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.ROLE: {
                    const value = this.getRoleOption(option.name)?.value;
                    if (!value && !this.values[optionIndex]) missing.push(option.name);
                    if (!value && this.values[optionIndex]) incorrect.push(option.name);
                    if (!value) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.USER: {
                    const value = this.getUserOption(option.name)?.value;
                    if (!value && !this.values[optionIndex]) missing.push(option.name);
                    if (!value && this.values[optionIndex]) incorrect.push(option.name);
                    if (!value) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.CHANNEL: {
                    const value = this.getChannelOption(option.name)?.value;
                    if (!value && !this.values[optionIndex]) missing.push(option.name);
                    if (!value && this.values[optionIndex]) incorrect.push(option.name);
                    if (!value) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.EMBEDDED_ATTACHMENT: {
                    const value = this.getAttachmentOption(option.name)?.value;
                    if (!value && !this.values[optionIndex]) missing.push(option.name);
                    if (!value && this.values[optionIndex]) incorrect.push(option.name);
                    if (!value) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.BOOLEAN: {
                    const value = this.getBooleanOption(option.name)?.value;
                    if (value === undefined && !this.values[optionIndex]) missing.push(option.name);
                    if (value === undefined && this.values[optionIndex]) incorrect.push(option.name);
                    if (value === undefined) total.push(option.name);
                    break;
                }
                case ApplicationCommandOptionType.EMOTE: {
                    const value = this.getEmoteOption(option.name)?.value;
                    if (value === undefined && !this.values[optionIndex]) missing.push(option.name);
                    if (value === undefined && this.values[optionIndex]) incorrect.push(option.name);
                    if (value === undefined) total.push(option.name);
                    break;
                }
            }
        }
        return {
            missing,
            incorrect,
            total
        };
    }
}
