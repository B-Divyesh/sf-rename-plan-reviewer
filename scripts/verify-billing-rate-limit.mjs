const endpoint = 'https://api.sociobot.in/api/v1/products/rename-plan-reviewer/verify?license=';
const waves = [80, 160];
const results = [];

for (const count of waves) {
  const nonce = `${Date.now()}-${crypto.randomUUID()}`;
  const wave = await Promise.all(Array.from({ length: count }, async (_, index) => {
    const response = await fetch(`${endpoint}${encodeURIComponent(`rate-policy-${nonce}-${index}`)}`);
    return { status: response.status, retryAfter: response.headers.get('retry-after') };
  }));
  results.push(...wave);
}

const statusCounts = results.reduce((counts, result) => {
  counts[result.status] = (counts[result.status] ?? 0) + 1;
  return counts;
}, {});
const throttled = results.filter((result) => result.status === 429);
console.log(JSON.stringify({ requests: results.length, statusCounts, retryAfterOn429: throttled.filter((result) => result.retryAfter).length }));

if (throttled.length === 0) {
  throw new Error('The Sociobot verification endpoint did not rate-limit the 240-request acceptance burst.');
}
if (throttled.some((result) => !result.retryAfter)) {
  throw new Error('A rate-limited response omitted the required Retry-After header.');
}
