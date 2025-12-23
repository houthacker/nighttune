
export const SMOOTHING_MIN_BASAL_ELEMENTS: number = 5

export interface ErrorInfo {

    isError: boolean,

    errorStep: number,

    errorText?: string,
}

export class AlertInfo {
    public readonly show: boolean
    public readonly title: string | undefined
    public readonly description: string | undefined

    constructor(show: boolean, title: string | undefined, description: string | undefined) {
        this.show = show
        this.title = title
        this.description = description
    }
}

export enum InsulinType {
    RapidActing = 'rapid-acting',
    UltraRapid = 'ultra-rapid',
    Unknown = '__default__',
}

export type Unit = 'mg/dl' | 'mg/dL' | 'mmol' | 'mmol/l' | 'mmol/L'

export function isInsulinType(value: string): value is InsulinType {
    return Object.values(InsulinType).includes(value as InsulinType);
}

export const INITIAL_CONVERSION_SETTINGS = {
        min_5m_carbimpact: 8.0,
        pump_basal_increment: 0.01,
        autotune_days: 7,
        uam_as_basal: true,
        insulin_type: '__default__',
        autosens_min: 0.7,
        autosens_max: 1.2,
}

export interface TimedValue {

    /**
     * The time of day represented in seconds, e.g. `14400` for `04:00`.
     */
    timeAsSeconds: number;

    /**
     * The time of day in a `%H:%M` representation, e.g. `14:00`.
     */
    time: string;

    /**
     * The value to average.
     */
    value: number;

    /**
     * The time of day represented in minutes, e.g. `240` for `04:00`.
     */
    minutes?: number;

    /**
     * The time of day in a `%H:%M:%S` representation, e.g. `14:00:00`.
     */
    start?: string;
}

export interface NormalizedTimedValue {
    /**
     * The time of day represented in seconds, e.g. `14400` for `04:00`.
     */
    timeAsSeconds: number;

    /**
     * The time of day represented in minutes, e.g. `240` for `04:00`.
     */
    minutes: number;

    /**
     * The time of day in a `%H:%M` representation, e.g. `14:00`.
     */
    time: string;

    /**
     * The time of day in a `%H:%M:%S` representation, e.g. `14:00:00`.
     */
    start: string;

    /**
     * The value to average.
     */
    value: number;
}

export interface NightscoutProfileDef {

    /**
     * Duration of Insulin Activity
     */
    dia: number;

    /**
     * The units used in this profile.
     */
    units: Unit,

    /**
     * The name of the native timezone if this profile, e.g. `Europe/Amsterdam`.
     */
    timezone: string,

    /**
     * The Insuline / Carb Ratios. AAPS supports a minimum resolution of 1h.
     */
    carbratio: TimedValue[],

    /**
     * The Insulin Sensitivity Factors. AAPS supports a minimum resolution of 1h.
     */
    sens: TimedValue[],

    /**
     * The basal values in units. AAPS supports a minimum resolution of 1h.
     */
    basal: TimedValue[],

    /**
     * The low targets in `units`. AAPS supports a minimum resolution of 1h.
     */
    target_low: TimedValue[],

    /**
     * The hight targets in `units`. AAPS supports a minimum resolution of 1h.
     */
    target_high: TimedValue[],
}

export type NightscoutProfiles = { [key: string]: NightscoutProfileDef}

export interface NightscoutProfile {

    /**
     * A unique identifier for this profile.
     */
    _id: string,

    /**
     * The name of the default profile. The profiles are listed in `self.store.[name]`.
     */
    defaultProfile: string

    /**
     * The local epoch date in milliseconds.
     */
    date: number

    /**
     * The date this profile was created, formatted like `2025-09-14T16:32:12.060Z`.
     */
    created_at: string;

    /**
     * The start date of this profile, formatted like `2025-09-14T16:32:12.0600000Z`
     */
    startDate: string;

    /**
     * The profile store.
     */
    store: NightscoutProfiles;
}

export interface BasalTimeslot extends NormalizedTimedValue {

    /**
     * The index of this timeslot within the containing array.
     */
    i: number;

    /**
     * The basal rate of this time slot.
     */
    rate: number;
}

export interface ScheduleSlot {

    /**
     * The index of this ratio within the containing array.
     */
    i: number;

    /**
     * The start time of this time slot, formatted as %H:%M:%S.
     */
    start: string,

    /**
     * The offset from 00:00 in minutes.
     */
    offset: number,
}

export interface BgTimeslot extends ScheduleSlot {

    /**
     * The lower bound of the bg target in `units`.
     */
    low: number,

    /**
     * The minimum bg in `units`.
     */
    min_bg: number,

    /**
     * The upper bound of the bg target in `units`.
     */
    high: number,

    /**
     * The maximum bg in `units`.
     */
    max_bg: number,
}

export interface CarbRatioTimeslot extends ScheduleSlot {
    
    /**
     * The Insulin / Carb Ratio
     */
    ratio: number,
}

export interface SensitivityTimeslot extends ScheduleSlot {

    /**
     * The Insulin Sensitivity Factor.
     */
    sensitivity: number,
}

export interface OAPSProfile {

    /**
     * The maximum autosens factor. Defaults to 1.2.
     */
    autosens_max: number;

    /**
     * The minimum autosens factor. Defaults to 0.7.
     */
    autosens_min: number;

    /**
     * The basal profile timeslots.
     */
    basalprofile: BasalTimeslot[],

    /**
     * The carb ratio to use if only a single value is to be used.
     */
    carb_ratio: number,

    /**
     * The Duration of Insulin Activity.
     */
    dia: number,

    /**
     * The minimum carb absorption in grams, per 5 minutes.
     */
    min_5m_carbimpact: number,

    /**
     * The type of insulin, indicating how fast the insulin acts and decays.
     */
    curve: InsulinType,

    /**
     * The output units.
     */
    out_units: Unit,

    /**
     * The native time zone name, e.g. `Europe/Amsterdam`.
     */
    timezone: string,

    /**
     * The blood glucose target time slots.
     */
    bg_targets: {
        units: Unit,
        user_preferred_units: Unit,
        targets: BgTimeslot[],
    },

    carb_ratios: {
        first: number,

        /**
         * The carb units, defaults to 'grams'.
         */
        units: 'grams' | string,

        /**
         * The carb ratio time slots.
         */
        schedule: CarbRatioTimeslot[],
    },

    isfProfile: {
        first: number,

        /**
         * The Insulin Sensitivity Factor time slots.
         */
        sensitivities: SensitivityTimeslot[],
    }
}