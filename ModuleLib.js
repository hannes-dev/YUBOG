export default class BombModule {
    #lib_version = "0.0.0";

    PORTS = Object.freeze({
        DVI_D: 'DVI-D',
        PARALLEL: 'Parallel',
        PS2: 'PS/2',
        SERIAL: 'Serial',
        RJ45: 'RJ-45',
        STEREO_RCA: 'Stereo RCA'
    });

    constructor() {
        window.onmessage = this.handleMessage;
        this.module_id = null;
        this.dynamic_gamestate = {};
        this.static_gamestate = {};
    }

    #cyrb128(str) {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
        return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
    }

    #sfc32(a, b, c, d) {
        return function() {
            a |= 0; b |= 0; c |= 0; d |= 0;
            let t = (a + b | 0) + d | 0;
            d = d + 1 | 0;
            a = b ^ b >>> 9;
            b = c + (c << 3) | 0;
            c = (c << 21 | c >>> 11);
            c = c + t | 0;
            return (t >>> 0) / 4294967296;
        }
    }

    #sendToBomb(type, data) {
        let message = {data: data, type: type, module_id: this.module_id};
        window.parent.postMessage(message, "*");
    }

    handleMessage = (e) => {
        switch (e.data.type) {
            case 'tick': {
                this.dynamic_gamestate.solved_modules = e.data.data.solved_modules;
                this.dynamic_gamestate.strikes_received = e.data.data.strikes_received;

                const event = new Event("yubog:tick", e.data.data);
                window.dispatchEvent(event);
                break;
            }

            case 'start': {
                this.static_gamestate.solved_modules = 0;
                this.static_gamestate.total_modules = e.data.data.total_modules;
                this.static_gamestate.total_time_ms = e.data.data.total_time_ms;
                this.static_gamestate.stikes_allowed = e.data.data.strikes_allowed;
                this.static_gamestate.seed = e.data.data.seed;
                this.static_gamestate.start_time_ms = e.data.data.start_time_ms;
                this.static_gamestate.edgework = Object.freeze(e.data.data.edgework);

                const seed = this.#cyrb128(this.static_gamestate.seed);
                Math.random = this.#sfc32(seed[0], seed[1], seed[2], seed[3]);

                const event = new Event("yubog:start", e.data.data);
                window.dispatchEvent(event);
                break;
            }

            case 'init': {
                this.module_id = e.data.module_id;

                const seed = this.#cyrb128("init");
                Math.random = this.#sfc32(seed[0], seed[1], seed[2], seed[3]);

                const event = new Event("yubog:init", e.data.data);
                window.dispatchEvent(event);
                
                this.#sendToBomb("hello", {});
                break;
            }
        }
    }

    sendStrike() {
       this.#sendToBomb("strike");
    }

    sendSolve() {
        this.#sendToBomb("solve");
    }

    getTotalStrikeAllowed() {
        return this.static_gamestate.strikes_allowed;
    }

    getStrikesAllowedRemaining() {
        return this.static_gamestate.strikes_allowed - this.static_gamestate.strikes_received;
    }

    getStrikesReceived() {
        return this.static_gamestate.strikes_received;
    }

    getBombTimeString() {
        let minutes = Math.floor(this.getTimeRemainingMs() / 60000);
        let seconds = Math.floor((this.getTimeRemainingMs() - minutes * 60000) / 1000);
        
        return String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
    }

    // Elapsed time, **in milliseconds**
    getTimeElapsedMs() {
        return  Date.now() - this.static_gamestate.start_time_ms;
    }

    // Remaining time, **in milliseconds**
    getTimeRemainingMs() {
        return this.static_gamestate.total_time_ms - this.getTimeElapsedMs();
    }

    // Total time the bomb can tick before exploding, **in milliseconds**
    getTotalTimeMs() {
        return this.static_gamestate.total_time_ms;
    }

    // Gets amount of unsolved modules, including this module
    getUnsolvedModuleAmount() {
        return this.static_gamestate.total_modules - this.dynamic_gamestate.solved_modules;
    }

    // Gets amount of solved modules
    getSolvedModuleAmount() {
        return this.dynamic_gamestate.solved_modules;
    }

    getTotalModuleAmount() {
        return this.static_gamestate.total_modules;
    }

    // Returns an object containing at least
    // - serial: a serial number string containing at least a number and a letter
    // - batteries: an array of integers, every element represents the amount of batteries in a group
    // - ports: array of strings, every element is the name of a port present on the bomb
    getEdgework() {
        return this.static_gamestate.edgework;
    }

    // Returns total amount of batteries
    getTotalBatteries() {
        return this.static_gamestate.edgework.batteries.reduce((partialSum, a) => partialSum + a, 0);
    }

    // Returns amount of battery groups
    getBatteryGroups() {
        return this.static_gamestate.edgework.batteries.length;
    }

    getSerialNumber() {
        return this.static_gamestate.edgework.serial;
    }

    // You can pass arbitary strings, but we recommend to pass a member of BombModule.PORTS
    isPortPresent(name) {
        return this.static_gamestate.edgework.ports.includes(name);
    }
}