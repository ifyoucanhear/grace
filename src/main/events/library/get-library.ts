import { gameRepository } from "@main/repository";
import { GameStatus } from "@main/constants";

import { searchRepacks } from "../helpers/search-games";
import { registerEvent } from "../register-event";

import sortBy from "lodash/sortBy";

const getLibrary = async (_event: Electron.IpcMainInvokeEvent) =>
    gameRepository
        .find({
            order: {
                createdAt: "desc"
            },

            relations: {
                repack: true
            }
        })
        
        .then((games) =>
            sortBy(
                games.map((game) => ({
                    ...game,

                    repacks: searchRepacks(game.title)
                })),

                (game) => (game.status !== GameStatus.Cancelled ? 0 : 1)
            )
        );

registerEvent(getLibrary, {
    name: "getLibrary"
});