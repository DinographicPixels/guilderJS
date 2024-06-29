// Importing TouchGuild.Client
const { Client, Member } = require("touchguild");

// Creating client & connecting.
const client = new Client({
    token: "TOKEN"
});

client.on("ready", () => {
    console.log("Ready as", client.user?.username);
});

client.on("error", (err) => {
    console.log(err);
});

const badWords = [
    "fuck",
    "bitch",
    "dick"
]

client.on("messageCreate", async (message) => {
    const member = await message.member;
    if (member.bot) return;
    if (member instanceof Member) {
        if (badWords.some(badword => message.content.includes(badword))) {
            message.delete().then(() => console.log("Successfully deleted the swear."))
              .catch(err => console.log("Failed to delete the swear."));
            member.ban(`bad word: ${message.content}`)
              .then(() => console.log("Successfully banned member."))
              .catch(() => console.log("Failed to ban member."));
        }
    } else {
        console.warn("Couldn't get Member.");
    }
})

client.connect();
