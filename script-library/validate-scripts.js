#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SCRIPT_LIBRARY_DIR = __dirname;
const SCHEMA_PATH = path.resolve(__dirname, '..', 'schemas', 'figaro-ftd.schema.json');

const COLOR_HEX_RE = /^#[0-9a-fA-F]{6}$/;
const REQUIRED_KEYS = [
	'title',
	'description',
	'script',
	'autoRunOnConnect',
	'autoRunPriority',
	'autoLock'
];
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, 'color']);

function getJsonFiles() {
	return fs
		.readdirSync(SCRIPT_LIBRARY_DIR)
		.filter((file) => file.endsWith('.json'))
		.sort();
}

function normalizeLineEndings(input) {
	return input.replace(/\r\n/g, '\n');
}

function validateTaskShape(task, fileName) {
	const errors = [];

	if (typeof task !== 'object' || task === null || Array.isArray(task)) {
		errors.push(`${fileName}: root value must be an object.`);
		return errors;
	}

	for (const key of REQUIRED_KEYS) {
		if (!(key in task)) {
			errors.push(`${fileName}: missing required key '${key}'.`);
		}
	}

	for (const key of Object.keys(task)) {
		if (!ALLOWED_KEYS.has(key)) {
			errors.push(`${fileName}: unexpected key '${key}'.`);
		}
	}

	if (typeof task.title !== 'string' || task.title.trim().length === 0) {
		errors.push(`${fileName}: 'title' must be a non-empty string.`);
	}

	if (typeof task.description !== 'string') {
		errors.push(`${fileName}: 'description' must be a string.`);
	}

	if (typeof task.script !== 'string' || task.script.trim().length === 0) {
		errors.push(`${fileName}: 'script' must be a non-empty string.`);
	}

	if (typeof task.autoRunOnConnect !== 'boolean') {
		errors.push(`${fileName}: 'autoRunOnConnect' must be a boolean.`);
	}

	if (!Number.isInteger(task.autoRunPriority) || task.autoRunPriority < 0 || task.autoRunPriority > 999) {
		errors.push(`${fileName}: 'autoRunPriority' must be an integer between 0 and 999.`);
	}

	if (typeof task.autoLock !== 'boolean') {
		errors.push(`${fileName}: 'autoLock' must be a boolean.`);
	}

	if (typeof task.runLocked !== 'boolean') {
		errors.push(`${fileName}: 'runLocked' must be a boolean.`);
	}

	if (task.color !== undefined) {
		if (typeof task.color !== 'string' || !COLOR_HEX_RE.test(task.color)) {
			errors.push(`${fileName}: optional 'color' must be a 6-digit hex value like '#22c55e'.`);
		}
	}

	return errors;
}

function lintScriptSafety(script, fileName) {
	const errors = [];
	const warnings = [];

	if (/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)/.test(script)) {
		warnings.push(`${fileName}: possible infinite loop detected ('while(true)' or 'for(;;)').`);
	}

	const usesTx = /sendCat\(\s*["'`]TX;/.test(script);
	const usesRx = /sendCat\(\s*["'`]RX;/.test(script);
	if (usesTx && !usesRx) {
		errors.push(`${fileName}: script sends TX but no RX command was detected for cleanup.`);
	}

	const usesSetInterval = /task\.setInterval\s*\(/.test(script);
	const usesClearInterval = /task\.clearInterval\s*\(/.test(script);
	if (usesSetInterval && !usesClearInterval) {
		warnings.push(`${fileName}: uses task.setInterval without task.clearInterval.`);
	}

	const usesSetTimeout = /task\.setTimeout\s*\(/.test(script);
	const usesClearTimeout = /task\.clearTimeout\s*\(/.test(script);
	if (usesSetTimeout && !usesClearTimeout) {
		warnings.push(`${fileName}: uses task.setTimeout without task.clearTimeout.`);
	}

	return { errors, warnings };
}

function checkScriptSync(task, jsonFilePath, fileName) {
	const jsPath = jsonFilePath.replace(/\.json$/i, '.js');
	if (!fs.existsSync(jsPath)) {
		return [];
	}

	const jsContent = fs.readFileSync(jsPath, 'utf8');
	if (normalizeLineEndings(jsContent) !== normalizeLineEndings(task.script || '')) {
		return [
			`${fileName}: script field does not match ${path.basename(jsPath)}. Run 'npm run syncScripts'.`,
		];
	}

	return [];
}

function checkScriptSyntax(task, fileName) {
	const errors = [];
	try {	new Function(`return (async () => { ${task.script} })();`);
	} catch (error) {
	errors.push(`${fileName}: script contains syntax errors: ${error.message}`);
	}
	return errors;
}

function main() {
	if (!fs.existsSync(SCHEMA_PATH)) {
		console.error(`Schema not found: ${SCHEMA_PATH}`);
		process.exit(1);
	}

	// Parse once so malformed schema fails fast.
	try {
		JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
	} catch (error) {
		console.error(`Failed to parse schema ${SCHEMA_PATH}: ${error.message}`);
		process.exit(1);
	}

	const jsonFiles = getJsonFiles();
	let errorCount = 0;
	let warningCount = 0;

	console.log(`Validating ${jsonFiles.length} script definition files...`);

	for (const fileName of jsonFiles) {
		const filePath = path.join(SCRIPT_LIBRARY_DIR, fileName);
		let task;

		try {
			task = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		} catch (error) {
			errorCount += 1;
			console.error(`ERROR: ${fileName}: invalid JSON (${error.message})`);
			continue;
		}

		const shapeErrors = validateTaskShape(task, fileName);
		const syncErrors = checkScriptSync(task, filePath, fileName);
		const syntaxErrors = checkScriptSyntax(task, fileName);
		const lintResults = lintScriptSafety(task.script || '', fileName);

		for (const error of [...shapeErrors, ...syncErrors, ...syntaxErrors, ...lintResults.errors]) {
			errorCount += 1;
			console.error(`ERROR: ${error}`);
		}

		for (const warning of lintResults.warnings) {
			warningCount += 1;
			console.warn(`WARN: ${warning}`);
		}
	}

	console.log(`\nSummary: ${errorCount} errors, ${warningCount} warnings`);

	if (errorCount > 0) {
		process.exit(1);
	}
}

main();