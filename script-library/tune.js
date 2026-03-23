const maxPaVIndex = 'MMProtection|Max. PA voltage'
let interval, mode, power;

const saveMode = () => {
	return sendCat(`MD;`).then((raw) => {
		mode = raw.substring(2);
		log(`Mode: ${mode}`);
	});
};

const savePower = () => {	
	return sendCat(`${maxPaVIndex};`).then((raw) => {
		power = raw.substr(2);
		log(`Power: ${power}`);
	});
};

const printSWR = () => {
	sendCat('SW;').then((raw) => {
    	raw = raw.substring(2);
    	let val = raw / 100;
    	print(`${val.toFixed(2)}`);
  	});
};

const cleanup = () => {
	task.clearInterval(interval);
	sendCat('RX;', false);
	sendCat(`MD${mode};`, false);
	sendCat(`${maxPaVIndex}=5.00;`, false);

	delay(250);
};



const runner = Promise.resolve(true)
	.then(saveMode)
	.then(savePower)
	.then(() => {
		sendCat(`${maxPaVIndex}=1.00;`, false);
		sendCat('MD3;', false);
		sendCat('TX;', false);

		interval = task.setInterval(printSWR, 300);
	})
	.then(() => pause('stop', '#D63031'))
	.then(cleanup)
	.catch((error) => {
		log(`Error: ${error.message}`);
	});

delay(250);
task.waitUntil(runner);