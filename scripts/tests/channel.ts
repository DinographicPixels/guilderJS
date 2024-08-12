import { Client } from "../../lib";
const client = new Client({ token: process.env.TOKEN as string });

client.on("ready", async () => {
    console.log(`Logged as ${client.user?.username}`);
    let chat = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "chat", { description: "We love Pizza 🍕" });
    let announcement = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "announcements", { description: "We love Pizza 🍕" });
    let calendar = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "calendar", { description: "We love Pizza 🍕" });
    let forums = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "forums", { description: "We love Pizza 🍕" });
    let media = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "media", { description: "We love Pizza 🍕" });
    let voice = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "voice", { description: "We love Pizza 🍕" });
    let docs = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "docs", { description: "We love Pizza 🍕" });
    let list = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "list", { description: "We love Pizza 🍕" });
    let scheduling = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "scheduling", { description: "We love Pizza 🍕" });
    let stream = await client.rest.guilds.createChannel("l6Wgk5QE", "PIZZANANAS", "stream", { description: "We love Pizza 🍕" });
    console.log("📧 The Channels were created")
    await chat.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await announcement.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await calendar.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await forums.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await media.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await voice.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await docs.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await list.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await scheduling.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    await stream.edit({ description: "We love Pizza 🍕\nWith Nutella", isPublic: true, name:"P-I-Z-Z-A" });
    console.log("✏️ The Channels were edited")
    await chat.archive();
    await announcement.archive();
    await calendar.archive();
    await forums.archive();
    await media.archive();
    await voice.archive();
    await docs.archive();
    await list.archive();
    await scheduling.archive();
    await stream.archive();
    console.log("📦 The Channels were archived")
    await chat.restore();
    await announcement.restore();
    await calendar.restore();
    await forums.restore();
    await media.restore();
    await voice.restore();
    await docs.restore();
    await list.restore();
    await scheduling.restore();
    await stream.restore();
    console.log("📦 The Channels were restored")
    await chat.delete();
    await announcement.delete();
    await calendar.delete();
    await forums.delete();
    await media.delete();
    await voice.delete();
    await docs.delete();
    await list.delete();
    await scheduling.delete();
    await stream.delete();
    console.log("🗑️ The Channels were deleted")
    client.disconnect();
});

client.connect();
