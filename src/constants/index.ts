import { UIPreferenceType } from "../hooks/useUIPreference"
import { PreferenceType, TimeOps } from "../types"

export const TimeOperators: { key: TimeOps, label: string }[] = [
    { key: 'eq', label: 'at' },
    { key: 'gt', label: 'after' },
    { key: 'lt', label: 'before' },
    { key: 'gte', label: 'at or after' },
    { key: 'lte', label: 'at or before' }
]

export const DurationOperators: { key: TimeOps, label: string }[] = [
    { key: 'lte', label: 'max' },
    { key: 'gte', label: 'min' },
    { key: 'eq', label: 'equal' },
];

export const defaultPreference: PreferenceType = {
    hotMinutesMultiplier: 1,
    hotSecondsLessThan: 7,
    minutesIncrementBy: 1,
    secondsIncrementBy: 1,
    refreshMode: 'Smart',
    testMode: 'Off',
}
export const defaultUIPreference: UIPreferenceType = {
    smartModeCollapsed: false,
    lastFilterType: 'VTO'
}

export const StorageKeys = {
    vetFilters: 'vetFilters',
    vtoFilters: 'vtoFilters',
    preference: 'preference',
    userInfo: 'userInfo',
    uiPreference: 'UIPreference',
    infoBoxPos: 'infoBoxPos'
}