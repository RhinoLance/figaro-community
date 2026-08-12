console.log("Cycle AGC script loaded");

/*

Most details taken from 
https://groups.io/g/QRPLabs/topic/best_qmx_agc_settings/110439092

*/

const sendCatOrig = sendCat;
sendCat = async (command, waitForResponse = true) => {
	console.log(`sendCat called with command: ${command}, waitForResponse: ${waitForResponse}`);
	//await delay(1000); // Add a 100ms delay before sending the command
	return sendCatOrig(command, waitForResponse);
};


const AGC_LIST = [
	{
		name: "QMX Default",
		attribution: "QRP Labs",
		thresholdS: 8,
		slopeDbPerDb: 80,
		noiseFilter: 10,
		hangTime: 80,
		smoothSamples: 50,
		recoveryDbPerSecond: 10,
		sampleBlocks: 2,
		errors: "locked x1"
	},
	{
		name: "Baloo",
		attribution: "Rick - W5NR",
		thresholdS: 7,
		slopeDbPerDb: 60,
		noiseFilter: 5,
		hangTime: 30,
		smoothSamples: 50,
		recoveryDbPerSecond: 50,
		sampleBlocks: 2
	},
	{
		name: "Gadget",
		attribution: "Dan - W2DLC",
		thresholdS: 8,
		slopeDbPerDb: 65,
		noiseFilter: 9,
		hangTime: 55,
		smoothSamples: 60,
		recoveryDbPerSecond: 8,
		sampleBlocks: 2
	},
	{
		name: "Granny",
		attribution: "Ron",
		thresholdS: 7,
		slopeDbPerDb: 95,
		noiseFilter: 5,
		hangTime: 50,
		smoothSamples: 99,
		recoveryDbPerSecond: 40,
		sampleBlocks: 2
	},
	{
		name: "Paddington",
		attribution: "K7VIQ",
		thresholdS: 8,
		slopeDbPerDb: 80,
		noiseFilter: 10,
		hangTime: 80,
		smoothSamples: 50,
		recoveryDbPerSecond: 10,
		sampleBlocks: 2
	},
	{
		name: "Pingu",
		attribution: "Other",
		thresholdS: 7,
		slopeDbPerDb: 60,
		noiseFilter: 5,
		hangTime: 30,
		smoothSamples: 50,
		recoveryDbPerSecond: 50,
		sampleBlocks: 4
	},
	{
		name: "Taz",
		attribution: "Steve - G4EDG",
		thresholdS: 4,
		slopeDbPerDb: 50,
		noiseFilter: 0,
		hangTime: 2,
		smoothSamples: 0,
		recoveryDbPerSecond: 60,
		sampleBlocks: 4,
		errors: "locked x2"
	},
	{
		name: "Tom",
		attribution: "Chuck - WA3UQV",
		thresholdS: 12,
		slopeDbPerDb: 80,
		noiseFilter: 10,
		hangTime: 80,
		smoothSamples: 50,
		recoveryDbPerSecond: 10,
		sampleBlocks: 2
	},
	{
		name: "Tweety",
		attribution: "KL7MJ",
		thresholdS: 4,
		slopeDbPerDb: 80,
		noiseFilter: 10,
		hangTime: 30,
		smoothSamples: 50,
		recoveryDbPerSecond: 10,
		sampleBlocks: 2
	},
	{
		name: "User Defined 1",
		attribution: "",
		thresholdS: 8,
		slopeDbPerDb: 80,
		noiseFilter: 10,
		hangTime: 80,
		smoothSamples: 50,
		recoveryDbPerSecond: 10,
		sampleBlocks: 5
	},

];

const getNext = (lastIndex, list) => {
	let index = isNaN(lastIndex) ? -1 : lastIndex;
	index = (index + 1) % list.length;
	return index;
};

const applyAGCSettings = async(settings) => {
	const prefix = "MMAUDIO|AGC settings|";

	await sendCat(`${prefix}Threshold S=${settings.thresholdS};`, false);
	await sendCat(`${prefix}Slope dB per dB=${settings.slopeDbPerDb};`, false);
	await sendCat(`${prefix}Noise filter=${settings.noiseFilter};`, false);
	await sendCat(`${prefix}Hang time=${settings.hangTime};`, false);
	await sendCat(`${prefix}Smooth samples=${settings.smoothSamples};`, false);
	await sendCat(`${prefix}Recovery db/s=${settings.recoveryDbPerSecond};`, false);
	
	// The following line may cause the QMX to reboot, so is disabled until 
	// there is a firmware fix.
	// await sendCat(`${prefix}Sample blocks=${settings.sampleBlocks};`, false);
	
};


const loadAGCSettingsFromRadio = async () => {
	try {
		const settings = {};
		const prefix = "MMAUDIO|AGC settings|";
		settings.thresholdS = await sendCat(`${prefix}Threshold S;`);
		settings.slopeDbPerDb = await sendCat(`${prefix}Slope dB per dB;`);
		settings.noiseFilter = await sendCat(`${prefix}Noise filter;`);
		settings.hangTime = await sendCat(`${prefix}Hang time;`);
		settings.smoothSamples = await sendCat(`${prefix}Smooth samples;`);
		settings.recoveryDbPerSecond = await sendCat(`${prefix}Recovery db/s;`);
		settings.sampleBlocks = await sendCat(`${prefix}Sample blocks;`);
		settings.s9SoundsLikeS = await sendCat(`${prefix}S9 sounds like S;`);
		return settings;
	}
	catch (e) {
		console.error("Error loading AGC settings from radio:", e);
		return null;
	}
};

const getDescriptionMarker = (activeIndex, length) => {

	let out = "";

	for (let i = 0; i < AGC_LIST.length; i++) {
		out += (i == activeIndex ? "^" : "-");
	}

	return out;
};

const formatSettings = (settings) => {

	let out = "";

	Object.entries(settings).forEach(([key, value]) => {
		out += `${key}:\t${value}\n`;
	});

	return out;
};

const getVersionInfo = async () => {
	const fwVersion = await sendCat("VN;");
	const verParts = fwVersion.match(/\d+/g).map(Number);

	return {
		major: parseInt(verParts[0]),
		minor: parseInt(verParts[1]),
		patch: parseInt(verParts[2])
	}
};

try{ 
	const lastIndex = parseInt(Storage.get("lastIndex"));
	const index = getNext(lastIndex, AGC_LIST);
	Storage.set("lastIndex", index);

	//const preSettings = await loadAGCSettingsFromRadio();
	//console.log("Current AGC settings from radio:", preSettings);
	
	const settings = AGC_LIST[index];
	await applyAGCSettings(settings);

	//const postSettings = await loadAGCSettingsFromRadio();
	//console.log("New AGC settings from radio:", postSettings);

	setTitle(`${context.task.title}: [${settings.name}]`);
	
	const versionInfo = await getVersionInfo();
	let versionWarning = "";
	if( versionInfo.minor >= 4 ){
		sendCat("MU;", false);
	}
	else{
		versionWarning = "Note: AGC settings may not apply until radio is restarted or " + 
				"menu is entered and exited.  Update to firmware v1.04 " + 
				"or later to load automatically.";
	}

	const activeMarker = getDescriptionMarker(index, AGC_LIST.length);
	const formattedSettings = formatSettings(settings);
	
	setDescription(`${context.task.description} ${activeMarker}\n` + 
		`${formattedSettings}\n\n${versionWarning}`);

}
catch (e) {
	console.error("Error applying AGC settings:", e);
	setDescription(`${context.task.description}\nError applying AGC settings: ${e.message}`);
}