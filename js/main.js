// ============ LOOP ============
let lastT=0;
function loop(ts){
  const dt=Math.min((ts-lastT)/1000,0.05);lastT=ts;
  update(dt);draw();requestAnimationFrame(loop);
}
reset();
requestAnimationFrame(ts=>{lastT=ts;loop(ts);});
