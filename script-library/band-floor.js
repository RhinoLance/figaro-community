const FREQ_STEP = 100; // 100Hz step, adjust as needed
const SCAN_SPEED = 100; // 100ms between frequency changes, adjust as needed

let freq =0;
let scanIntervalId;
let vfo;

// array of bands' MHz and lowest frequencies in Hz
const bandFloors = [
	{MHz: 1, floor: 1800000},
	{MHz: 3, floor: 3500000},
	{MHz: 5, floor: 5351500},
	{MHz: 7, floor: 7000000},
	{MHz: 10, floor: 10100000},
	{MHz: 14, floor: 14000000},
	{MHz: 18, floor: 18068000},
	{MHz: 21, floor: 21000000},
	{MHz: 24, floor: 24890000},
	{MHz: 28, floor: 28000000},
	{MHz: 50, floor: 50000000}
]

const getVFO = () => {
	return sendCat("FR;")
	.then( v => vfo = parseInt(v.substring(2)) == 0 ? "A" : "B");
};

const initFreq = () =>{
	return sendCat(`F${vfo};`)
		.then( v=> freq = parseInt(v.substring(2)));
};

const setFreq = () => {
	
	const bandFloor = Math.floor(freq / 1000000);
	const band = bandFloors.find(b => b.MHz === bandFloor);

	freq = band.floor;
	sendCat(`F${vfo}${freq};`, false);
};

const runner = Promise.resolve()
	.then( getVFO )
	.then( initFreq )
	.then( setFreq );
	
	task.waitUntil(runner);