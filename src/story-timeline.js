// Augen-style pinned scroll: compact travel, clear copy beats, no long dead holds.
export const storyStops = [0, .18, .43, .68, 1];
export const desktopTimeline = [
 {end:.18,from:0,to:.1667,copy:0},
 {end:.43,from:.1667,to:.4167,copy:1},
 {end:.68,from:.4167,to:.6667,copy:2},
 {end:.88,from:.6667,to:1,copy:-1},
 {end:1,from:1,to:1,copy:3},
];
export function desktopMoment(progress){
 const p=Math.max(0,Math.min(1,progress));
 const index=desktopTimeline.findIndex(beat=>p<=beat.end);
 const beat=desktopTimeline[index],start=index?desktopTimeline[index-1].end:0;
 return {frame:beat.from+(beat.to-beat.from)*(p-start)/(beat.end-start),copy:beat.copy};
}


// Boundaries use the same frame mapping and rounding as story.js.
function frameAt(p,mobile){
 if(!mobile)return desktopMoment(p).frame*288;
 const chapter=p>=.68?3:p>=.43?2:p>=.18?1:0;
 const beats=[[0,.1667],[.1667,.4167],[.4167,.6667],[.6667,1]];
 const local=(p-storyStops[chapter])/(storyStops[chapter+1]-storyStops[chapter]);
 const [a,b]=beats[chapter];return (a+(b-a)*Math.max(0,Math.min(1,(local-.03)/.94)))*216;
}
const ranges=[false,true].map(mobile=>{
 const starts=mobile?[41,68,95,136,178]:[54,90,127,181,237];
 return [0,...starts.map(frame=>{let a=0,b=1;for(let i=0;i<40;i++){const m=(a+b)/2;if(frameAt(m,mobile)<frame-.5)a=m;else b=m;}return (a+b)/2;}),1];
});
const weights=[1,2,1.3,2,1.2,1];
export function travelFactor(mobile=false){const r=ranges[+mobile];return weights.reduce((sum,w,i)=>sum+(r[i+1]-r[i])*w,0);}
export function sourceProgress(p,mobile=false){
 const r=ranges[+mobile];let distance=Math.max(0,Math.min(1,p))*travelFactor(mobile);
 for(let i=0;i<weights.length;i++){const length=(r[i+1]-r[i])*weights[i];if(distance<=length)return r[i]+distance/weights[i];distance-=length;}return 1;
}
export function scrollProgress(p,mobile=false){
 const r=ranges[+mobile];let distance=0;
 for(let i=0;i<weights.length;i++)distance+=Math.max(0,Math.min(p,r[i+1])-r[i])*weights[i];
 return distance/travelFactor(mobile);
}
export function sceneProgress(p,scene,mobile=false){const r=ranges[+mobile];return Math.max(0,Math.min(1,(p-r[scene])/(r[scene+1]-r[scene])));}
