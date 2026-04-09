---
sidebar_position: 6
---

# Reading State

It is often usefull to retrieve state from the radio.  In this step you'll
learn how to request state data.

One of the shortcomings of our previous example was that after cycling through
the specified frequencies, it left the radio on the last frequency.  It would be
far more usefull to return the radio to the frequency in use before it was run.

### Reading data

To read data, we go back to our `sendCat` command.  This time however, we're 
interested in the response, so we need to wait on the returned promise.

:::tip[FA: Get/Set VFO A]

Set: &nbsp;&nbsp;&nbsp;&nbsp; Sets VFO A value. Example: FA7030000; sets VFO A 
to 7.030MHz

Get: &nbsp;&nbsp;&nbsp;&nbsp; Returns the VFO A contents as an 11-digit number. 
Example: “FA;” returns “FA00007030000;”

:::

**Note** that while the specification shows responses including a trailing ";", 
the `sendCat` command removes it before returning the response to the script,
so you don't have to deal with it.

### Updating the script

Now let's update the script to save the initial frequency at the start, then 
restore it once done.

```js title="Monitor frequencies" showLineNumbers
const freqList = [7032000, 10114000, 14044000];

const setFreq = async (freq) => {
    //set the freq.
    sendCat(`FA${freq};`, false);
    //wait for user input.
    await pause('play-pause', '#00c3ff')
};

// highlight-start
const getInitialFreq = async ()=> {
    const response = await sendCat("FA;")
    //Remove "FA" from the start of the response.
    const trimmedFreq = response.substring(2);
    return trimmedFreq;
};
// highlight-end

// highlight-next-line
const initialFreq = await getInitialFreq();
await setFreq(freqList[0]);
await setFreq(freqList[1]);
await setFreq(freqList[2]);
// highlight-start
//restore the initial frequency
await sendCat(`FA${initialFreq};`, false);
// highlight-end
```

### Installing the script

Before running the task this time, change your frequency so that it isn't 
the same as any of the list frequencies.

You should observe your QMX returning to the initial frequency when done.

### Congratulations
You can now read state, and save it for writing later.

