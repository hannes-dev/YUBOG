# YUBOG (Yet Unnamed BOmb Game)

This game is basically the same as 'Keep Talking and Nobody Explodes', but then in the browser.

## How to make a module
Check the [HOW_TO](./HOW_TO_module.md) for instructions.

## Running locally
Due to browser security things you can't just open the main.html. The easiest way is to run `python -m http.server` in the project root, then going to http://localhost:8000/main.html (or another port depending).
The `localhost` is important because it is a secure context, `0.0.0.0` isn't.

## Architecture

The idea is that every module runs in an iframe within the main window; the modules can then communicate with the main window by using `window.parent.postMessage`.

## Event

(Date not yet determined): once we finished writing the framework, there will be a Zeus event where every participant will make a module and a part of the manual. At the end of the evening, we'll have a lot of modules and they'll all work together :tm:

## Hardware version

There is also a version of this in hardware: https://github.com/ZeusWPI/OBUS
