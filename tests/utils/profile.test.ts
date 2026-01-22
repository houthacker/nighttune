import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { test } from 'node:test'
import assert from 'node:assert/strict'

import { InsulinType, NightscoutProfileDef, OAPSProfile } from '../../src/utils/constants.js'
import { convertNightscoutProfile } from '../../src/utils/profile.js'

const jsonFixture = (name: string): any => {
    return JSON.parse(readFileSync(fileURLToPath(import.meta.resolve(`${import.meta.dirname}/../resources/${name}`)), 'utf8'))
}

test('Force hourly basal yields a basal value for all hours of the day', (_) => {
    const nightscoutProfile: NightscoutProfileDef = jsonFixture('force_hourly_basal_profile.json')
    const oapsProfile: OAPSProfile = convertNightscoutProfile(nightscoutProfile, 8.0, 0.7, 1.2, InsulinType.RapidActing, true)

    assert.equal(oapsProfile.basalprofile.length, 24, 'Expect 24 basal recommendation values')
})