import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@renderer/components";
import { useDownload, useLibrary } from "@renderer/hooks";
import type { Game, ShopDetails } from "@types";

import { formatDownloadProgress } from "@renderer/helpers";
import { NoEntryIcon, PlusCircleIcon } from "@primer/octicons-react";
import { BinaryNotFoundModal } from "../shared-modals/binary-not-found-modal";
import * as styles from "./hero-panel.css";
import { useDate } from "@renderer/hooks/use-date";
import { byteFormat } from "@renderer/utils";

export interface HeroPanelProps {
    game: Game | null;
    gameDetails: ShopDetails | null;
    color: string;
    isGamePlaying: boolean;
    openRepacksModal: () => void;
    getGame: () => void;
}

export function HeroPanel({
    game,
    gameDetails,
    color,
    openRepacksModal,
    getGame,
    isGamePlaying,
}: HeroPanelProps) {
    const { t } = useTranslation("game_details");

    const [showBinaryNotFoundModal, setShowBinaryNotFoundModal] = useState(false);
    const [lastTimePlayed, setLastTimePlayed] = useState("");

    const { formatDistance } = useDate();

    const {
        game: gameDownloading,
        isDownloading,
        progress,
        eta,
        numPeers,
        numSeeds,
        resumeDownload,
        pauseDownload,
        cancelDownload,
        removeGame,
        isGameDeleting,
    } = useDownload();
    const { updateLibrary, library } = useLibrary();

    const [toggleLibraryGameDisabled, setToggleLibraryGameDisabled] = useState(false);

    const gameOnLibrary = library.find(
        ({ objectID }) => objectID === gameDetails?.objectID
    );

    const isGameDownloading = isDownloading && gameDownloading?.id === game?.id;

    const updateLastTimePlayed = useCallback(() => {
        setLastTimePlayed(
            formatDistance(game.lastTimePlayed, new Date(), {
                addSuffix: true
            })
        );
    }, [game?.lastTimePlayed, formatDistance]);

    useEffect(() => {
        if (game?.lastTimePlayed) {
            updateLastTimePlayed();

            const interval = setInterval(() => {
                updateLastTimePlayed();
            }, 1000);

            return () => {
                clearInterval(interval);
            };
        }
    }, [game?.lastTimePlayed, updateLastTimePlayed]);

    const openGameInstaller = () => {
        window.electron.openGameInstaller(game.id).then((isBinaryInPath) => {
            if (!isBinaryInPath)
                setShowBinaryNotFoundModal(true);

            updateLibrary();
        });
    };

    const openGame = () => {
        if (game.executablePath) {
            window.electron.openGame(game.id, game.executablePath);

            return;
        }

        if (game?.executablePath) {
            window.electron.openGame(game.id, game.executablePath);

            return;
        }

        window.electron
            .showOpenDialog({
                properties: ["openFile"],
                filters: [{ name: "jogo executável (.exe)", extensions: ["exe"] }],
            })
            .then(({ filePaths }) => {
                if (filePaths && filePaths.length > 0) {
                    const path = filePaths[0];

                    window.electron.openGame(game.id, path);
                }
            });
    };

    const closeGame = () => {
        window.electron.closeGame(game.id);
    };

    const finalDownloadSize = useMemo(() => {
        if (!game)
            return "N/A";

        if (game.fileSize)
            return byteFormat(game.fileSize);

        if (gameDownloading?.fileSize && isGameDownloading)
            return byteFormat(gameDownloading.fileSize);

        return game.repack?.fileSize ?? "N/A";
    }, [game, isGameDownloading, gameDownloading]);

    const toggleLibraryGame = async () => {
        setToggleLibraryGameDisabled(true);

        try {
            if (gameOnLibrary) {
                await window.electron.removeGame(gameOnLibrary.id);
            } else {
                await window.electron.addGameToLibrary(
                    gameDetails.objectID,
                    gameDetails.name,

                    "steam"
                );
            }

            await updateLibrary();
        } finally {
            setToggleLibraryGameDisabled(false);
        }
    };

    const getInfo = () => {
        if (!gameDetails)
            return null;

        if (isGameDeleting(game?.id)) {
            return <p>{t("deleting")}</p>;
        }

        if (isGameDownloading) {
            return (
                <>
                    <p className={styles.downloadDetailsRow}>
                        {progress}
                        {eta && <small>{t("eta", { eta })}</small>}
                    </p>

                    {gameDownloading?.status !== "downloading" ? (
                        <>
                            <p>{t(gameDownloading?.status)}</p>

                            {eta && <small>{t("eta", { eta })}</small>}
                        </>
                    ) : (
                        <p className={styles.downloadDetailsRow}>
                            {byteFormat(gameDownloading?.bytesDownloaded)} /{" "}
                            {finalDownloadSize}

                            <small>
                                {numPeers} peers / {numSeeds} seeds
                            </small>
                        </p>
                    )}
                </>
            );
        }

        if (game?.status === "paused") {
            return (
                <>
                    <p>
                        {t("paused_progress", {
                            progress: formatDownloadProgress(game.progress),
                        })}
                    </p>

                    <p>
                        {byteFormat(game.bytesDownloaded)} / {finalDownloadSize}
                    </p>
                </>
            );
        }

        if (game?.status === "seeding") {
            if (!game.lastTimePlayed) {
                return <p>{t("not_played_yet", { title: game.title })}</p>;
            }

            return (
                <>
                    <p>
                        {t("play_time", {
                            amount: formatDistance(0, game.playTimeInMilliseconds)
                        })}
                    </p>

                    <p>
                        {t("last_time_played", {
                            period: lastTimePlayed
                        })}
                    </p>
                </>
            );
        }

        const [latestRepack] = gameDetails.repacks;

        if (latestRepack) {
            const lastUpdate = format(latestRepack.uploadDate!, "dd/MM/yyyy");
            const repacksCount = gameDetails.repacks.length;

            return (
                <>
                    <p>{t("updated_at", { updated_at: lastUpdate })}</p>
                    <p>{t("download_options", { count: repacksCount })}</p>
                </>
            );
        }

        return <p>{t("no_downloads")}</p>;
    };

    const getActions = () => {
        const deleting = isGameDeleting(game?.id);

        const toggleGameOnLibraryButton = (
            <Button
                theme="outline"
                disabled={!gameDetails || toggleLibraryGameDisabled}
                onClick={toggleLibraryGame}
            >
                {gameOnLibrary ? <NoEntryIcon /> : <PlusCircleIcon />}
                {gameOnLibrary ? t("remove_from_library") : t("add_to_library")}
            </Button>
        );

        if (isGameDownloading) {
            return (
                <>
                    <Button onClick={() => pauseDownload(game.id)} theme="outline">
                        {t("pause")}
                    </Button>

                    <Button onClick={() => cancelDownload(game.id)} theme="outline">
                        {t("cancel")}
                    </Button>
                </>
            );
        }

        if (game?.status === "paused") {
            return (
                <>
                    <Button onClick={() => resumeDownload(game.id)} theme="outline">
                        {t("resume")}
                    </Button>

                    <Button
                        onClick={() => cancelDownload(game.id).then(getGame)}
                        theme="outline"
                    >
                        {t("cancel")}
                    </Button>
                </>
            );
        }

        if (game?.status === "seeding") {
            return (
                <>
                    <Button
                        onClick={openGameInstaller}
                        theme="outline"
                        disabled={deleting || isGamePlaying}
                    >
                        {t("install")}
                    </Button>

                    {isGamePlaying ? (
                        <Button onClick={closeGame} theme="outline" disabled={deleting}>
                            {t("close")}
                        </Button>
                    ) : (
                        <Button
                            onClick={openGame}
                            theme="outline"
                            disabled={deleting || isGamePlaying}
                        >
                            {t("play")}
                        </Button>
                    )}
                </>
            );
        }

        if (game?.status === "cancelled") {
            return (
                <>
                    <Button
                        onClick={openRepacksModal}
                        theme="outline"
                        disabled={deleting}
                    >
                        {t("open_download_options")}
                    </Button>

                    <Button
                        onClick={() => removeGame(game.id).then(getGame)}
                        theme="outline"
                        disabled={deleting}
                    >
                        {t("remove_from_list")}
                    </Button>
                </>
            );
        }

        if (gameDetails && gameDetails.repacks.length) {
            return (
                <>
                    {toggleGameOnLibraryButton}

                    <Button onClick={openRepacksModal} theme="outline">
                        {t("open_download_options")}
                    </Button>
                </>
            );
        }

        return toggleGameOnLibraryButton;
    };

    return (
        <>
            <BinaryNotFoundModal
                visible={showBinaryNotFoundModal}
                onClose={() => setShowBinaryNotFoundModal(false)}
            />

            <div style={{ backgroundColor: color }} className={styles.panel}>
                <div className={styles.content}>{getInfo()}</div>
                <div className={styles.actions}>{getActions()}</div>
            </div>
        </>
    );
}