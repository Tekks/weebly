import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Emoji } from '../enum/Emoji.js';
import { getEmoji } from '../utils/emojiFactory.js';
import { bot } from '../index.js';
import async from 'async';

const pVars = {
	endpoint: 'https://api.replicate.com/v1/predictions',
	version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'
}

export const options = { ephemeral: false }

export const data = new SlashCommandBuilder()
	.setName('text2img')
	.setDescription('Converts your nonsense into an image')
	.addStringOption(option => option
		.setName('message')
		.setDescription('The nonsense to convert.')
		.setRequired(true)
	).addStringOption(option => option
		.setName('quality')
		.setDescription('The quality of the image. Higher quality means longer processing time.')
		.setRequired(true)
		.addChoices(
			{ name: 'Low ( fastest )', value: '50' },
			{ name: 'Medium', value: '100' },
			{ name: 'High ( slowest )', value: '250' }
		)
	);

export const execute = async (interaction: CommandInteraction) => {

	if (!_dbGetAiEnabled()) { return interaction.editReply({ content: `${getEmoji(Emoji.A_FAILED)} The AI is not enabled.` }); }

	let response = await fetch(pVars.endpoint, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${_dbGetAiApiKey()}` },
		body: JSON.stringify({
			"version": pVars.version,
			"input": {
				"prompt": interaction.options.get('message').value,
				"num_inference_steps": parseInt(interaction.options.get('quality').value as string),
				"guidance_scale": 7
			}
		})
	})

	let data = await response.json();
	if (data.status !== 'starting') { return sendError(interaction) }
	let result = await async.retry({ times: 30, interval: 5000 }, checkImageProcess.bind(data.urls.get))

	if (result == "NSFW") {
		return sendError(interaction, "NSFW")
	}

	if (result == null) { return sendError(interaction) }

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