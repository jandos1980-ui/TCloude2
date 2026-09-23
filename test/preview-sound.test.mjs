import test from 'node:test';
import assert from 'node:assert/strict';
import {initPreviewSound} from '../src/preview-sound.js';

test('mobile audio releases listeners and contexts when the story is replaced',async()=>{
  const original={window:globalThis.window,document:globalThis.document,addEventListener:globalThis.addEventListener};
  const document=new EventTarget(),window=new EventTarget(),root=new EventTarget();
  root.dataset={scene:'0'};
  let created=0,closed=0,ticks=0;
  const parameter={setValueAtTime(){},exponentialRampToValueAtTime(){}};
  class AudioContext {
    state='suspended';currentTime=1;
    constructor(){created++;}
    async resume(){this.state='running';}
    async suspend(){this.state='suspended';}
    async close(){this.state='closed';closed++;}
    createOscillator(){return {frequency:parameter,connect(){},disconnect(){},start(){ticks++;},stop(){}};}
    createGain(){return {gain:parameter,connect(){},disconnect(){}};}
  }
  window.AudioContext=AudioContext;
  Object.assign(globalThis,{window,document,addEventListener:window.addEventListener.bind(window)});
  try{
    for(let i=0;i<4;i++){
      const dispose=initPreviewSound(root);
      document.dispatchEvent(new Event('click'));
      await Promise.resolve();
      root.dispatchEvent(new CustomEvent('scenechange',{detail:{index:1}}));
      assert.equal(created,i+1);
      assert.equal(ticks,i+1);
      dispose();
      assert.equal(closed,i+1);
      document.dispatchEvent(new Event('click'));
      root.dispatchEvent(new CustomEvent('scenechange',{detail:{index:2}}));
      window.dispatchEvent(new Event('pagehide'));
      assert.equal(created,i+1,'disposed listeners must not create another context');
      assert.equal(ticks,i+1,'disposed listeners must not play another tick');
    }
  }finally{
    for(const [key,value] of Object.entries(original)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}
  }
});
