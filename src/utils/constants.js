
/**
 * The type of insulin in the profile.
 * @typedef {('rapid-acting'|'ultra-rapid')} InsulinType
 */
export const InsulinType = {
    RAPID: 'rapid-acting',
    ULTRA_RAPID: 'ultra-rapid'
};

export const INITIAL_CONVERSION_SETTINGS = {
        min_5m_carbimpact: 8.0,
        pump_basal_increment: 0.01,
        autotune_days: 7,
        uam_as_basal: false,
        insulin_type: '__default__',
        email_address: '',
        autosens_min: 0.7,
        autosens_max: 1.2,
};