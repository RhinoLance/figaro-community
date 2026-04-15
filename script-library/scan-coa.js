console.log("COA scan script loaded");

const FREQ_LIST =[7032000, 10114000, 14044000, 18088000, 21044000];
const SCAN_SPAN = 3000; // Hz span around each frequency to scan, adjust as needed
const FREQ_STEP = 100; // 100Hz step, adjust as needed
const SCAN_SPEED = 100; // 100ms between frequency changes, adjust as needed

let freq =0;
let vfo;

let scanIntervalId;
let txMonitorIntervalId;

let resume;

function* scanFreqList( initIndex, initFreq) {

	let index = initIndex || 0;

	while(true) {
		const endFreq = getCoaEnd(index);
		
		let startFreq;
		if( initFreq ) {
			startFreq = initFreq;
			initFreq = null; // only use initial frequency for the first scan
		}
		else{
			startFreq = getCoaStart(index);
		}

		for( let freq = startFreq; freq <= endFreq; freq += FREQ_STEP) {
			yield freq;
		}

		index = (index + 1) % FREQ_LIST.length;
	}

}

const getCoaStart = (coaIndex) => {
	return FREQ_LIST[coaIndex] - SCAN_SPAN;
}

const getCoaEnd = (coaIndex) => {
	return FREQ_LIST[coaIndex] + SCAN_SPAN;
}

const findStartIndexAndFreq = () => {

	let index; freq;

	for( let i = 0; i < FREQ_LIST.length; i++) {
		if( Math.floor(FREQ_LIST[i] / 1000000) == Math.floor(freq / 1000000) ) {
			index = i;

			if( freq < getCoaStart(i) || freq > getCoaEnd(i) ) {
				freq = getCoaStart(i);
			}

			break;
		}
	};

	// if current frequency doesn't match any COA, start with the first one
	index = freq ? index : 0; 

	return { index, freq };
}


const getState = () => {

	return sendCat("IF;")
		.then( status => {

			const regex = /IF(\d{11}).{17}(\d)/;
			const match = status.match(regex);

			if (match) {
				freq = parseInt(match[1]);
				vfo = parseInt(match[2]) == 0 ? "A" : "B";
				log(`IF: ${freq} Hz, VFO: ${vfo}`);

			} else {
				log("Failed to parse IF status");
			}

			return true;

		});

};

const scan = () => {
	
	const initValues = findStartIndexAndFreq();
	const freqGenerator = scanFreqList(initValues.index, initValues.freq);

	scanIntervalId = task.setInterval(() => {
		const nextFreq = freqGenerator.next().value;
		if (nextFreq !== undefined) {
			freq = nextFreq;
			sendCat(`F${vfo}${freq};`, false);
		}
	}, SCAN_SPEED);
};

const monitorTx = () => {
	
	const checkTxStatus = () => {
		sendCat("TQ;").then( status => {
			if( status.substring(2) === "1") {
				log("Transmission detected, stopping scan");
				resume();
				cancelScan();
			}
		});
	};

	txMonitorIntervalId = task.setInterval(checkTxStatus, 100);
};

const cancelScan = () => {
	task.clearInterval(scanIntervalId);
	task.clearInterval(txMonitorIntervalId);
}

const runner = Promise.resolve()
	.then( getState )
	.then( monitorTx )
	.then( ()=> {
		scan();

		const cancelPromise = new Promise((resolve) => {
			resume = resolve;
		});

		return pause('stop', '', cancelPromise);
	})
	.finally( ()=> {
		cancelScan();
	});
	
	task.waitUntil(runner);