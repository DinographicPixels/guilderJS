// Imports
const { Client, GatewayLayerIntent } = require("touchguild"); // JavaScript/TS (CommonJS)
// TypeScript/JavaScript (ES): import { Client } from "touchguild";

// Configuration
const config = {
    token: "INSERT TOKEN",
    prefix: "/"
}

// Constructing the Client, passing the token into it.
const client = new Client({
    token: config.token,
    intents: [GatewayLayerIntent.GUILD_MESSAGES, GatewayLayerIntent.MESSAGE_CONTENT]
});

// Map that will contain settings for each registered guild.
const guildSettingsMap = new Map();

// Listening to the Client 'ready' state that is emitted.
client.on("ready", () => {
    console.log("Ready as", client.user?.username, "(" + client.user?.id + ")");
});

// Listening to new messages being sent.
client.on("messageCreate", async (message) => {
    // Check if the user is an app or not, if yes, return
    // preventing potential message creation loop when making out our commands
    if ((await message.member)?.app) return;
    // Check if the message content starts with the set prefix
    if (message.content?.startsWith(config.prefix)) {
        // Split the message at the prefix symbol
        // so we can separate the prefix from the message content
        const msgContent = message.content.toLowerCase().split(config.prefix)[1];
        switch (msgContent) {
          // First command, 'help', a list of command you can use
            case "help": {
                const helpEmbed = {
                    title: "Help",
                    description: "Here are all the commands you can use:",
                    fields: [
                        { name: `${config.prefix }help`,      value: "shows all the command you can use."     },
                        { name: `${config.prefix }uptime`,    value: "app up time."                           },
                        { name: `${config.prefix }latency`,   value: "app's latency in ms."                   },
                        { name: `${config.prefix }hi`,        value: "say hi"                                 },
                        { name: `${config.prefix }ping`,      value: "pong"                                   },
                        { name: `${config.prefix }pong`,      value: "ping"                                   },
                        { name: `${config.prefix }not_found`, value: "Disable the command not found message." }
                    ]
                }
                return message.createMessage({
                    embeds: [helpEmbed],
                    replyMessageIDs: [message.id]
                });
            }
          // Uptime command, showing precisely for how long
          // the application is up.
            case "uptime": {
                const uptime = new Date(client.uptime);
                const days = uptime.getDate() - 1;
                const hours = uptime.getHours() - 1;
                const mins = uptime.getMinutes();
                const secs = uptime.getSeconds();
                return message.createMessage({
                    embeds: [
                        {
                            title: "Client uptime",
                            fields: [
                                { name: "Days",    value: days.toString(),  inline: true },
                                { name: "Hours",   value: hours.toString(), inline: true },
                                { name: "Minutes", value: mins.toString(),  inline: true },
                                { name: "Seconds", value: secs.toString(),  inline: true }
                            ]
                        }
                    ]
                });
            }
          // Latency command, gives the app latency in ms
            case "latency": {
                const latency = Date.now() - message.createdAt.getTime();
                return message.createMessage({ embeds: [{ title: "Latency: " + latency + "ms" }] })
            }
          // Simple hi command
            case "hi": {
                return message.createMessage({ content: "hi", replyMessageIDs: [message.id] });
            }
          // ping!
            case "ping": {
                return message.createMessage({ content: "pong!", replyMessageIDs: [message.id] })
            }
          // pong!
            case "pong": {
                return message.createMessage({ content: "ping!", replyMessageIDs: [message.id] });
            }
          // Toggle the command not found message if it is annoying,
          // or if you're using another app with the same prefix (in both case it is annoying)
            case "not_found": {
                if (!guildSettingsMap.has(message.guildID) && message.guildID)
                    setGuildSettings(message.guildID);
                else if (!message.guildID)
                    return message.createMessage({ content: "Something went wrong." });

                // get settings object
                const settings = guildSettingsMap.get(message.guildID);
                // toggle not_found boolean
                settings["not_found"] = !settings["not_found"];
                // replace the old settings object with the new one
                guildSettingsMap.set(message.guildID, settings);
                // send success message
                void message.createMessage({
                    content: `Successfully ${settings["not_found"] ? "enabled" : "disabled"} not_found.`
                });
                break;
            }
          // The command not found message,
          // if the command the user is trying to execute is unknown
            default: {
                if (guildSettingsMap.get(message.guildID) == undefined && message.guildID)
                    setGuildSettings(message.guildID);
                if (guildSettingsMap.get(message.guildID)?.["not_found"])
                    void message.createMessage({
                        content: "command not found", replyMessageIDs: [message.id]
                    });
            }
        }
    } else if (message.mentions
      && message.mentions.users?.find(user => user.id === client.user?.id)
    ) {
        void message.createMessage({
            content: `haha, stop pinging me! (list of commands: ${config.prefix}help)`,
            replyMessageIDs: [message.id]
        });
    }
});

// Function used to assign a default settings object to a guild ID
function setGuildSettings(guildID) {
    const settings = {
        not_found: true
    }
    guildSettingsMap.set(guildID, settings);
}

client.connect();
