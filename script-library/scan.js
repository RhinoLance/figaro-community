console.log("scan script loaded");

const FREQ_STEP = 100; // 100Hz step, adjust as needed
const SCAN_SPEED = 100; // 100ms between frequency changes, adjust as needed
const TX_MONITOR_INTERVAL = 100; // 100ms between TX status checks, adjust as needed
const STOP_ON_TX = true; // stop scanning when transmission is detected

let freq =0;
let vfo;
let scanActive = false;

let scanTimerId;
let txMonitorTimerId;

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
	
	if( !scanActive ) {
		return;
	}

	setNextFreq();
	
	// Use recursive setTimeout to mitigate slower devices not keeping up 
	// with the scan speed when using setInterval
	scanTimerId = task.setTimeout(() => {
		scan();
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

			if (scanActive) {
				txMonitorTimerId = task.setTimeout(checkTxStatus, 
					TX_MONITOR_INTERVAL);
			}
		});
	};
	
	checkTxStatus();
};

const cancelScan = () => {
	scanActive = false;
	task.clearTimeout(scanTimerId);
	task.clearTimeout(txMonitorTimerId);
}

const runner = Promise.resolve()
	.then( getState )
	.then( () => { if (STOP_ON_TX) monitorTx(); } )
	.then( ()=> {
		scanActive = true;
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