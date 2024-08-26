import { FC, Fragment, useId } from "react";
import { FilterType } from "../types";
import { TimeOperators } from "../constants";
import { Badge, Button, Card } from "flowbite-react";
import { intMinsToString, intMinsToTime12 } from "../utils/formatters";

const durationString = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    let str = ``;
    if (h) str = `${h}h`;
    if (m) str = str + ` ${m}m`;
    return str.trim();
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
                let maxStartTime = 0;
                let minStartTime = Infinity;
                let maxEndTime = 0;
                let minEndTime = Infinity;

                filter.timeRules.forEach(timeRule => {
                    if (timeRule.type === 'Start Time') {
                        if (timeRule.minutes > maxStartTime)
                            maxStartTime = timeRule.minutes
                        if (timeRule.minutes < minStartTime)
                            minStartTime = timeRule.minutes
                    }else if(timeRule.type === 'End Time') {
                        if (timeRule.minutes > maxEndTime)
                            maxEndTime = timeRule.minutes
                        if (timeRule.minutes < minEndTime)
                            minEndTime = timeRule.minutes
                    }
                });

                const maxDuration = maxEndTime - minStartTime;
                const minDuration = minEndTime - maxStartTime;
                return <Fragment key={keyPrefix + index + JSON.stringify(filter)}>
                    <div className="flex flex-col gap-0 text-xs shadow-sm border rounded-md p-4">
                        <div className="flex items-start gap-4 shrink-0">
                            <Badge color={filterType==='VTO'?'success':'indigo'} className="aspect-square tracking-widest shrink-0 p-6 self-center font-normal rounded-full text-base flex items-center justify-center">
                                {filterType}
                            </Badge>
                            <div className="flex-grow flex flex-col gap-2">
                                <p className="font-semibold text-gray-600 flex items-start gap-2 justify-between">
                                    <span>{filter.forName} ({filter.date}) <span className="font-normal text-xs">{filter.deleteAfterMatch?'(Use Once)':''}</span></span>
                                </p>
                                {filter.timeRules.map((timeRule, j) => <Fragment key={'timeRule'+j}>
                                    <div>{timeRule.type} ({timeRule.op}): <span className="text-gray-500 font-semibold">{['Duration', 'Gap', 'Total Gap'].includes(timeRule.type) ?  durationString(timeRule.minutes): intMinsToTime12(timeRule.minutes || 0)}</span></div>
                                </Fragment>)}
                                <p className="text-gray-600 flex items-start gap-2 justify-between">
                                    <span>Prefer {filter.preferedDuration === 'Max' ? 'Maximum' : 'Minimum'} Duration</span>
                                </p>
                                <div className="text-gray-500">{minDuration > 0 && minDuration < maxDuration ? `${intMinsToString(minDuration)} - ` : ''}{maxDuration > 0 && intMinsToString(maxDuration)}</div>
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