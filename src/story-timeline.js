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
