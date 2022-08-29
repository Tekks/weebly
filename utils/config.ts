import "dotenv/config";
import { Config } from "../interfaces/Config.js";

let config: Config;

config = {
    TOKEN: process.env.TOKEN || "",
};

export { config };