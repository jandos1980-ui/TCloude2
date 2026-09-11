// Normalized scroll intervals are independent of source clip duration.
export const desktopTimeline = [
 {end:.10,from:0,to:0,copy:0},
 {end:.30,from:0,to:.25,copy:-1},
 {end:.40,from:.25,to:.25,copy:1},
 {end:.65,from:.25,to:.70,copy:-1},
 {end:.85,from:.70,to:1,copy:-1},
 {end:1,from:1,to:1,copy:3},
];
export function desktopMoment(progress){
 const p=Math.max(0,Math.min(1,progress));
 const index=desktopTimeline.findIndex(beat=>p<=beat.end);
 const beat=desktopTimeline[index],start=index?desktopTimeline[index-1].end:0;
 return {frame:beat.from+(beat.to-beat.from)*(p-start)/(beat.end-start),copy:beat.copy};
}
