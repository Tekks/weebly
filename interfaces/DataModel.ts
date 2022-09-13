export interface DataModel {
    reEntries: Array<ReEntry>,
    config: Config
}

export interface ReEntry {
    guildId: string,
    channelId: string,
    messageId: string,
}

export interface Config {
    ai: {
        apiKey: string,
        enabled: boolean
    },
    recommendations: {
        url: string,
    }
}
