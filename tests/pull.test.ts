import {ClassPull} from '../src/index.js';

class ExamplePull {
    counter = 0;
    sleep(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const pull = new ClassPull(
    () => new ExamplePull(),
    {
        limit: 2
    }
);

async function countRef() {
    const {instance, unlock} = await pull.lockInstance();

    await instance.sleep(1000);
    console.log('counter', ++instance.counter);
    unlock();
}


function main() {
    for (let i = 0; i < 5; i++) {
        countRef();
    }
}

main();
