export default class Bomb {
    #lib_version = "0.1.0"
    
    constructor() {
        window.onmessage = this.handleMessage;
    }

    handleMessage(e) {
        console.log(e)
    }

    strike() {
        window.parent.postMessage({type: "strike", id: 0}, "*");
    }
}