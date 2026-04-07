---
sidebar_position: 5
---

# Pausing Scripts

In our delay example, we had a fixed 5 seconds in which to listen for
activity.    We will now update the script to pause the script's execution
untill you choose to move on to the next frequency.

### The Pause command

`pause(icon: string='play-pause', colour?:string, resume?: Promise<void>): Promise<void>`

Pause script execution until the ***Run*** button is pressed again.

There are also two new parameters:

**icon**: Change the button icon.    The following options are available:
-    `'play'` ![play](./img/play.png) 
-    `'play-pause'` ![play-pause](./img/play-pause.png)
-    `'stop'` ![stop](./img/stop.png)

**colour**: Change the button's background colour to any hex value.    
e.g. `#FF0000`.

**resume**: A promise may be passed which, when resolved, will resume the script,
as though the button had been pressed.

### Updating the script

Now let's update the script to wait for you instead of the fixed timout.

```js title="Monitor frequencies"
const freqList = [7032000, 10114000, 14044000];

const setFreq = (freq) => 
    //set the freq.
    sendCat(`FA${freq};`);
    //wait for user input.
// highlight-next-line
    return pause('play-pause', '#00c3ff');
};

Promise.resolve()
    .then( () => setFreq(freqList[0]))
    .then( () => setFreq(freqList[1]))
    .then( () => setFreq(freqList[2]));

```

### Installing the script

Add a new task and run it.    You should observe your QMX cycling through the set 
frequencies, only continuing after user input.

### Congratulations
You can now pause execution contingent on user input.

