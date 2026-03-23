# <img src="media/header_logo.png" alt="Figaro" width="30"/> Figaro Scripting Guide



This page documents the task scripting environment used by Figaro.

## What a Script Is

A task script is JavaScript executed inside Figaro's runtime. Scripts are used to automate CAT operations against a connected QMX radio.

Typical uses:

- Set rig time from device time
- Switch mode and power for tune operations
- Display live values (for example SWR)
- Save and restore values between runs

## Runtime Model

- Scripts are compiled and executed at runtime.
- CAT operations are serialized through an internal command queue.
- A script fails fast when a CAT command fails.
- Cleanup handlers run even when a script fails.
- `async` and `await` keywords are removed by the runtime parser. Use Promise chaining and `task.waitUntil(...)` for asynchronous flows.

## Available Globals

### `sendCat(cmd, waitForResponse = true): Promise<string>`

Sends one CAT command.

- `cmd` must be a non-empty string and must end with `;`.
- Returns the raw response text from the radio.
- When `waitForResponse` is `false`, command is still sent, but the script does not wait for a response.

Example:

```javascript
sendCat('IF;').then((raw) => {
  log(`IF response: ${raw}`);
});
```

### `delay(milliseconds): Promise<void>`

Adds a timed pause in the command chain.

- `milliseconds` must be a non-negative number.

```javascript
sendCat('TX;', false)
  .then(() => delay(1000))
  .then(() => sendCat('RX;', false));
```

### `log(message): void`

Writes a message into the execution log for this task run.  Note that the execution log will retain the last 100 run results.

```javascript
log('Starting tune sequence');
```

### `print(text?): void`

Pushes a transient UI value while the task is running.  The printed value will 
be hidden once the script completes, it is therefor common to use `print` in conjunction with the `pause` statement.

- Useful for live values such as SWR.
- Call without the text parameter to clear.

```javascript
print('1.32');
task.waitUntil(pause());
```

### `pause(icon = 'play-pause', color?): Promise<void>`

Pauses script flow until the user resumes execution by tapping the run button again.

Supported icons:

- <img src="media/play.png" alt="Figaro" width="15"/>  `'play'` 
- <img src="media/play-pause.png" alt="Figaro" width="15"/>  `'play-pause'` 
- <img src="media/stop.png" alt="Figaro" width="20"/>  `'stop'` 

```javascript
pause('stop', '#D63031').then(() => {
  log('Resumed by user');
});
```

### `Storage.get(key): string | null`
### `Storage.set(key, value): void`

Small key-value storage.  Keys are scoped to the task, so the same key may be
safely used across several scripts without collisions.

- Values are persisted as strings.
- Useful for saving state between runs.

```javascript
const last = Storage.get('lastMode');
if (last) {
  sendCat(`MD${last};`, false);
}
Storage.set('lastMode', '3');
```

## Task API (`task`)

### `task.waitUntil(promise): void`

Registers asynchronous work so the runtime waits for it before finishing the task.

Use this when your script starts a Promise chain that is not directly returned.

```javascript
const runner = sendCat('FA;').then((raw) => {
  log(raw);
});

task.waitUntil(runner);
```

### `task.onCleanup(handler): void`

Registers cleanup logic that always runs at end of script, even on failure.

- Cleanup handlers run in reverse registration order.

```javascript
task.onCleanup(() => {
  sendCat('RX;', false);
});
```

### `task.setInterval(handler, timeout, ...args): number`
### `task.clearInterval(intervalId): void`
### `task.setTimeout(handler, timeout, ...args): number`
### `task.clearTimeout(timeoutId): void`

Managed timers tied to the task lifecycle.

- Active timers are automatically cleared when the task exits.

```javascript
// retrive the SWR every 300 milliseconds, and display untill the user presses the 'stop' button.
let id;
id = task.setInterval(() => {
  sendCat('SW;').then((raw) => {
    const swr = Number(raw.substring(2)) / 100;
    print(swr.toFixed(2));
  });
}, 300);

task.waitUntil(pause('stop', '#D63031'));

task.onCleanup(() => task.clearInterval(id));
```

## Standard Timers

These are also available directly:

- `setInterval` / `clearInterval`
- `setTimeout` / `clearTimeout`

Prefer `task.*` timer wrappers for automatic lifecycle cleanup.

## Error and Logging Behavior

- CAT command failures are recorded with the failing command.
- Runtime exceptions are recorded as script runtime errors.
- Logs include:
  - command input
  - output or error
  - timestamp

Execution history in the app keeps the most recent runs (see app docs for current cap and retention rules).

## Patterns

### Pattern: Save, change, restore

```javascript
let previousMode;

const runner = sendCat('MD;')
  .then((raw) => {
    previousMode = raw.substring(2);
    return sendCat('MD3;', false);
  })
  .then(() => pause('stop', '#D63031'))
  .then(() => sendCat(`MD${previousMode};`, false));

task.waitUntil(runner);
```

### Pattern: Long-running flow with cleanup

```javascript
let ticker;

const runner = Promise.resolve()
  .then(() => {
    ticker = task.setInterval(() => {
      sendCat('SW;').then((raw) => {
        const swr = Number(raw.substring(2)) / 100;
        print(swr.toFixed(2));
      });
    }, 300);
  })
  .then(() => pause('stop', '#D63031'));

task.onCleanup(() => {
  task.clearInterval(ticker);
  sendCat('RX;', false);
});

task.waitUntil(runner);
```

## Best Practices

- Always terminate CAT commands with `;`.
- Use `task.waitUntil(...)` for Promise chains.
- Register cleanup early with `task.onCleanup(...)`.
- Use `waitForResponse = false` only when you intentionally do not need a reply.
- Keep scripts deterministic and idempotent where possible.
- Log key milestones to simplify troubleshooting.
