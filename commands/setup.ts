import { ChatInputCommandInteraction, CommandInteractionOption, PermissionFlagsBits, SlashCommandBuilder } from "discord.js"
import { Emoji } from "../enum/Emoji.js";
import { getEmoji } from "../utils/emojiFactory.js";
import { bot } from "../index.js";
import { config } from "../utils/config.js";


export const options = {
    ephemeral: true
}

export const data = new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Sets up the bot.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(true)
    .addSubcommand(subcommand => subcommand
        .setName('recommendations')
        .setDescription('Sets up the server recommendations.')
        .addStringOption(option => option
            .setName('url')
            .setDescription('The url to the recommendations.')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand => subcommand
        .setName('ai')
        .setDescription('Sets up the Image AI.')
        .addBooleanOption(option => option
            .setName('enabled')
            .setDescription('Enables or disables the Image AI.')
            .setRequired(true))
        .addStringOption(option => option
            .setName('apikey')
            .setDescription('The API key for the Image AI.')
            .setRequired(false)
        )
    );


export const execute = async (interaction: ChatInputCommandInteraction) => {
    switch (interaction.options.getSubcommand()) {
        case 'recommendations':
            setupRecommendations(interaction);
            break;
        case 'ai':
            setupAi(interaction);
            break;
    }
};


/**
 * It sets the url of the recommendations page in the database.
 * @param {ChatInputCommandInteraction} interaction - ChatInputCommandInteraction
 * @returns the result of the interaction.editReply() function.
 */
async function setupRecommendations(interaction: ChatInputCommandInteraction) {
    if (!(interaction.user.id == config.Discord.OWNER_ID)) { return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} You are not allowed to do this!` }); }
    let option: CommandInteractionOption = interaction.options.get('recommendationsurl');

    await bot.db.setData('config', { ...bot.db.getData('config'), ...{ recommendations: { url: option.value as string } } });
    return interaction.editReply({ content: `${getEmoji(Emoji.A_SUCCESS)} Setup completed!` });
}

/**
 * It sets the api key for the ai module.
 * @param {ChatInputCommandInteraction} interaction - ChatInputCommandInteraction - This is the
 * interaction object that is passed to the command.
 * @returns the result of the interaction.editReply() function.
 */
async function setupAi(interaction: ChatInputCommandInteraction) {
    if (!(interaction.user.id == config.Discord.OWNER_ID)) { return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} You are not allowed to do this!` }); }
    let optionEnabled: CommandInteractionOption = interaction.options.get('enabled');
    let optionApiKey: CommandInteractionOption = interaction.options.get('apikey');

    await bot.db.setData('config', { ...bot.db.getData('config'), ...{ ai: { apiKey: bot.db.getData('config').ai?.apiKey, enabled: optionEnabled.value as boolean } } });
    if (optionApiKey?.value) await bot.db.setData('config', { ...bot.db.getData('config'), ...{ ai: { apiKey: optionApiKey.value as string, enabled: optionEnabled.value as boolean } } });
    return interaction.editReply({ content: `${getEmoji(Emoji.A_SUCCESS)} Setup completed!` });
}