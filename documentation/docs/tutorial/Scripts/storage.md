---
sidebar_position: 7
---

# Storage

In the previous step we learned how to save values to use again later.  Those
values are however only retained for the duration of the script.  Once the 
script completes, the values are gone.

In order to overcome that limitation, you may use the `Storage` object for values
which need to persist across multiple runs and app restarts.

### Storage object

`Storage.get(key: string): string`

`Storage.set(key: string, value: any)`

Let's create a new script, also with out favourite 
SOTA frequencies, but this time, every time we run the script, it will advance 
to the next frequency, where we can operate as usual.

**Note**
- storage keys are scoped to the task.  As such, you can have 
several tasks with a value stored against the key `lastFreq`, and they will not interfere 
with eachother.
- Storage.get returns a string, not a promise, so no promises in the mix.

### Creating the script

Now let's create a new script to use the Storage object.

```js title="Monitor frequencies" showLineNumbers
const freqList = [7032000, 10114000, 14044000];

const lastFreqIndex = Storage.get("freqIndex");

const index = lastFreqIndex 
    ? (lastFreqIndex + 1) % freqList.length
    : 0;

Storage.set("freqIndex", index);

sendCat(`FA${freqList[index]};`, false);
```

### Installing the script

Save and run the script.  You should observe your QMX cycling to the next 
frequency each time it's run.

### Congratulations
You can now save state, which persists across multiple script runs.

