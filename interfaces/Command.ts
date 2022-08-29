import { SlashCommandBuilder } from "discord.js";

export interface Command {
    data: SlashCommandBuilder;
    options: {
        ephemeral: boolean;
    };
    execute(...args: any): any;
}