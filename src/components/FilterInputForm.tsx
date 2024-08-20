import React, { FC, Fragment, useEffect, useId, useState } from "react";
import { adjustIntMinsForMinimumValue, formatDate, formatDateForInput, getCurrentTime, intMinsToTimeStr, moveObjectWithKeyToFront, timeStringToIntMins } from "../utils/formatters";
import { Button, Datepicker, Dropdown, TextInput } from "flowbite-react";
import { IoIosArrowDown } from "react-icons/io";
import { FilterType, TimeOps, TimeRule } from "../types";
import { defaultPreference, defaultUIPreference, TimeOperators, DurationOperators } from "../constants";
import { MdDeleteOutline } from "react-icons/md";
import { useUserInfo } from "../hooks/useUserInfo";
import { datesAreOnSameDay } from "../utils/comparison.utils";
import { useUIPreference } from "../hooks/useUIPreference";
import { NumberInput } from "./Preference";

const TimeInput: FC<{ defaultValue?: number, min?: number, max?: number, onChange: (intMinutes: number, timeStr: string) => any }> = ({ defaultValue, onChange, min, max }) => {
    const inputIdPrefix = useId();
    const defaultValueStr = defaultValue != undefined ? intMinsToTimeStr(defaultValue) : getCurrentTime();
    const minValueStr = min !== undefined ? intMinsToTimeStr(min) : undefined;
    const maxValueStr = max !== undefined ? intMinsToTimeStr(max) : undefined;

    const onChangeListener = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
        !!e.target.value && onChange(timeStringToIntMins(e.target.value), e.target.value);
    }

    return <>
        <div className="relative">
            <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd" />
                </svg>
            </div>
            <input onChange={onChangeListener} min={minValueStr} max={maxValueStr} value={defaultValueStr} type="time" id={inputIdPrefix} className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
        </div>
    </>;
}

const DurationInput: FC<{ defaultValue?: number, min?: number, max?: number, onChange: (intMinutes: number) => any }> = ({ defaultValue, onChange, min, max }) => {
    const minutes = defaultValue || 0;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    const onChangeHours = (e: React.ChangeEvent<HTMLInputElement>) => {
        let hours = parseInt(e.target.value);
        if (isNaN(hours)) {
            hours = 0;
        }
        const newMinutes = hours * 60 + m;
        onChange(newMinutes);
    }
    const onChangeMins = (e: React.ChangeEvent<HTMLInputElement>) => {
        let mins = parseInt(e.target.value);
        if (isNaN(mins)) {
            mins = 0;
        }
        const newMinutes = h * 60 + mins;
        onChange(newMinutes);
    }

    return <>
        <div role="textbox" className="flex shrink-1 grow-0 items-center text-sm gap-1.5">
            <input onChange={onChangeHours} min={0} max={24} maxLength={2} size={1} defaultValue={h} type="text" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 grow" />
            <div>h</div>
            <input onChange={(onChangeMins)} min={0} max={60} maxLength={2} size={1} defaultValue={m} type="text" className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 grow" />
            <div className="">m</div>
        </div>
    </>;
}

const Select: FC<{ options: { key: string, label: string }[], selectedKey: string, onChange: (key: string) => any }> = ({ options, selectedKey, onChange }) => {
    const opts = moveObjectWithKeyToFront(options, selectedKey || options[0].key);
    const inputIdPrefix = useId();

    return (
        <Dropdown label={""} renderTrigger={() => <Button color={'gray'} size={'xs'}>
            <div className="flex items-center justify-between gap-2 text-xs">
                <span>{opts[0].label.toUpperCase()}</span>
                <IoIosArrowDown />
            </div>
        </Button>}>
            {opts.map((option, index) => <React.Fragment key={inputIdPrefix + index}>
                <Dropdown.Item onClick={() => onChange(option.key)}>{option.label.toUpperCase()}</Dropdown.Item>
            </React.Fragment>)}
        </Dropdown >
    );
}

type CreateFilterFn = (filter: FilterType) => any;
export const FilterInputForm: FC<{ onCreateVTOFilter: CreateFilterFn, onCreateVETFilter: CreateFilterFn }> = ({ onCreateVETFilter, onCreateVTOFilter }) => {

    const { UIPreference, setUIPreference } = useUIPreference();

    const filterType = UIPreference.lastFilterType || defaultUIPreference.lastFilterType;
    const setFilterType = (fType: 'VTO' | 'VET') => setUIPreference(() => ({ lastFilterType: fType }))
    const [timeRules, setTimeRules] = useState<TimeRule[]>([{ op: 'eq', minutes: 80, type: 'Start Time' }, { op: 'eq', minutes: 710, type: 'End Time' }]);
    const [date, setDate] = useState(new Date());
    const [userInfo] = useUserInfo();
    const [forName, setForName] = useState('');

    useEffect(() => {
        if (userInfo?.name)
            setForName(userInfo.name)
    }, [userInfo?.name]);

    const onClickCreatefilter = () => {
        if (!timeRules.length) return;
        let maxStartTimeVal = 0;
        timeRules.forEach(rule => {
            if (rule.type === 'Start Time' && rule.minutes > maxStartTimeVal)
                maxStartTimeVal = rule.minutes
        })
        const filter: FilterType = {
            timeRules: timeRules.map(rule => {
                if (rule.type === 'Start Time') return rule;
                return { ...rule, minutes: adjustIntMinsForMinimumValue(rule.minutes, maxStartTimeVal) }
            }),
            date: formatDate(date),
            forName: forName.trim()
        }
        const createFilter = filterType === 'VTO' ? onCreateVTOFilter : onCreateVETFilter;
        createFilter(filter);
    }

    const onClickAddRule = () => {
        setTimeRules(prevRules => {
            const newRule: TimeRule = prevRules.length ? { ...prevRules[prevRules.length - 1] } : { op: 'eq', minutes: 0, type: 'Start Time' };
            return [...prevRules, newRule];
        })
    }

    const updateRuleAtIndex = (i: number, newRule: TimeRule) => {
        setTimeRules(prevRules => {
            return prevRules.map((rule, j) => {
                if (i === j && newRule.type === 'Duration' && rule.type !== 'Duration') {
                    return { ...newRule, op: 'eq', minutes: 0 }
                }
                return i === j ? newRule : rule
            });
        })
    }

    const deleteRuleAtIndex = (i: number) => {
        setTimeRules(prevRules => {
            return prevRules.filter((_r, j) => i !== j);
        })
    }

    const onChangeDateInput = (date: Date) => {
        if (!date) return;
        setDate(date);
    }

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    return <>
        <TextInput id="firstName" value={forName} onChange={({ target: { value } }) => setForName(value.trim())} placeholder="First Name" addon="&nbsp;For&nbsp;" />
        <div className="grid grid-cols-2 gap-2">
            <Button outline={filterType === 'VTO'} color={'gray'} onClick={() => { setFilterType('VTO') }}>VTO</Button>
            <Button outline={filterType === 'VET'} color={'gray'} onClick={() => { setFilterType('VET') }}>VET</Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
            <Datepicker minDate={new Date()} value={formatDateForInput(date)} onSelectedDateChanged={onChangeDateInput} />
            <Button outline={datesAreOnSameDay(date, today)} color={'gray'} onClick={() => setDate(new Date())}>Today</Button>
            <Button outline={datesAreOnSameDay(date, tomorrow)} color={'gray'} onClick={() => {
                const d = new Date();
                d.setDate(d.getDate() + 1);
                setDate(d);
            }}>Tomorrow</Button>
        </div>
        <div className="grid grid-cols-[1fr_1fr_1fr_max-content] gap-2">
            {timeRules.map((rule, i) => {
                const operators = rule.type === 'Duration' ? DurationOperators : TimeOperators;
                return <Fragment key={'rule' + i + Math.random()}>
                    <Select
                        options={[{ key: 'Start Time', label: 'Start Time' }, { key: 'End Time', label: 'End Time' }, { key: 'Duration', label: 'Duration' }]}
                        selectedKey={rule.type}
                        onChange={(timeType) => updateRuleAtIndex(i, { ...rule, type: timeType as TimeRule['type'] })}
                    />
                    <Select options={operators} selectedKey={rule.op} onChange={(opKey) => updateRuleAtIndex(i, { ...rule, op: opKey as TimeOps })} />
                    {rule.type !== 'Duration' && <TimeInput onChange={(intMins) => updateRuleAtIndex(i, { ...rule, minutes: intMins })} defaultValue={rule.minutes} />}
                    {rule.type === 'Duration' && <DurationInput onChange={(intMins) => updateRuleAtIndex(i, { ...rule, minutes: intMins })} defaultValue={rule.minutes} />}
                    <button className="flex items-center justify-center" onClick={() => deleteRuleAtIndex(i)}><MdDeleteOutline className="w-6 h-6" /></button>
                </Fragment>
            })}
        </div>
        <Button color={'gray'} className="max-w-fit self-center" onClick={onClickAddRule}>+ Add Rule</Button>
        <Button onClick={onClickCreatefilter}>{`Add ${filterType} Filter`}</Button>
    </>
}