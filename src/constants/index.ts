import { UIPreferenceType } from "../hooks/useUIPreference"
import { PreferenceType, TimeOps } from "../types"

export const TimeOperators: { key: TimeOps, label: string }[] = [
    { key: 'eq', label: 'At' },
    { key: 'gt', label: 'After' },
    { key: 'lt', label: 'Before' },
    { key: 'gte', label: 'At or After' },
    { key: 'lte', label: 'At or Before' }
]

export const DurationOperators: { key: TimeOps, label: string }[] = [
    { key: 'lte', label: 'Max' },
    { key: 'gte', label: 'Min' },
    { key: 'eq', label: 'Equal' },
];

export const defaultPreference: PreferenceType = {
    hotMinutesMultiplier: 1,
    hotSecondsLessThan: 7,
    minutesIncrementBy: 1,
    secondsIncrementBy: 1,
    refreshMode: 'Smart',
    testMode: 'Off',
    vet: {
        maxGapMinutes: 0,
        order: {
            duration: 'desc'
        }
    }
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