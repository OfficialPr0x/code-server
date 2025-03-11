import { logger } from "@coder/logger"
import { Query } from "express-serve-static-core"
import { promises as fs } from "fs"

export type Settings = { [key: string]: Settings | string | boolean | number }

/**
 * Read and write settings.
 */
export class SettingsProvider<T extends object> {
  public constructor(private readonly settingsPath: string) {}

  /**
   * Read settings from the file. Will return an empty object if the file does
   * not exist. Otherwise will return the parsed contents of the file. If the
   * file cannot be parsed, the promise will reject and the error will be
   * logged.
   */
  public async read(): Promise<T> {
    try {
      const raw = (await fs.readFile(this.settingsPath, "utf8")).trim()
      return raw ? JSON.parse(raw) : {} as T
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        logger.warn(error.message)
      }
      return {} as T
    }
  }

  /**
   * Write settings combined with current settings. On failure log a warning.
   * Settings will be merged shallowly.
   */
  public async write(settings: Partial<T>): Promise<void> {
    try {
      const oldSettings = await this.read()
      const nextSettings = { ...oldSettings, ...settings }
      await fs.writeFile(this.settingsPath, JSON.stringify(nextSettings, null, 2))
    } catch (error: any) {
      logger.warn(error.message)
    }
  }
}

export interface UpdateSettings {
  update: {
    checked: number
    version: string
  }
}

/**
 * Global code-server settings.
 */
export interface CoderSettings extends UpdateSettings {
  query?: Query
}
