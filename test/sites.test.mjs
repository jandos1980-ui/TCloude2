import test from 'node:test';
import assert from 'node:assert/strict';
import { sites } from '../src/content.js';

const findSite = address => sites.find(site => site.address === address);

test('Almaty project cards expose their own image galleries', () => {
  const alatau = findSite('СЭЗ «ПИТ «Алатау»');
  const pioneerEdge = findSite('г.Алматы, пр.Достык 134');

  assert.ok(alatau?.project, 'СЭЗ «ПИТ «Алатау» should have project details');
  assert.equal(alatau.project.images.length, 4);
  assert.ok(alatau.project.images.every(image => image.caption));

  assert.ok(pioneerEdge?.project, 'Pioneer Edge should have project details');
  assert.equal(pioneerEdge.project.images.length, 2);
  assert.ok(pioneerEdge.project.images.every(image => image.caption));
});
