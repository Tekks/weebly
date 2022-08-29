import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Emoji } from '../enum/Emoji.js';
import { getEmoji } from '../utils/emojiFactory.js';


export const options = {
	ephemeral: true
}

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pog!')

export const execute = async (interaction: CommandInteraction) => {
	return interaction.editReply({ content: `${getEmoji(Emoji.A_SUCCESS)}  Pog!` });
}
