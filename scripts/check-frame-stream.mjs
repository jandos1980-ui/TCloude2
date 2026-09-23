import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
  const page = await browser.newPage({viewport: {width: 1440, height: 900}});
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.route(/\/media\/energy-sequence\//, async route => {
    const response = await route.fetch();
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.fulfill({response});
  });
  await page.goto(process.env.TAU_TEST_URL || 'http://127.0.0.1:5173/');
  await page.waitForFunction(() => performance.getEntriesByType('resource').some(entry => entry.name.endsWith('.bin')));
  await page.evaluate(() => {
    window.drawnFrames = new Set();
    const context = document.querySelector('#film').getContext('2d');
    const draw = context.drawImage.bind(context);
    context.drawImage = (...args) => {drawnFrames.add(args[0]); return draw(...args);};
  });
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1000);
  const uniqueFrames = await page.evaluate(() => drawnFrames.size);
  assert(uniqueFrames > 30, `Animation stalled: only ${uniqueFrames} frames`);
  await page.mouse.wheel(0, -5000);
  // Lenis settles over animation frames; wait for the result, not a fixed delay.
  await page.waitForFunction(() => scrollY < 3, null, {timeout: 5000});
  assert(requests.filter(url => /\d{4}\.webp/.test(url)).length <= 12, 'Too many priority frame requests');
  assert.equal(requests.filter(url => url.endsWith('.bin')).length, 1);
  assert.deepEqual(errors, []);
  await page.unrouteAll({behavior: 'wait'});
  await page.close();

  const fallback = await browser.newPage();
  let individualFrames = 0;
  fallback.on('request', request => {if (/\d{4}\.webp/.test(request.url())) individualFrames++;});
  await fallback.route('**/*.bin', route => route.abort());
  await fallback.goto(process.env.TAU_TEST_URL || 'http://127.0.0.1:5173/');
  // The opening scene is ambient video; the generator scene uses the frame stream.
  await fallback.locator('.desktop-story-dots [data-dot="1"]').click();
  await fallback.waitForFunction(() => document.querySelector('.stage').dataset.scene === '1' && getComputedStyle(document.querySelector('#film')).opacity === '1');
  assert(individualFrames > 0, 'Interrupted stream did not fall back to individual frames');
  console.log(JSON.stringify({uniqueFrames, streamRequests: 1, reverse: true, fallback: true, errors}));
} finally {
  await browser.close();
}
