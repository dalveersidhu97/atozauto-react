import { StorageKeys } from "../constants";
import { FilterType, PreferenceType, VTOType } from "../types";
import { deepEqualObjects } from "../utils/comparison.utils";
import { closeModal, finalCallBack, getUserInfo, isVTOAcceptable, looper, pressModalButton, pressModalButtonTemp, removeFilter, sortArray } from "../utils/content.utils";
import { convertTimeToMins } from "../utils/formatters";
import { createInfoBoxWithHTML, InjectorQueue, removeInfoBox } from "../utils/html.utils";
import { startMain } from "./init.content";

const getVtos = ({ isTestMode }: { isTestMode: boolean }) => {
    const vtos: VTOType[] = [];
    const expanders = document.querySelectorAll('div[data-test-component="StencilExpander"]');
    expanders.forEach(expander => {
        if (!expander) return;
        const h1 = expander.querySelector('h2')?.innerText;
        const vtoBadge = expander.querySelector('div[data-test-id="VtoForDay_countIcon"]');

        if (!isTestMode) {
            if (!vtoBadge) return;
            const numVTOText = vtoBadge.textContent || '';
            const numVTO = +numVTOText;
            if (!numVTO) return;
        }

        const expandedContent = expander.querySelector('div[data-test-component="StencilExpanderContent"]');
        if (!expandedContent) return;
        const cards = expandedContent.querySelectorAll('div[data-test-component="StencilReactCard"]');
        cards.forEach(card => {
            const button = card.querySelector('button');
            if ((button && button.innerText === 'Accept') || isTestMode) {
                const texts = card.querySelectorAll('div[data-test-component="StencilText"]');
                const time = texts[0].textContent || '';
                const times = time.split(' - ');
                const startTime = convertTimeToMins(times[0]);
                const endTime = convertTimeToMins(times[1]);
                const duration = texts[1].textContent || '';
                const cycle = texts[2].textContent || '';
                vtos.push({ date: h1, startTime, endTime, time, duration, cycle, button })
            }
        })
    })
    return vtos;
}

const acceptVTO = (vto: VTOType, isTestMode: boolean, callBack: () => void) => {
    console.log('Click VTO Button', vto);
    vto.button.click();
    if (isTestMode) {
        setTimeout(() => closeModal(callBack), 1000);
        return;
    }
    setTimeout(() => {
        const btnFound = pressModalButton(/^Accept VTO$/i, () => {
            removeInfoBox();
            let counter = 1;
            const interval = setInterval(() => {
                if (counter > 60) {
                    clearInterval(interval);
                    console.log('Ok button not found. Closing Modal')
                    closeModal(callBack);
                }
                pressModalButtonTemp(/^ok$/i, () => {
                    clearInterval(interval);
                    callBack();
                });
                counter++;
            }, 100)
        });
        if (!btnFound) {
            setTimeout(() => closeModal(callBack), 500);
            console.log('Accept VTO Button Not Found')
        }
        // pressModalButton(/^CANCEL$/i);
    }, 1000)
}

const acceptAllAcceptables = (filters: FilterType[], callBackOuter: () => void, { isTestMode }: { isTestMode: boolean }) => {
    let vtos = getVtos({ isTestMode });
    console.log('Ready VTOs', { vtos });
    let acceptables: { vto: VTOType, filter: FilterType }[] = [];
    for (let i = 0; i < vtos.length; i++) {
        const vto = vtos[i];
        const acceptableFilter = isVTOAcceptable(filters, vto);
        if (!!acceptableFilter) {
            acceptables.push({ vto, filter: acceptableFilter });
        }
    }
    console.log('Acceptable VTOs', { acceptables });
    const acceptablesSortedAsFilters = sortArray(acceptables, filters);
    console.log('Acceptable Sorted As Filters VTOs', { acceptablesSortedAsFilters });
    const injector = () => createInfoBoxWithHTML(`${acceptablesSortedAsFilters.length} Acceptable VTOs`);
    InjectorQueue.add(injector);
    looper(acceptablesSortedAsFilters, (acceptable, callBack, index) => {
        const vto = acceptable.vto;
        const filter = acceptable.filter;
        const injector = () => createInfoBoxWithHTML(`Accepting VTO...</br>(${index + 1} of ${acceptablesSortedAsFilters.length})`);
        InjectorQueue.add(injector);
        acceptVTO(vto, isTestMode, () => {
            !isTestMode && removeFilter(StorageKeys.vtoFilters, filter);
            vtos = vtos.filter(v => {
                if (deepEqualObjects(v, vto)) return false;
                return true;
            });
            callBack();
        });
    }, callBackOuter, 'AcceptVTOsLooper', 200);
}

const main = (preference: PreferenceType) => {
    console.log({ preference });
    chrome.storage.local.get(StorageKeys.vtoFilters, function ({ vtoFilters }) {
        const refreshMode = preference.refreshMode; // Smart | Full Speed
        const isTestMode = preference.testMode === 'On'; // On | Off
        const userName = getUserInfo().name || '';
        const filters = (vtoFilters || []).filter((f: FilterType) => f.forName.toLowerCase() === userName.toLowerCase()) || [];
        console.log('filters', filters);
        if (!filters.length) return;
        acceptAllAcceptables(filters, () => {
            finalCallBack(filters, preference);
        }, { isTestMode });
    });
}

startMain(main);