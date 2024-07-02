import { PreferenceType } from "../types"

export const TimeOperators = [
    { key: 'eq', label: 'Equals' },
    { key: 'gt', label: 'After' },
    { key: 'lt', label: 'Before' },
    { key: 'gte', label: 'At or After' },
    { key: 'lte', label: 'At or Before' }
]

export const defaultPreference: PreferenceType = {
    minutesMultiplier: 1,
    hotSecondsLessThan: 7,
    minutesIncrementor: 1,
    secondsIncrementor: 0,
    refreshMode: 'Smart',
    testMode: 'Off',
}