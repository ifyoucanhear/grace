import { gameRepository } from "@main/repository";

import { registerEvent } from "../register-event";

const getGameByObjectID = async (
    _event: Electron.IpcMainInvokeEvent,
    objectID: string
) =>
    gameRepository.findOne({
        where: {
            objectID
        },

        relations: {
            repack: true
        }
    });

registerEvent(getGameByObjectID, {
    name: "getGameByObjectID"
});