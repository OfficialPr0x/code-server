"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsProvider = void 0;
const logger_1 = require("@coder/logger");
const fs_1 = require("fs");
/**
 * Read and write settings.
 */
class SettingsProvider {
    constructor(settingsPath) {
        this.settingsPath = settingsPath;
    }
    /**
     * Read settings from the file. Will return an empty object if the file does
     * not exist. Otherwise will return the parsed contents of the file. If the
     * file cannot be parsed, the promise will reject and the error will be
     * logged.
     */
    async read() {
        try {
            const raw = (await fs_1.promises.readFile(this.settingsPath, "utf8")).trim();
            return raw ? JSON.parse(raw) : {};
        }
        catch (error) {
            if (error.code !== "ENOENT") {
                logger_1.logger.warn(error.message);
            }
            return {};
        }
    }
    /**
     * Write settings combined with current settings. On failure log a warning.
     * Settings will be merged shallowly.
     */
    async write(settings) {
        try {
            const oldSettings = await this.read();
            const nextSettings = { ...oldSettings, ...settings };
            await fs_1.promises.writeFile(this.settingsPath, JSON.stringify(nextSettings, null, 2));
        }
        catch (error) {
            logger_1.logger.warn(error.message);
        }
    }
}
exports.SettingsProvider = SettingsProvider;
