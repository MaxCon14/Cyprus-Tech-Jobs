import assert from 'node:assert/strict';

const base = process.env.SEO_TEST_URL ?? 'http://localhost:3011';
const canonicalBase = 'https://cyprustech.careers';
async function page(path) {
  const response = await fetch(base + path, { headers: { 'User-Agent': 'Googlebot' } });
  const html = await response.text();
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
  return { response, html, schemas };
}
for (const city of ['nicosia', 'limassol', 'larnaca', 'paphos']) {
  const { response, html, schemas } = await page(`/jobs/${city}`);
  assert.equal(response.status, 200);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(html.includes(`href="${canonicalBase}/jobs/${city}"`));
  assert.ok(html.includes('content="index, follow"'));
  assert.ok(html.includes('ACTIVE LISTINGS'));
  assert.ok(html.includes('Current hiring in'));
  assert.ok(html.includes('gross') || html.includes('Gross'));
  for (const type of ['Organization', 'WebSite', 'BreadcrumbList', 'CollectionPage', 'ItemList']) assert.ok(schemas.some(s => s['@type'] === type), `${city}: missing ${type}`);
  assert.ok(!schemas.some(s => s['@type'] === 'JobPosting'), 'JobPosting belongs on individual vacancies');
  assert.ok(!schemas.some(s => s['@type'] === 'FAQPage'));
  const collection = schemas.find(s => s['@type'] === 'CollectionPage');
  assert.equal(collection.about.address.addressCountry, 'CY');
  const list = schemas.find(s => s['@type'] === 'ItemList');
  assert.equal(list.numberOfItems, list.itemListElement.length);
  for (const item of list.itemListElement) assert.ok(html.includes(`href="${item.url.replace(canonicalBase, '')}"`), 'Structured job URL is visible in SSR HTML');
  console.log(`PASS ${city}: indexable SSR guide, metadata, schema, ${list.numberOfItems} visible jobs`);
}
const second = await page('/jobs/nicosia?page=2');
assert.equal(second.response.status, 200);
assert.ok(second.html.includes(`href="${canonicalBase}/jobs/nicosia?page=2"`));
assert.ok(second.html.includes('Page 2'));
assert.equal(second.schemas.find(s => s['@type'] === 'ItemList').itemListElement[0].position, 21);
const filtered = await page('/jobs/nicosia?employment=FULL_TIME&skill=Python');
assert.equal(filtered.response.status, 200);
assert.ok(filtered.html.includes('content="noindex, follow"'));
assert.ok(filtered.html.includes('name="employment"'));
assert.ok(filtered.html.includes('name="skill"'));
const employmentPage = await page('/jobs/nicosia?employment=FULL_TIME&page=2');
assert.ok(employmentPage.html.includes('/jobs/nicosia?employment=FULL_TIME'));
assert.ok(employmentPage.html.includes('employment=FULL_TIME'));
const invalid = await page('/jobs/nicosia?type=invalid&employment=invalid&level=invalid&salary=NaN');
assert.equal(invalid.response.status, 200);
assert.ok(invalid.html.includes('content="noindex, follow"'));
const missing = await page('/jobs/nicosia?page=9999');
assert.ok(missing.response.status === 404 || missing.html.includes('content="noindex"'));
const sitemap = await page('/sitemap.xml');
for (const city of ['nicosia', 'limassol', 'larnaca', 'paphos']) assert.equal(sitemap.html.split(`<loc>${canonicalBase}/jobs/${city}</loc>`).length - 1, 1);
for (const path of ['/', '/jobs', '/jobs/category/backend']) {
  const result = await page(path);
  assert.equal(result.response.status, 200);
  assert.ok(result.html.includes('aria-label="Tech jobs by city"'));
}
const jobUrl = second.schemas.find(s => s['@type'] === 'ItemList').itemListElement[0].url.replace(canonicalBase, '');
const job = await page(jobUrl);
assert.equal(job.response.status, 200);
const posting = job.schemas.find(s => s['@type'] === 'JobPosting');
assert.ok(posting?.title && posting?.description && posting?.datePosted && posting?.hiringOrganization);
console.log('PASS pagination, filter preservation, invalid inputs, out-of-range page, sitemap, internal links and individual JobPosting');
const summary = await page('/llms.txt');
assert.equal(summary.response.status, 200);
assert.ok(!summary.html.includes('Every listing shows a verified salary'));
assert.ok(summary.html.includes('Pay is shown when disclosed'));
console.log('PASS AI-facing summary matches disclosure policy');
