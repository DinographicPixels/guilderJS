const { Client, GatewayLayerIntent } = require("touchguild");
const client = new Client({
    token: "INSERT TOKEN",
    intents: [GatewayLayerIntent.GUILD_MESSAGES, GatewayLayerIntent.MESSAGE_CONTENT]
});

client.on("ready", () => {
    console.log("Ready as", client.user.username);
});

client.on("error", (err) => {
    console.error(err);
});

client.on("messageCreate", async (message) => {
    if ((await message.member).app === true) return;
    if (message.content === "!ping") {
        const gettingPing = "Please wait..";
        const pingResultText1 = "your ping: `";
        const pingResultText2 = "ms`";

        await message.createMessage({ content: gettingPing, replyMessageIds: [message.id] });
        const ping = Date.now() - message.createdAt.getTime();
        await message.editOriginal({ content: pingResultText1 + ping + pingResultText2 });
    }
});

client.connect();
