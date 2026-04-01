---
sidebar_position: 4
---

# Delaying Scripts

Now let's investigate how to delay scripts, then continue again.

Assume we have three frequencies we use when operating SOTA, and when setting
up our station we normally flick between them to see if any of them have 
activity.

The three frequencies we're interested in are 7.032, 10.114 and 14.044 MHz.

### The Delay command

`delay(milliseconds: number): Promise<void>`

Delays script execution for the number of milliseconds.

If you're not familiar with the `Promise` object, I suggest you review the 
[Promise specification](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
.  In a nutshell, it's how we deal with asynchronous tasks.

### Updating the script

```js title="Monitor frequencies"
// set the first freq.
sendCat("FA7032000;");
//delay for 5 seconds.
delay(5000)
	.then(() => {
		//set the second freq.
		sendCat("FA10114000;");
		//delay for 5 seconds.
		return delay(5000)
	})
	.then(() => {
		//set the third freq.
		sendCat("FA14044000;");
		
		//no need to delay as we're done.
	});
```

Being in a Javascript environment, we of course have access to flow control
structures, so let's simplify our script.

```js title="Monitor frequencies"
const freqList = [7032000, 10114000, 14044000];

const setFreq = (freq) => {
    //set the freq.
    sendCat(`FA${freq};`);
    //delay for 5 seconds.
    return delay(5000);
};

Promise.resolve()
    .then( () => setFreq(freqList[0]))
    .then( () => setFreq(freqList[1]))
    .then( () => setFreq(freqList[2]));

```

### Installing the script

Add a new task and run it.  You should observe your QMX cycling through the set 
frequencies with a 5 second delay.

:::tip

Now that you've started working with Promises, you'll find yourself 
needing to debug your scripts.  Helpfull tips are found in the 
**[debugging](debugging)** page.

:::

### Congratulations
You can now delay script execution.

