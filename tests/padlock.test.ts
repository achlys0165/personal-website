import assert from 'node:assert/strict';
import {test} from 'node:test';
import {Mesh} from 'three';
import {createPadlock} from '../src/components/lock/createPadlock';
import {clampLockTilt,heroLockFlag,unlockProgress} from '../src/lockState';

test('padlock is procedural, bevelled, and has a separate opening shackle',()=>{
  const model=createPadlock(true);
  assert.ok(model.body.geometry.attributes.position.count>24);
  assert.ok(model.lock.children.includes(model.shackle));
  assert.equal(model.shackle.name,'Opening shackle');
  assert.equal(model.amber.color.getHexString(),'e9ae45');
  model.lock.traverse(object=>{if(object instanceof Mesh){object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();}});
});
test('unlock easing is bounded and reduced motion switches instantly',()=>{
  let progress=0;
  for(let i=0;i<60;i++){progress=unlockProgress(progress,true,1/30);assert.ok(progress>=0&&progress<=1);}
  assert.ok(progress>.99);
  for(let i=0;i<60;i++)progress=unlockProgress(progress,false,1/30);
  assert.ok(progress<.01);
  assert.equal(unlockProgress(.4,true,0,true),1);
  assert.equal(unlockProgress(.4,false,0,true),0);
  assert.equal(unlockProgress(.4,true,0),.4);
});
test('drag tilt stays bounded and the reveal uses Jan’s exact flag',()=>{
  assert.equal(clampLockTilt(-10),-.35);assert.equal(clampLockTilt(10),.35);assert.equal(clampLockTilt(.1),.1);
  assert.equal(heroLockFlag,'flag{you_found_me_lets_talk}');
});
