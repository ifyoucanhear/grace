import flexSearch from "flexsearch";
import orderBy from "lodash/orderBy";

import type { GameRepack, GameShop, CatalogueEntry } from "@types";

import { formatName, getSteamAppAsset, repackerFormatter } from "@main/helpers";
import { searchSteamGame } from "@main/services";
import { stateManager } from "@main/state-manager";

const { Index } = flexSearch;
const repacksIndex = new Index();

const repacks = stateManager.getValue("repacks");

for (let i = 0; i < repacks.length; i++) {
    const repack = repacks[i];
    const formatter = repackerFormatter[repack.repacker as keyof typeof repackerFormatter];
  
    repacksIndex.add(i, formatName(formatter(repack.title)));
}

export const searchRepacks = (title: string): GameRepack[] => {
    const repacks = stateManager.getValue("repacks");
  
    return orderBy(
        repacksIndex
            .search(formatName(title))
            .map((index) => repacks.at(index as number)!),

        ["uploadDate"],

        "desc"
    );
};

export const searchGames = async (query: string): Promise<CatalogueEntry[]> => {
    const formattedName = formatName(query);
  
    const steamResults = await searchSteamGame(formattedName);
  
    const results = steamResults.map((result) => ({
        objectID: result.objectID,
        title: result.name,
        shop: "steam" as GameShop,
        cover: getSteamAppAsset("library", result.objectID)
    }));
  
    const gamesIndex = new Index({
        tokenize: "full"
    });
  
    for (let i = 0; i < results.length; i++) {
        const game = results[i];

        gamesIndex.add(i, game.title);
    }
  
    const filteredResults = gamesIndex
        .search(query)
        .map((index) => results[index as number]);
  
    return Promise.all(
        filteredResults.map(async (result) => ({
            ...result,
            repacks: searchRepacks(result.title)
        }))
    ).then((resultsWithRepacks) =>
        orderBy(
            resultsWithRepacks,
            [({ repacks }) => repacks.length, "repacks"],
            ["desc"]
        )
    );
};