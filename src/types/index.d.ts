export type TimeOps = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';
export type FilterType = {
    date: string,
    forName: string,
    startTime: { [key in TimeOps]?: number },
    endTime: { [key in TimeOps]?: number },
}
