import { CommandInteraction, SlashCommandBuilder } from 'discord.js';


export const options = {
	ephemeral: true
}

export const data = new SlashCommandBuilder()
	.setName('ping')
	.setDescription('Replies with Pog!')

export const execute = async (interaction: CommandInteraction) => {
	return interaction.editReply({ content: `Pog!` });
}
