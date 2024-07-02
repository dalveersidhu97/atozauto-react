import { useCallback, useEffect } from "react";

export type UseLocalStorageProps<T> = {
    key: string,
    newValue?: T,
    getter?: (val?: T) => void,
    setter?: (oldValue?: T) => T
}

export type Storage<T> = {
    set: (setter?: ((oldValue?: T | undefined) => T) | undefined, getter?: ((val?: T | undefined) => void) | undefined, newValue?: T | undefined) => void,
    get: (getter: ((val?: T | undefined) => void) | undefined) => void
};

export const useChromeLocalStorage = <T,>({ key, newValue, getter, setter }: UseLocalStorageProps<T>) => {
    type Setter = UseLocalStorageProps<T>['setter'];
    type Getter = UseLocalStorageProps<T>['getter'];
    const set = useCallback((setter?: Setter, getter?: Getter, newValue?: T) => {
        const setVal = (newValue?: T) => {
            chrome.storage.local.set({ [key]: newValue }).then(() => {
                !!getter && getter(newValue);
            })
        }
        !!setter && chrome.storage.local.get(key).then((result) => {
            const newValue = setter(result[key]);
            setVal(newValue);
        });
        !setter && setVal(newValue)
    }, [])
    const get = useCallback((getter: Getter) => {
        chrome.storage.local.get(key).then((result) => {
            !!getter && getter(result[key]);
        });
    }, [])

    useEffect(() => {
        if (!getter && !setter && newValue === undefined) return;
        if (!!getter && (!!setter || newValue !== undefined)) {
            set(setter, getter, newValue)
        } else if (!!getter) {
            get(getter);
        } else if (!!setter || newValue !== undefined) {
            set(setter, getter, newValue)
        }
    }, [get, set]);
    const storage: Storage<T> = { set, get };
    return storage;
}