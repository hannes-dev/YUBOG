# How to make a new bomb module
A minimal example of a module is available in [modules](modules/yes_no/)

In the [`module.html`](modules/yes_no/module.html) between the script tags you can see how it works:
- you import the ModuleLib (in your version you will have to do this from https://hannes-dev.github.io/YUBOG/ModuleLib.js)
- if the user solves the module, you use `.sendSolve()` on the to the BombModule
- if the user makes a mistake, user `.sendStrike()` on the BombModule

You keep track of the state of your module in your own code.
After a module has been solved, any further signals are ignored.

If you need to setup anything, listen to the `yubog:init` event that is emitted by the module when the bomb is setting up.

If you need to know when the game starts, listen to the `yubog:start` event. After this event, things like the edgework (batteries, ports, serial) will be available.

You can query many properties of the bomb, like the amount of modules, solved modules and total and remaining time. To see the available functions for this, look at the bottom of the [ModuleLib.js](ModuleLib.js)

## Manual
Put the manual in `manual.html` next to your `module.html`.

## Testing
The easiest way to test your module is to put it in the `modules` folder and adding your module to the array `modules` in [`main.html`](./main.html).

## Hosting
You can host the module yourself, and give the URL to people that wanna play.

If you're from Zeus WPI you can add it to [the repo](https://github.com/ZeusWPI/YUBOG_modules).

## Extra Info
### Serial number
The serial number is always 6 characters long.
It always starts with a letter and always ends with a number.
You can get this by calling `getEdgework().serial`.

### Ports
The available ports are `["DVI-D", "Parallel", "PS/2", "RJ-45", "Serial", "Stereo RCA"]`. The module library has an enum for this, use that instead of strings :).

You can get the current ports on the bomb by calling `.getEdgework().ports` on your bombModule object.

### Batteries
The bomb can have between 0 and 4 groups of batteries (inclusive).
Each group of batteries has 1 or 2 batteries.

You can get this by calling `getEdgework().batteries`. You will get something like `[1, 2, 2]` where each item is a battery group and the number is the amount of batteries in that group.

There are some helper functions for batteries. Check the [`ModuleLib.js`](./ModuleLib.js)

