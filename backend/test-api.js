const fs = require('fs');
async function run() {
  const params = new URLSearchParams({
    limit: 6,
    latitude: 12.9716,
    longitude: 77.5946
  });
  const res = await fetch(`http://localhost:5000/api/services?${params}`);
  const json = await res.json();
  fs.writeFileSync('out-api-utf8.txt', JSON.stringify(json, null, 2), 'utf8');
}
run();
