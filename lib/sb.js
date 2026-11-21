// Server-only Supabase REST + Storage helpers. Never import into client components.
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
const BUCKET = process.env.SUPABASE_PRIVATE_BUCKET || 'fm-physio-private';

const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// GET rows from a table/view with a PostgREST query string.
export async function sb(path, { revalidate = 30 } = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { ...H, Accept: 'application/json' },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status} on ${path}: ${await res.text()}`);
  return res.json();
}

// Exact count via content-range header.
export async function sbCount(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { ...H, Prefer: 'count=exact', Range: '0-0' },
    next: { revalidate: 30 },
  });
  const cr = res.headers.get('content-range') || '0-0/0';
  return Number(cr.split('/')[1] || 0);
}

// Create a signed URL to a private storage object (valid `expires` seconds).
export async function signedUrl(objectPath, expires = 3600) {
  const res = await fetch(`${URL}/storage/v1/object/sign/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify({ expiresIn: expires }),
    cache: 'no-store',
  });
  if (!res.ok) return null;
  const j = await res.json();
  return j.signedURL ? `${URL}/storage/v1${j.signedURL}` : null;
}

// Read a private text object (e.g. transcript) as a string.
export async function readTextObject(objectPath) {
  const url = await signedUrl(objectPath, 120);
  if (!url) return null;
  const res = await fetch(url, { cache: 'no-store' });
  return res.ok ? res.text() : null;
}

// Turn a `private://recordings/retell/<id>.wav` reference into the storage object path.
export function refToPath(ref) {
  if (!ref) return null;
  return ref.replace(/^private:\/\//, '');
}

export { URL as SB_URL, BUCKET };
