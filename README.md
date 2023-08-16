# Class Pull

<div align="center">

[![npm version](https://badge.fury.io/js/class-pull.svg)](https://badge.fury.io/js/catai)
[![npm downloads](https://img.shields.io/npm/dt/class-pull.svg)](https://www.npmjs.com/package/catai)
[![GitHub license](https://img.shields.io/github/license/ido-pluto/class-pull)](./LICENSE)
[![semantic-release: node](https://img.shields.io/badge/semantic--release-node-5dae47?logo=semantic-release)](https://github.com/semantic-release/semantic-release)

</div>

This package enables you to manage a class pull.

With this package, you can:
- Make sure only limited uses of that class can happen simultaneously
- Do heavy tasks that require a class state
- Manage pull & get statistics

### Use example

```javascript
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
} main();


/**
 * Output:
 * counter 1
 * counter 1
 * counter 2
 * counter 2
 * counter 3
 */
```

### API
```typescript
interface ClassPull {
    new (createInstance: () => T | Promise<T>, options: ClassPullOptions);
    lockInstance(): Promise<lockInstanceItem>;
    loadingCount: number;
    freeCount: number;
}

type ClassPullOptions= {
    limit?: number;
    createOnInit?: number;
}

type lockInstanceItem = {
    instance: T;
    unlock: () => void;
}
```
