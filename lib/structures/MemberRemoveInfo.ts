/** @module MemberRemoveInfo */
import { Client } from "./Client";
import { MemberInfo } from "./MemberInfo";
import { GatewayEvent_ServerMemberRemoved } from "../Constants";

/** Information about a removed member. */
export class MemberRemoveInfo extends MemberInfo {
    /** If set to true, the member left because he has been kicked. */
    isKick?: boolean;
    /** If set to true, the member left because he has been banned. */
    isBan?: boolean;
    /**
     * @param data raw data.
     * @param memberID ID of the member.
     * @param client client.
     */
    constructor(
        data: GatewayEvent_ServerMemberRemoved,
        memberID: string,
        client: Client
    ) {
        super(data, memberID, client);
        this.isKick = data.isKick;
        this.isBan = data.isBan;
    }
}
