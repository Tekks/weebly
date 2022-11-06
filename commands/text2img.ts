import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Emoji } from '../enum/Emoji.js';
import { getEmoji } from '../utils/emojiFactory.js';
import async from 'async'
import { bot } from '../index.js';

const pVars = {
	endpoint: 'https://api.replicate.com/v1/predictions',
	version: '8abccf52e7cba9f6e82317253f4a3549082e966db5584e92c808ece132037776'
}

export const options = {
	ephemeral: false
}

export const data = new SlashCommandBuilder()
	.setName('text2img')
	.setDescription('Converts your nonsense into an image')
	.addStringOption(option => option
		.setName('message')
		.setDescription('The nonsense to convert.')
		.setRequired(true)
	).addIntegerOption(option => option
		.setName('num_inference_steps')
		.setDescription('Number of denoising steps (minimum: 1; maximum: 500) (default 100)')
		.setRequired(true)
		.setMinValue(1)
		.setMaxValue(500)
	).addNumberOption(option => option
		.setName('guidance_scale')
		.setDescription('Scale for classifier-free guidance (minimum: 1; maximum: 20) (default 7.5)')
		.setRequired(true)
		.setMinValue(1)
		.setMaxValue(20)
	);

export const execute = async (interaction: CommandInteraction) => {

	if (!_dbGetAiEnabled()) { return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} The AI is not enabled.` }); }

	let response = await fetch(pVars.endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${_dbGetAiApiKey()}` },
		body: JSON.stringify({
			"version": pVars.version, "input": {
				"prompt": interaction.options.get('message').value,
				"num_inference_steps": interaction.options.get('num_inference_steps').value,
				"guidance_scale": interaction.options.get('guidance_scale').value
			}
		})
	})
	let data = await response.json();
	if (data.status !== 'starting') { return sendError(interaction) }
	let result = await async.retry({ times: 30, interval: 5000 }, checkImageProcess.bind(data.urls.get))

	if (result == "NSFW") {
		return sendError(interaction, "NSFW")
	}
	if (result == null) {
		return sendError(interaction)
	}

	return interaction.editReply({ files: [new AttachmentBuilder(result.output[0])] });
}

async function checkImageProcess(callback) {
	let response = await fetch(this, { method: 'GET', headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${_dbGetAiApiKey()}` } })
	let data = await response.json()
	if (data.status == 'succeeded') {
		callback(null, data)
	} else if (data.status == 'failed') {
		callback(null, "NSFW")
	} else {
		callback("not succesfull")
	}
}

async function sendError(interaction: CommandInteraction, error?: string) {
	if (error) {
		return interaction.editReply({ content: `${getEmoji(Emoji.A_ERROR)} No NSFW allowed.` });
	} else {
		return interaction.editReply({ content: `${getEmoji(Emoji.A_ERROR)} Something went wrong.` });
	}
}


/**
 * _dbGetAiApiKey() returns the value of the key "apiKey" in the object "ai" in the object "config" in
 * the object "bot.db" or null if any of those keys don't exist.
 * @returns The value of the key "apiKey" in the object "ai" in the object "config" in the object
 * "bot.db"
 */
function _dbGetAiApiKey(): any {
	return bot.db.getData("config")?.ai?.apiKey || null;
}

/**
 * _dbGetAiEnabled() returns the value of the key "enabled" in the object "ai" in the object "config"
 * in the database, or false if any of those keys don't exist
 * @returns The value of the key "enabled" in the object "ai" in the object "config" in the object
 * "bot.db"
 */
function _dbGetAiEnabled(): boolean {
	return bot.db.getData("config")?.ai?.enabled || false;
}

