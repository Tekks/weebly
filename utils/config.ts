import { Config } from "../interfaces/Config.js";
import "dotenv/config";

let config: Config;

config = {
    Discord: {
        TOKEN: process.env.DC_TOKEN || "",
        OWNER_ID: process.env.DC_OWNER_ID || "",
    }
};

export { config };