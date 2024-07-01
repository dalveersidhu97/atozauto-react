import { Datepicker, Timeline, Label, Tabs, TextInput, Button, Dropdown, ButtonGroup, Card } from "flowbite-react"
import { TopNav } from "./components/TopNav"
import { flowbiteTabsTheme } from "./flowbite-themes/tabs.theme"
import { Preference } from "./components/Preference"
import { FilterInputForm } from "./components/FilterInputForm"
import React, { FC, useId, useState } from "react"
import { FilterType, TimeOps } from "./types"
import { TimeOperators } from "./constants"
import { intMinsToString, intMinsToTime12 } from "./utils/formatters"

const getFilterKeyVal = (filter: FilterType['startTime']) => {
  const keys = Object.keys(filter);
  if (keys.length > 0) {
    const key = keys[0];
    const value = filter[key as keyof typeof filter];
    const label = TimeOperators.find(op=>op.key===key)?.label;
    if (!key || !value || !label) return {};
    return { 
      key: keys[0], 
      value,
      label
    }
  }
  return {};
}

const FilterList: FC<{ list: FilterType[], onDelete: (filter:FilterType)=>any, onClearAll:()=>any }> = ({ list, onDelete, onClearAll }) => {
  const keyPrefix = useId();
  const onClickDelete = (filter: FilterType) => {
    onDelete(filter);
  }
  return <>
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h5 className="text-base text-gray-600 flex justify-between items-start">Applied filters</h5>
        <Button onClick={()=>onClearAll()} color="gray" size={'sm'} >Clear All</Button>
      </div>
      {list.map((filter, index) => {
        const startTimeOpVal = getFilterKeyVal(filter.startTime);
        const endTimeOpVal = getFilterKeyVal(filter.endTime);
        const duration = (endTimeOpVal.value||0)-(startTimeOpVal.value||0);
        return <React.Fragment key={keyPrefix + index+JSON.stringify(filter)}>
          <Card>
            <div className="flex flex-col gap-0 text-xs">
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-600">{filter.date} ({filter.forName})</p>
                <Button onClick={()=>onClickDelete(filter)} size={'xs'} color={'red'}>Delete</Button>
              </div>
              <div className="flex flex-col gap-2">
                <div>Start Time ({startTimeOpVal.label}): <span className="text-gray-500 font-semibold">{intMinsToTime12(startTimeOpVal.value||0)}</span></div>
                <div>End Time ({endTimeOpVal.label}): <span className="text-gray-500 font-semibold">{intMinsToTime12(endTimeOpVal.value||0)}</span></div>
                <div className="text-gray-500">{intMinsToString(duration)}</div>
              </div>
            </div>
          </Card>
        </React.Fragment>
      })}
      {list.length===0 && <div className="text-center text-gray-500">No Filters</div>}
    </div>
  </>
}

const vtoFilterList: FilterType[] = [
  {
    "startTime": {
      "eq": 80
    },
    "endTime": {
      "gt": 600
    },
    "date": "Jul 04, 2024",
    "forName": "Dalveer"
  },
  {
    "startTime": {
      "eq": 80
    },
    "endTime": {
      "lt": 710
    },
    "date": "Jul 05, 2024",
    "forName": "Dalveer"
  }
];

function App() {
  const forName = 'Dalveer';

  const [filterList, setFilterList] = useState(vtoFilterList);

  const onFilterDelete = (filter: FilterType) => {
    let newFilterList = filterList.slice().filter(f=>{
      return JSON.stringify(f)!==JSON.stringify(filter);
    });

    setFilterList(newFilterList);
  }
  const clearAllFilter = () => {
    setFilterList([]);
  }
  const onVTOFilterAdd = (filter: FilterType) => {
    setFilterList(prev=>[...prev, filter]);
    console.log('Add VTO Filter', filter)
  }
  const onVETFilterAdd = (filter: FilterType) => {
    setFilterList(prev=>[...prev, filter]);
  }

  return (
    <div style={{ minWidth: '28rem', background: '#eeeeee01' }}>
      <TopNav></TopNav>
      <div className="p-4 flex flex-col gap-4">
        <Preference></Preference>
        <Tabs variant="fullWidth" theme={flowbiteTabsTheme}>
          <Tabs.Item active title="VTO">
            <div className="flex flex-col gap-4">
              <Label>Create a VTO Filter</Label>
              <FilterInputForm onSubmit={onVTOFilterAdd} forFirstName={forName} submitBtnText="Add VTO Filter" />
              <FilterList onClearAll={clearAllFilter} onDelete={onFilterDelete} list={filterList} />
            </div>
          </Tabs.Item>
          <Tabs.Item title="VET">
            <div className="flex flex-col gap-4">
              <Label>Create a VET Filter</Label>
              <FilterInputForm onSubmit={onVETFilterAdd} forFirstName={forName} submitBtnText="Add VET Filter" />
              <FilterList onClearAll={clearAllFilter} onDelete={onFilterDelete} list={filterList} />
            </div>
          </Tabs.Item>
        </Tabs>
      </div>

    </div>
  )
}

export default App
