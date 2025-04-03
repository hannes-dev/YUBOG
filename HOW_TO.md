# How to make a new bomb module
A minimal example of a module is available in [modules](modules/yes_no/)

In the [`module.html`](modules/yes_no/module.html) between the script tags you can see how it works:
- you import the ModuleLib (in your version you will have to do this from https://hannes-dev.github.io/YUBOG/ModuleLib.js)
- if the user solves the module, you use `.sendSolve()` on the to the BombModule
- if the user makes a mistake, user `.sendStrike()` on the BombModule

You keep track of the state of your module in your own code.
After a module has been solved, any further signals are ignored.

If you need to setup anything, listen to the `yubog:init` event that is emitted by the module when the bomb is setting up.

If you need to know when the game starts, listen to the `yubog:start` event. After this event, things like the edgework and batteries will be available.

You can query many properties of the bomb, like the amount of modules, solved modules and total and remaining time. To see the available functions for this, look at the bottom of the [ModuleLib.js](ModuleLib.js)

## Manual
Put the manual in `manual.html` next to your `module.html`.