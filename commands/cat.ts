import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Emoji } from '../enum/Emoji.js';
import { getEmoji } from '../utils/emojiFactory.js';


export const options = {
	ephemeral: false
}

export const data = new SlashCommandBuilder()
	.setName('cat')
	.setDescription('Posts a cat. clueless')

export const execute = async (interaction: CommandInteraction) => {
	try {
		const response = await fetch('https://api.waifu.pics/sfw/awoo');
		if (!response.ok) { return await sendError(interaction); }
		const body = await response.json();
		if (!body.url) { return await sendError(interaction); }

		return interaction.editReply({ files: [new AttachmentBuilder(body.url)] });
	} catch (error) {
		return await sendError(interaction);
	}
}

async function sendError(interaction: CommandInteraction) {
	return interaction.editReply({ content: `${getEmoji(Emoji.A_ERROR)} Something went wrong.` });
}
