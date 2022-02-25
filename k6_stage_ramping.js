import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Global var 
const SLEEP_Duration = 0.2;
const PROTOCOL = "https";
const HOST_NAME = "test-api.k6.io";
const RESP_KEYWORD = "Bert";

// Define custom metrics 
let successRate = new Rate("check_success_rate");

// Test running options 
export const options = {
    discardResponseBodies: false,
    userAgent: 'k6Demo/1.0',
    scenarios: {
        http_get_api_stage_test: {
            executor: 'ramping-arrival-rate', // use open model: https://k6.io/docs/using-k6/scenarios/arrival-rate/ 
            startRate: 1, // 1 RPS 
            timeUnit: '1s',
            preAllocatedVUs: 3,
            maxVUs: 15,
            stages: [
                { target: 1, duration: '60s' },
                { target: 3, duration: '5s' },
                { target: 3, duration: '55s' },
                { target: 5, duration: '5s' },
                { target: 5, duration: '55s' },
            ],
            gracefulStop: "5s"
        },
    },
    thresholds: {
        http_req_duration: ['p(90) < 250'],
        'check_success_rate': [{
            threshold: 'rate > 0.95',
            abortOnFail: true,
            delayAbortEval: '15s',
        }],
    }
}

// Init Stage 
export function setup() {
    console.log("Init Testing at: " + new Date().toLocaleString());
    return Date.now();
}

// Running Stage 
export default function () {
    // Send out request 
    const response = http.get(`${PROTOCOL}://${HOST_NAME}/public/crocodiles/?format=json`, {
        cookies: { my_cookie: "123456" },
        headers: { 'X-MyHeader': "api-test" },
        timeout: "15s",
        compression: "gzip, deflate, br",
        tags: { name: "APINAME--GET" },
    });

    // Assert Response body, return a boolean
    const checkResp = check(response, {
        "response code is 200": (resp) => resp.status === 200,
        "content is present": (resp) => resp.body.includes(`${RESP_KEYWORD}`),
    });

    successRate.add(checkResp);
    // Simulate think time 
    sleep(Math.random() * SLEEP_Duration);
}

// Teardown Stage 
export function teardown(data) {
    console.log(`Test Duration: ${Date.now() - data}ms`);
}
