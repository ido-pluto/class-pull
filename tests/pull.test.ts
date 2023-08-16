import {ClassPull, PullableClass} from "../src/index.js";

class examplePull extends PullableClass {
    constructor() {
        super();
    }

    sleep(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const pull = new ClassPull(examplePull, {
    limit: 2,
});

let counter = 0;
async function doSomething() {

    const count = ++counter;
    console.time('doSomething' + count);

    const {instance, unlock} = await pull.lockInstance();

    await instance.sleep(1000);

    console.timeEnd('doSomething' + count);
    unlock();
}


function main(){
    for (let i = 0; i < 5; i++) {
        doSomething();
    }
} main();
