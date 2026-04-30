---
sidebar_position: 2
---

# Writing Data

This page will teach you how to write a command to your QMX.  We'll learn by 
setting VFO A to our favourite CW calling frequency.

## Setting the frequency

To set the frequency we first need to know the QMX's CAT command for setting
the frequency.  We do that by referencing the QMX's 
[CAT programming manual](https://qrp-labs.com/qmx.html).

### Finding the CAT command
Page 2 shows the following:

:::tip[FA: Get/Set VFO A]

Set: &nbsp;&nbsp;&nbsp;&nbsp; Sets VFO A value. Example: FA7030000; sets VFO A 
to 7.030MHz

Get: &nbsp;&nbsp;&nbsp;&nbsp; Returns the VFO A contents as an 11-digit number. 
Example: “FA;” returns “FA00007030000;”

:::

:::tip[FB: Get/Set VFO B]

Set: &nbsp;&nbsp;&nbsp;&nbsp; Sets VFO B value. Example: FB7016000; sets VFO B 
to 7.016MHz

Get: &nbsp;&nbsp;&nbsp;&nbsp; Returns the VFO B contents as an 11-digit number. 
Example: “FB;” returns “FA00007016000;"

:::

This tells us that if we send the command `FA<freq>;` (all commands MUST end with a 
semicolon), the QMX will change VFO A's frequency accordingly.  So for example, 
if we want VFO A to be 7.030 MHz, our command will be `FA7030000;`;

### Writing the script
Now we'll learn our first script function: 

`sendCat(command: string, waitForResponse: boolean = true): Promise<string>`

If you're not familiar with writing software, that may look complex, but it's 
actually rather simple.  Let's look at what it's telling us:

- The command is called `sendCat`.
- It takes two parameters, the first `command: string` is the CAT Command which 
should be in the form of text within quotes.
- The second `waitForResponse: boolean: true` wants a simple `true` or `false` 
(without quotes).  If we don't provide anything, it will default to `true`.
- The final part `: Promise<string>` tells us that it will return a promise 
containing a text value.  We can ignore that for now though.

So in this instance, our script will be:
```js title="Set Frequency"
sendCat("FA7030000;",false);
```

### Installing the script
Now for the fun part.

In Figaro, create a new task.  You'll see the default script, which you can 
delete and replace with your new script.

When done, you new task should look something like this:

![alt text](image.png)

If you've not yet done so, update the rest of the fields thus:

- **Name**: A short name for the task.  Enter: "Set 7.300".
- **Description**: A one line explanation for what the script does.  Enter: 
"Set the QMX freq to 7.300 kHz".
- **Script**:  This is where you'll paste your script.  Tapping/clicking will 
open a large dialog for easy editing.  Close when you're done.
- **Task colour**:  Select a colour to visually distinguish tasks in your list.
A good practice is to use Red or Orange for any script which will put your radio
into TX mode, as a reminder to ensure you've got an antenna/dummy load connected
first.
- **Auto-run on connect**:  Enable if you want Figaro to run the script 
when a connection with your radio is established.
- **Priority**:  If Auto-run is enabled, the priority determines the order in 
which Auto-run tasks will execute.  We can leave it as the default.
- **Auto-lock**: If enabled, the task must be armed before it may be run. This 
is usefull for preventing accidental execution of tasks.
**Note** that this is a UI lock only. If both Auto-run and Auto-lock are 
enabled, the script will still execute as Auto-run’able without being armed.

:::tip

If you wish to go back and edit your task, do so by:

- **Android**: Swiping the task left.
- **Web**: Right clicking the task.

:::

Now save your script and try running it.

### Congratulations
You've just created your first custom script!

