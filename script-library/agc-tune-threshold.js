const name = "threshold"
const catSuffix = "Threshold S";
const valuePrefix = "S";
const range = [0,9];
const step = 1;

console.log(`AGC tune ${name} script loaded`);

const LIST = Array.from({ length: Math.floor((range[1] - range[0]) / step) + 1 }, (_, i) => i * step + range[0]);

const getNext = (lastIndex, list) => {
	let index = isNaN(lastIndex) ? -1 : lastIndex;
	index = (index + 1) % list.length;
	return index;
}

const applyAGCSettings = (value) => {
	const prefix = "MMAUDIO|AGC settings|";

	sendCat(`${prefix}${catSuffix}=${value};`, false);
}

const getDescription = (activeIndex, length) => {
	
	let out = "";

	for( let i=0; i<LIST.length; i++) {
		out += (i == activeIndex ? "^" : "-");
	}

	return out;
}

const lastIndex = parseInt(Storage.get("lastIndex"));
const index = getNext(lastIndex, LIST);
Storage.set("lastIndex", index);

applyAGCSettings(LIST[index]);

setTitle(`${context.task.title}: ${valuePrefix}${LIST[index]}`);
const description = getDescription(index, LIST.length);
setDescription(`${context.task.description} ${description}`);