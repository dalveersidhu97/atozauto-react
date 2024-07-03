import { useState } from "react"
import { useChromeLocalStorage } from "./useChromeLocalStorage";
import { StorageKeys, defaultUIPreference } from "../constants";

type UIPreferenceType = typeof defaultUIPreference;

export const useUIPreference = () => {
    const state = useState<UIPreferenceType>();
    const storage = useChromeLocalStorage({
        key: StorageKeys.uiPreference, getter: (pref: UIPreferenceType | undefined) => {
            state[1](pref || defaultUIPreference)
        }
    });

    const setUIPreference = (setter: (oldPref?: UIPreferenceType)=>UIPreferenceType) => {
        storage.set(setter, (newPref)=>state[1](newPref))
    }

    return [state[0], setUIPreference];
}