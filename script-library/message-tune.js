/*

MMMessages|Message 10=7032020|10114020|14044020|18088020|21044020

*/

const MMINDEX_MAX_PA_V = 'MMProtection|Max. PA voltage';
const MMINDEX_FREQ_LIST = 'MMMessages|Message 10';
const PA_V_TUNE = 5.00;
const PA_V_OPERATE = 11.5;

let interval, vfo, mode, power, dispFreq;

const saveSettings = async () => {
	
	/*
	0-10 digits: IF frequency in Hz
	11-16 N/A (Spaces)
	17-22 RIT offset in Hz (signed)
	23 RIT status (0=off, 1=on)
	24 XIT status (0=off, 1=on)
	25-27 N/A
	28 TX Status (0=RX, 1=TX)
	29 MODE
	30 RX VFO (0=A, 1=B)
	31 N/A
	32 Split status (0=off, 1=on)
	33-34 N/A
	35 N/A (Space)
	*/

	const rawIF = await sendCat(`IF;`);
	vfo = rawIF.substring(30,31) == "0" ? "A" : "B";
	mode = rawIF.substring(29,30);

	power = (await sendCat(`${MMINDEX_MAX_PA_V};`)).substring(2);
}

const revertSettings = () => {
	sendCat(`MD${mode};`, false);
	sendCat(`${MMINDEX_MAX_PA_V}=${PA_V_OPERATE};`, false);
};

const printSWR = async () => {
	const raw = (await sendCat('SW;')).substring(2);
	let val = raw / 100;
	print( `${dispFreq}\n${val.toFixed(1)}` );
};

const setBand = (freq) => {
	const band = Math.floor(freq / 1000000);
	return `${band} MHz`;
};

const tuneSetup = async () => {
	await saveSettings();
	sendCat(`${MMINDEX_MAX_PA_V}=${PA_V_TUNE};`, false);
	sendCat('MD6;', false); // FSK
};

const tuneStart = () => {
	sendCat('TX;', false);
	sendCat('TA500;', false);
};

const tuneStop = () => {
	sendCat('TA0;', false);
	delay(6);
	sendCat('RX;', false);
}

const tuneTeardown = () => {
	task.clearInterval(interval);
	revertSettings();
};

const retrieveFrequencies = async () => {
	const raw = (await sendCat(`${MMINDEX_FREQ_LIST};`)).substring(2);
	return raw.split('|')
		.map(f => f.trim())
		.filter(f => /^\d+$/.test(f));
};

const freqList = await retrieveFrequencies();

await tuneSetup();
interval = task.setInterval(printSWR, 500);

for( const freq of freqList ) {
	dispFreq = setBand(freq);
	await sendCat(`F${vfo}${freq};`, false);
	await tuneStart();
	await pause('play-pause', '#D63031');
	await tuneStop();	
}

tuneTeardown();