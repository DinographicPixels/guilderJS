/** @module Routes/Misc */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import type { RESTManager } from "../rest/RESTManager";
import * as endpoints from "../rest/endpoints";
import type { GETGuildMemberSocialsResponse, GETUserResponse, GETUserServersResponse, PUTUserStatusBody } from "../Constants";
import type { User } from "../structures/User";
import { SocialLink } from "../structures/SocialLink";
import { Guild } from "../structures/Guild";
import { AppUser } from "../structures/AppUser";
import type { RawAppUser } from "../types";
import type { POSTURLSignatureBody, POSTURLSignatureResponse } from "guildedapi-types.ts/v1";

/** Miscellaneous routes. */
export class Miscellaneous {
    #manager: RESTManager;
    /**
     * @param manager REST Manager needed to execute request.
     */
    constructor(manager: RESTManager){
        this.#manager = manager;
    }

    /**
     * Delete a user's status, this includes the app's one.
     * @param userID User ID (@me can be used).
     */
    async deleteUserStatus(userID: string): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "DELETE",
            path:   endpoints.USER_STATUS(userID)
        });
    }

    /** Get Application/Client Partial User
     * (and sets Client#user if REST Mode is enabled).
     */
    async getAppUser(): Promise<AppUser> {
        return this.#manager.authRequest<GETUserResponse>({
            method: "GET",
            path:   endpoints.USER("@me")
        }).then(data => {
            const appUser = new AppUser(
                data.user as RawAppUser,
                this.#manager.client
            );
            if (this.#manager.client.params.restMode)
                this.#manager.client.user = appUser;
            return appUser;
        });
    }

    /** Get a specified social link from the member, if member is connected to them through Guilded.
     * @param guildID The ID of the guild the member is in.
     * @param memberID The ID of the member to get their social link.
     * @param socialMediaName Name of a social media linked to this member.
     */
    async getSocialLink(guildID: string, memberID: string, socialMediaName: string): Promise<SocialLink> {
        return this.#manager.authRequest<GETGuildMemberSocialsResponse>({
            method: "GET",
            path:   endpoints.GUILD_MEMBER_SOCIALS(guildID, memberID, socialMediaName)
        }).then(data => new SocialLink(data.socialLink, this.#manager.client));
    }

    /**
     * Get a user.
     *
     * If you'd like to get the App User, we recommend to use Client#user
     * or request it using Misc#getAppUser.
     * @param userID The ID of the user to get.
     */
    async getUser(userID: string): Promise<User> {
        if (userID === "@me")
            throw new Error(
                "Cannot get App User, please use Client#user or " +
              "request it using Misc#getAppUser"
            );
        return this.#manager.authRequest<GETUserResponse>({
            method: "GET",
            path:   endpoints.USER(userID)
        }).then(data => this.#manager.client.util.updateUser(data.user));
    }


    /**
     * Retrieve user's joined servers.
     * @param userID ID of the user. (`@me` can be used to select your instance)
     */
    async getUserGuilds(userID: string): Promise<Array<Guild>> {
        return this.#manager.authRequest<GETUserServersResponse>({
            method: "GET",
            path:   endpoints.USER_SERVERS(userID)
        }).then(data =>
            data.servers.map(d =>
                new Guild(d, this.#manager.client)
            )
        );
    }

    /**
     * Create a URL Signature from a Guilded CDN URL. (RAW API RESPONSE)
     *
     * Due to restrictions imposed by the Guilded API CDN,
     * you are required to sign the file's CDN URL in order to access its content,
     * and have to store it (within 5 minutes as the signed URL will expire)
     * appropriately as you can only create a new signed URL of the same file
     * each day.
     *
     * More information about it on the Guilded API Documentation.
     *
     * Note that TouchGuild doesn't provide a built-in handler for CDN assets.
     * @param options Signature options
     */
    async signURL(options: POSTURLSignatureBody): Promise<POSTURLSignatureResponse> {
        return this.#manager.authRequest<POSTURLSignatureResponse>({
            method: "POST",
            path:   endpoints.URL_SIGNATURES(),
            json:   options
        });
    }
    /**
     * Change a user's status, this includes the app's one.
     * @param userID User ID (@me can be used).
     * @param options Status options
     */
    async updateUserStatus(userID: string, options: PUTUserStatusBody): Promise<void> {
        return this.#manager.authRequest<void>({
            method: "PUT",
            path:   endpoints.USER_STATUS(userID),
            json:   options
        });
    }
}
