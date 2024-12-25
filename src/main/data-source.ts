import { DataSource } from "typeorm";
import {
    Game,
    GameShopCache,
    ImageCache,
    Repack,
    RepackerFriendlyName,
    UserPreferences,
    MigrationScript
} from "@main/entity";
import type { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";
import { databasePath } from "./constants";

export const createDataSource = (options: Partial<SqliteConnectionOptions>) => new DataSource({
    type: "sqlite",
    database: databasePath,
    entities: [
        Game,
        ImageCache,
        Repack,
        RepackerFriendlyName,
        UserPreferences,
        GameShopCache,
        MigrationScript
    ],

    ...options
});

export const dataSource = createDataSource({
    synchronize: true
});