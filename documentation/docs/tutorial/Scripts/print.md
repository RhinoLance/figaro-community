---
sidebar_position: 8
---

# Print

At times it can be useful to show a value from the radio.  The `print` function 
allows just that.


### Print function

`print(text?: string): void`

When run with text, eg. `print('hello')`, an area with the printed text 
displays on the running task's panel.  When run with no text, eg. `print()`, the 
area is removed.

Note that when the script completes, the print area will be automatically 
removed.

### Creating the script

Now let's create a new script to retrieve and display the radio's firmware 
version.

```js title="Monitor frequencies" showLineNumbers
sendCat(`VN;`)
    .then( response =>  {
        //remember to remove the 'VN' from the response.
        print(response.substring(2));
        delay(5000);
    });
```

### Installing the script

Save and run the script.  You should observe the firmware being displayed.

### Congratulations
You can now display argitrary text.

