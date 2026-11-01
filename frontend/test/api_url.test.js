import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveApiBase, getApiBaseUrl, API_BASE } from '../src/services/api.js';

test('1. resolveApiBase returns /api in development when VITE_API_URL is unset', () => {
  const result = resolveApiBase(undefined, true);
  assert.equal(result, '/api');

  const emptyResult = resolveApiBase('', true);
  assert.equal(emptyResult, '/api');
});

test('2. resolveApiBase defaults to live Render backend in production when VITE_API_URL is unset', () => {
  const result = resolveApiBase(undefined, false);
  assert.equal(result, 'https://akshroddhara.onrender.com/api');

  const emptyResult = resolveApiBase('', false);
  assert.equal(emptyResult, 'https://akshroddhara.onrender.com/api');
});

test('3. resolveApiBase handles VITE_API_URL without trailing slash and appends /api', () => {
  const result = resolveApiBase('https://akshroddhara.onrender.com', false);
  assert.equal(result, 'https://akshroddhara.onrender.com/api');
});

test('4. resolveApiBase strips trailing slash before ensuring /api suffix', () => {
  const result = resolveApiBase('https://akshroddhara.onrender.com/', false);
  assert.equal(result, 'https://akshroddhara.onrender.com/api');

  const multipleSlashes = resolveApiBase('https://akshroddhara.onrender.com///', false);
  assert.equal(multipleSlashes, 'https://akshroddhara.onrender.com/api');
});

test('5. resolveApiBase preserves existing /api path without duplicating', () => {
  const result = resolveApiBase('https://akshroddhara.onrender.com/api', false);
  assert.equal(result, 'https://akshroddhara.onrender.com/api');

  const trailingWithApi = resolveApiBase('https://akshroddhara.onrender.com/api/', false);
  assert.equal(trailingWithApi, 'https://akshroddhara.onrender.com/api');
});

test('6. resolveApiBase preserves /api root relative endpoint', () => {
  const result = resolveApiBase('/api', true);
  assert.equal(result, '/api');
});

test('7. getApiBaseUrl produces valid non-empty string in Node runtime', () => {
  const url = getApiBaseUrl();
  assert.ok(typeof url === 'string');
  assert.ok(url.length > 0);
  assert.ok(url.endsWith('/api'));
});

test('8. API_BASE is exported and matches getApiBaseUrl()', () => {
  assert.ok(typeof API_BASE === 'string');
  assert.equal(API_BASE, getApiBaseUrl());
});
