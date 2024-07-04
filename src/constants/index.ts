import { PreferenceType } from "../types"

export const TimeOperators = [
    { key: 'eq', label: 'Equals' },
    { key: 'gt', label: 'After' },
    { key: 'lt', label: 'Before' },
    { key: 'gte', label: 'At or After' },
    { key: 'lte', label: 'At or Before' }
]

export const defaultPreference: PreferenceType = {
    hotMinutesMultiplier: 1,
    hotSecondsLessThan: 7,
    minutesIncrementBy: 1,
    secondsIncrementBy: 0,
    refreshMode: 'Smart',
    testMode: 'Off',
}
export const defaultUIPreference = {
    smartModeCollapsed: false
}

export const StorageKeys = {
    vetFilters: 'vetFilters',
    vtoFilters: 'vtoFilters',
    preference: 'preference',
    userInfo: 'userInfo',
    uiPreference: 'UIPreference',
    infoBoxPos: 'infoBoxPos'
}