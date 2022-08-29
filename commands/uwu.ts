import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import Uwuifier from 'uwuifier';


export const options = {
	ephemeral: false
}

export const data = new SlashCommandBuilder()
	.setName('uwu')
	.setDescription('Corrects your message with the best language :>')
    .addStringOption(option => option
        .setName('message')
        .setDescription('The message to correct.')
        .setRequired(true)
    );

        

            

export const execute = async (interaction: CommandInteraction) => {
    /// @ts-ignore
    const uwuifier = new Uwuifier({
        spaces: {
            faces: 0.5,
            actions: 0.075,
            stutters: 0.1
        },
        words: 1,
        exclamations: 1
    });
    let tranlsated = uwuifier.uwuifySentence(interaction.options.get('message').value);
	return interaction.editReply({ content: tranlsated });
}

