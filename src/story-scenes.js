// Cuts verified against the actual exported frames, rather than nominal shot times.
export const sceneStarts={desktop:[0,54,90,127,181,237],mobile:[0,41,68,95,136,178]};
export const sceneCopies=[0,1,1,2,3,-1];
export function sceneForFrame(frame,mobile=false){
 const starts=sceneStarts[mobile?'mobile':'desktop'];
 let scene=0;
 while(scene+1<starts.length&&frame>=starts[scene+1])scene++;
 return scene;
}
