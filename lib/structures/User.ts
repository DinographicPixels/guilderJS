/** @module User */
import { Client } from "./Client";
import { Base } from "./Base";
import { UserTypes, APIUser, APIGuildMember, APIUserSummary } from "../Constants";
import { JSONUser } from "../types/json";

/** Represents a user. */
export class User extends Base<string> {
    /** User type */
    type: UserTypes | null;
    /** User's username. */
    username: string;
    /** Current avatar url of the user. */
    avatarURL: string | null;
    /** Current banned url of the user. */
    bannerURL: string | null;
    /** When the user account was created. */
    createdAt: Date; // user.
    /** If true, the user is a bot. */
    bot: boolean;

    /**
     * @param data raw data.
     * @param client client.
     */
    constructor(data: APIUser, client: Client){
        super(data.id, client);
        this.type = data.type ?? null;
        this.username = data.name;
        this.createdAt = new Date(data.createdAt);
        this.avatarURL = data.avatar ?? null;
        this.bannerURL = data.banner ?? null;

        if (!this.type) this.type = "user"; // as it is undefined when the user is a bot.
        this.bot = this.type === "bot";

        this.update(data);
    }

    override toJSON(): JSONUser {
        return {
            ...super.toJSON(),
            type:      this.type,
            username:  this.username,
            createdAt: this.createdAt,
            avatarURL: this.avatarURL,
            bannerURL: this.bannerURL,
            bot:       this.bot
        };
    }

    protected override update(
        d: APIUser
        | APIGuildMember
        | APIUserSummary
    ): void {
        const data = d as APIUser;
        if (data.avatar !== undefined) {
            this.avatarURL = data.avatar ?? null;
        }
        if (data.banner !== undefined) {
            this.bannerURL = data.banner ?? null;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.name !== undefined) {
            this.username = data.name;
        }
        if (data.type !== undefined) {
            this.type = data.type ?? null;
        }
    }
}
