const fs = require('fs');
const path = require('path');

const PACKAGE_ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(PACKAGE_ROOT, 'schemas', 'figaro-ftd.schema.json');
const COLOR_HEX_RE = /^#[0-9a-fA-F]{6}$/;
const REQUIRED_KEYS = [
  'title',
  'description',
  'script',
  'autoRunOnConnect',
  'autoRunPriority',
  'autoLock',
  'runLocked',
];
const ALLOWED_KEYS = new Set([...REQUIRED_KEYS, 'color']);

function printUsage() {
  console.log('Usage: figaro-ftd-validate [path-to-task.json|directory]');
  console.log('Examples:');
  console.log('  figaro-ftd-validate my-task.json');
  console.log('  figaro-ftd-validate script-library');
  console.log('  figaro-ftd-validate');
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

  if (task.color !== undefined && (typeof task.color !== 'string' || !COLOR_HEX_RE.test(task.color))) {
    errors.push(`${fileName}: optional 'color' must be a 6-digit hex value like '#22c55e'.`);
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
    return [`${fileName}: script field does not match ${path.basename(jsPath)}.`];
  }

  return [];
}

function checkScriptSyntax(task, fileName) {
  const errors = [];

  try {
    new Function(`return (async () => { ${task.script} })();`);
  } catch (error) {
    errors.push(`${fileName}: script contains syntax errors: ${error.message}`);
  }

  return errors;
}

function resolveTargets(inputPath) {
  if (!inputPath) {
    const cwd = process.cwd();
    return fs
      .readdirSync(cwd)
      .filter((name) => name.toLowerCase().endsWith('.json'))
      .sort()
      .map((name) => ({ filePath: path.join(cwd, name), fileName: name }));
  }

  const resolvedPath = path.resolve(process.cwd(), inputPath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`Path not found: ${inputPath}`);
  }

  const stat = fs.statSync(resolvedPath);
  if (stat.isFile()) {
    if (!resolvedPath.toLowerCase().endsWith('.json')) {
      throw new Error(`Path must be a .json file or directory: ${inputPath}`);
    }

    return [{ filePath: resolvedPath, fileName: path.basename(resolvedPath) }];
  }

  if (stat.isDirectory()) {
    return fs
      .readdirSync(resolvedPath)
      .filter((name) => name.toLowerCase().endsWith('.json'))
      .sort()
      .map((name) => ({ filePath: path.join(resolvedPath, name), fileName: name }));
  }

  throw new Error(`Unsupported path type: ${inputPath}`);
}

function validateTargets(targets) {
  let errorCount = 0;
  let warningCount = 0;

  console.log(`Validating ${targets.length} file(s)...`);

  for (const target of targets) {
    let task;

    try {
      task = JSON.parse(fs.readFileSync(target.filePath, 'utf8'));
    } catch (error) {
      errorCount += 1;
      console.error(`ERROR: ${target.fileName}: invalid JSON (${error.message})`);
      continue;
    }

    const shapeErrors = validateTaskShape(task, target.fileName);
    const syncErrors = checkScriptSync(task, target.filePath, target.fileName);
    const syntaxErrors = checkScriptSyntax(task, target.fileName);
    const lintResults = lintScriptSafety(task.script || '', target.fileName);

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
  return errorCount === 0;
}

function runCli(argv) {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`Schema not found: ${SCHEMA_PATH}`);
    process.exit(1);
  }

  try {
    JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  } catch (error) {
    console.error(`Failed to parse schema ${SCHEMA_PATH}: ${error.message}`);
    process.exit(1);
  }

  const arg = argv[2];
  if (arg === '--help' || arg === '-h') {
    printUsage();
    process.exit(0);
  }

  if (argv.length > 3) {
    console.error('Expected zero or one argument.');
    printUsage();
    process.exit(1);
  }

  try {
    const targets = resolveTargets(arg);
    if (targets.length === 0) {
      console.error('No .json files found to validate.');
      process.exit(1);
    }

    const ok = validateTargets(targets);
    process.exit(ok ? 0 : 1);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  runCli,
};
