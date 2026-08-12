console.log("Multi SWR Check");

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
	freq = rawIF.substring(2,13);
	vfo = rawIF.substring(30,31) == "0" ? "A" : "B";
	mode = rawIF.substring(29,30);

	console.log(`Saved settings - Freq: ${freq}, VFO: ${vfo}, Mode: ${mode}`);
}

const getFirmwareVersion = async () => {
	const versionText = await sendCat("VN;");  // 1_04_003QMX;
	const parts = versionText.split("_");
	const major = parseInt(parts[0].substring(2));
	const minor = parseInt(parts[1]);
	const patch = parseInt(parts[2].substring(0,3));

	return [major,minor,patch];
}

const isFirmwareOk = (fwVersion, checkVersion) => {

	const invalidCheckVersion = () => {
		console.error( `Invalid firmware check version: ${checkVersion}`)
	};

	if( checkVersion.length < 3){
		invalidCheckVersion();
	}

	for( let cI=0; cI<fwVersion.length; cI++ ) {
		if( isNaN(checkVersion[cI])) {
			invalidCheckVersion();
		}
		if( fwVersion[cI] < checkVersion[cI] ) return false;
	}

	return true;
}

const revertSettings = async () => {
	sendCat(`MD${mode};`, false);
	sendCat(`F${vfo}${freq};`, false);
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
};

const txStart = () => {
	sendCat('MD8;', false); // SWR
};

const txStop = () => {
	sendCat(`MD${mode};`, false);
}

const prerunCheck = async () => {

	const fwVersion = await getFirmwareVersion();
	const reqFw = [1,4,3];
	if( !isFirmwareOk(fwVersion, reqFw)) {
		setDescription("ERROR: This script requires firmware >= " + 
			reqFw.join("."));
		return false;
	}

	return true;

}

let freq, vfo, mode, power;

if( !(await prerunCheck())) return;

const freqList = await getFreqList();

await tuneSetup();

let description = "Checking ";

setDescription( description );

const swrList = [];

for( const tFreq of freqList ) {
	await sendCat(`F${vfo}${tFreq};`, false);
	await txStart();
	await delay(100);
	const swr = await getSWR();
	swrList.push({freq: tFreq, swr });  
	await txStop();	
	setDescription( description += "." );
}

await revertSettings();

let output = swrList.map( v=> {
	return `${Math.round(v.freq/100)/10}: ${v.swr}`
})
.join(" | ");

setDescription( output );