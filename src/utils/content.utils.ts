import { StorageKeys, defaultPreference } from "../constants";
import { FilterType, PreferenceType, TimeOps, VETType, VTOType } from "../types";
import { deepEqualObjects } from "./comparison.utils";

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
            console.log({ modal })
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
    console.log(name, img?.getAttribute('src'));
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
            console.log(month, 'found');
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
    console.log({ parsedDate1, parsedDate2 })
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
    console.log(val1, op, val2, isValid)
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

    const startTimeOp = Object.keys(filter.startTime)[0] as TimeOps;
    const startTime = filter.startTime[startTimeOp] as number;
    const endTimeOp = Object.keys(filter.endTime)[0] as TimeOps;
    const endTime = filter.endTime[endTimeOp] as number;

    const isStartTimeValid = is(vto.startTime, startTimeOp, startTime);
    const isEndTimeValid = is(vto.endTime, endTimeOp, endTime);
    const isValid = isStartTimeValid && isEndTimeValid;
    return isValid;
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
        console.log(loopName, ': Starting');
        const fnToCall = () => fn(arr[i], () => {
            if (arr.length - 1 > i) {
                loopName && console.log(loopName, ': Next');
                looper(arr, fn, whenDoneFn, loopName, delay, initialDelay, i + 1);
            } else {
                whenDoneFn();
                loopName && console.log(loopName, ': Done')
            };
        }, i);
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

const injectInfoToPage = (html: string) => {
    const id = 'azauto-info-box';
    let infoBox = document.getElementById(id);
    const defaultTop = '20rem';
    const defaultLeft = '.5rem';
    chrome.storage.local.get(StorageKeys.infoBoxPos, (result) => {
        const pos: { top: string, left: string } = result[StorageKeys.infoBoxPos] || { top: defaultTop, lef: defaultLeft };
        let timeout: NodeJS.Timeout;
        const onMove = (pos: { top: number, left: number }) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                // save position
                chrome.storage.local.set({ [StorageKeys.infoBoxPos]: { top: pos.top + 'px', left: pos.left + 'px' } });
            }, 100);
        }

        if (!infoBox) { // create info box if does not exist
            const { onMouseDown, onMouseMove, onMouseUp, onMouseMoveThrottled } = createDraggableListeners(id, onMove);
            infoBox = document.createElement('div');
            infoBox.style.top = pos.top;
            infoBox.style.left = pos.left;
            infoBox.id = 'azauto-info-box';
            infoBox.classList.add('azauto-info-box');
            document.body.appendChild(infoBox);
            infoBox.onmousedown = onMouseDown;
            document.onmousemove = onMouseMove;
            document.onmouseup = onMouseUp;

            infoBox.addEventListener('touchstart', (e) => {
                onMouseDown(e);
                document.addEventListener('touchmove', onMouseMoveThrottled, { passive: false });
                const touchEndListener = (e: TouchEvent) => {
                    document.removeEventListener('touchmove', onMouseMoveThrottled);
                    onMouseUp(e);
                    document.removeEventListener('touchend', touchEndListener);
                };
                document.addEventListener('touchend', touchEndListener);
            }, { passive: false });
        }
        infoBox.innerHTML = html;
    })



}
const createInfoInnerHTML = (formattedScheduleTime: string, delaySeconds: number) => {
    const delaySecs = delaySeconds % 60;
    const delyMins = (delaySeconds - delaySecs) / 60;
    const delayStr = delaySeconds <= 60 ? `${delaySeconds}s` : `${delyMins}m ${delaySecs % 60}s`
    return `
        <div id="azauto-info-box-container">
            <div id="azauto-info-title">Reloading</div>
            <div>${formattedScheduleTime}</div>
            <div>${delayStr}</div>
        </div>
    `;
}

export const finalCallBack = (filters: FilterType[], preference: PreferenceType) => {
    const secheduledDate = new Date();
    const now = new Date();
    const refreshMode = preference.refreshMode; // Smart | Full Speed
    if (!filters.length || refreshMode === "Off") return;
    if (refreshMode === 'Full Speed')
        return window.location.reload();

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
    const formattedScheduleTime = secheduledDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    const realodingIn = (delay / 1000);
    console.log('Reloading at', formattedScheduleTime, `(in ${realodingIn.toFixed(2)}s)`);
    injectInfoToPage(createInfoInnerHTML(formattedScheduleTime, Math.round(realodingIn)));
    setInterval(() => {
        let reloadingIn = ((secheduledDate.getTime() - new Date().getTime()) / 1000);
        if (reloadingIn < 0) reloadingIn = 0;
        console.log('Realoding in', `${reloadingIn < 0 ? 0 : reloadingIn.toFixed(2)}s`);
        injectInfoToPage(createInfoInnerHTML(formattedScheduleTime, Math.round(reloadingIn)));
    }, 1000);
}

export const createDraggableListeners = (id: string, callback: (a: { top: number, left: number }) => void) => {
    let offsetX: number, offsetY: number;
    let isDragging = false;
    let rafPending = false;

    function onMouseDown(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        isDragging = true;
        const draggableElement = document.getElementById(id);
        if (!draggableElement) return;
        if (event instanceof MouseEvent) {
            offsetX = event.clientX - draggableElement.getBoundingClientRect().left;
            offsetY = event.clientY - draggableElement.getBoundingClientRect().top;
        } else if (event instanceof TouchEvent && event.touches.length === 1) {
            offsetX = event.touches[0].clientX - draggableElement.getBoundingClientRect().left;
            offsetY = event.touches[0].clientY - draggableElement.getBoundingClientRect().top;
        }
    }
    function onMouseMove(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        const draggableElement = document.getElementById(id);
        if (!draggableElement) return;

        const maxTop = window.innerHeight - draggableElement.offsetHeight;
        const maxLeft = window.innerWidth - draggableElement.offsetWidth;
        if (isDragging) {
            let left, top;
            if (event instanceof MouseEvent) {
                left = event.clientX - offsetX;
                top = event.clientY - offsetY;
            } else if (event instanceof TouchEvent && event.touches.length === 1) {
                left = event.touches[0].clientX - offsetX;
                top = event.touches[0].clientY - offsetY;
            } else { left = 0, top = 0; }
            if (left > maxLeft) left = maxLeft;
            if (left < 0) left = 0;
            if (top > maxTop) top = maxTop;
            if (top < 0) top = 0;
            draggableElement.style.top = `${top}px`;
            draggableElement.style.left = `${left}px`;
            callback({ top, left });
        }
    }
    function onMouseMoveThrottled(event: TouchEvent) {
        if (!rafPending) {
            rafPending = true;
            requestAnimationFrame(() => {
                onMouseMove(event);
                rafPending = false;
            });
        }
    }
    function onMouseUp(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        isDragging = false;
    }
    return { onMouseDown, onMouseMove, onMouseUp, onMouseMoveThrottled };
}