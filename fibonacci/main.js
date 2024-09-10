const { Worker } = require("worker_threads");
const path = require('path');

let number = 30;

const worker = new Worker(path.join(__dirname, './worker.js'), { workerData: { num: number } });

worker.once("message", result => {
    console.log(`${number}th Fibonacci Result: ${result}`);
});

worker.on("error", error => {
    console.log(error);
});

worker.on("exit", exitCode => {
    console.log(`It exited with code ${exitCode}`);
})

console.log("Execution in main thread");