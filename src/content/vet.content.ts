import { StorageKeys } from "../constants";
import { FilterType, PreferenceType, VETType } from "../types";
import { closeModal, finalCallBack, isVTOAcceptable, looper, pressModalButton, pressModalButtonTemp, removeFilter, sortArray } from "../utils/content.utils";
import { convertTimeToMins, dateFormatter } from "../utils/formatters";
import { startMain } from "./init.content";
import { extractDateFromVetHeader } from "./vet.utils";

const getVetsFromContext = (context: Element, { isTestMode }: { isTestMode: boolean }) => {
    const presentation = document.querySelector('div[role="presentation"]');
    if (!presentation) return [];
    const listHeader = presentation.querySelector('div[data-test-id="ClaimedShiftsColHeader"]');
    if (!listHeader) return [];
    const listHeaderText = listHeader.textContent || '';
    const dateStr = extractDateFromVetHeader(listHeaderText);
    const vets: VETType[] = [];
    const items = context.querySelectorAll('div[role="listitem"]')
    console.log(items.length);
    items.forEach(listItem => {
        const heading = listItem.querySelector('div[role="heading"]');
        if (!!heading) {
            let button = listItem.querySelector('button[data-test-id="AddOpportunityModalButton"]');
            if (isTestMode)
                button = listItem.querySelector('button[data-test-id="AddOpportunityModalButton"]')
                    || listItem.querySelector('button[data-testid="OpportunityDetailsModalButton"]')
                    || listItem.querySelector('button[data-testid="ViewDetailsButton"]');
            if (button && heading.textContent) {
                const timeStr = heading.textContent.split(' ')[0];
                const startTimeStr = timeStr.split('-')[0];
                const endTimeStr = timeStr.split('-')[1];
                const startTime = convertTimeToMins(startTimeStr);
                const vet = {
                    button,
                    startTimeStr,
                    endTimeStr,
                    date: dateStr,
                    startTime,
                    endTime: convertTimeToMins(endTimeStr, startTime)
                }
                console.log(vet);
                vets.push(vet);
            }
        }

    });
    return vets;
}

const getVets = ({ isTestMode }: { isTestMode: boolean }) => {
    const presentation = document.querySelector('div[role="presentation"]');
    if (!presentation) return [];
    const vets = getVetsFromContext(presentation, { isTestMode });
    return vets;
}


const acceptVET = (vet: VETType, isTestMode: boolean, callBack: (vetAccepted?: boolean) => void) => {
    console.log('Click VET Button', vet);
    vet.button.click();
    if (isTestMode) {
        setTimeout(() => closeModal(callBack), 2000);
        return;
    }
    setTimeout(() => {
        const btnFound = pressModalButton(/^yes, add shift$/i, () => {
            let counter = 1;
            const interval = setInterval(() => {
                if (counter > 60) {
                    clearInterval(interval);
                    closeModal(callBack);
                }
                pressModalButtonTemp(/^done$/i, () => {
                    clearInterval(interval);
                    callBack(true);
                });
                pressModalButtonTemp(/^ok$/i, () => {
                    clearInterval(interval);
                    callBack(false);
                });
                counter++;
            }, 100);
        });
        if (!btnFound) {
            setTimeout(() => closeModal(callBack), 500);
        }
    }, 0)
}

const waitForLoadingOver = (callBack: () => void) => {
    console.log('Waiting for vets Loading to Over.')
    let counter = 0;
    const intervalMillis = 500;
    const maxWaitMillis = 5000;
    const maxCounter = maxWaitMillis / intervalMillis;
    const interval = setInterval(() => {
        counter++;
        if (counter > maxCounter) {
            console.log('Loading Wait Time Over');
            clearInterval(interval);
            return callBack();
        }
        let loadingDone = false;
        const presentation = document.querySelector('div[role="presentation"]');
        if (!presentation) return callBack();
        const rows = presentation.children;
        if (rows.length === 3) {
            const thirdRow = rows[2];
            const vets = getVetsFromContext(thirdRow, { isTestMode: true });
            if (vets.length > 0) {
                console.log('VETs Loaded');
                loadingDone = true;
            } else {
                const firstListItem = thirdRow.querySelector('div[role="listitem"]');
                if (firstListItem) {
                    const textDiv = firstListItem.querySelector('div[data-test-component="StencilText"]');
                    if (!!textDiv) {
                        loadingDone = !(textDiv.textContent || '').includes('There aren’t any available shifts.');
                        // console.log(textDiv.innerText);
                    }
                }
            }
        } else {
            console.log('No Third Row found in Presentation')
            loadingDone = true;
        }

        if (loadingDone) {
            console.log({ loadingDone })
            clearInterval(interval);
            callBack();
        }
    }, intervalMillis);
}

const getSelectedDay = () => {
    const daySelector = document.querySelector('div[data-test-id="day-selector"]');
    if (!daySelector) return undefined;
    const tabList = daySelector.querySelector('div[role="tablist"]');
    const labelQuery = `div[aria-label*="selected"]`;
    if (!tabList) return undefined;
    const card = tabList.querySelector(labelQuery);
    return card;
}


const getNumberOfAvailableShiftsFromDayLabel = (text: string) => { // "Wednesday, Jun 26. 0 shifts available."
    const regex = /\b(\d+)\s+shifts?\s+available\b/;
    const match = text.match(regex);
    if (match) {
        const numberOfShifts = match[1];
        return +numberOfShifts;
    } else {
        console.log("No shifts available information found.");
        return NaN;
    }
}

const selectDay = (inputDate: string, callback: () => void, shouldWaitForLoading: boolean, shouldScroll: boolean, isTestMode: boolean) => {
    const parts = inputDate.split(' ');
    const date = parts[0] + ' ' + parseInt(parts[1], 10).toString(); // converting Jul 01 to Jul 1
    const daySelector = document.querySelector('div[data-test-id="day-selector"]');
    if (!daySelector) {
        console.log('No day Selector')
        return;
    }
    const tabList = daySelector.querySelector('div[role="tablist"]') as HTMLElement;
    let cardFound = false;
    const labelQuery = `div[aria-label*="${date.replace(' ', '  ')}"]`;
    const card = daySelector.querySelector(labelQuery) as HTMLElement;
    if (!card) {
        console.log('Day Tab not found for ', date);
        return;
    }
    const cardLabel = card.getAttribute("aria-label") || '';
    const numAvailableShifts = getNumberOfAvailableShiftsFromDayLabel(cardLabel);
    console.log(numAvailableShifts, 'Shifts Available', inputDate);
    // tabList.scrollLeft = card.offsetLeft - tabList.offsetLeft;
    shouldScroll && tabList.scroll({ left: card.offsetLeft - tabList.offsetLeft, behavior: 'smooth' });
    if (!!card) {
        card.click();
        if (numAvailableShifts === 0 && !isTestMode)
            setTimeout(callback, 10);
        else {
            shouldWaitForLoading && setTimeout(() => waitForLoadingOver(callback), 10);
            !shouldWaitForLoading && setTimeout(callback, 10);
        }
        cardFound = true;
        console.log('Selected Date: ', date)
    }
    if (!cardFound) console.log('Day Tab not found for ', date);
}

const removeDuplicates = (arr: string[] = []) => {
    return arr.filter((item, index) => arr.indexOf(item) === index);
}

const acceptAllAcceptables = (filters: FilterType[], callBackOuter: () => void, { isTestMode }: { isTestMode: boolean }) => {
    let vets = getVets({ isTestMode });
    console.log('Ready VETS', { vets });
    type Acceptable = { vet?: VETType, filter: FilterType };
    let acceptables: { vet: VETType, filter: FilterType }[] = [];
    for (let i = 0; i < vets.length; i++) {
        const vet = vets[i];
        const acceptableFilter = isVTOAcceptable(filters, vet);
        if (!!acceptableFilter) {
            acceptables.push({ vet, filter: acceptableFilter });
        }
    }
    console.log('Acceptable VETS', { acceptables });
    const acceptablesSortedAsFilters = sortArray(acceptables, filters);
    console.log('Acceptable Sorted As Filters VETS', { acceptablesSortedAsFilters });

    looper(acceptablesSortedAsFilters, (acceptable: Acceptable, callBack: () => void) => {
        const vet = acceptable.vet;
        const filter = acceptable.filter;
        acceptVET(vet, isTestMode, (vetAccepted) => {
            !isTestMode && vetAccepted && removeFilter(StorageKeys.vetFilters, filter);
            vets = vets.filter(v => {
                if (JSON.stringify(v) === JSON.stringify(vet)) return false;
                return true;
            });
            callBack();
        });
    }, callBackOuter, 'AcceptVETSLooper', 200);
}

const prepareSelectableFilterDates = (filters: FilterType[]) => {
    const allFilterDates = filters.map(filter => filter.date.split(',')[0])
    const selectableDates = removeDuplicates(allFilterDates);
    const urlParams = new URLSearchParams(window.location.search);
    const urlDate = urlParams.get('date');
    let preSelectedDate = '';
    let nextPreSelectedDate = selectableDates[0];
    if (urlDate) {
        preSelectedDate = dateFormatter(urlDate);
        if (selectableDates.includes(preSelectedDate)) {
            selectableDates.splice(selectableDates.indexOf(preSelectedDate), 1);
            selectableDates.unshift(preSelectedDate);
        }
        console.log('Pre Selected Date is', preSelectedDate);
    }
    !!nextPreSelectedDate && selectableDates.push(nextPreSelectedDate);
    return { selectableDates, preSelectedDate };
}

const main = (preference: PreferenceType) => {
    console.log({ preference });
    const refreshMode = preference.refreshMode; // Smart | Full Speed
    const isTestMode = preference.testMode === 'On'; // On | Off

    chrome.storage.local.get(StorageKeys.vetFilters, function (result) {
        const filters = result.vetFilters || [];
        console.log('vetFilters', filters);
        const { selectableDates, preSelectedDate } = prepareSelectableFilterDates(filters);

        looper(selectableDates, (date, callBack, index) => {
            const notWaitForLoading = date === preSelectedDate || index === selectableDates.length - 1;
            const shouldNotScroll = index === 0 || (index === selectableDates.length - 1 && selectableDates.length === 2)
            selectDay(date, () => {
                acceptAllAcceptables(filters, callBack, { isTestMode })
            }, !notWaitForLoading, !shouldNotScroll, isTestMode);
        }, () => {
            finalCallBack(filters, preference);
        }, 'SelectDayLooper', 0, 0)
    });
}

startMain(main);


