import { StorageKeys } from "../constants";

type Injector = () => void;

export class InjectorQueue {
    private static injectors: Injector[] = [];
    private static interval: NodeJS.Timeout | undefined = undefined;
    private static delay = 500;
    private static isIntervalActive = false;

    private constructor() { }

    public static add(injector: Injector) {
        InjectorQueue.injectors.push(injector);
        if (!InjectorQueue.isIntervalActive) {
            InjectorQueue.startInterval();
        }
    }

    public static clear() {
        InjectorQueue.injectors = []; // Clear injectors array
        InjectorQueue.stopInterval();
    }

    private static startInterval() {
        if (InjectorQueue.injectors.length === 0) {
            InjectorQueue.isIntervalActive = false;
            return;
        }

        const nextInjector = InjectorQueue.injectors[0];

        InjectorQueue.isIntervalActive = true;
        nextInjector(); // Execute the next injector
        InjectorQueue.injectors.shift(); // Remove the first injector from the array

        InjectorQueue.interval = setTimeout(() => {
            InjectorQueue.startInterval();
        }, InjectorQueue.delay);
    }

    private static stopInterval() {
        clearTimeout(InjectorQueue.interval);
        InjectorQueue.isIntervalActive = false;
    }
}


export const injectTextBoxToPage = (text: string) => {
    injectInfoToPage(createInfoBoxHTML(text))
}

export const injectReloadingInfoBoxMillis = (millisInReload: number) => {
    const secheduledDate = new Date();
    secheduledDate.setMilliseconds(secheduledDate.getMilliseconds() + millisInReload);
    injectReloadingInfoBox(secheduledDate);
}

export const injectReloadingInfoBox = (secheduledDate: Date) => {
    const now = new Date();
    let reloadingInMillis = secheduledDate.getTime() - now.getTime();
    let reloadingIn = (reloadingInMillis / 1000);
    if (reloadingIn < 0) reloadingIn = 0;

    const formattedScheduleTime = secheduledDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    injectInfoToPage(createReloadingInfoHTML(formattedScheduleTime, Math.round(reloadingIn)));
    setInterval(() => {
        let reloadingIn = ((secheduledDate!.getTime() - new Date().getTime()) / 1000);
        if (reloadingIn < 0) reloadingIn = 0;
        injectInfoToPage(createReloadingInfoHTML(formattedScheduleTime, Math.round(reloadingIn)));
    }, 1000);
}

export const removeInfoBox = () => {
    document.getElementById('azauto-info-box')?.remove();
}

export const createInfoBoxHTML = (html: string) => {
    return `
        <div id="azauto-info-box-container">
            ${html}
        </div>
    `;
}

export const createReloadingInfoHTML = (formattedScheduleTime: string, delaySeconds: number) => {
    const delaySecs = delaySeconds % 60;
    const delyMins = (delaySeconds - delaySecs) / 60;
    const delayStr = delaySeconds <= 60 ? `${delaySeconds}s` : `${delyMins}m ${delaySecs % 60}s`;
    return createInfoBoxHTML(`
        <div id="azauto-info-title">Reloading</div>
        <div>${formattedScheduleTime}</div>
        <div>${delayStr}</div>
    `);
}

export const injectInfoToPage = (html: string) => {
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
            removeInfoBox();
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