import { Label, Tabs } from "flowbite-react"
import { TopNav } from "./components/TopNav"
import { flowbiteTabsTheme } from "./flowbite-themes/tabs.theme"
import { Preference } from "./components/Preference"
import { FilterInputForm } from "./components/FilterInputForm"
import { useFilterList } from "./hooks/useFilterList"
import { FilterList } from "./components/FilterList"

function App() {
	const forName = 'Dalveer';
	const {
		filterList: vtoFilterList,
		addFilter: addVTOFilter,
		deleteFilter: deleteVTOFilter,
		clearAllFilter: clearAllVTOFilters
	} = useFilterList('vtoFilters');
	const {
		filterList: vetFilterList,
		addFilter: addVETFilter,
		deleteFilter: deleteVETFilter,
		clearAllFilter: clearAllVETFilters
	} = useFilterList('vetFilters');

	return (
		<div style={{ minWidth: '28rem', background: '#eeeeee01' }}>
			<TopNav></TopNav>
			<div className="p-4 flex flex-col gap-4">
				<Preference></Preference>
				<Tabs variant="fullWidth" theme={flowbiteTabsTheme}>
					<Tabs.Item active title="VTO">
						<div className="flex flex-col gap-4">
							<Label>Create a VTO Filter</Label>
							<FilterInputForm onSubmit={addVTOFilter} forFirstName={forName} submitBtnText="Add VTO Filter" />
							<FilterList onClearAll={clearAllVTOFilters} onDelete={deleteVTOFilter} list={vtoFilterList} />
						</div>
					</Tabs.Item>
					<Tabs.Item title="VET">
						<div className="flex flex-col gap-4">
							<Label>Create a VET Filter</Label>
							<FilterInputForm onSubmit={addVETFilter} forFirstName={forName} submitBtnText="Add VET Filter" />
							<FilterList onClearAll={clearAllVETFilters} onDelete={deleteVETFilter} list={vetFilterList} />
						</div>
					</Tabs.Item>
				</Tabs>
			</div>
		</div>
	)
}

export default App
