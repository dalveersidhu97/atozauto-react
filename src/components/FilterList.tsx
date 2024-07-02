import { FC, Fragment, useId } from "react";
import { FilterType } from "../types";
import { TimeOperators } from "../constants";
import { Button, Card } from "flowbite-react";
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

export const FilterList: FC<{ list: FilterType[], onDelete: (filter: FilterType) => any, onClearAll: () => any }> = ({ list, onDelete, onClearAll }) => {
    const keyPrefix = useId();
    const onClickDelete = (filter: FilterType) => {
        onDelete(filter);
    }
    const onClickClearAll = () => {
        onClearAll();
    }
    return <>
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <h5 className="text-base text-gray-600 flex justify-between items-start">Applied filters</h5>
                <Button onClick={onClickClearAll} color="gray" size={'sm'} >Clear All</Button>
            </div>
            {list.map((filter, index) => {
                const startTimeOpVal = getFilterKeyVal(filter.startTime);
                const endTimeOpVal = getFilterKeyVal(filter.endTime);
                const duration = (endTimeOpVal.value || 0) - (startTimeOpVal.value || 0);
                return <Fragment key={keyPrefix + index + JSON.stringify(filter)}>
                    <Card>
                        <div className="flex flex-col gap-0 text-xs">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-gray-600">{filter.date} ({filter.forName})</p>
                                <Button onClick={() => onClickDelete(filter)} size={'xs'} color={'red'}>Delete</Button>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div>Start Time ({startTimeOpVal.label}): <span className="text-gray-500 font-semibold">{intMinsToTime12(startTimeOpVal.value || 0)}</span></div>
                                <div>End Time ({endTimeOpVal.label}): <span className="text-gray-500 font-semibold">{intMinsToTime12(endTimeOpVal.value || 0)}</span></div>
                                <div className="text-gray-500">{intMinsToString(duration)}</div>
                            </div>
                        </div>
                    </Card>
                </Fragment>
            })}
            {list.length === 0 && <div className="text-center text-gray-500">No Filters</div>}
        </div>
    </>
}