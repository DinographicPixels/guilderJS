// Importing Client,
// Message is also imported as we'll be using it later on.
const { Client, Message, GatewayLayerIntent } = require("touchguild"); // JavaScript/TS (CommonJS)
// TypeScript/JavaScript (ES): import { Client, Message } from "touchguild";

// Constructing Application Client (required)
const client = new Client({
    token: "INSERT TOKEN",
    intents: [GatewayLayerIntent.GUILD_MESSAGES, GatewayLayerIntent.MESSAGE_CONTENT]
});

// Listen for the Client 'ready' state to be emitted.
client.on("ready", () => {
    console.log("Ready as", client.user?.username);
});

// Listen for errors
client.on("error", (err) => {
    console.log(err);
});

// Declaring deleted & edited message maps.
const lastDeletedMessage = new Map();
const lastEditedMessage = new Map();

// Listen for new messages sent by users
// We'll be building through conditional statements a way to
// detect commands in messages and perform the actions we want
// according to the command that is requested.
client.on("messageCreate", (message) => {
    // Split on space the message content to separate each word
    // and detect later on the command in the message as a first argument.
    const args = message.content?.split(" "); // array of args.

    // Make the whole message content in lowercase to detect the command in proper conditions
    message.content = message.content?.toLowerCase() ?? null;

    // Detect !snipe CHANNEL_ID command in chat
    if (message.content?.startsWith("!snipe") && args?.[1]) {
        if (!lastDeletedMessage.has(args?.[1]))
            return message.createMessage({
                content: `No deleted message detected for: *${args?.[1]}*`
            });
        return message.createMessage({
            content: `Last deleted message content: ${lastDeletedMessage.get(args?.[1])}`
        });
    } else if (message.content == "!snipe") { // Detect !snipe command in chat
        // Check if map has this message ID
        if (!lastDeletedMessage.has(message.channelID))
            return message.createMessage({
                content: "No deleted message detected for the moment."
            });
        // Send message with old message content if it is stored
        return message.createMessage({
            content: `Last deleted message content: ${lastDeletedMessage.get(message.channelID)}`
        });
    }

    // Detect !editsnipe CHANNEL_ID command in chat
    if (message.content?.startsWith("!editsnipe") && args?.[1]) {
        if (!lastEditedMessage.has(args?.[1]))
            return message.createMessage({
                content: `No edited message detected for: *${args?.[1]}*`
            });
        return message.createMessage({
            content: `Last edited message content: ${lastEditedMessage.get(args?.[1])}`
        });
    } else if (message.content == "!editsnipe") {  // Detect !editsnipe command in chat
        // Check if map has this message ID
        if (!lastEditedMessage.has(message.channelID))
            return message.createMessage({
                content: "No edited message detected for the moment."
            });
        // Send message with old message content if it is stored
        return message.createMessage({
            content: `Last edited message content: ${lastEditedMessage.get(message.channelID)}`
        });
    }
});

// Detect when message is updated/deleted & save their content.
client.on("messageUpdate", (message, oldMessage) => {
    if (!oldMessage) return; // return if message oldContent not cached.
    lastEditedMessage.set(message.channelID, oldMessage.content);
});

client.on("messageDelete", (message) => {
    if (message instanceof Message) {
        lastDeletedMessage.set(message.channelID, message.content);
    } else return;
});

// Connect the Client to the API (required)
client.connect();
