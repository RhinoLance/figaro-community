const MMINDEX_MAX_PA_V = 'MMProtection|Max. PA voltage';
const PA_V_TUNE = 5.00;
const PA_V_OPERATE = 11.5;

let interval, freq, vfo, mode, power, vol, dispFreq;

const saveSettings = async () => {
	/*

	IF
	00021044020     +00000000006000000 
	00021044020
	-----
	+0000
	0000006000000 
	
	0-10 digits: IF frequency in Hz			00021044020
	11-15 N/A (Spaces)						-----
	16-20 RIT offset in Hz (signed)			+0000
	21 RIT status (0=off, 1=on)		 	
	22 XIT status (0=off, 1=on)
	23-25 N/A
	26 TX Status (0=RX, 1=TX)
	27 MODE
	28 RX VFO (0=A, 1=B)
	29 N/A
	30 Split status (0=off, 1=on)
	31-32 N/A
	33 N/A (Space)
	*/

	const rawIF = (await sendCat(`IF;`)).substring(2);
	freq = rawIF.substring(0,10);
	vfo = rawIF.substring(28,29) == "0" ? "A" : "B";
	mode = rawIF.substring(27,28);

	power = (await sendCat(`${MMINDEX_MAX_PA_V};`)).substring(2);
	vol = (await sendCat(`AG;`)).substring(2);


	console.log(`Saved settings - Freq: ${freq}, VFO: ${vfo}, Mode: ${mode}, Power: ${power}`);
}

const revertSettings = () => {
	sendCat(`MD${mode};`, false);
	sendCat(`${MMINDEX_MAX_PA_V}=${PA_V_OPERATE};`, false);
	sendCat(`AG${vol};`, false); // restore AF gain

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
	sendCat('AG00;', false); // AF gain to 0 to supress audio spike on TX.
	sendCat(`${MMINDEX_MAX_PA_V}=${PA_V_TUNE};`, false);
	sendCat('MD6;', false); // FSK
	
};

const tuneStart = () => {
	sendCat('TX;', false);
	sendCat('TA500;', false);
};

const tuneStop = async () => {
	sendCat('TA0;', false);
	delay(6);
	sendCat('RX;', false);
}

const tuneTeardown = () => {
	task.clearInterval(interval);
	revertSettings();
};

await tuneSetup();

dispFreq = setBand(freq);
interval = task.setInterval(printSWR, 500);

await tuneStart();
await pause('stop', '#D63031');
await tuneStop();

tuneTeardown();