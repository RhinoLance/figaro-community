---
sidebar_position: 3
---

# Chaining Write Commands

Now let's investigate sending multiple write commands to your QMX in a 
single script.

In the previous stage we set the frequency on VFO A.  Unfortunately we still
need to manually switch the radio to VFO A (if we're on B), and the mode to CW.

Let's go back to the QMX's 
[CAT programming manual](https://qrp-labs.com/qmx.html), and find the commands
to set the VFO and mode.

### Setting the VFO

:::tip[FT: Get/Set Transmit VFO Mode]

**Set**: &nbsp;&nbsp;&nbsp;&nbsp; Set VFO Mode: 0, 1, 2 correspond to VFO A, VFO B or Split respectively. This is the case for
both the FR and FT commands (which are nominally Receive and Transmit VFOs) because in
the QMX the VFO mode use does not correspond exactly to TS-480.

**Get**: &nbsp;&nbsp;&nbsp;&nbsp; Get Transmit VFO Mode: 0 means VFO A is used for transmit (must be VFO Mode A); 1
means VFO B is being used for transmit (could be due to VFO mode being VFO B, or VFO
Mode being Split)

:::

### Setting the Mode

:::tip[MD: Get/Set operating mode]

**Set**: Set to 3 (CW), 6 (FSK), 7 (CWR) or 9 (FSR/FSK Reverse)
**Get**: Returns 3 (CW), 6 (FSK), 7 (CWR) or 9 (FSR/FSK Reverse)

:::


### Updating the script

Let's add the additional commands to set the VFO and mode.

```js title="Set Frequency, VFO and Mode"
// set the frequency
sendCat("FA7030000;",false);

// set the vfo
sendCat("FT0;",false);

// set the mode
sendCat("MD3;",false);
```

### Installing the script

Update the script in your task and try running it.

### Congratulations
You now know how to chain multiple writing commands.

