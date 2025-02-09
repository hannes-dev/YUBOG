export default class Bomb {
    strikes = 0;

    constructor(modules, seconds, strikes_allowed) {
        this.total_time_ms = seconds * 1000;
        this.strikes_allowed = strikes_allowed; // 1 more explodes

        this.solved_modules = 0;
        this.solvable_modules = modules.length; // TODO check for needy
        this.modules = {};
        this.registerModules(modules)
        this.batteries = this.generateBatteries();
        this.ports = this.generatePorts();
        this.serial = this.getOrGenSerial(6);

        addEventListener("message", this.handleMessage);
    }

    start() {
        this.waitForHello();
    }

    #startTimer() {
        const tick = new Event("tick");
        this.start_time_ms = Date.now();
        this.startModules();

        // start ticking every ~100ms
        this.tick_interval = setInterval(() => {
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
                strikes: 0,
                hello: false,
                url: "",
                frame: module,
            };

            module.onload = () => {
                this.sendToModule("init", module_id, {});
            }
        }
    }

    // send start signal to modules
    startModules() {
        for (let module_id in this.modules) {
            this.sendToModule("start", module_id, {
                total_modules: this.modules.length,
                total_time_ms: this.total_time_ms,
                start_time_ms: this.start_time_ms,
                strikes_allowed: this.strikes_allowed,
                seed: this.serial, // using the serial as the seed is actually kind of cute
                edgework: {
                    batteries: this.batteries,
                    ports: this.ports,
                    serial: this.serial,
                },
            })
        }
    }

    strike(module_id) {
        console.log("strike received from ", this.modules[module_id]);
        this.strikes++;
        this.modules[module_id].strikes++;
        if (this.strikes > this.strikes_allowed) {
            this.explode();
        }
    }

    solve(module_id) {
        let module = this.modules[module_id]
        if (!module.solved) {
            console.log("solved ", module_id);
            module.solved = true;
            this.solved_modules += 1;
            module.frame.classList.add("solved");
        }
        if (this.solved_modules == this.solvable_modules) {
            console.log("fully solved bomb!");
            this.finish();
        }
    }

    explode() {
        this.stop();
        window.dispatchEvent(new Event("explode"));
    }

    finish() {
        this.stop();
        window.dispatchEvent(new Event("solved"));
    }

    stop() {
        clearInterval(this.tick_interval);
        removeEventListener("message", this.handleMessage);
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

            // if all modules are ready, start game early
            if (this.allModulesHello()) {
                console.log("all modules ready, starting game")
                clearTimeout(this.hello_timeout);
                this.#startTimer();
            }
        }
        if (e.data.type == "strike") {
            this.strike(e.data.module_id);
        }
        if (e.data.type == "solve") {
            this.solve(e.data.module_id);
        }
    };

    // send init to modules, wait for hello
    waitForHello() {
        this.hello_timeout = setTimeout(() => {
            // check if all modules replied
            if (!this.allModulesHello) {
                console.error("Not all modules replied hello", this.modules);
                return;
            }
            // if all modules are ready, start game
            this.#startTimer();
        }, 5000)
    }

    allModulesHello() {
        for (let module_id in this.modules) {
            if (!this.modules[module_id].hello) {
                return false;
            }
        }
        return true;
    }

    sendToModule(type, module_id, data) {
        let message = {
            type: type,
            module_id: module_id,
            data: data,
        }
        this.modules[module_id].frame.contentWindow.postMessage(message, "*");
    }
    
    generateBatteries() {
        let batteries = [];
        for (let i  = 0; i < this.getRandomNumber(0, 4); i++) {
            batteries.push(this.getRandomNumber(1, 2));
        }
        return batteries;
    }
    
    generatePorts() {
        const possiblePorts = ["DVI-D", "Parallel", "PS/2", "RJ-45", "Serial", "Stereo RCA"];
        let portNumber = this.getRandomNumber(1, )
        return possiblePorts.sort(() => Math.random() - 0.5).slice(0, 3)
    }
    
    getOrGenSerial(serial_length) {
        // check if serial was given in URL
        let params = new URLSearchParams(window.location.search);
        if (params.has("serial") && params.get("serial").length == serial_length) {
            return params.get("serial");
        }
        // no Y to avoid vowel questions
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXZ";
        const numbers = "0123456789";
        const chars = letters + numbers;

        let first   = letters[this.randomIndex(letters.length)];
        let middle  = Array.from({ length: serial_length - 2 }, () => chars[this.randomIndex(chars.length)]).join('');
        let last    = numbers[this.randomIndex(numbers.length)]
        return first + middle + last;
    }

    // get a random number inclusive
    getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    randomIndex(exclusive_max) {
        return Math.floor(Math.random() * exclusive_max);
    }
      
}
