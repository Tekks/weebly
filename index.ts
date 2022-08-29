import { Client, GatewayIntentBits } from 'discord.js';
import { bot as Bot } from './structs/bot.js';

export const bot = new Bot(
    new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildEmojisAndStickers] })
)