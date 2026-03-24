// Created by Andy
// API handler for workout completion persistence via Cloudflare KV

const KV_KEY = 'completed-workouts';
const ALLOWED_ORIGINS = [
  'https://traiingplan.com',
  'https://dev.traiingplan.com',
  'http://localhost:8788',
];

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
}

function jsonResponse(data, status, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(request) },
  });
}

function checkAuth(request, env) {
  const apiKey = request.headers.get('X-API-Key');
  return apiKey && apiKey === env.API_KEY;
}

export async function onRequestOptions(context) {
  return new Response(null, { status: 204, headers: corsHeaders(context.request) });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, request);
  }
  const data = await env.TRAINING_PLANT_KV.get(KV_KEY, 'json');
  return jsonResponse(data || {}, 200, request);
}

export async function onRequestPut(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, request);
  }
  const body = await request.json();
  if (!body.date || !body.timestamp) {
    return jsonResponse({ error: 'Missing date or timestamp' }, 400, request);
  }
  const data = (await env.TRAINING_PLANT_KV.get(KV_KEY, 'json')) || {};
  data[body.date] = body.timestamp;
  await env.TRAINING_PLANT_KV.put(KV_KEY, JSON.stringify(data));
  return jsonResponse({ ok: true }, 200, request);
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  if (!checkAuth(request, env)) {
    return jsonResponse({ error: 'Unauthorized' }, 401, request);
  }
  const body = await request.json();
  if (!body.date) {
    return jsonResponse({ error: 'Missing date' }, 400, request);
  }
  const data = (await env.TRAINING_PLANT_KV.get(KV_KEY, 'json')) || {};
  delete data[body.date];
  await env.TRAINING_PLANT_KV.put(KV_KEY, JSON.stringify(data));
  return jsonResponse({ ok: true }, 200, request);
}
