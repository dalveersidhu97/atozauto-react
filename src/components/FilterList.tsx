import { FC, Fragment, useId } from "react";
import { FilterType } from "../types";
import { TimeOperators } from "../constants";
import { Badge, Button, Card } from "flowbite-react";
import { intMinsToString, intMinsToTime12 } from "../utils/formatters";

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
                        if (timeRule.seconds > maxStartTime)
                            maxStartTime = timeRule.seconds
                        if (timeRule.seconds < minStartTime)
                            minStartTime = timeRule.seconds
                    }else {
                        if (timeRule.seconds > maxEndTime)
                            maxEndTime = timeRule.seconds
                        if (timeRule.seconds < minEndTime)
                            minEndTime = timeRule.seconds
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
                                    <span>{filter.forName} ({filter.date})</span>
                                </p>
                                {filter.timeRules.map((timeRule, j) => <Fragment key={'timeRule'+j}>
                                    <div>{timeRule.type} ({timeRule.op}): <span className="text-gray-500 font-semibold">{intMinsToTime12(timeRule.seconds || 0)}</span></div>
                                </Fragment>)}
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