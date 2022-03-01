// @ts-nocheck

export default class Logger {

    constructor(loglevel) {
        this.loglevel = loglevel;
    }

    // always print to the console
    info(infoMsg) {
        console.log(`${infoMsg}`)
    }

    // only print to the console if enable DEBUG level
    debug(debugMsg) {
        if (this.loglevel.toUpperCase()  == "DEBUG") {
            console.log(`${debugMsg}`)
        }
    }

    // always print to the console
    error(errMsg) {
        console.error(`${errMsg}`)
    }
}
