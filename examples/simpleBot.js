const { Client } = require("touchguild");

const config = {
    token: "TOKEN",
    prefix: "/"
}

const client = new Client({ token: config.token });

const guildSettingsMap = new Map();

client.on("messageCreate", async (message) => {
    if ((await message.member)?.bot === true) return;
    if (message.content?.startsWith(config.prefix)) {
        const msgcontent = message.content.toLowerCase().split(config.prefix)[1];
        switch (msgcontent) {
            case "help": {
                const helpEmbed = {
                    title: "Help",
                    description: "Every commands you can use.",
                    fields: [
                        { name: `${config.prefix}help`, value: "shows every command you can use." },
                        { name: `${config.prefix}uptime`, value: "bot up time." },
                        { name: `${config.prefix}latency`, value: "bot's latency in ms." },
                        { name: `${config.prefix}hi`, value: "say hi" },
                        { name: `${config.prefix}ping`, value: "pong" },
                        { name: `${config.prefix}pong`, value: "ping" },
                        { name: `${config.prefix}cmdnotfound`, value: "Disable the command not found message." }
                    ]
                }
                return message.createMessage({ embeds: [helpEmbed], replyMessageIds: [message.id] });
            }
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
                                { name: "Days", value: days.toString(), inline: true },
                                { name: "Hours", value: hours.toString(), inline: true },
                                { name: "Minutes", value: mins.toString(), inline: true },
                                { name: "Seconds", value: secs.toString(), inline: true }
                            ]
                        }
                    ]
                });
            }
            case "latency": {
                const latency = Date.now() - message.createdAt.getTime();
                return message.createMessage({ embeds: [{ title: "Latency: " + latency + "ms" }] })
            }
            case "hi": {
                return message.createMessage({ content: "hi", replyMessageIds: [message.id] });
            }
            case "ping": {
                return message.createMessage({ content: "pong!", replyMessageIds: [message.id] })
            }
            case "pong": {
                return message.createMessage({ content: "ping!", replyMessageIds: [message.id] });
            }
            case "cmdnotfound": {
                if (!guildSettingsMap.has(message.guildID) && message.guildID) setGuildSettings(message.guildID); else if (!message.guildID) return message.createMessage({ content: "Something went wrong." });
                const settings = guildSettingsMap.get(message.guildID);
                if (settings["cmdnotfound"] == true) {
                    settings["cmdnotfound"] = false;
                } else if (settings["cmdnotfound"] == false) {
                    settings["cmdnotfound"] = true;
                }
                guildSettingsMap.set(message.guildID, settings);
                message.createMessage({ content: `Successfully ${settings["cmdnotfound"] ? "enabled" : "disabled"} cmdnotfound.` })
                break;
            }
            default: {
                if (guildSettingsMap.get(message.guildID) == undefined && message.guildID) setGuildSettings(message.guildID);
                if (guildSettingsMap.get(message.guildID)?.["cmdnotfound"] == true) {
                    message.createMessage({ content: "command not found", replyMessageIds: [message.id] });
                }
            }
        }
    } else if (message.mentions && message.mentions.users?.find(user => user.id == client.user?.id)) {
        message.createMessage({ content: `haha, stop pinging me! (list of commands: ${config.prefix}help)`, replyMessageIds: [message.id] });
    }
});

function setGuildSettings(guildID) {
    const settings = {
        cmdnotfound: true
    }
    guildSettingsMap.set(guildID, settings);
}

client.connect();
