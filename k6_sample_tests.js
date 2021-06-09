import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';
import { SharedArray } from 'k6/data';
// load 3rd party lib from k6 JS Lib CDN
import PapaParse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
// or you can install it through npm install and load it from local disk
//import PapaParse from '../node_modules/papaparse/papaparse.js';


const SLEEP_DURATION = 0.2;
const PROTOCOL = "https"
const HOST_NAME = "test-api.k6.io";

//Define custom metrics
let successRate = new Rate("check_success_rate");

//Test running configs
export let options = {
    discardResponseBodies: false,
    userAgent: 'MyK6UserAgentString/1.0',
    scenarios:{
        http_get_api: {
            executor: 'constant-arrival-rate', // use open model instead of close model
            rate: 1, // this means 3 RPS
            timeUnit:  '1s',
            duration: '1m',
            preAllocatedVUs: 5,
            maxVUs: 15,
        },
    },
    thresholds: {
        http_req_duration: ['p(90) < 250'],
        'check_success_rate': [{
            threshold: 'rate > 0.95', 
            abortOnFail: true,
            delayAbortEval: '15s'}],
    }

}

//Data parameterization
const inputData = new SharedArray("ids and names", () => {
    // Load CSV file and parse it using Papa Parse
    return PapaParse.parse(open('./data.csv'), {header: true}).data;
});

//Init code
export function setup() {
    console.log("Init Testing..." + new Date().toLocaleString());
    return Date.now();
}

//VU test code
export default function()  {

    let rand_input = inputData[Math.floor(Math.random() * inputData.length)];
    console.log(JSON.stringify(rand_input));

    // Send out the API
    const response = http.get(`${PROTOCOL}://${HOST_NAME}/public/crocodiles/?format=json&id=${rand_input.id}&name=${rand_input.name}`, {
        cookies: { my_cookie: "123456" },
        headers: { 'X-MyHeader': "apitest" },
        timeout: "15s",
        compression: "gzip, deflate, br",
        tags: {name: 'APINAME--GET'},
    });
    console.log(response.url);

    // Assert the response
    const checkResp = check(response, { // can be a combination assertion
        "response code is 200": (resp) => resp.status === 200,
        "content is present": (resp) => resp.body.includes("Bert"),
    });

    successRate.add(checkResp);

    // Simulate the think time
    sleep(Math.random() * SLEEP_DURATION);
}

//TearDown code
export function teardown(data) {
    console.log(`Test duration: ${ Date.now()- data }ms`);
}
