console.log("Cycle SSTV Freqs");

const FREQ_LIST = [
	3.640,
	7.171, 
	14.233, 
	21.340, 
	24.927, 
	28.680
];

const getVfo = async () => {
	const rawIF = (await sendCat(`IF;`)).substring(2);
	const vfo = rawIF.substring(28,29) == "0" ? "A" : "B";
	return vfo;
}

const getBands = async () => {
	
	const bandList = [];

	for( let cI=0; cI<15; cI++) {
		try{
			const transmitStatus = await sendCat(`MMBand config.|Transmit[${cI}];`)
			if( transmitStatus == "MMENABLED") {
				const bandName = (await sendCat(`MMBand config.|Band name (m)[${cI}];`)).substring(2);
				const freqMin = (await sendCat(`MMBand config.|Frequency min.[${cI}];`)).substring(2);
				const freqMax = (await sendCat(`MMBand config.|Frequency max.[${cI}];`)).substring(2);
				bandList.push({
					bandName,
					freqMin,
					freqMax
				});
			}
		}	catch(e) {
			console.warn(`Error checking band index ${cI}:`, e);
		}
	}

	return bandList;
}

const isInSupportedBand = (freq, bandList) => {

	for( let bI=0; bI<bandList.length; bI++) {
		if( freq >= bandList[bI].freqMin && freq <= bandList[bI].freqMax) {
			return true;
		}
	}

	return false;
}

const getNextFreqIndex = (lastIndex, bandList) => {
	let index = isNaN(lastIndex) ? 0 : lastIndex;
	
	for( let i=0; i<FREQ_LIST.length; i++) {
		index = (index + 1) % FREQ_LIST.length;

		if( isInSupportedBand(FREQ_LIST[index]*1000000, bandList)) {
			break;
		}

	}
	return index;
}


const lastIndex = parseInt(Storage.get("freqIndex"));

const bandList = await getBands();
const index = getNextFreqIndex(lastIndex, bandList);

Storage.set("freqIndex", index);

const vfo = await getVfo();
const freq = FREQ_LIST[index] * 1000000;

sendCat(`F${vfo}${freq};`, false);

const mode = freq < 14000000 ? "1" : "2";
sendCat(`MD${mode};`, false);