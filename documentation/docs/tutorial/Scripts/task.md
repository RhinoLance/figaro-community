---
sidebar_position: 9
---

# Task Management

Given that many scripts will be executing asynchronous code, the Task object
provides a series of helpers to manage the script lifecycle.

These examples are using promises directly rather than async/await to better 
demonstrate their use.


### Task API

#### WaitUntil

`task.waitUntil(promise: Promise<any>): void`

Script will not complete until the passed promise has completed.

```js title="Retrieve firmware version" showLineNumbers
const runner = sendCat(`VN;`)
    .then( response =>  {
        print(response.substring(2));
        return delay(5000);
    });

task.waitUntil(runner);
```

#### OnCleanup

`task.onCleanup(hander: Fn): void`

Registers cleanup logic that always runs at end of the script, even on failure.

```js title="Display SWR" showLineNumbers
const runner = Promise.resolve()
    .then( () => {
        sendCat("TX;", false);
        return sendCat("SW;");
    })
    .then((response)=> {
        const swrNr = parseInt(response.substring(2))/100;
        print(`SWR: ${swrNr}`);
        return delay(5000);
    });

task.waitUntil(runner);

task.onCleanup(() => {
    sendCat("RX;", false);
});
```

## Intervals and Timers

Intervals and timers get complicated rather quickly if you're not familiar with 
async programming.  When reviewing the following scripts, don't be daunted
if they're beyond you.  It's still a good opportunity to consider some of the 
functionality Figaro can unlock with your QMX.

#### Intervals

`task.setInterval(handler: Fn, timeout: number, ...args: any): number`

`task.clearInterval(intervalId: number): void`

These functions behave the same as regular `setInterval` and `clearInterval`
functions, with the benefit
that they're limited to the script lifetime.  If the script completes before 
`task.clearInterval` is called, it will automatically be executed when the 
script terminates.

The following script will put the radio into TX mode and print the SWR untill 
the ***Stop*** (*Run*) button is tapped.

```js title="Monitor SWR" showLineNumbers
let intervalId;

const startSwrRead = ()=> {
    return task.setInterval(()=> {
        sendCat("SW;")
            .then((response)=> {
                const swrNr = parseInt(response.substring(2))/100;
                print(`SWR: ${swrNr.toFixed(1)}`);
            });
        }, 250);
};

const runner = Promise.resolve()
    .then( () => {
        sendCat("TX;", false);
        intervalId = startSwrRead();
        return pause('stop', "#CC0000");
    });

task.waitUntil(runner);

task.onCleanup(() => {
    sendCat("RX;", false);
});
```
#### Timeouts
`task.setTimeout(handler: Fn, timeout: number, ...args: any): number`

`task.clearTimeout(timeoutId: number): void`

These functions behave the same as regular `setTimeout` and `clearTimeout`
functions, with the benefit
that they're limited to the script lifetime.  If the script completes before 
`task.clearTimeout` is called, it will automatically be executed when the 
script terminates.

Now let's create a new script to monitor TX state of the radio. Once it detects 
that the radio is transmitting for more than AUTO_STOP_MILLIS, terminate the 
transmission;  Note that this is only able to switch back to RX state if it
was placed into TX via CAT commands.

```js title="Auto-Stop long TX" showLineNumbers
const AUTO_STOP_MILLIS = 3000;

let intervalId, timeoutId;
let prevTx = false;

//Define two promises.  One completes when the radio is put back into RX state
// manually, the other when the TX times out.
let txCompleteCb, txTimeoutCb;
const txCompletePromise = new Promise((resolve, _)=>{txCompleteCb = resolve});
const txTimeoutPromise = new Promise((resolve, _)=>{txTimeoutCb = resolve});

//listen for when the radio enters TX state.
const listenForTx = ()=> {
    return task.setInterval(()=> {
        sendCat("TQ;")
            .then((response)=> {
                const isTxNow = parseInt(response.substring(2)) == 1;

                if( isTxNow && !prevTx ){
                    
                    //the radio has just entered TX state, start the timout
                    // timer
                    prevTx = true;
                    print("TX");
                    startTxTimeout();
                }
                else if( !isTxNow && prevTx) {
                    //the radio has been manually switched to the RX state,
                    // complete the manual RX promise.
                    prevTx = false;
                    txCompleteCb();
                }
            });
        }, 1000);
};

const startTxTimeout = () => {
    timeoutId = task.setTimeout(()=>{
        
        //the TX has timed out, complete the timeout promise.
        txTimeoutCb();
    }, AUTO_STOP_MILLIS);
};

const cleanup = () => {
    sendCat("RX;", false);
    task.clearInterval(intervalId);
    task.clearTimeout(timeoutId);
}

//monitor the two promises, and cleanup as soon as one completes.
const racer = Promise.race([
    txCompletePromise,
    txTimeoutPromise
])
    .then(()=> {
        cleanup();
    });

intervalId = listenForTx();

task.waitUntil(racer);

task.onCleanup( cleanup );


```

### Installing the script

Save and run the script.  You should observe the firmware being displayed.

### Congratulations
You can now display argitrary text.

