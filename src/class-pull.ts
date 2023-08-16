export type ClassPullOptions= {
    limit?: number;
    createOnInit?: number;
}

const DEFAULT_CLASS_PULL_OPTIONS: ClassPullOptions = {
    limit: 10,
};

type ClassPullItem = {
    instance: any;
    loading: boolean;
    locked: boolean;
}

type UserGetInstance<T> = {
    instance: T
    unlock: () => void;
}

export default class ClassPull<T> {
    private _pull: ClassPullItem[] = [];
    private _waitPull: ((item: UserGetInstance<T>) => void)[] = [];

    constructor(protected _createInstance: () => T | Promise<T>, protected _options: ClassPullOptions = {}) {
        this._options = Object.assign({}, DEFAULT_CLASS_PULL_OPTIONS, _options);
        this._init();
    }

    private _init() {
        if (!this._options.limit || this._options.limit <= 0) {
            throw new Error('ClassPull: limit must be greater than 0');
        }

        if (!this._options.createOnInit) {
            return;
        }

        for (let i = 0; i < this._options.createOnInit; i++) {
            this._createLockedInstance(false);
        }
    }

    private get _freeInstance() {
        return this._pull.find(item => !item.locked);
    }

    public get loadingCount() {
        return this._pull.filter(item => item.loading).length;
    }

    public get freeCount() {
        return this._pull.filter(item => !item.locked).length;
    }

    public async lockInstance(): Promise<UserGetInstance<T>> {
        const haveInstance = this._freeInstance || await this._createLockedInstance();
        if (haveInstance) {
            haveInstance.locked = true;
            await haveInstance.instance;
            return {
                instance: haveInstance.instance,
                unlock: () => this._unlockedInstance(haveInstance),
            };
        }

        let resolve: (item: UserGetInstance<T>) => void;
        const promise = new Promise<UserGetInstance<T>>(resolve_ => resolve = resolve_);
        this._waitPull.push(resolve!);

        return promise;
    }

    private async _createLockedInstance(locked = true) {
        if (this._options.limit! <= this._pull.length) {
            return null;
        }

        const pullItem: ClassPullItem = {locked, loading: true, instance: this._createInstance()};
        this._pull.push(pullItem);

        if(pullItem.instance instanceof Promise){
            pullItem.instance = await pullItem.instance;
        }

        pullItem.loading = false;
        return pullItem;
    }

    private _unlockedInstance(item: ClassPullItem) {
        const pull = this._waitPull.shift();
        if (!pull) {
            item.locked = false;
            return;
        }

        pull({
            instance: item.instance,
            unlock: () => this._unlockedInstance(item),
        });
    }
}
