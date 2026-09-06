import test from 'node:test';
import assert from 'node:assert/strict';
import { parseDiscoveries, advanceAction, focusBlur, parallaxOffset } from '../../components/scenic-hero/sceneState.mjs';

test('journal rejects corrupt data, unknown identifiers and duplicates', () => {
 for (const input of ['{bad', 'null', '{}', '42']) assert.deepEqual(parseDiscoveries(input), []);
 assert.deepEqual(parseDiscoveries('["canopy","__proto__","canopy","snow",42]'), ['canopy', 'snow']);
});
test('uncovering saturates and invalid counters cannot escape the action bounds', () => {
 let count = 0;
 for (let i = 0; i < 100; i++) count = advanceAction(count, 3);
 assert.equal(count, 3);
 assert.equal(advanceAction(-7, 3), 1);
 assert.equal(advanceAction('bad', 3), 1);
 assert.equal(advanceAction(0, -1), 1);
});
test('focus leaves selected objects sharp and caps costly blur', () => {
 const distances = { near: { far: 90, middle: -2 } };
 assert.equal(focusBlur('near', 'near', distances), 0);
 assert.equal(focusBlur('far', 'near', distances), 10);
 assert.equal(focusBlur('middle', 'near', distances), 0);
});
test('pointer offsets remain bounded outside the scene and safe for zero size', () => {
 const bounds = { left: 100, top: 100, width: 200, height: 100 };
 assert.deepEqual(parallaxOffset({ x: 200, y: 150 }, bounds, 10), { x: 0, y: 0 });
 assert.deepEqual(parallaxOffset({ x: -100, y: 1000 }, bounds, 10), { x: -10, y: 10 });
 assert.deepEqual(parallaxOffset({ x: 1, y: 1 }, { width: 0, height: 0 }, 10), { x: 0, y: 0 });
});

test('scenic letter fill and ink contour exceed AA contrast', () => {
 const foreground=[245,236,216], ink=[22,36,31];
 const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
 assert.ok((luminance(foreground)+.05)/(luminance(ink)+.05)>=4.5);
});
