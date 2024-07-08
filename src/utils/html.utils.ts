import { StorageKeys } from "../constants";
type InjectorFn = () => void;
type Injector = { injectorFn: InjectorFn, delay: number, delayNext: number };

export class InjectorQueue {
    private static NEXT_DELAY = 500;
    private static injectors: Injector[] = [];
    private static busyTill: number = Date.now();

    private constructor() { }

    public static add(injectorFn: InjectorFn, delayMillis: number = 0, delayMillisNext: number = InjectorQueue.NEXT_DELAY) {
        const injector = { injectorFn, delay: delayMillis, delayNext: delayMillisNext };
        InjectorQueue.injectors.push(injector);
        InjectorQueue.next();
    }

    private static next() {
        let delaySum = InjectorQueue.busyTill - Date.now();
        if (delaySum < 0) delaySum = 0;
        while (InjectorQueue.injectors.length > 0) {
            const nextInjector = InjectorQueue.injectors.shift();
            if (nextInjector) {
                const { injectorFn, delay, delayNext } = nextInjector;
                delaySum += delay;
                setTimeout(() => {
                    injectorFn();
                }, delaySum);
                delaySum += delayNext; // Add delayNext for the next injector
            }
        }
        InjectorQueue.busyTill = Date.now() + delaySum;
    }
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
    createReloadingInfoHTML(formattedScheduleTime, Math.round(reloadingIn));
    setInterval(() => {
        let reloadingIn = ((secheduledDate!.getTime() - new Date().getTime()) / 1000);
        if (reloadingIn < 0) reloadingIn = 0;
        createReloadingInfoHTML(formattedScheduleTime, Math.round(reloadingIn));
    }, 1000);
}

export const removeInfoBox = () => {
    document.getElementById('azauto-info-box')?.remove();
}

export const createInfoBoxWithHTML = (html: string, stay?: boolean) => {
    const element = document.createElement('div');
    element.classList.add('azauto-info-box-container');
    element.innerHTML = html;
    injectInfoToPage('', (infoBox) => {
        if (infoBox.children.length) {
            infoBox.insertBefore(element, infoBox.children[0]);
        } else {
            infoBox.appendChild(element)
        }
    });
    !stay && setTimeout(()=>{
        element.classList.add('fade-out');
        setTimeout(() => {
            element.remove();
        }, 1500);
    }, 1500);
}

export const createReloadingInfoHTML = (formattedScheduleTime: string, delaySeconds: number) => {
    const delaySecs = delaySeconds % 60;
    const delyMins = (delaySeconds - delaySecs) / 60;
    const delayStr = delaySeconds <= 60 ? `${delaySeconds}s` : `${delyMins}m ${delaySecs % 60}s`;
    const timerTextElement = document.getElementById('azauto-timer-text');
    if (timerTextElement) {
        timerTextElement.innerText = delayStr;
        return;
    }
    createInfoBoxWithHTML(`
        <div id="azauto-info-title">Reloading...</div>
        <div>${formattedScheduleTime}</div>
        <div id="azauto-timer-text">${delayStr}</div>
    `, true);
}
export const getInfoBoxElement = () => document.getElementById('azauto-info-box');
export const injectInfoToPage = (html: string, callBack?: (element: HTMLElement) => void) => {
    const id = 'azauto-info-box';
    let infoBox = document.getElementById(id);
    const defaultTop = '20rem';
    const defaultLeft = '.5rem';
    if (infoBox) {
        if (html) infoBox.innerHTML = html;
        !!callBack && callBack(infoBox);
        return;
    }
    const createInfoBox = (top: string, left: string) => {
        infoBox = document.createElement('div');
        infoBox.style.top = top;
        infoBox.style.left = left;
        infoBox.id = id;
        infoBox.classList.add('azauto-info-box');
        document.body.appendChild(infoBox);
        if (html) infoBox.innerHTML = html;
        return infoBox;
    }
    chrome.storage.local.get(StorageKeys.infoBoxPos, (result) => {
        const pos: { top: string, left: string } = result[StorageKeys.infoBoxPos] || { top: defaultTop, lef: defaultLeft };
        let timeout: NodeJS.Timeout;
        const onMove = (pos: { top: number, left: number }) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                chrome.storage.local.set({ [StorageKeys.infoBoxPos]: { top: pos.top + 'px', left: pos.left + 'px' } });
            }, 100);
        }
        const infoBox = createInfoBox(pos.top, pos.left);

        const { onMouseDown, onMouseMove, onMouseUp } = createDraggableListeners(id, onMove);
        infoBox.onmousedown = onMouseDown;
        document.onmousemove = onMouseMove;
        document.onmouseup = onMouseUp;
        infoBox.addEventListener('touchstart', onMouseDown, { passive: false });
        infoBox.addEventListener('touchmove', onMouseMove, { passive: false });
        infoBox.addEventListener('touchend', onMouseUp, { passive: false });
        !!callBack && callBack(infoBox);
    })
}

export const createDraggableListeners = (id: string, callback: (a: { top: number, left: number }) => void) => {
    let offsetX: number, offsetY: number;
    let isDragging = false;

    function onMouseDown(event: MouseEvent | TouchEvent) {
        const draggableElement = document.getElementById(id);
        if (!draggableElement) return;
        event.preventDefault();
        isDragging = true;
        if (event instanceof MouseEvent) {
            offsetX = event.clientX - draggableElement.getBoundingClientRect().left;
            offsetY = event.clientY - draggableElement.getBoundingClientRect().top;
        } else if (event instanceof TouchEvent && event.touches.length === 1) {
            offsetX = event.touches[0].clientX - draggableElement.getBoundingClientRect().left;
            offsetY = event.touches[0].clientY - draggableElement.getBoundingClientRect().top;
        }
    }
    function onMouseMove(event: MouseEvent | TouchEvent) {
        const draggableElement = document.getElementById(id);
        if (!draggableElement) return;
        event.preventDefault();

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
    function onMouseUp(event: MouseEvent | TouchEvent) {
        event.preventDefault();
        isDragging = false;
    }
    return { onMouseDown, onMouseMove, onMouseUp };
}