import { useState } from "react";
import { useChromeLocalStorage } from "./useChromeLocalStorage";
import { FilterType } from "../types";

export const useFilterList = (filterListKey: string) => {
	const [filterList, setFilterList] = useState<FilterType[]>([]);
	const listStorage = useChromeLocalStorage<FilterType[]>({
		key: filterListKey, getter: (val) => {
			setFilterList(val || []);
		}
	});
	const deleteFilter = (filter: FilterType) => {
		listStorage.set((oldList) => {
			let newFilterList = (oldList || []).slice().filter(f => {
				return JSON.stringify(f) !== JSON.stringify(filter);
			});
			return newFilterList;
		}, (newList) => setFilterList(newList || []))
	}
	const clearAllFilter = () => {
		listStorage.set(undefined, (newVal) => setFilterList(newVal || []), []);
	}
	const addFilter = (filter: FilterType) => {
		listStorage.set((oldList) => {
			let newFilterList = (oldList || []).slice();
			newFilterList.push(filter);
			return newFilterList;
		}, (newList) => setFilterList(newList || []))
	}
	return {
		filterList,
		addFilter,
		deleteFilter,
		clearAllFilter,
	}
}