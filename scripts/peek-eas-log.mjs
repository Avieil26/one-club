import fs from 'node:fs';
import zlib from 'node:zlib';

const p = process.env.TEMP + '/eas-build-log.txt';
const raw = fs.readFileSync(p);
const text = (raw[0] === 0x1f && raw[1] === 0x8b ? zlib.gunzipSync(raw) : raw).toString('utf8');
const lines = text.split(/\r?\n/);
const hits = lines.filter((line) => /AAPT|What went wrong|FAILED|error:|not a valid|Execution failed|PNG|FAILURE/i.test(line));
console.log('lines', lines.length, 'hits', hits.length);
console.log(hits.slice(-40).join('\n'));
console.log('---TAIL---');
console.log(lines.slice(-30).join('\n'));
