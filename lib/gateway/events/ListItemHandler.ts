/** @module ListItemHandler */

//
// Created by Wade (@pakkographic)
// Copyright (c) 2024 DinographicPixels. All rights reserved.
//

import { GatewayEventHandler } from "./GatewayEventHandler";
import { ListItem } from "../../structures/ListItem";
import type {
    GatewayEvent_ListItemCompleted,
    GatewayEvent_ListItemCreated,
    GatewayEvent_ListItemDeleted,
    GatewayEvent_ListItemUncompleted,
    GatewayEvent_ListItemUpdated
} from "../../Constants";

/** Internal component, emitting list events. */
export class ListItemHandler extends GatewayEventHandler{
    listItemComplete(data: GatewayEvent_ListItemCompleted): void {
        const ListItemComponent = new ListItem(data.listItem, this.client);
        this.client.emit("listItemComplete", ListItemComponent);
    }
    listItemCreate(data: GatewayEvent_ListItemCreated): void {
        const ListItemComponent = new ListItem(data.listItem, this.client);
        this.client.emit("listItemCreate", ListItemComponent);
    }
    listItemDelete(data: GatewayEvent_ListItemDeleted): void {
        const ListItemComponent = new ListItem(data.listItem, this.client);
        this.client.emit("listItemDelete", ListItemComponent);
    }
    listItemUncomplete(data: GatewayEvent_ListItemUncompleted): void {
        const ListItemComponent = new ListItem(data.listItem, this.client);
        this.client.emit("listItemUncomplete", ListItemComponent);
    }
    listItemUpdate(data: GatewayEvent_ListItemUpdated): void {
        const ListItemComponent = new ListItem(data.listItem, this.client);
        this.client.emit("listItemUpdate", ListItemComponent);
    }
}
