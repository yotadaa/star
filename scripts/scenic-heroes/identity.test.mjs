import test from 'node:test';
import assert from 'node:assert/strict';
import { displayOwnerText } from '../../lib/identity.mjs';
test('the owner uses the requested short name in stored captions and bylines',()=>{
 assert.equal(displayOwnerText("I'm Mukhtada Billah NST, based in Jambi."),"I'm Mukhtada, based in Jambi.");
 assert.equal(displayOwnerText("Mukhtada Billah Nasution's work"),"Mukhtada's work");
 assert.equal(displayOwnerText('MUKHTADA BILLAH NST'),'Mukhtada');
});
test('unrelated names, URLs and existing short names stay intact',()=>{
 for(const text of ['Mukhtada','N Suniyyah, MB Nst','https://www.linkedin.com/in/mukhtada-nasution-893aaa246/','Nala']) assert.equal(displayOwnerText(text),text);
 assert.equal(displayOwnerText(null),'');
});
