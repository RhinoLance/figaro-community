console.log("Filter cycle script loaded");

const FILTER_LIST = ["50", "100", "150", "200", "250", "300", "400", "500"];

let scanTimerId;
let txMonitorTimerId;

let resume;

const getEnabledFilters = async () => {
	
	const availableFilters = ["None"];

	for( let cI=0; cI<FILTER_LIST.length; cI++) {
		const response = await sendCat(`MMCW|Choose filters|${cI};`);

		if( response == "MMENABLED") {
			availableFilters.push(FILTER_LIST[cI]);
		}
	}

	return availableFilters;
};

const getActiveFilter = async () => {
	return (await sendCat("MMCW|CW passband;")).substring(2);
}

const setFilter = (filter) => {
	const cmd  = `MMCW|CW passband=${filter};`;
	//need to write the command twice to ensure the filter is set, 
	// seems to be a quirk of the CAT interface for this command
	return sendCat(cmd+cmd, false);
}

const availableFilters = await getEnabledFilters();
const currentFilter = await getActiveFilter();
const currentIndex = availableFilters.indexOf(currentFilter);
const nextIndex = (currentIndex + 1) % availableFilters.length;
const nextFilter = availableFilters[nextIndex];

setFilter(nextFilter);

setTitle(`${context.task.title} [${nextFilter}]`);
setDescription(`Filter options: ${availableFilters .join(" | ")}`);