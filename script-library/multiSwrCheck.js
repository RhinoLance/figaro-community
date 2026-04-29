const FREQ_LIST = [
	7032000,
	14044000,
	21044000
];

const MMINDEX_MAX_PA_V = 'MMProtection|Max. PA voltage';
const MMINDEX_SWR_PROTECTION = 'MMProtection|SWR protection';
const PA_V_TUNE = 4.50;
const PA_V_OPERATE = 11.5;

console.log("Multi SWR Check");

let vfo, mode, power, swrProtection;

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
	swrProtection = (await sendCat(`${MMINDEX_SWR_PROTECTION};`)).substring(2);
	//console.log(`SWR Protection saving state: ${swrProtection}`);

}

const revertSettings = async () => {
	sendCat(`MD${mode};`, false);
	sendCat(`${MMINDEX_MAX_PA_V}=${PA_V_OPERATE};`, false);
	sendCat(`${MMINDEX_SWR_PROTECTION}=${swrProtection};`, false);
	
	//console.log(`SWR Protection reverting to: ${swrProtection}`);

	//let tmp = (await sendCat(`${MMINDEX_SWR_PROTECTION};`)).substring(2);

	//console.log(`SWR Protection saved: ${tmp}`);
};

const getSWR = async () => {
	
	const resultList = [];
	for( let cI=0; cI<10; cI++) {
		const raw = (await sendCat('SW;')).substring(2);
		let val = raw / 100;
		resultList.push(val);
	}

	const sum = resultList.reduce((acc, value) => acc + value, 0);

	const avg = sum/10;
	return avg.toFixed(1);
};

const setBand = (freq) => {
	const band = Math.floor(freq / 1000000);
	return `${band} MHz`;
};

const tuneSetup = async () => {
	await saveSettings();
	
	sendCat(`${MMINDEX_MAX_PA_V}=${PA_V_TUNE};`, false);
	sendCat(`${MMINDEX_SWR_PROTECTION}=DISABLED;`, false);
	sendCat('MD6;', false); // FSK

	//let tmp = (await sendCat(`${MMINDEX_SWR_PROTECTION};`)).substring(2);

	//console.log(`SWR Protection set for tune: ${tmp}`);
};

const txStart = () => {
	sendCat('TX;', false);
	sendCat('TA500;', false);
	delay(6);
};

const txStop = () => {
	sendCat('TA0;', false);
	delay(6);
	sendCat('RX;', false);
}

const freqList = FREQ_LIST;

await tuneSetup();

setDescription( "Checking ..." );

const swrList = [];

for( const freq of freqList ) {
	await sendCat(`F${vfo}${freq};`, false);
	await txStart();
	await delay(100);
	const swr = await getSWR();
	swrList.push({freq, swr });  
	await txStop();	
}

await revertSettings();

let output = swrList.map( v=> {
	return `${Math.round(v.freq/100)/10}: ${v.swr}`
})
.join(" | ");

setDescription( output );