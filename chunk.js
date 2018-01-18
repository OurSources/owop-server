class Chunk {
    constructor(data, x, y) {
        this._data = data;
        this._changed = false;
    }

    get data() {
        return this._data;
    }

    putPixel(x, y, color) {
        /*pixels[((y << 8) + x) << 1] = color;
        pixels[(((y << 8) + x) << 1) + 1] = color >> 8;*/
        this._changed = true;
    }

    getPixel(x, y) {
        /*return pixels[((y << 8) + x) << 1]
            | pixels[(((y << 8) + x) << 1) + 1] << 8;*/
    }

    get changed() {
        
    }
}

module.exports = Chunk;