import path from "node:path";
import { app } from "electron";

import chunk from "lodash/chunk";

import { createDataSource, dataSource } from "@main/data-source";
import { Repack, RepackerFriendlyName } from "@main/entity";
import { migrationScriptRepository, repackRepository, repackerFriendlyNameRepository } from "@main/repository";
import { MigrationScript } from "@main/entity/migration-script.entity";

import { Like } from "typeorm";

const migrationScripts = {
    /* 0.0.6 -> 0.0.7 */
    "0.0.7": async (updateRepacks: Repack[]) => {
        const VERSION = "0.0.7";

        const migrationScript = await migrationScriptRepository.findOne({
            where: {
                version: VERSION
            }
        });

        if (!migrationScript) {
            const xatabRepacks = updateRepacks.filter(
                (repack) => repack.repacker === "Xatab"
            );

            await dataSource.transaction(async (transactionalEntityManager) => {
                await Promise.all(
                    xatabRepacks.map((repack) =>
                        transactionalEntityManager.getRepository(Repack).update(
                            {
                                title: repack.title,
                                repacker: repack.repacker
                            }, {
                                uploadDate: repack.uploadDate
                            }
                        )
                    )
                );

                await transactionalEntityManager.getRepository(MigrationScript).insert({
                    version: VERSION
                });
            });
        }
    },

    /* 1.0.1 -> 1.1.0 */
    "1.1.0": async () => {
        const VERSION = "1.1.0";

        const migrationScript = await migrationScriptRepository.findOne({
            where: {
                version: VERSION
            }
        });

        if (!migrationScript) {
            await dataSource.transaction(async (transactionalEntityManager) => {
                const repacks = await transactionalEntityManager
                    .getRepository(Repack)
                    .find({
                        where: {
                            uploadDate: Like("1%")
                        }
                    });

                await Promise.all(
                    repacks.map(async (repack) => {
                        return transactionalEntityManager
                            .getRepository(Repack)
                            .update(
                                { id: repack.id },
                                { uploadDate: new Date(repack.uploadDate) }
                            );
                    })
                );

                await transactionalEntityManager.getRepository(MigrationScript).insert({
                    version: VERSION
                });
            });
        }
    }
};

export const runMigrationScripts = async (updateRepacks: Repack[]) => {
    return Promise.all(
        Object.values(migrationScripts).map((migrationScript) => {
            return migrationScript(updateRepacks);
        })
    );
};

export const resolveDatabaseUpdates = async () => {
    const updateDataSource = createDataSource({
        database: app.isPackaged
            ? path.join(process.resourcesPath, "grace.db")
            : path.join(__dirname, "..", "..", "resources", "grace.db")
    });

    return updateDataSource.initialize().then(async () => {
        const updateRepackRepository = updateDataSource.getRepository(Repack);
        const updateRepackerFriendlyNameRepository = updateDataSource.getRepository(RepackerFriendlyName);

        const [updateRepacks, updateRepackerFriendlyNames] = await Promise.all([
            updateRepackRepository.find(),
            updateRepackerFriendlyNameRepository.find()
        ]);

        await runMigrationScripts(updateRepacks);

        await repackerFriendlyNameRepository
            .createQueryBuilder()
            .insert()
            .values(updateRepackerFriendlyNames)
            .orIgnore()
            .execute();

        const updateRepacksChunks = chunk(updateRepacks, 800);

        for (const chunk of updateRepacksChunks) {
            await repackRepository
                .createQueryBuilder()
                .insert()
                .values(chunk)
                .orIgnore()
                .execute();
        }
    });
};