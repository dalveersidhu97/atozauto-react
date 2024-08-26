import { FilterType, TimeRule, VoluntaryElementBaseType } from "../types";
import { equalDateStrings, is, isVTGroupAcceptable, sortArray } from "./content.utils";

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

export const makeGroups = <T extends VoluntaryElementBaseType>(vtosOrVets: T[], sortOrder: 'asc' | 'desc' = 'asc', gapValid: (gap: number) => boolean, totalGapValid: (totalGap: number) => boolean) => {
    const initialGroups = vtosOrVets.map(v => [v]);
    const groupsTimeSorted = sortGroupsByStartTime(initialGroups, sortOrder);
    const groupsMerged = [];
    for (let i = 0; i < groupsTimeSorted.length; i++) {
        const grpi = [...groupsTimeSorted[i]];
        let totalGap = 0;
        const startTimeI = grpi[0].startTime;

        for (let j = i+1; j < groupsTimeSorted.length; j++) {
            const grpj = [...groupsTimeSorted[j]];
            let endTimeI = grpi[grpi.length - 1].endTime;
            let startTimeJ = grpj[0].startTime;
            if (endTimeI < startTimeI) endTimeI = endTimeI + 24 * 60;
            const gap = startTimeJ - endTimeI;

            totalGap += gap;
            if (gapValid(gap) && totalGapValid(totalGap)) {
                grpi.push(...grpj);
            }
        }
        if (grpi.length > 1)
            groupsMerged.push(grpi);
    }

    groupsMerged.push(...initialGroups);

    const groupsMergedSorted = sortGroupsByDuration(groupsMerged, sortOrder);
    return groupsMergedSorted;
}

export const makeVTGroupsForFilter = <T extends VoluntaryElementBaseType>(vtosOrVets: T[], filter: FilterType) => {
    const gapRules = filter.timeRules.filter(rule => rule.type === 'Gap');
    gapRules.push({ minutes: -1, op: 'gt', type: 'Gap' });
    const totalGapRules = filter.timeRules.filter(rule => rule.type === 'Total Gap');
    totalGapRules.push({ minutes: -1, op: 'gt', type: 'Total Gap' });
    let vtGroups = makeGroups(
        vtosOrVets,
        filter.preferedDuration === 'Max' ? 'desc' : 'asc',
        (gap) => gapRules.every(rule => is(gap, rule.op, rule.minutes)),
        (totalGap) => totalGapRules.every(rule => is(totalGap, rule.op, rule.minutes))
    );
    return vtGroups;
}


export type Acceptable = { vtoOrVET: VoluntaryElementBaseType, filter: FilterType };
export const makeAcceptables = <T extends VoluntaryElementBaseType>(vtoOrVets: T[], date: string, filters: FilterType[]) => {
    let acceptables: Acceptable[] = [];
    let acceptableGprs = [];

    outer:
    for (let k = 0; k < filters.length; k++) {
        const filter = filters[k];
        let vetGroups = makeVTGroupsForFilter(vtoOrVets, filter);
        console.log({ vetGroups })
        if (!equalDateStrings(filter.date, date)) continue;
        vetGroups:
        for (let i = 0; i < vetGroups.length; i++) {
            const vtGrp = vetGroups[i];
            const acceptableFilter = isVTGroupAcceptable([filter], vtGrp);
            if (!!acceptableFilter) {
                for (let index = 0; index < acceptableGprs.length; index++) {
                    const existingGrp = acceptableGprs[index];
                    const startTimeA = existingGrp[0].startTime;
                    const endTimeA = existingGrp[existingGrp.length - 1].endTime;
                    const startTimeB = vtGrp[0].startTime;
                    const endTimeB = vtGrp[vtGrp.length - 1].endTime;
                    const isABeforeB = startTimeA < startTimeB && endTimeA <= startTimeB;
                    const isBBeforeA = startTimeB < startTimeA && endTimeB <= startTimeA;
                    if (!isABeforeB && !isBBeforeA)
                        continue vetGroups;
                }
                acceptableGprs.push(vtGrp);
                const acceptablesNext: Acceptable[] = vtGrp.map(vtoOrVET => ({ vtoOrVET, filter: acceptableFilter }))
                acceptables.push(...acceptablesNext);
                if (acceptableGprs.length >= filter.maxGroups) 
                    continue outer;
            }
        }
    }

    acceptables = acceptables.filter(acceptable => !acceptable.vtoOrVET.claimed);
    console.log('Acceptable VET Groups', acceptableGprs);
    console.log('Acceptable VETS', { acceptables });
    let acceptablesSortedAsFilters = sortArray(acceptables, filters);
    return acceptablesSortedAsFilters;
}