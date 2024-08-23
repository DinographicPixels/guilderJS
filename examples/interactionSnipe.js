const { Client, ApplicationCommandOptionType, ApplicationCommandType, Message } = require("../");

const client = new Client(
  {
    token: "INSERT TOKEN",
    applicationShortname: "INSERT APP SHORT NAME"
  }
);

// Usage:
//
// /applicationShortname snipe *channel*
// /applicationShortname editsnipe *channel*
//
// Note: channel option is optional

void client.bulkRegisterGlobalApplicationCommand([
  {
    type: ApplicationCommandType.CHAT_INPUT,
    name: "snipe",
    options: [
      {
        type: ApplicationCommandOptionType.CHANNEL,
        name: "channel",
        required: false
      }
    ]
  },
  {
    type: ApplicationCommandType.CHAT_INPUT,
    name: "editsnipe",
    options: [
      {
        type: ApplicationCommandOptionType.CHANNEL,
        name: "channel",
        required: false
      }
    ]
  }
]);

const lastDeletedMessage = new Map();
const lastEditedMessage = new Map();

client.on("interactionCreate", interaction => {
  const targetChannelID =
    interaction.data.options.getChannelOption("channel", false)?.value ?? interaction.channelID;
  if (interaction.data.name === "snipe") {
    if (!lastDeletedMessage.has(targetChannelID))
      return void interaction.createMessage({ content: `There is no deleted message.` });
    void interaction.createMessage({
      content: `The last deleted message content is: ${lastDeletedMessage.get(targetChannelID)}`
    });
  } else if (interaction.data.name === "editsnipe") {
    if (!lastEditedMessage.has(targetChannelID))
      return void interaction.createMessage({ content: `There is no edited message.` });
    void interaction.createMessage({
      content: `The last edited message content is: ${lastEditedMessage.get(targetChannelID)}`
    });
  }
});

client.on("messageUpdate", (message, oldMessage) => {
  if (!oldMessage) return;
  lastEditedMessage.set(oldMessage.channelID, oldMessage.content);
});

client.on("messageDelete", message => {
  if (!(message instanceof Message)) return;
  lastDeletedMessage.set(message.channelID, message.content);
});

client.connect();
