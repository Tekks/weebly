import { Emoji } from "../enum/Emoji.js";
import { bot } from "../index.js";

export function getEmoji(emojiName: string) {
    return emojiName; // not functional with editreply ._.
    // return bot.client.emojis.cache.find(e => e.name === emojiName);
}