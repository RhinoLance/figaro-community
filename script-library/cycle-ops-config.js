console.log("Cycle Ops Config");

const CONFIG_LIST = [
	{name: "CW", mode: "CW", vfo: "A", maxVoltage: 11.5, vox: false, keyerSpeed: 20},
	
	{name: "SSB", mode: "LSB", vfo: "A", maxVoltage: 11.5, ssbAutoSb: true, 
		ssbVox: false, ssbInput: "Ext. mic"},
	
	{name: "SSTV", mode: "LSB", vfo: "A", maxVoltage: 8, ssbAutoSb: false, 
		ssbVox: true, ssbVoxThreshold: 22, ssbVoxHoldTime: 11, ssbDriveLevel: 900, 
		ssbInput: "USB"},	
	
	{name: "FT*", mode: "DIGI", vfo: "A", maxVoltage: 8, digiVox: true,
		digiSideband: "USB"},
	
];

const getNextConfigIndex = () => {
	
	let index = parseInt(Storage.get("configIndex"));
	index = isNaN(index) ? 0 : index;
	index = (index + 1) % CONFIG_LIST.length;

	console.log(`Using config index ${index}`);
	Storage.set("configIndex", index);

	return index;
};

const appendTitle = (configName) => {
	const baseTitle = context.task.title.split("[")[0].trim();
	context.task.title = `${baseTitle} [${configName}]`;

	setTitle(`${baseTitle} [${configName}]`);
};

const setMode = (mode) => {
	
	const modes = {
		LSB: 1,
		USB: 2,
		CW: 3,
		DIGI: 6,
		CWR: 7,
		DIGIR: 9
	}

	if( mode === undefined) return;
	if( !Object.keys(modes).includes(mode.toUpperCase())) return;

	writeCat(`MD${modes[mode.toUpperCase()]};`, false);
	
};

const setSsbAutoSb = (autoSSB) => {
	
	if( autoSSB === undefined) return;
	if( typeof autoSSB !== "boolean") return;

	writeCat(`MMSSB|Band auto U/LSB=${autoSSB ? "YES" : "NO"};`, false);
};

const setVfo = (vfoStr) => {
	
	const validVfos = {
		A: 0,
		B: 1,
		SPLIT: 2,
	};

	if( vfoStr === undefined) return;
	if( !Object.keys(validVfos).includes(vfoStr)) return;
	
	const vfo = validVfos[vfoStr];

	writeCat(`FR${vfo};`, false);
};

const setMaxPaVoltage = (maxVoltage) => {
	
	if( maxVoltage == undefined) return;
	if( isNaN(maxVoltage)) return;

	writeCat(`MMProtection|Max. PA voltage=${maxVoltage};`, false);
};

const setKeyerSpeed = (keyerSpeed) => {
	
	if( keyerSpeed == undefined) return;
	if( isNaN(keyerSpeed)) return;

	writeCat(`KS${keyerSpeed};`, false);
};

const setSsbVox = (ssbVox) => {
	
	if( ssbVox === undefined) return;
	if( typeof ssbVox !== "boolean") return;

	writeCat(`Q3${ssbVox ? "1" : "0"};`, false);
};

const setSsbVoxThreshold = (ssbVoxThreshold) => {
	if( ssbVoxThreshold === undefined) return;
	if( isNaN(ssbVoxThreshold)) return;

	writeCat(`MMSSB|VOX|VOX threshold=${ssbVoxThreshold};`, false);
};

const setSsbVoxHoldTime = (ssbVoxHoldTime) => {
	if( ssbVoxHoldTime === undefined) return;
	if( isNaN(ssbVoxHoldTime)) return;

	writeCat(`MMSSB|VOX|VOX hold time=${ssbVoxHoldTime};`, false);
};

const setSsbDriveLevel = (ssbDriveLevel) => {
	if( ssbDriveLevel === undefined) return;
	if( isNaN(ssbDriveLevel)) return;

	writeCat(`MMSSB|Drive level=${ssbDriveLevel};`, false);
};

const setSsbInput = (ssbInput) => {
	if( ssbInput === undefined) return;

	const options = ["USB", "Two-tone", "Ext. mic", "Auto"];
	if( !options.includes(ssbInput)) return;

	writeCat(`MMSSB|Input=${ssbInput};`, false);
};

const setDigiVox = (digiVox) => {
	
	if( digiVox === undefined) return;
	if( typeof digiVox !== "boolean") return;

	writeCat(`MMDigi|VOX${digiVox ? "ON" : "OFF"};`, false);
};

const setDigiSideband = (digiSideband) => {
	if( digiSideband === undefined) return;

	const options = ["USB", "LSB"];
	if( !options.includes(digiSideband)) return;

	writeCat(`MMDigi|Sideband=${digiSideband};`, false);
};

const writeCat = async (command, waitForResponse) => {
	
	console.log(`Sending CAT command: ${command}`);
	await sendCat(command, false);
}

const index = getNextConfigIndex();
const config = CONFIG_LIST[index];

setMode(config.mode);
setVfo(config.vfo);
setMaxPaVoltage(config.maxVoltage);
setKeyerSpeed(config.keyerSpeed);

setSsbVox(config.ssbVox);
setSsbVoxThreshold(config.ssbVoxThreshold);
setSsbVoxHoldTime(config.ssbVoxHoldTime);
setSsbDriveLevel(config.ssbDriveLevel);
setSsbAutoSb(config.ssbAutoSb);
setSsbInput(config.ssbInput);

setDigiVox(config.digiVox);
setDigiSideband(config.digiSideband);

appendTitle(config.name);
setDescription(CONFIG_LIST.map(v => v.name).join(" | "));