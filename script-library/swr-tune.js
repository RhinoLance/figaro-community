console.log("Tune script");

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

	console.log(`Saved settings - Freq: ${freq}, VFO: ${vfo}, Mode: ${mode}`);
}

const revertSettings = () => {
	sendCat(`MD${mode};`, false);
};

const printSWR = async () => {
	const raw = (await sendCat('SW;')).substring(2);
	let val = raw / 100;
	print( `${dispFreq}\n${val.toFixed(1)}` );
};

const getBand = (freq) => {
	const band = Math.floor(freq / 100000);
	return `${band} MHz`;
};

const tuneSetup = async () => {
	await saveSettings();
};

const tuneStart = () => {
	sendCat('MD8;', false); // SWR
};

const tuneStop = async () => {
	sendCat(`MD${mode};`, false);
}

const tuneTeardown = () => {
	task.clearInterval(interval);
	revertSettings();
};

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

let interval, freq, vfo, mode, power, vol, dispFreq;

if( !(await prerunCheck())) return;

await tuneSetup();

dispFreq = getBand(freq);
interval = task.setInterval(printSWR, 500);

await tuneStart();
await pause('stop', '#D63031');
await tuneStop();

tuneTeardown();