import { ChannelType, ChatInputCommandInteraction, CommandInteractionOption, Message, PermissionFlagsBits, PermissionsBitField, SlashCommandBuilder, TextChannel } from "discord.js"
import { Emoji } from "../enum/Emoji.js";
import { getEmoji } from "../utils/emojiFactory.js";
import { bot } from "../index.js";
import { ReEntry } from "../interfaces/ReEntry.js";
import fetch from "node-fetch";

type ServerList = {
    servers: Server[]
}

type Server = {
    name: string,
    description: string,
    url: string
}

export const options = {
    ephemeral: true
}

export const data = new SlashCommandBuilder()
    .setName('recommendations')
    .setDescription('Manages your recommendations.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false)
    .addSubcommand(subcommand => subcommand
        .setName('add')
        .setDescription('Adds server recommendations.')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to add the recommendation to.')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        ))
    .addSubcommand(subcommand => subcommand
        .setName('remove')
        .setDescription('Removes the server recommendations.'))
    .addSubcommand(subcommand => subcommand
        .setName('update')
        .setDescription('Updates the server recommendations.'));


export const execute = async (interaction: ChatInputCommandInteraction) => {

    switch (interaction.options.getSubcommand()) {
        case 'add':
            addMessage(interaction);
            break;
        case 'remove':
            removeMessage(interaction);
            break;
        case 'update':
            updateMessage(interaction);
            break;
    }
};

/**
 * It creates a message in a channel
 * @param {ChatInputCommandInteraction} interaction - ChatInputCommandInteraction
 * @returns The return value of the function is the return value of the last statement in the function.
 */
async function addMessage(interaction: ChatInputCommandInteraction) {
    let option: CommandInteractionOption = interaction.options.get('channel');
    let channel: TextChannel = await interaction.guild.channels.cache.find(c => c.id === option.value) as TextChannel;

    if (await bot.db.isGuildListed(interaction.guild.id)) { return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} There is allready a message in this Server!` }); }

    let [success, recommendation] = await buildMessage();
    if (!success) { return interaction.editReply({ content: `${getEmoji(Emoji.A_ERROR)} Reccomandation List is not deposited, or not reachable!` }); }
    let message = await channel.send(recommendation).catch(error => { return null });
    if (!message) { return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} Message cannot be send!` }); }
    bot.db.addMessage({ guildId: interaction.guild.id, channelId: channel.id, messageId: message.id });

    return interaction.editReply({ content: `${getEmoji(Emoji.A_SUCCESS)} Message created.` });
}

/**
 * It deletes a message from a channel.
 * @param {ChatInputCommandInteraction} interaction - ChatInputCommandInteraction
 * @returns The return value of the function is the return value of the last statement in the function.
 */
async function removeMessage(interaction: ChatInputCommandInteraction) {
    if (!bot.db.isGuildListed(interaction.guild.id)) { return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} There is no message in this Server!` }); }
    let messageObj: ReEntry = await bot.db.getMessage(interaction.guild.id);
    let textChannel = bot.client.channels.cache.get(messageObj.channelId)
    textChannel.fetch().then(async (channel) => {
        try {
            let message: Message = await channel.messages.fetch(messageObj.messageId);
            if (await message.delete()) {
                bot.db.deleteMessage(messageObj);
                return interaction.editReply({ content: `${getEmoji(Emoji.A_SUCCESS)} Message deleted!` });
            } else {
                return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} Message cannot be deleted! It will be removed from weebly database!` });
            }
        } catch (errors) {
            bot.db.deleteMessage(messageObj);
            return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} Message cannot be found! It will be removed from weebly database!` });
        }
    })
}

/**
 * It fetches all messages from the database, and then edits them with the new recommendation list
 * @param {ChatInputCommandInteraction} interaction - The interaction object, which contains the
 * message, the author, the channel, and more.
 * @returns a promise that resolves to a string.
 */
async function updateMessage(interaction: ChatInputCommandInteraction) {
    let [success, recommendation] = await buildMessage();
    if (!success) { return interaction.editReply({ content: `${getEmoji(Emoji.A_ERROR)} Reccomandation List is not deposited, or not reachable!` }); }

    bot.db.getAllMessages().forEach(async (messageObj: ReEntry) => {
        let textChannel = bot.client.channels.cache.get(messageObj.channelId)
        textChannel.fetch().then(async (channel) => {
            try {
                let message: Message = await channel.messages.fetch(messageObj.messageId);
                message.edit(recommendation);
            } catch (error) {
                console.log(error);
            }
        })
    });
    return interaction.editReply({ content: `${getEmoji(Emoji.A_SUCCESS)} Recommendations in \`${bot.db.getAllMessages().length}\` Servers updated!` });
}

/**
 * It fetches the server list from the API, and if it's successful, it builds a string of the server
 * list
 * @returns A promise that resolves to an array of two elements. The first element is a boolean, the
 * second is a string.
 */
async function buildMessage(): Promise<[boolean, string?]> {
    if (!process.env.RECOMMENDATIONS) { return [false] }
    let response = await fetchServerList().catch(() => { return });

    if (!response) { return [false] }

    let serverList: ServerList = response;

    if (serverList.servers.length == 0) { return [false] }

    let serverListString: string = "";
    serverList.servers.forEach(server => {
        serverListString += `**${server.name}**\n${server.description}\n${server.url}\n\n`;
    })
    serverListString += `\n_ _`
    return [true, serverListString];


}


/**
 * It fetches a list of servers from the recommendations API, and returns a promise that resolves to a
 * ServerList object
 * @returns A promise that resolves to a ServerList
 */
function fetchServerList(): Promise<ServerList> {
    return new Promise((resolve, reject) => {
        fetch(process.env.RECOMMENDATIONS)
            .then(res => res.json()
                .then(json => resolve(json as ServerList))
                .catch(error => { return reject(error) }))
            .catch(error => { return reject(error) });
    })

}