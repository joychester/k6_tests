// @ts-nocheck

export default class Logger {

    constructor(loglevel) {
        this.loglevel = loglevel;
    }

    // always print to the console
    printInfoMsg(infoMsg) {
        console.log(`${infoMsg}`)
    }

    // only print to the console if enable DEBUG level
    printDebugMsg(debugMsg) {
        if (this.loglevel.toUpperCase()  == "DEBUG") {
            console.log(`${debugMsg}`)
        }
    }

    // always print to the console
    printErrorMsg(errMsg) {
        console.error(`${errMsg}`)
    }
}
