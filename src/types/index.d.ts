export type TimeOps = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';

export type TimeRule = { op: TimeOps, seconds: number, type: 'Start Time' | 'End Time' };

export type FilterType = {
    date: string,
    forName: string,
    timeRules: TimeRule[],
}
export type PreferenceType = {
    hotMinutesMultiplier: number,
    hotSecondsLessThan: number,
    minutesIncrementBy: number,
    secondsIncrementBy: number,
    refreshMode: 'Off' | 'Smart' | 'Full Speed',
    testMode: 'On' | 'Off',
};

export type UserInfo = {
    name: string,
}

export type VTOType = any;
export type VETType = any;
