import semver from 'semver'
import { Snapshot } from './localStore'
import { isSmoothingAvailable } from './profile'
import { BasalSmoothing } from './nightscout'

import * as logger from './logger'
import { NightscoutApiVersion } from './constants'

export interface Migration {

    /**
     * The version in which the migration was introduced.
     */
    version: string

    /**
     * Execute the migration
     */
    execute(snapshot: Snapshot): void
}

const migrations: Migration[] = [
    {
        version: '1.5.0',
        execute(snapshot: Snapshot) {
            snapshot.version = this.version

            // Synchronize the stored basal smoothing settings with 
            // the smoothing availability settings.
            if (!isSmoothingAvailable(snapshot)) {
                snapshot.conversion_settings.basal_smoothing = BasalSmoothing.NONE
            }
        },
    },
    {
        version: '2.4.0',
        execute(snapshot: Snapshot) {
            snapshot.version = this.version

            // Set the Nightscout API version to the default, if it doesn't exist.
            if (snapshot.nightscout_api_version === undefined) {
                snapshot.nightscout_api_version = NightscoutApiVersion.v1
            }
        }
    }
]

export function getMigrations(fromVersion: string, toVersion: string): Migration[] {
    logger.debug(`Retrieving migrations from ${fromVersion} to ${toVersion}`)
    return migrations
        .filter(m => semver.compare(fromVersion, m.version) <= 0 && semver.compare(toVersion, m.version) >= 0)
        .sort((x, y) => {
            return semver.compare(x.version, y.version)
        })
}