'use strict';
const ArrayList = require(`./arraylist`);

function compress(rawData) {
	rawData = rawData.buffer; /* converts to UInt8Array */
	var compressedSize = 0;
	var repeatLocations = new ArrayList();
	var repeatTimes = new ArrayList();
	var repeats = 1;
	var lastColor = -1;

	for (var i = 0; i < rawData.length; i += 2) {
		var thisColor = (rawData[i + 1] << 8) | rawData[i];
		if (lastColor == thisColor) {
			repeats++;
		} else {
			if (repeats >= 3) {
				compressedSize -= (repeats - 1) * 2 - 2 - 2;
				repeatLocations.add((compressedSize - 2 - 2 - 2) / 2);
				repeatTimes.add(repeats - 1);
				repeats = 1;
				lastColor = thisColor;
				continue;
			}
			repeats = 1;
			lastColor = thisColor;
		}
		compressedSize += 2;
	}
	if (repeats >= 3) {
		compressedSize -= (repeats) * 2 - 2 - 2;
		repeatLocations.add((compressedSize - 2 - 2) / 2);
		repeatTimes.add(repeats - 1);
	}

	var repeatsSize = repeatLocations.size;
	var compressedData = new Uint8Array(2 + 2 + repeatsSize * 2 + compressedSize);
	var length = rawData.length / 2 - 1;
	var offset = 2 + 2 + repeatsSize * 2;
	var cptr = 0;
	var dptr = offset;
	var optr = 0;
	compressedData[cptr++] = length & 0xFF;
	compressedData[cptr++] = (length >> 8) & 0xFF;
	compressedData[cptr++] = repeatsSize & 0xFF;
	compressedData[cptr++] = (repeatsSize >> 8) & 0xFF;
	for (var i = 0; i < repeatsSize; i++) {
		var loc = repeatLocations.get(i);
		var times = repeatTimes.get(i);
		compressedData[cptr++] = loc;
		compressedData[cptr++] = loc >> 8;
		while (dptr < loc * 2 + offset) {
			compressedData[dptr++] = rawData[optr++];
		}
		compressedData[dptr++] = times;
		compressedData[dptr++] = times >> 8;
		compressedData[dptr++] = rawData[optr++]; /* RG */
		compressedData[dptr++] = rawData[optr++]; /* GB (565) */
		optr += (1 + times - 1) * 2;
	}
	while (optr < rawData.size) {
		compressedData[dptr++] = rawData[optr++];
	}

	return Buffer.from(compressedData);
}

function decompress(compressedData) {
	compressedData = compressedData.buffer; /* converts to UInt8Array */
	var originalLength = (((compressedData[1] & 0xFF) << 8 | (compressedData[0] & 0xFF)) + 1) * 2;
	var rawData = new Uint8Array(originalLength);
	var repeatsSize = (compressedData[3] << 8) | compressedData[2];
	var offset = repeatsSize * 2 + 4;
	var uptr = 0;
	var cptr = offset;
	for (var i = 0; i < repeatsSize; i++) {
		var currentRepeatLoc = 2 * ((compressedData[4 + i * 2 + 1] << 8) | compressedData[4 + i * 2]) + offset;
		while (cptr < currentRepeatLoc) {
			rawData[uptr++] = compressedData[cptr++];
		}
		var repeatedNum = (compressedData[cptr + 1] << 8 | compressedData[cptr]) + 1;
		var repeatedColor = (compressedData[cptr + 3] << 8) | compressedData[cptr + 2];
		cptr += 4;
		while (repeatedNum-- != 0) {
			rawData[uptr] = repeatedColor;
			rawData[uptr + 1] = repeatedColor >> 8;
			uptr += 2;
		}
	}
	while (cptr < compressedData.length) {
		rawData[uptr++] = compressedData[cptr++];
	}

	return Buffer.from(rawData);
}

module.exports = { compress, decompress };
