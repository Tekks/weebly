import { ActivityType, Client, Collection, Routes } from "discord.js";
import { getEmoji } from "../utils/emojiFactory.js";
import { Command } from "../interfaces/Command.js";
import { config } from "../utils/config.js";
import { Emoji } from '../enum/Emoji.js';
import { Database } from "./database.js";
import { REST } from "@discordjs/rest";
import { fileURLToPath } from "url";
import { readdirSync } from "fs";
import { join } from "path";
import path from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class bot {
    public commands = new Collection<string, Command>();
    public db: Database;

    public constructor(public client: Client) {

        this.client.login(config.Discord.TOKEN);

        this.client.on("ready", () => {
            console.log(`Weeb Commander v${process.env.npm_package_version} =>  ${this.client.user?.tag}`);
            client.user!.setActivity(`Anime`, { type: ActivityType.Watching });

            this.db = new Database();
            this.db.init();

            this.importCommands();
            this.onSlashCommand();
        });
    }


    /**
     * It imports all the commands from the commands folder and then registers them with the Discord
     * API
     */
    private async importCommands() {
        const commands = readdirSync(join(__dirname, "..", "commands")).filter(
            (file) => file.endsWith(".ts")
        );
        for (const file of commands) {
            const command = await import(`./../commands/${file}`);
            this.commands.set(command.data.name, command);
        }
        const rest = new REST({ version: "10" }).setToken(config.Discord.TOKEN);

        rest.put(Routes.applicationCommands(this.client.user!.id), {
            body: Array.from(this.commands.values()).map((command) => command.data.toJSON()),
        }).catch(console.error);
    }


    /**
     * This function is called when a slash command is entered in the chat window.
     */
    private async onSlashCommand() {
        this.client.on("interactionCreate", async (interaction) => {
            if (!interaction.isChatInputCommand()) { return; }

            const command = this.commands.get(interaction.commandName);
            if (!command) { await interaction.reply({ content: `${getEmoji(Emoji.A_ERROR)} Command not found.`, ephemeral: true }); return; }

            await interaction.deferReply({ ephemeral: command.options.ephemeral });

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                await interaction.editReply({ content: `${getEmoji(Emoji.A_ERROR)} An error occurred while executing this command.` });
            }
            return;
        });
    }
}
