/*

MMMessages|Message 10=7032020|10114020|14044020|18088020|21044020

*/

const MMINDEX_MAX_PA_V = 'MMProtection|Max. PA voltage';
const MMINDEX_FREQ_LIST = 'MMMessages|Message 10';
const TUNE_PA_V = 5.00;

let interval, mode, power;

const saveSettings = () => {
	return Promise.resolve(true)
		.then( () => {
			return sendCat(`MD;`);
		})
		.then((raw) => {
			mode = raw.substring(2);
		})
		.then( () => {
			return sendCat(`${MMINDEX_MAX_PA_V};`);
		})
		.then((raw) => {
			power = raw.substr(2);
		});	
};

const restoreSettings = () => {
	sendCat(`MD${mode};`, false);
	
	/*
	There's a firmware bug where the retrieved PA voltage is 
	ambiguous, so we set it to a known safe value rather than 
	restoring the original value.

	This will be fixed in a future firmware release, at which point 
	we can restore the original value instead.
	*/
	sendCat(`${MMINDEX_MAX_PA_V}=11.5;`, false);
};

const initState = () => {
	sendCat(`${MMINDEX_MAX_PA_V}=${TUNE_PA_V};`, false);
	sendCat('MD3;', false);
	return delay(100);
};

const retrieveFrequencies = () => {
	return sendCat(`${MMINDEX_FREQ_LIST};`)
		.then((raw) => {
			return raw.substring(2)
				.split('|')
				.map(f => f.trim())
				.filter(f => /^\d+$/.test(f))
		});		
};

const printSWR = () => {
	return sendCat('SW;')
		.then((raw) => {
			raw = raw.substring(2);
			let val = raw / 100;
			print(`${val.toFixed(2)}`);
		});
};

const tuneAndCheckFreqSWR = (frequency) => {

	return Promise.resolve(true)
		.then(() => {
			sendCat(`FA${frequency};`, false);
			return sendCat('FA;');
		})
		.then((raw) => {
			
			const freq = raw.substring(2);
			if (parseInt(freq,10) !== parseInt(frequency,10)) {
				log(`Failed to set frequency to ${frequency} Hz.`);
			}
			else {
				return checkSWR();
			}

		});
};

const checkSWR = () => {

	interval = task.setInterval(printSWR, 300);

	return Promise.resolve(true)
		.then(() => sendCat('TX;', false))
		.then(() => pause('play-pause', '#D63031'))
		.then(() => sendCat('RX;', false))
		.then(() => task.clearInterval(interval));
};

task.onCleanup(() => {
	sendCat('RX;', false);
	delay(250);
});

const runner = Promise.resolve(true)
	.then(saveSettings)
	.then(initState)
	.then(retrieveFrequencies)
	.then(freqList => {
		
		let chain = Promise.resolve();

		freqList.map(freq => {
			chain = chain.then(() => tuneAndCheckFreqSWR(freq));
		});

		return chain;

	})
	.then(restoreSettings)
	.catch((error) => {
		log(`Error: ${error.message}`);
	});

delay(250);
task.waitUntil(runner);