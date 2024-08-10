import { StorageKeys, defaultPreference } from "../constants";
import { FilterType, PreferenceType, TimeOps, VETType, VTOType } from "../types";
import { deepEqualObjects } from "./comparison.utils";
import { InjectorQueue, createReloadingInfoHTML, injectInfoToPage, injectReloadingInfoBox, removeInfoBox } from "./html.utils";

export function contains(context: Element, selector: string, text: RegExp | string) {
    var elements = context.querySelectorAll(selector);
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (RegExp(text).test(element.textContent || '')) return element;
    }
    return undefined;
}

export const closeModal = (callBack: () => void) => {
    const modals = document.querySelectorAll('div[role="dialog"]'); // try role="dialog"
    modals.forEach(modal => {
        if (!modal) {
            console.log('No modal');
        } else {
            const button = contains(modal, 'button[data-test-component="ModalCloseButton"]', '') as HTMLButtonElement;
            if (!button) {
                console.log('No button');
            } else {
                button.click();
                callBack && callBack();
            }
        }
    })

}
export const pressModalButton = (regex: RegExp, callBack: () => void) => {
    const modal = document.querySelector('div[data-test-component="StencilModal"]'); // try role="dialog"
    if (!modal) {
        console.log('No modal');
        return false;
    }
    const button = contains(modal, 'button', regex) as HTMLButtonElement | undefined;
    if (!button) {
        console.log('No button', regex);
        return false;
    }
    button.click();
    callBack && callBack();
    return true;
}
export const pressModalButtonTemp = (regex: RegExp, callBack: () => void) => {
    const modals = document.querySelectorAll('div[role="dialog"]');
    let btnFound = false;
    modals.forEach(modal => {
        if (!modal) {
            console.log('No modal');
        } else {
            const button = contains(modal, 'button', regex) as HTMLButtonElement | undefined;
            if (!button) {
                console.log('No button', regex);
            } else {
                button.click();
                callBack && callBack();
                btnFound = true;
            }
        }
    });
    return btnFound;
}

export const getUserInfo = () => {
    if (typeof document === 'undefined') return { name: '' };
    const navbar = document.querySelector('#navbar-menu');
    if (!navbar) return {};
    const img = navbar.querySelector(`img[alt="User's avatar"]`) as HTMLElement | undefined;
    const name = img?.parentElement?.parentElement?.innerText;
    return { name: name?.trim(), img: img?.getAttribute('src') }
}

export const setUserInfo = () => {
    const userInfo = getUserInfo();
    chrome.storage.local.set({ [StorageKeys.userInfo]: userInfo });
}

function convertStringToNumber(str: string) {
    // Remove non-numeric characters from the string
    const numericStr = str.replace(/\D/g, '');
    // Convert the cleaned string to a number
    const number = parseInt(numericStr, 10); // Use radix 10 to ensure proper parsing
    return number;
}

const parseDate = (dateString: string) => { // date formats: jul 03|Jul 3|July 5|Fri, Jul 05
    if (!dateString || !dateString.trim())
        return undefined;
    const dateStr = dateString.trim().toLowerCase();
    const shortMonths = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const fullMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const months = [...shortMonths, ...fullMonths];
    const dateParts = dateStr.split(',');
    for (let i = 0; i < dateParts.length; i++) {
        const part = dateParts[i].trim();
        const month = months.find(m => part.includes(m.toLowerCase()));
        if (month) {
            const partsOfPart = part.split(' ');
            if (partsOfPart.length === 2) {
                const day = convertStringToNumber(partsOfPart[1]) || convertStringToNumber(partsOfPart[0]);
                const fullMonthIndex = fullMonths.findIndex(m => m === month);
                if (fullMonthIndex !== -1)
                    return { month: shortMonths[fullMonthIndex], day }
                return { month, day };
            }
        }
    }
}

export const equalDateStrings = (dateString1: string, dateString2: string) => { // date formats: jul 03|Jul 3|July 5|Fri, Jul 05
    const parsedDate1 = parseDate(dateString1);
    const parsedDate2 = parseDate(dateString2);
    if (!parsedDate1 || !parsedDate2)
        return false;
    const datesEqual = parsedDate1.day === parsedDate2.day && parsedDate1.month === parsedDate2.month
    return datesEqual;
}

const is = (val1: number, op: TimeOps, val2: number) => {
    let isValid = false;
    switch (op) {
        case 'gt': { if (val1 > val2) isValid = true; break; }
        case 'gte': { if (val1 >= val2) isValid = true; break; }
        case 'lt': { if (val1 < val2) isValid = true; break; }
        case 'lte': { if (val1 <= val2) isValid = true; break; }
        case 'eq': { if (val1 === val2) isValid = true; break; }
    }
    isValid && console.log(val1, op, val2, isValid)
    return isValid;
}

export const validateVTOFilter = (vto: VTOType, filter: FilterType) => {
    const userName = getUserInfo().name || '';
    const vtoDate = vto.date;
    const requiredDate = filter.date;

    if (filter.forName.toLowerCase().trim() !== userName.toLowerCase().trim()) {
        console.log('User name does not match')
        return false;
    }

    if (!equalDateStrings(vtoDate, requiredDate)) {
        return false;
    }

    for (let index = 0; index < filter.timeRules.length; index++) {
        const timeRule = filter.timeRules[index];
        let valid = true;
        if (timeRule.type === 'Start Time')
            valid = is(vto.startTime, timeRule.op, timeRule.seconds);
        else
            valid = is(vto.endTime, timeRule.op, timeRule.seconds);
        if (!valid) return false;
    }
    return true;
}

export const isVTOAcceptable = (vtoFilters: FilterType[], vto: VTOType) => {
    for (let i = 0; i < vtoFilters.length; i++) {
        const isFilterValid = validateVTOFilter(vto, vtoFilters[i]);
        if (isFilterValid) {
            return vtoFilters[i];
        }
    }
    return false;
}

const getArryObjectIndex = (obj: Object, arr: Object[]) => {
    const arrStr = arr.map(f => JSON.stringify(f));
    return arrStr.indexOf(JSON.stringify(obj))
}


export const sortArray = (acceptables: { vto?: VTOType, vet?: VETType, filter: FilterType }[], filters: FilterType[]) => {
    function compare(a: any, b: any) {
        if (getArryObjectIndex(a.filter, filters) < getArryObjectIndex(b.filter, filters))
            return -1;
        if (getArryObjectIndex(a.filter, filters) > getArryObjectIndex(b.filter, filters))
            return 1;
        return 0;
    }

    return acceptables.sort(compare);
}

export const looper = <T>(arr: T[], fn: (e: T, callback: () => void, i: number) => void, whenDoneFn: () => void, loopName: string, delayTime?: number, initialDelay?: number, index?: number) => {
    console.log(loopName, ': Entering', (index || 0) + 1, '/', arr.length);
    let i = index || 0;
    let delay = delayTime || 0;
    let intialDel = initialDelay || 0;
    if (arr.length > i) {
        const fnToCall = () => {
            fn(arr[i], () => {
                if (arr.length - 1 > i) {
                    looper(arr, fn, whenDoneFn, loopName, delay, initialDelay, i + 1);
                } else {
                    whenDoneFn();
                    loopName && console.log(loopName, ': Done')
                };
            }, i)
        };
        setTimeout(fnToCall, (i === 0 ? 0 : delay) + (i === 0 ? intialDel : 0));
    } else {
        whenDoneFn();
        loopName && console.log(loopName, ': End')
    }
}

export const removeFilter = (filterKey: string, filterToDelete: FilterType) => {
    chrome.storage.local.get(filterKey, function (result) {
        const filters: FilterType[] = result[filterKey] || [];
        const newFilters = filters.filter(filter => {
            if (deepEqualObjects(filterToDelete, filter)) {
                return false
            }
            return true;
        });
        chrome.storage.local.set({ [filterKey]: newFilters });
    });
}

export const finalCallBack = (filters: FilterType[], preference: PreferenceType) => {
    const secheduledDate = new Date();
    const now = new Date();
    const refreshMode = preference.refreshMode; // Smart | Full Speed
    if (!filters.length || refreshMode === "Off") {
        return InjectorQueue.add(removeInfoBox);
    };
    if (refreshMode === 'Full Speed') {
        InjectorQueue.add(removeInfoBox);
        return window.location.reload();
    }

    const currentMins = now.getMinutes();
    const currentSeconds = now.getSeconds();
    const hotMinsMultiplier = preference.hotMinutesMultiplier || defaultPreference.hotMinutesMultiplier;
    const hotSecondsLessThan = preference.hotSecondsLessThan || defaultPreference.hotSecondsLessThan;
    const incrementMinsBy = preference.minutesIncrementBy || defaultPreference.minutesIncrementBy;
    const incrementSecondsBy = preference.secondsIncrementBy || defaultPreference.secondsIncrementBy;

    const nextHotMins = currentMins + hotMinsMultiplier - currentMins % hotMinsMultiplier;
    const incrementMins = () => {
        if (currentMins + incrementMinsBy <= nextHotMins) {
            secheduledDate.setMinutes(currentMins + incrementMinsBy);
        } else {
            secheduledDate.setMinutes(nextHotMins)
        }
        secheduledDate.setSeconds(0);
        secheduledDate.setMilliseconds(0);
    }

    if (currentMins % hotMinsMultiplier === 0) {
        if (currentSeconds < hotSecondsLessThan) {
            const nextRefreshSecond = hotSecondsLessThan < currentSeconds + incrementSecondsBy ? hotSecondsLessThan : currentSeconds + incrementSecondsBy
            secheduledDate.setSeconds(nextRefreshSecond);
        } else
            incrementMins();
    } else {
        incrementMins();
    }
    secheduledDate.setMilliseconds(secheduledDate.getMilliseconds() + 50);

    let delay = secheduledDate.getTime() - now.getTime();
    if (delay < 0) delay = 0;
    setTimeout(() => window.location.reload(), delay);

    const finalInjector = () => injectReloadingInfoBox(secheduledDate);
    InjectorQueue.add(finalInjector);
}