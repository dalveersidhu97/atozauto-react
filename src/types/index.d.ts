export type TimeOps = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
export type FilterType = {
    date: string,
    forName: string,
    startTime: { [key in TimeOps]?: number },
    endTime: { [key in TimeOps]?: number },
}
export type PreferenceType = {
    minutesMultiplier: number,
    hotSecondsLessThan: number,
    minutesIncrementor: number,
    secondsIncrementor: number,
    refreshMode: 'Off' | 'Smart' | 'Full Speed',
    testMode: 'On' | 'Off',
};
