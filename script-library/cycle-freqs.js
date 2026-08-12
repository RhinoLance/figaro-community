console.log("Cycle Freqs");

const FREQ_SRC = "SCRIPT"; // MSG | SCRIPT
const MESSAGE_INDEX = 10;
const FREQ_LIST = [
	7032000,
	14044000,
	21044000
];

const getFreqList = async () => {
	
	switch (FREQ_SRC) {
		case "MSG":
			return await getFreqListFromMessage(MESSAGE_INDEX);
		case "SCRIPT":
			return FREQ_LIST;
		default:
			throw new Error(`Invalid FREQ_SRC: ${FREQ_SRC}`);
	}
}

const getFreqListFromMessage = async (index) => {
	
	const raw = (await sendCat(`MMMessages|Message ${index};`)).substring(2);
	return raw.split('|')
		.map(f => f.trim())
		.filter(f => /^\d+$/.test(f));
}

const getVfo = async () => {
	const rawIF = (await sendCat(`IF;`)).substring(2);
	const vfo = rawIF.substring(28,29) == "0" ? "A" : "B";
	return vfo;
}

const getNextFreqIndex = (lastIndex, freqList) => {
	let index = isNaN(lastIndex) ? 0 : lastIndex;
	index = (index + 1) % freqList.length;
	return index;
}

const formatMarker = (index, freqList) => {
	let pre = "-".repeat(index);
	let post = "-".repeat(freqList.length - index - 1);
	let output = `${pre}${index + 1}${post}`;
	
	return output;
}

const freqList = await getFreqList();
const lastIndex = parseInt(Storage.get("freqIndex"));
const index = getNextFreqIndex(lastIndex, freqList);
const freq = freqList[index];

Storage.set("freqIndex", index);

const vfo = await getVfo();
sendCat(`F${vfo}${freq};`, false);

setDescription(formatMarker(index, freqList));