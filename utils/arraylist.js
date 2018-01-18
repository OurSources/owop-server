class ArrayList {
    constructor() {
        this._data = [];
    }

    get size() {
        return this._data.length;
    }

    add(value) {
        this._data.push(value);
    }

    remove(value) {
        var index = this._data.indexOf(value);
        if (index >= 0) {
            this._data.splice(index, 1);
        }
    }

    clear() {
        this._data = [];
    }

    forEach(callback) {
        this._data.forEach(callback);
    }
}

module.exports = ArrayList;