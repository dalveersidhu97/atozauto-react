import { StorageKeys } from "../constants";
import { PreferenceType } from "../types";
import { setUserInfo } from "../utils/content.utils";

const loaded = () => {
    const h1 = document.querySelector('h1[data-test-component="StencilH1"]');
    if (!h1) return false;
    const vtoSpinner = document.querySelector('svg[data-test-id="VtoLandingPage_Spinner"]');
    if (!!vtoSpinner) {
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
                noResponseReloadTimeout = setTimeout(() => window.location.reload(), 10*1000);
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
            !!noResponseReloadTimeout && clearTimeout(noResponseReloadTimeout);
            clearInterval(inverval);
            chrome.storage.local.get(StorageKeys.preference, function (result) {
                const preference = result.preference || {};
                main(preference);
            });
            const GenericErrorContainer = document.querySelector('div[data-test-id="GenericErrorPageLayout"]');
            if (!!GenericErrorContainer)
                setTimeout(() => window.location.reload(), 2000);
        }
    }, 100);
}