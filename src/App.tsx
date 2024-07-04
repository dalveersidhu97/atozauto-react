import { Button, FooterDivider, Label, Tabs } from "flowbite-react"
import { TopNav } from "./components/TopNav"
import { flowbiteTabsTheme } from "./flowbite-themes/tabs.theme"
import { Preference } from "./components/Preference"
import { FilterInputForm } from "./components/FilterInputForm"
import { useFilterList } from "./hooks/useFilterList"
import { FilterList } from "./components/FilterList"
import { StorageKeys } from "./constants"

function App() {
	const {
		filterList: vtoFilterList,
		addFilter: addVTOFilter,
		deleteFilter: deleteVTOFilter,
		clearAllFilter: clearAllVTOFilters
	} = useFilterList(StorageKeys.vtoFilters);
	const {
		filterList: vetFilterList,
		addFilter: addVETFilter,
		deleteFilter: deleteVETFilter,
		clearAllFilter: clearAllVETFilters
	} = useFilterList(StorageKeys.vetFilters);

	const onClickClearAll = () => {
		clearAllVETFilters();
		clearAllVTOFilters();
	}

	return (
		<div style={{ minWidth: '32rem', background: '#eeeeee01' }}>
			<TopNav></TopNav>
			<div className="p-4 flex flex-col gap-4">
				<Preference></Preference>
				<div className=" flex flex-col gap-4 border bg-gray-50 rounded-md p-4">
					<h2 className="text-base text-gray-700">Create a Filter</h2>
					<FilterInputForm onCreateVETFilter={addVETFilter} onCreateVTOFilter={addVTOFilter} />
				</div>
				<div className="flex justify-between items-center">
					<h2 className="text-base text-gray-700">Active filters</h2>
					<Button onClick={onClickClearAll} color="gray" size={'sm'} >Clear All</Button>
				</div>
				<FilterList onDelete={deleteVTOFilter} list={vtoFilterList} filterType={'VTO'} />
				<FilterList onDelete={deleteVETFilter} list={vetFilterList} filterType={'VET'}/>
				{vtoFilterList.length === 0 && vetFilterList.length===0 && <div className="text-center text-gray-500">No Filters</div>}
			</div>
		</div>
	)
}

export default App
