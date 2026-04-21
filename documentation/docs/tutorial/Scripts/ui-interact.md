---
sidebar_position: 9
---

# UI Interaction

At times it can be usefull to update the task's UI card.  Perhaps to output 
some radio settings.  


### Reading task details

Read only state information is available from the `context` object.

``` js

context: {
	task: {
		id: number;
		title: string;
		description: string;
		color?: string;
		autoRunOnConnect: boolean;
		autoRunPriority: number;
		autoLock: boolean;
	}
}

```


### Updating the UI

As well as reading task details, it may also be useful to update the title and 
descriptions displayed on the task card.

While the [print](print) command only displays while the script is running,
these commands will persist after the script has completed.

#### setTitle

`setTitle(title: string): void`

Set the task title to the provided text.

#### setDescription

`setDescription(title: string): void`

Set the task description to the provided text.


### Example

Let's create an example where we will read the current CW filter width,
and append it to the end of the current description.

```js title="Display SWR" showLineNumbers
const filterWidth = (await sendCat("MMCW|CW passband;")).substring(2);
setDescription(`${context.task.description} [${filterWidth}]`);
```

### Installing the script

Save and run the script.  You should observe the description updating to
display the CW filter width.

### Congratulations
You can now interact with the task UI.

