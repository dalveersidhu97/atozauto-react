import { useState } from "react"
import { useChromeLocalStorage } from "./useChromeLocalStorage";
import { StorageKeys, defaultUIPreference } from "../constants";

export type UIPreferenceType = { smartModeCollapsed: boolean, lastFilterType: 'VTO' | 'VET' };

export const useUIPreference = () => {
    const [state, setState] = useState<Partial<UIPreferenceType>>({});
    const storage = useChromeLocalStorage({
        key: StorageKeys.uiPreference, getter: (pref: UIPreferenceType | undefined) => {
            setState(pref || defaultUIPreference)
        }
    });

    const setUIPreference = (setter: (oldPref?: UIPreferenceType) => Partial<UIPreferenceType>) => {
        const newSetter = (oldPref?: UIPreferenceType) => {
            const newPref = setter(oldPref);
            return { ...oldPref, ...newPref } as UIPreferenceType
        }
        storage.set(newSetter, (newPref) => setState({ ...newPref }))
    }

    return { UIPreference: state, setUIPreference };
}