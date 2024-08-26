import { defaultPreference, StorageKeys } from "../constants";
import { PreferenceType } from "../types";
import { setUserInfo } from "../utils/content.utils";
import { createInfoBoxWithHTML, injectInfoToPage, InjectorQueue, injectReloadingInfoBoxMillis, removeInfoBox } from "../utils/html.utils";

const loaded = () => {
    const navigation = document.querySelector('nav[role="navigation"]');
    if (!navigation) return false;
    let loadingSpinner = document.querySelector('svg[data-test-id="VtoLandingPage_Spinner"]');
    if(!loadingSpinner) loadingSpinner = document.querySelector('svg[data-test-id="FindShiftsPageLoadingSpinner"]');
    if (!!loadingSpinner) {
        return false;
    };
    console.log('LOADED')
    return true;
}

export const startMain = (main: (preference: PreferenceType) => void) => {

    console.clear();
    let noResponseReloadTimeout: NodeJS.Timeout;
    const reloadIfNoResponse = () => {
        chrome.storage.local.get(StorageKeys.preference, function (result) {
            const preference = result.preference || {};
            if (preference.refreshMode !== 'Off') {
                InjectorQueue.add(()=>createInfoBoxWithHTML('Loading...'));
                const reloadingInMillis = 5*1000;
                noResponseReloadTimeout = setTimeout(() => {
                    window.location.reload();
                    injectReloadingInfoBoxMillis(reloadingInMillis);
                }, reloadingInMillis);
            }
        });
    }
    reloadIfNoResponse();
    setTimeout(() => !!setUserInfo && setUserInfo(), 100);

    const sessionInterval = setInterval(() => {
        const sessionModal = document.querySelector('div[aria-describedby="sr-session-expires-modal-message"]') as HTMLElement | undefined;
        if (!sessionModal) return;
        const styles = window.getComputedStyle(sessionModal);
        if (styles.display !== 'none') {
            const stayLoggedInButton = sessionModal.querySelector('#session-expires-modal-btn-stay-in') as HTMLButtonElement | undefined;
            stayLoggedInButton?.click();
            sessionModal.style.display = 'none';
            console.log('modal is visible')
        }
    }, 300);

    const inverval = setInterval(() => {
        if (loaded()) {
            InjectorQueue.add(()=>injectInfoToPage(' '));
            !!noResponseReloadTimeout && clearTimeout(noResponseReloadTimeout);
            clearInterval(inverval);
            chrome.storage.local.get(StorageKeys.preference, function (result) {
                const preference = result.preference || defaultPreference;
                Object.keys(defaultPreference).forEach(key => {
                    if (preference[key] === undefined) {
                        preference[key] = defaultPreference[key as keyof PreferenceType];
                    }
                });
                main(preference);
            });
            const GenericErrorContainer = document.querySelector('div[data-test-id="GenericErrorPageLayout"]');
            if (!!GenericErrorContainer)
                setTimeout(() => window.location.reload(), 2000);
        }
    }, 100);
}