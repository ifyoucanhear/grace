import type { Configuration } from "webpack";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

import { rules } from "./webpack.rules";
import { plugins } from "./webpack.plugins";

export const mainConfig: Configuration = {
    /**
     * este é o principal ponto de entrada para sua aplicação
     * é o primeiro arquivo que irá rodar o processo principal
     */
    entry: "./src/index.ts",
    devtool: "source-map",

    // insira sua configuração do webpack normal aqui
    module: {
        rules
    },

    plugins,

    resolve: {
        extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],

        plugins: [new TsconfigPathsPlugin()]
    }
};