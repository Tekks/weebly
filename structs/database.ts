import { DataModel, Config } from '../interfaces/DataModel.js';
import { Low, JSONFile } from 'lowdb';
import fs from 'fs';


export class Database {
    private db: Low<DataModel>;

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
     * It checks if the database has a property called reEntries, if it doesn't, it creates it.
     */
    public async init() {
        this.db = new Low(new JSONFile<DataModel>('db/db.json'));

        await this.db.read();

        if (this.db.data === null) {
            this.db.data || (this.db.data = {} as DataModel);
        }

        let dbObject: DataModel = {} as DataModel;
        if (this.db.data?.reEntries === undefined) { dbObject.reEntries = []; }
        if (this.db.data?.config === undefined) { dbObject.config = {} as Config; }


        if (Object.keys(dbObject).length !== 0) {
            this.db.data = { ...this.db.data, ...dbObject };
        }
        await this.rwDb();
    }

    /**
     * The function rwDb() is an async function that awaits the write() and read() functions of the db
     * object.
     */
    public async rwDb() {
        await this.db.write();
        await this.db.read();
    }

    /**
     * It takes a key of type keyof DataModel and returns a value of type DataModel[Key]
     * @param {Key} key - Key - The key of the data you want to get.
     * @returns The value of the key in the data object.
     */
    public getData<Key extends keyof DataModel>(key: Key): DataModel[Key] {
        return this.db.data[key];
    }

    /**
     * This function takes a key of type keyof DataModel and a value of type DataModel[Key] and sets
     * the value of the key in the data object to the value.
     * @param {Key} key - Key - The key of the data you want to set.
     * @param value - DataModel[Key]
     */
    public async setData<Key extends keyof DataModel>(key: Key, value: DataModel[Key]): Promise<void> {
        this.db.data[key] = value;
        await this.rwDb();
    }

}