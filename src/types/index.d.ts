export type TimeOps = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
export type FilterType = {
    date: string,
    forName: string,
    startTime: { [key in TimeOps]?: number },
    endTime: { [key in TimeOps]?: number },
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
