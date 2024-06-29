/** @module MemberInfo */
import type { Client } from "./Client";
import type { Guild } from "./Guild";
import type { Member } from "./Member";
import type { GatewayEvent_ServerMemberUpdated as GWMUpdated, GatewayEvent_ServerRolesUpdated as GWMRolesUpdated, GatewayEvent_ServerMemberRemoved as GWMRemoved, GatewayEvent_ServerMemberSocialLinkUpdated as GWSocialLink } from "../Constants";

/** Base class for member information classes. */
export abstract class MemberInfo {
    /** Client. */
    client!: Client;
    /** ID of the guild where the member came from. */
    guildID: string;
    /** ID of the member. */
    memberID: string;
    constructor(
        data: GWMUpdated
        | GWMRemoved
        | GWMRolesUpdated
        | GWSocialLink,
        memberID: string,
        client: Client
    ) {
        this.client! = client;
        this.guildID = data.serverId;
        this.memberID = memberID;
    }

    get guild(): Guild | Promise<Guild> {
        return this.client!.guilds.get(this.guildID) ?? this.client!.rest.guilds.getGuild(this.guildID);
    }

    get member(): Member | Promise<Member> {
        return this.client!.getGuild(this.guildID)?.members.get(this.memberID)
          ?? this.client!.rest.guilds.getMember(this.guildID, this.memberID);
    }
}
