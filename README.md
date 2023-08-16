# Class Pull

<div align="center">

[![npm version](https://badge.fury.io/js/class-pull.svg)](https://badge.fury.io/js/catai)
[![npm downloads](https://img.shields.io/npm/dt/class-pull.svg)](https://www.npmjs.com/package/catai)
[![GitHub license](https://img.shields.io/github/license/withcatai/class-pull)](./LICENSE)

</div>

This package enables you to manage a class pull.

With this package, you can:
- Make sure only limited uses of that class can happen simultaneously
- Do heavy tasks that require a class state
- Manage pull & get statistics

### Use example

```javascript
import {ClassPull, PullableClass} from "class-pull";

class MySleepyClass extends PullableClass {
    constructor() {
        super();
    }

    sleep(ms = 1000) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

const pull = new ClassPull(MySleepyClass, {
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


function main() {
    for (let i = 0; i < 5; i++) {
        doSomething();
    }
}

main();

/**
 * Output:
 * doSomething1: 1s
 * doSomething2: 1s
 * doSomething3: 2s
 * doSomething4: 2s
 * doSomething5: 3s
 */
```

### API
```typescript
interface ClassPull {
    new (classRef: T, options: ClassPullOptions);
    lockInstance(): Promise<lockInstanceItem>;
    loadingCount: number;
    freeCount: number;
}

type ClassPullOptions = {
    limit?: number;
    createOnInit?: number;
}

type lockInstanceItem = {
    instance: T;
    unlock: () => void;
}
```
