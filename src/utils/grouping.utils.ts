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
        let endTimeA = a[a.length - 1].endTime;
        if (endTimeA <= startTimeA) {
            endTimeA = endTimeA + 24 * 60;
        }
        const startTimeB = b[0].startTime;
        let endTimeB = b[b.length - 1].endTime;
        if (endTimeB <= startTimeB) {
            endTimeB = endTimeB + 24 * 60;
        }
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

        let j = i + 1;
        let counter = groupsTimeSorted.length - 1;

        while (counter > 0) {
            counter--;
            if (j === groupsTimeSorted.length) {
                j = 0;
            }
            const grpj = [...groupsTimeSorted[j]];
            let endTimeI = grpi[grpi.length - 1].endTime;
            let startTimeJ = grpj[0].startTime;
            if (startTimeJ >= 24 * 60) startTimeJ = startTimeJ - 24 * 60;
            if (endTimeI >= 24 * 60) endTimeI = endTimeI - 24 * 60;
            const gap = startTimeJ - endTimeI;
            if (gapValid(gap)) {
                grpi.push(...grpj);
            }
            j++;
        }

        if (grpi.length > 1)
            groupsMerged.push(grpi);
    }

    groupsMerged.push(...initialGroups);

    const groupsMergedSorted = sortGroupsByDuration(groupsMerged, sortOrder);
    return groupsMergedSorted;
}