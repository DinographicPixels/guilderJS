/** @module ForumThread */
import { Client } from "./Client";
import { Guild } from "./Guild";
import { Member } from "./Member";
import { Base } from "./Base";
import { User } from "./User";
import { ForumThreadComment } from "./ForumThreadComment";
import { ForumChannel } from "./ForumChannel";
import { APIForumTopic, APIForumTopicComment, APIMentions } from "../Constants";
import { EditForumThreadOptions } from "../types/forumThread";
import { CreateForumCommentOptions } from "../types/forumThreadComment";
import TypedCollection from "../util/TypedCollection";
import { JSONForumThread } from "../types/json";
import { AnyTextableChannel } from "../types/channel";

/** Represents a thread/topic coming from a "Forums" channel. */
export class ForumThread<T extends ForumChannel> extends Base<number> {
    private _cachedChannel!: T extends AnyTextableChannel ? T : undefined;
    private _cachedGuild?: T extends Guild ? Guild : Guild | null;
    /** Guild ID */
    guildID: string;
    /** Forum channel id */
    channelID: string;
    /** Name of the thread */
    name: string;
    /** When this forum thread was created. */
    createdAt: Date;
    /** Owner of this thread, if cached. */
    owner: T extends Guild ? Member : Member | User | Promise<Member> | undefined;
    /** The ID of the owner of this thread. */
    ownerID: string;
    /** Timestamp at which this channel was last edited. */
    editedTimestamp: Date | null;
    /** Timestamp (unix epoch time) that the forum thread was bumped at. */
    bumpedAt: Date | null;
    /** Content of the thread */
    content: string;
    /** Thread mentions */
    mentions: APIMentions | null;
    /** Cached comments. */
    comments: TypedCollection<number, APIForumTopicComment, ForumThreadComment>;
    /** If true, the thread is locked. */
    isLocked: boolean;
    /** If true, the thread is pinned. */
    isPinned: boolean;

    /**
     * @param data raw data
     * @param client client
     */
    constructor(data: APIForumTopic, client: Client){
        super(data.id, client);
        this.guildID = data.serverId;
        this.channelID = data.channelId;
        this.name = data.title;
        this.createdAt = new Date(data.createdAt);
        this.ownerID = data.createdBy;
        this.owner =  (this.client.getMember(data.serverId, data.createdBy)
          ?? this.client.users.get(data.createdBy)
          ?? this.client.rest.guilds.getMember(
              data.serverId,
              data.createdBy
          )) as T extends Guild ? Member : Member | User | Promise<Member> | undefined;
        this.editedTimestamp = data.updatedAt ? new Date(data.updatedAt) : null;
        this.bumpedAt = data.bumpedAt ? new Date(data.bumpedAt) : null;
        this.content = data.content;
        this.mentions = data.mentions ?? null;
        this.comments = new TypedCollection(
            ForumThreadComment,
            client,
            client.params.collectionLimits?.threadComments
        );
        this.isLocked = data.isLocked ?? false;
        this.isPinned = data.isPinned ?? false;
        this.update(data);
    }

    override toJSON(): JSONForumThread {
        return {
            ...super.toJSON(),
            guildID:         this.guildID,
            channelID:       this.channelID,
            name:            this.name,
            createdAt:       this.createdAt,
            owner:           this.owner,
            ownerID:         this.ownerID,
            editedTimestamp: this.editedTimestamp,
            bumpedAt:        this.bumpedAt,
            content:         this.content,
            mentions:        this.mentions,
            comments:        this.comments.map(comment => comment.toJSON()),
            isLocked:        this.isLocked,
            isPinned:        this.isPinned
        };
    }

    protected override update(data: APIForumTopic): void {
        if (data.bumpedAt !== undefined) {
            this.bumpedAt = new Date(data.bumpedAt);
        }
        if (data.channelId !== undefined) {
            this.channelID = data.channelId;
        }
        if (data.content !== undefined) {
            this.content = data.content;
        }
        if (data.createdAt !== undefined) {
            this.createdAt = new Date(data.createdAt);
        }
        if (data.createdBy !== undefined) {
            this.ownerID = data.createdBy;
        }
        if (data.id !== undefined) {
            this.id = data.id;
        }
        if (data.isLocked !== undefined) {
            this.isLocked = data.isLocked;
        }
        if (data.mentions !== undefined) {
            this.mentions = data.mentions ?? null;
        }
        if (data.serverId !== undefined) {
            this.guildID = data.serverId;
        }
        if (data.title !== undefined) {
            this.name = data.title;
        }
        if (data.updatedAt !== undefined) {
            this.editedTimestamp = new Date(data.updatedAt);
        }
    }

    /** The guild the thread is in. This will throw an error if the guild isn't cached.*/
    get guild(): T extends Guild ? Guild : Guild | null {
        if (!this._cachedGuild) {
            this._cachedGuild = this.client.getGuild(this.guildID);
            if (!this._cachedGuild) {
                throw new Error(`${this.constructor.name}#guild: couldn't find the Guild in cache.`);
            }
        }
        return this._cachedGuild as T extends Guild ? Guild : Guild | null;
    }

    /** The forum channel this thread was created in.  */
    get channel(): T extends AnyTextableChannel ? T : undefined {
        return this._cachedChannel
          ?? (this._cachedChannel = this.client.getChannel(
              this.guildID,
              this.channelID
          ) as T extends AnyTextableChannel ? T : undefined);
    }

    /** Add a comment to this forum thread.
     * @param options Options of the comment.
     */
    async createForumComment(options: CreateForumCommentOptions): Promise<ForumThreadComment>{
        return this.client.rest.channels.createForumComment(
            this.channelID,
            this.id as number,
            options
        );
    }

    /** Edit the forum thread.
     * @param options Edit options.
     */
    async edit(options: EditForumThreadOptions): Promise<ForumThread<T>> {
        return this.client.rest.channels.editForumThread<T>(
            this.channelID,
            this.id as number,
            options
        );
    }

    /** Delete this forum thread. */
    async delete(): Promise<void> {
        return this.client.rest.channels.deleteForumThread(
            this.channelID,
            this.id as number
        );
    }

    /** Pin this forum thread. */
    async pin(): Promise<void> {
        return this.client.rest.channels.pinForumThread(this.channelID, this.id as number);
    }

    /** Unpin this forum thread. */
    async unpin(): Promise<void> {
        return this.client.rest.channels.unpinForumThread(this.channelID, this.id as number);
    }

    /** Lock this forum thread. */
    async lock(): Promise<void> {
        return this.client.rest.channels.lockForumThread(this.channelID, this.id as number);
    }

    /** Unlock this forum thread. */
    async unlock(): Promise<void> {
        return this.client.rest.channels.unlockForumThread(this.channelID, this.id as number);
    }

    /** Add a reaction to this forum thread.
     * @param emoteID ID of the emote to be added.
     */
    async createReaction(emoteID: number): Promise<void> {
        return this.client.rest.channels.createReaction(
            this.channelID,
            "ForumThread",
            this.id as number,
            emoteID
        );
    }

    /** Remove a reaction from this forum thread.
     * @param emoteID ID of the emote to be added.
     */
    async deleteReaction(emoteID: number): Promise<void> {
        return this.client.rest.channels.deleteReaction(
            this.channelID,
            "ForumThread",
            this.id as number,
            emoteID
        );
    }
}
