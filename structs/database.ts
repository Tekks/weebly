import { ReEntry } from '../interfaces/ReEntry.js';
import { Low, JSONFile } from 'lowdb';
import fs from 'fs';

type dataModel = {
    reEntries: ReEntry[];
}


export class Database {
    private db: Low<dataModel>;

    public constructor() {
        console.log("Initializing Database");
        if (!fs.existsSync("./db")) {
            console.log("Creating Database Subfolder");
            fs.mkdirSync("./db");
        }
        if (!fs.existsSync("db/db.json")) {
            console.log("Creating Database File");
            fs.writeFileSync("db/db.json", "{}");
        }
    }

    /**
     * The function rwDb() is an async function that awaits the write() and read() functions of the db
     * object.
     */
    public async rwDb(){
        await this.db.write();
        await this.db.read();
    }

    /**
     * It checks if the database has a property called reEntries, if it doesn't, it creates it.
     */
    public async init() {
        this.db = new Low(new JSONFile<dataModel>('db/db.json'));

        await this.db.read();

        if (this.db.data === null) {
            this.db.data || (this.db.data = {} as dataModel);
        }

        let dbObject: dataModel = {} as dataModel;
        if (this.db.data?.reEntries === undefined) { dbObject.reEntries = []; }

        if (Object.keys(dbObject).length !== 0) {
            this.db.data = dbObject;
        }
        await this.rwDb();
    }

    public async addMessage(reEntry: ReEntry) {
        this.db.data.reEntries.push(reEntry);
        await this.rwDb();
    }

    public async deleteMessage(entry: ReEntry) {
        this.db.data.reEntries = this.db.data.reEntries.filter(e => e !== entry);
        await this.rwDb();
    }

    public isGuildListed(guildId: string): boolean {
        return this.db.data.reEntries.some(entry => entry.guildId === guildId);
        
    }
    
    public getMessage(guildId: string): ReEntry {
        return this.db.data.reEntries.find(entry => entry.guildId === guildId);
    }
    
    public getAllMessages(): ReEntry[] {
        return this.db.data.reEntries || [];
    }
}