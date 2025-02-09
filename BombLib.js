export default class Bomb {
    strikes = 0;

    constructor(modules, seconds, strikes_allowed) {
        this.total_time_ms = seconds * 1000;
        this.strikes_allowed = strikes_allowed; // 1 more explodes
        console.log(this);

        this.modules = {};
        this.registerModules(modules)
        this.serial = this.generateSerial();
        this.batteries = this.generateBatteries();
        this.ports = this.generatePorts();

        window.onmessage = this.handleMessage;
    }

    start() {
        this.waitForHello();
    }

    startGame() {
        const tick = new Event("tick");
        this.start_time_ms = Date.now();
        this.startModules();

        // start ticking every ~100ms
        this.timer_interval = setInterval(() => {
            this.time_left =
                this.total_time_ms - (Date.now() - this.start_time_ms);
            if (this.time_left <= 0) {
                this.explode();
                return;
            }
            window.dispatchEvent(tick);
        }, 100);
    }

    // generate a UUID and prepare data
    registerModules(modules) {
        for (let module of modules) {
            let module_id = self.crypto.randomUUID();
            this.modules[module_id] = {
                solved: false,
                hello: false,
                url: "",
                frame: module,
            }; 

            module.onload = () => {
                this.initModule(module_id);
            }
        }
    }

    // send init to modules, wait for hello
    waitForHello() {
        this.hello_timeout = setTimeout(() => {
            // check if all modules replied
            for (let module_id in this.modules) {
                if (!this.modules[module_id].hello) {
                    console.error("Not all modules replied hello", this.modules[module_id]);
                    return;
                }
            }
            // if all modules are ready, start game
            this.startGame();
        }, 5000)
    }

    initModule(module_id) {
        this.sendToModule("init", module_id, {});
    }

    // send start signal to modules
    startModules() {
        for (let module_id in this.modules) {
            this.sendToModule("start", module_id, {
                total_modules: this.modules.length,
                total_time_ms: this.total_time_ms,
                start_time_ms: this.start_time_ms,
                strikes_allowed: this.strikes_allowed,
                seed: "ABCDEFG", // TODO
                edgework: {}, // TODO
            })
        }
    }


    strike() {
        this.strikes++;
        console.log(this.strikes);
        if (this.strikes > this.strikes_allowed) {
            this.explode();
        }
    }

    explode() {
        this.stop();
        window.dispatchEvent(new Event("explode"));
    }

    stop() {
        clearInterval(this.timer_interval);
    }

    get time_left_string() {
        let minutes = Math.floor(this.time_left / 60000);
        let seconds = Math.floor((this.time_left - minutes * 60000) / 1000);
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes + ":" + seconds;
    }

    handleMessage = (e) => {
        if (e.data.type == "hello") {
            // module replies, mark it as such
            this.modules[e.data.module_id].hello = true;
            // TODO if all modules work, start the game early (loading screen?)
        }
        if (e.data.type == "strike") {
            this.strike();
        }
    };

    sendToModule(type, module_id, data) {
        let message = {
            type: type,
            module_id: module_id,
            data: data,
        }
        this.modules[module_id].frame.contentWindow.postMessage(message, "*");
    }

    generateSerial() {
        return "ABC123";
    }

    generateBatteries() {
        return 3;
    }

    generatePorts() {
        return ["Parallel", "Serial"];
    }
}
