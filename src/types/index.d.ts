export type TimeOps = 'eq' | 'gt' | 'lt' | 'gte' | 'lte';

export type TimeRule = { op: TimeOps, minutes: number, type: 'Start Time' | 'End Time' | 'Duration' | 'Gap' | 'Total Gap' };

export type FilterType = {
    date: string,
    forName: string,
    timeRules: TimeRule[],
    preferedDuration: 'Min' | 'Max';
    deleteAfterMatch: boolean,
    maxGroups: number
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

type VoluntaryElementBaseType = { 
    startTime: number, 
    endTime: number,
    date: string, // Aug 11 | Sun, Aug 11
    button: HTMLButtonElement | null,
    claimed: boolean,
};

export type VTOType = VoluntaryElementBaseType & {  };
export type VETType = VoluntaryElementBaseType & {  };
