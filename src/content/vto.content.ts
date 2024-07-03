import { StorageKeys } from "../constants";
import { FilterType, PreferenceType, VTOType } from "../types";
import { closeModal, finalCallBack, getUserInfo, isVTOAcceptable, looper, pressModalButton, removeFilter, sortArray } from "../utils/content.utils";
import { convertTimeToMins } from "../utils/formatters";
import { startMain } from "./init.content";

const getVtos = ({ isTestMode }: { isTestMode: boolean }) => {
    const vtos: VTOType[] = [];
    const expanders = document.querySelectorAll('div[data-test-component="StencilExpander"]');
    expanders.forEach(expander => {
        if (!expander) return;
        const h1 = expander.querySelector('h2')?.innerText;
        const vtoBadge = expander.querySelector('div[data-test-id="VtoForDay_countIcon"]');

        if (!vtoBadge) return;
        const numVTOText = vtoBadge.textContent || '';
        const numVTO = +numVTOText;
        if (!numVTO) return;

        const expandedContent = expander.querySelector('div[data-test-component="StencilExpanderContent"]');
        if (!expandedContent) return;
        const cards = expandedContent.querySelectorAll('div[data-test-component="StencilReactCard"]');
        cards.forEach(card => {
            const button = card.querySelector('button');
            if (button && button.innerText === 'Accept') {
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
    if (isTestMode) {
        setTimeout(() => closeModal(callBack), 2000);
        return;
    }
    vto.button.click()
    setTimeout(() => {
        pressModalButton(/^Accept VTO$/i, () => {
            callBack && callBack();
            let counter = 1;
            const interval = setInterval(() => {
                if (counter <= 10) clearInterval(interval);
                pressModalButton(/^ok$/i, () => clearInterval(interval));
                counter++;
            }, 500)
        });
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

    looper(acceptablesSortedAsFilters, (acceptable, callBack) => {
        const vto = acceptable.vto;
        const filter = acceptable.filter;
        acceptVTO(vto, isTestMode, () => {
            removeFilter(StorageKeys.vtoFilters, filter);
            vtos = vtos.filter(v => {
                if (JSON.stringify(v) === JSON.stringify(vto)) return false;
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