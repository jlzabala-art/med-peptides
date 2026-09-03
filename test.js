const id = '5-amino-1mq';
let hash = 0;
for (let i = 0; i < id.length; i++) {
  hash = (hash << 5) - hash + id.charCodeAt(i);
  hash |= 0;
}
console.log(Math.abs(hash).toString(16).toUpperCase().padStart(6, '0'));
