import { FC, Fragment, useId } from "react";
import { FilterType } from "../types";
import { TimeOperators } from "../constants";
import { Badge, Button, Card } from "flowbite-react";
import { intMinsToString, intMinsToTime12 } from "../utils/formatters";

const getFilterKeyVal = (filter: FilterType['startTime']) => {
    const keys = Object.keys(filter);
    if (keys.length > 0) {
        const key = keys[0];
        const value = filter[key as keyof typeof filter];
        const label = TimeOperators.find(op => op.key === key)?.label;
        if (key === undefined || value === undefined || label === undefined) return {};
        return {
            key: keys[0],
            value,
            label
        }
    }
    return {};
}

export const FilterList: FC<{ list: FilterType[], onDelete: (filter: FilterType) => any, filterType: string }> = ({ list, onDelete, filterType }) => {
    const keyPrefix = useId();
    const onClickDelete = (filter: FilterType) => {
        onDelete(filter);
    }
    if (!list.length) return <></>
    return <>
        <div className="flex flex-col gap-4">
            {list.map((filter, index) => {
                const startTimeOpVal = getFilterKeyVal(filter.startTime);
                const endTimeOpVal = getFilterKeyVal(filter.endTime);
                const duration = (endTimeOpVal.value || 0) - (startTimeOpVal.value || 0);
                return <Fragment key={keyPrefix + index + JSON.stringify(filter)}>
                    <div className="flex flex-col gap-0 text-xs shadow-sm border rounded-md p-4">
                        <div className="flex items-start gap-4 shrink-0">
                            <Badge color={filterType==='VTO'?'success':'indigo'} className="aspect-square tracking-widest shrink-0 p-6 self-center font-normal rounded-full text-base flex items-center justify-center">
                                {filterType}
                            </Badge>
                            <div className="flex-grow flex flex-col gap-2">
                                <p className="font-semibold text-gray-600 flex items-start gap-2 justify-between">
                                    <span>{filter.forName} ({filter.date})</span>
                                </p>
                                <div>Start Time ({startTimeOpVal.label}): <span className="text-gray-500 font-semibold">{intMinsToTime12(startTimeOpVal.value || 0)}</span></div>
                                <div>End Time ({endTimeOpVal.label}): <span className="text-gray-500 font-semibold">{intMinsToTime12(endTimeOpVal.value || 0)}</span></div>
                                <div className="text-gray-500">{intMinsToString(duration)}</div>
                            </div>
                            <div className="flex self-start">
                                <Button onClick={() => onClickDelete(filter)} size={'xs'} color={'red'}>Delete</Button>
                            </div>
                        </div>
                    </div>
                </Fragment>
            })}
        </div>
    </>
}