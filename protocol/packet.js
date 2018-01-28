'use strict';
const compression = require(`../utils/compression`);

class Packet {
	constructor(rawPacket, id) {
		if (rawPacket) {
			this._id = rawPacket.readUInt8(0);
			this._payload = rawPacket;
		} else {
			this._id = id;
			this._payload = Buffer.allocUnsafe(0);
			this.writeUInt8(id);
		}
		this._pointer = 0;
	}

	get id() {
		return this._id;
	}

	get size() {
		return this._size;
	}

	readUInt8() {
		return this._payload.readUInt8(this._pointer++);
	}

	readUInt16() {
		return this._payload.readUInt16LE(this._pointer, this._pointer += 2);
	}

	readInt32() {
		return this._payload.readInt32LE(this._pointer, this._pointer += 4);
	}

	readUInt32() {
		return this._payload.readUInt32LE(this._pointer, this._pointer += 4);
	}

	/* String:
		UInt16 - length, then
		UTF8 bytes
	*/
	readString() {
		var length = this.readUInt16();
		return this._payload.slice(this._pointer, length).toString();
	}

	/* String:
		UInt8 - width, then
		UInt8 - height, then
		Compressed bytes
	*/
	readImage() {
		var width = this.readUInt8();
		var height = this.readUInt8();
		return {
			width: width,
			height: height,
			image: compression.decompress(this._payload.slice(this._pointer))
		};
	}

	writeUInt8(value) {
		var temp = Buffer.allocUnsafe(1);
		temp.writeUInt8(value);
		this._payload = Buffer.concat([this._payload, temp]);
		return this;
	}

	writeUInt16(value) {
		var temp = Buffer.allocUnsafe(2);
		temp.writeUInt16LE(value);
		this._payload = Buffer.concat([this._payload, temp]);
		return this;
	}

	writeInt32(value) {
		var temp = Buffer.allocUnsafe(4);
		temp.writeInt32LE(value);
		this._payload = Buffer.concat([this._payload, temp]);
		return this;
	}

	writeUInt32(value) {
		var temp = Buffer.allocUnsafe(4);
		temp.writeUInt32LE(value);
		this._payload = Buffer.concat([this._payload, temp]);
		return this;
	}

	writeString(value) {
		var temp = Buffer.from(value.toString());
		this.writeUInt16(temp.byteLength);
		this._payload = Buffer.concat([this._payload, temp]);
		return this;
	}

	writeImage(value) {
		this.writeUInt8(value.x);
		this.writeUInt8(value.y);
		var temp = compression.compress(value.image);
		this._payload = Buffer.concat([this._payload, temp]);
		return this;
	}
}

module.exports = Packet;
