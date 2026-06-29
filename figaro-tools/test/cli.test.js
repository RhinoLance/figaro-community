const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const binPath = path.resolve(__dirname, '..', 'bin', 'figaro-ftd-validate.js');

function runCli(args, cwd) {
  return spawnSync(process.execPath, [binPath, ...args], {
    cwd,
    encoding: 'utf8',
  });
}

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'figaro-tools-test-'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

test('prints usage with --help', () => {
  const result = runCli(['--help'], path.resolve(__dirname, '..'));
  assert.equal(result.status, 0);
  assert.match(result.stdout, /Usage: figaro-ftd-validate/);
});

test('validates a valid task json file', () => {
  const dir = makeTempDir();

  try {
    writeJson(path.join(dir, 'task.json'), {
      title: 'Test Task',
      description: 'Sample task',
      script: 'await sendCat("RX;");',
      autoRunOnConnect: false,
      autoRunPriority: 10,
      autoLock: false,
      runLocked: false,
      color: '#22c55e',
    });

    const result = runCli(['task.json'], dir);
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Summary: 0 errors, 0 warnings/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('fails when required keys are missing', () => {
  const dir = makeTempDir();

  try {
    writeJson(path.join(dir, 'bad-task.json'), {
      title: 'Broken Task',
      description: 'Missing runLocked key',
      script: 'await sendCat("RX;");',
      autoRunOnConnect: true,
      autoRunPriority: 1,
      autoLock: true,
    });

    const result = runCli(['bad-task.json'], dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing required key 'runLocked'/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('validates all json files in a directory argument', () => {
  const dir = makeTempDir();

  try {
    writeJson(path.join(dir, 'ok.json'), {
      title: 'Ok Task',
      description: 'Good',
      script: 'await sendCat("RX;");',
      autoRunOnConnect: false,
      autoRunPriority: 2,
      autoLock: false,
      runLocked: false,
    });

    writeJson(path.join(dir, 'bad.json'), {
      title: 'Bad Task',
      description: 'Has bad color',
      script: 'await sendCat("RX;");',
      autoRunOnConnect: false,
      autoRunPriority: 2,
      autoLock: false,
      runLocked: false,
      color: 'green',
    });

    const result = runCli([dir], path.resolve(__dirname, '..'));
    assert.equal(result.status, 1);
    assert.match(result.stderr, /bad.json: optional 'color' must be a 6-digit hex value/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
