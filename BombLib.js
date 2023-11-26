export default class Bomb {
    strikes = 0;

    constructor(modules, seconds, max_strikes) {
        this.seconds = seconds;
        this.max_strikes = max_strikes;
        console.log(this);

        this.modules = [];
        let i = 0;
        for (let module of modules) {
            this.modules[i] = module;
            i++;
        }

        this.serial = this.generateSerial();
        this.batteries = this.generateBatteries();
        this.ports = this.generatePorts();

        window.onmessage = this.handleMessage;
    }

    start() {
        const tick = new Event("tick");
        this.start_time = Date.now();
        this.timer_interval = setInterval(() => {
            this.time_left = this.seconds * 1000 - (Date.now() - this.start_time);
            if (this.time_left <= 0) {
                this.stop();
                return
            }
            window.dispatchEvent(tick);
        }, 100);
    }

    strike() {
        this.strikes++;
        console.log(this.strikes);
        if (this.strikes > this.max_strikes) {
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
        if (e.data.type == "strike") {
            this.strike();
        }
    }

    generateSerial() {
        return "ABC123";
    }

    generateBatteries() {
        return 3
    }

    generatePorts() {
        return ["Parallel", "Serial"]
    }
}