import { VoluntaryElementBaseType } from "../types";

export const sortGroupsByStartTime = <T extends VoluntaryElementBaseType>(arr: T[][], sortOrder: 'asc' | 'desc' = 'asc') => {
    return arr.sort((a, b) => {
        const startTimeA = a[0].startTime;
        const endTimeA = a[a.length - 1].endTime;
        const startTimeB = b[0].startTime;
        const endTimeB = b[b.length - 1].endTime;
        // Compare by startTime
        if (startTimeA !== startTimeB) {
            return startTimeA - startTimeB;
        }

        // If startTime is the same, sort by duration based on sortOrder
        const durationA = endTimeA - startTimeA;
        const durationB = endTimeB - startTimeB;

        if (sortOrder === 'asc') {
            return durationA - durationB;
        } else {
            return durationB - durationA;
        }
    });
}

export const sortGroupsByDuration = <T extends VoluntaryElementBaseType>(elments: T[][], sortOrder: 'asc' | 'desc' = 'asc') => {
    return elments.sort((a, b) => {
        const startTimeA = a[0].startTime;
        const endTimeA = a[a.length - 1].endTime;
        const startTimeB = b[0].startTime;
        const endTimeB = b[b.length - 1].endTime;
        const durationA = endTimeA - startTimeA;
        const durationB = endTimeB - startTimeB;

        if (sortOrder === 'asc') {
            return durationA - durationB;
        } else {
            return durationB - durationA;
        }
    })
}

export const makeGroups = <T extends VoluntaryElementBaseType>(vtosOrVets: T[], sortOrder: 'asc' | 'desc' = 'asc', gapValid: (gap: number) => boolean) => {
    const initialGroups = vtosOrVets.map(v => [v]);
    const groupsTimeSorted = sortGroupsByStartTime(initialGroups, sortOrder);
    const groupsMerged = [];

    for (let i = 0; i < groupsTimeSorted.length; i++) {
        const grpi = [...groupsTimeSorted[i]];
        for (let j = i + 1; j < groupsTimeSorted.length; j++) {
            const grpj = [...groupsTimeSorted[j]];
            const endTimeI = grpi[grpi.length-1].endTime;
            const startTimeJ = grpj[0].startTime;
            const gap = startTimeJ - endTimeI;
            if (gapValid(gap)) {
                grpi.push(...grpj);
            }
        }
        if (grpi.length > 1)
            groupsMerged.push(grpi);
    }

    const groupsMergedSorted = sortGroupsByDuration(groupsMerged, sortOrder);
    return groupsMergedSorted;
}