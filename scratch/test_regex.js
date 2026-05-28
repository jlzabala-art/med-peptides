const text = `[TIMELINE:[{"phase":"1","title":"Foundational Priming","duration":"4 weeks","desc":"Establish baseline, initiate cellular repair & metabolic support.","color":"#0284c7"},{"phase":"2","title":"Active Optimization","duration":"8-12 weeks","desc":"Intensify cellular rejuvenation and metabolic efficiency.","color":"#059669"},{"phase":"3","title":"Maintenance & Monitoring","duration":"Ongoing","desc":"Sustain benefits, adapt protocol based on regular diagnostics.","color":"#f59e0b"}]]`;

const timelineMatch = text.match(/\[TIMELINE:(\[.*?\])\]/i);
console.log('timelineMatch:', timelineMatch);

if (timelineMatch) {
  try {
    const parsed = JSON.parse(timelineMatch[1]);
    console.log('Successfully parsed:', parsed);
  } catch (e) {
    console.error('Failed to parse:', e.message);
  }
}
