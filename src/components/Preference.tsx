import { Label, Radio } from "flowbite-react";
import React, { useEffect } from "react";
import { FC, useId, useState } from "react";
import { padWithZero } from "../utils/formatters";
import { useChromeLocalStorage } from "../hooks/useChromeLocalStorage";
import { PreferenceType } from "../types";
import { defaultPreference } from "../constants";

const NumberInput: FC<{ label: string, desc: string, unit: string, value: number, onChange: (value: number) => any, min?: number, max?: number }> = ({ label, desc, unit, value, onChange, min, max }) => {
    const inputIdPrefix = useId();
    const onChangeListener = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = +e.target.value;
        onChange(value || min || 1);
    }

    const onIncrement = () => {
        if (max !== undefined && value + 1 > max) return;
        onChange(value + 1)
    }

    const onDecrement = () => {
        if (min !== undefined && value - 1 < min) return;
        onChange(value - 1)
    }

    return <>
        <div className="flex flex-col gap-1">
            {label && <Label className="font-normal text-xs" htmlFor={inputIdPrefix}>{label}</Label>}
            <div className="relative flex items-center">
                <button onClick={onDecrement} type="button" id={inputIdPrefix + "decrement-button"} data-input-counter-decrement={inputIdPrefix} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-s-lg py-2 px-4 h-11 focus:ring-gray-100 dark:focus:ring-gray-700">
                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 2">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h16" />
                    </svg>
                </button>
                <input onChange={onChangeListener} value={value} type="text" id={inputIdPrefix} data-input-counter data-input-counter-min="1" data-input-counter-max="5" aria-describedby="helper-text-explanation" className="bg-gray-50 border-x-0 border-gray-300 h-11 font-medium text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 pb-5" />
                {unit && <div className="absolute bottom-1 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center text-xs text-gray-400 space-x-1 rtl:space-x-reverse">
                    <span>{unit}</span>
                </div>}
                <button onClick={onIncrement} type="button" id={inputIdPrefix + "increment-button"} data-input-counter-increment={inputIdPrefix} className="bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 dark:border-gray-600 hover:bg-gray-200 border border-gray-300 rounded-e-lg px-4 py-2 h-11 focus:ring-gray-100 dark:focus:ring-gray-700">
                    <svg className="w-3 h-3 text-gray-900 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 18">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 1v16M1 9h16" />
                    </svg>
                </button>
            </div>
            {desc && <p id="helper-text-explanation" className="text-xs max-w-44 text-gray-500 dark:text-gray-400 truncate">{desc}</p>}
        </div>
    </>
}

const RadioInput: FC<{ onChange: (value: string) => any, name: string, options: { label: string, value: string }[], value: string }> = ({ onChange, options, name, value }) => {
    const inputIdPrefix = useId();
    const onCheckedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            onChange(e.target.value);
        }
    }
    return <>
        {options.map(({ label, value: val }, index) => <React.Fragment key={inputIdPrefix + index}>
            <div className="flex items-center gap-2">
                <Radio onChange={onCheckedChange} id={`${inputIdPrefix}-${index}`} name={name} value={val} checked={value === val} />
                <Label className="text-xs" htmlFor={`${inputIdPrefix}-${index}`}>{label}</Label>
            </div>
        </React.Fragment>)}
    </>
}

export const Preference: FC = () => {

    const refreshModeOptions = [{ label: 'Off', value: 'Off' }, { label: 'Smart', value: 'Smart' }, { label: 'Full Speed', value: 'Full Speed' }];
    const testModeOptions = [{ label: 'Off', value: 'Off' }, { label: 'On', value: 'On' }]

    const [preference, setPreferenceState] = useState<PreferenceType>(defaultPreference);
    const p = preference;

    const { set } = useChromeLocalStorage<PreferenceType>({
        key: 'preference', 
        getter: (pref) => {
            setPreferenceState(pref || defaultPreference)
        },
    });

    const setPreference = (pref: Partial<PreferenceType>) => {
        set((oldPref) => {
            let newPref = oldPref || defaultPreference;
            newPref = { ...newPref, ...pref }
            return newPref;
        }, (newPref) => setPreferenceState(newPref || defaultPreference))
    }

    useEffect(() => {
        console.log('preference', preference)
    }, [preference]);

    const hotMinsMultDesc = `Hot Mins: ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map(v => v * p.minutesMultiplier).filter(v => v < 61).map(v => ':' + padWithZero(v)).join(',')}`;

    return <>
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                    <Label className="min-w-28 text-gray-600">Test Mode:</Label>
                    <RadioInput
                        name="TestMode"
                        onChange={(mode) => setPreference({ testMode: mode as any })}
                        value={p.testMode}
                        options={testModeOptions}
                    />
                    <div></div>
                </div>
                <div className="flex gap-4 items-center">
                    <Label className="min-w-28 text-gray-600">Refresh Mode:</Label>
                    <RadioInput
                        name="RefreshMode"
                        onChange={(mode) => setPreference({ refreshMode: mode as any })}
                        value={p.refreshMode}
                        options={refreshModeOptions}
                    />
                </div>
                {p.refreshMode === 'Smart' && <div className="flex flex-col gap-4 border rounded-md p-4">
                    <Label className="text-gray-500">Smart Mode Settings</Label>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                        <div className="flex flex-col gap-2">
                            <NumberInput min={1} max={60} label="Hot Minutes Multiplier " unit="Minutes" desc={hotMinsMultDesc} value={p.minutesMultiplier} onChange={(val) => setPreference({ minutesMultiplier: val })} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <NumberInput min={1} max={60} label="Refresh for first " unit="Seconds" desc={`When its a hot minute`} value={p.hotSecondsLessThan} onChange={(val) => setPreference({ hotSecondsLessThan: val })} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <NumberInput min={0} max={59} label="Refresh after every" unit="Seconds" desc="When its a hot minute" value={p.secondsIncrementor} onChange={(val) => setPreference({ secondsIncrementor: val })} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <NumberInput min={1} max={60} label="Refresh after every " unit="Minutes" desc="After hot minute is over" value={p.minutesIncrementor} onChange={(val) => setPreference({ minutesIncrementor: val })} />
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    </>
}