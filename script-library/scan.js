console.log("scan script loaded");

const FREQ_STEP = 100; // 100Hz step, adjust as needed
const SCAN_SPEED = 100; // 100ms between frequency changes, adjust as needed

let freq =0;
let vfo;

let scanIntervalId;
let txMonitorIntervalId;

let resume;

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

const setNextFreq = () => {
	freq = freq + FREQ_STEP;
	sendCat(`F${vfo}${freq};`, false);
};

const scan = () => {
	scanIntervalId = task.setInterval(setNextFreq, SCAN_SPEED);
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