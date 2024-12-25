export type GameShop = "steam" | "epic";
export type CatalogueCategory = "recently_added" | "trending";

export interface SteamGenre {
    id: string;
    name: string;
}

export interface SteamScreenshot {
    id: number;
    path_thumbnail: string;
    path_full: string;
}

export interface SteamAppDetails {
    name: string;
    detailed_description: string;
    about_the_game: string;
    short_description: string;
    publishers: string[];
    genres: SteamGenre[];
    screenshots: SteamScreenshot[];

    pc_requirements: {
        minimum: string;
        recommended: string;
    };

    mac_requirements: {
        minimum: string;
        recommended: string;
    };

    linux_requirmenets: {
        minimum: string;
        recommended: string;
    };

    release_date: {
        coming_soon: boolean;
        date: string;
    };
}

export type ShopDetails = SteamAppDetails & {
    objectID: string;
    repacks: GameRepack[];
};

export interface GameRepack {
    id: number;
    title: string;
    magnet: string;
    page: number;
    repacker: string;
    fileSize: string | null;
    uploadDate: Date | string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface TorrentFile {
    path: string;
    length: number;
}

/* utilizado pelo catálogo */
export interface CatalogueEntry {
    objectID: string;
    shop: GameShop;
    title: string;
    /* as capas da epic games não podem ser adivinhadas com objectid */
    cover: string;
    repacks: GameRepack[];
}

/* utilizado pela biblioteca */
export interface Game extends Omit<CatalogueEntry, "cover"> {
    id: number;
    title: string;
    iconUrl: string;
    status: string;
    folderName: string;
    downloadPath: string | null;
    repacks: GameRepack[];
    repack: GameRepack;
    progress: number;
    fileVerificationProgress: number;
    bytesDownloaded: number;
    playTimeInMilliseconds: number;
    executablePath: string | null;
    lastTimePlayed: Date | null;
    fileSize: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TorrentProgress {
    downloadSpeed: number;
    timeRemaining: number;
    numPeers: number;
    numSeeds: number;
    game: Omit<Game, "repacks">;
}
  
export interface UserPreferences {
    downloadsPath: string | null;
    language: string;
    downloadNotificationsEnabled: boolean;
    repackUpdatesNotificationsEnabled: boolean;
}
  
export interface HowLongToBeatCategory {
    title: string;
    duration: string;
    accuracy: string;
}