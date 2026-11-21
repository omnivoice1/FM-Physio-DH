# FM Physio — OmniVoice Dashboard

Next.js + Supabase dashboard. Reads live data from your Supabase project and
serves call recordings/transcripts from the `fm-physio-private` storage bucket.

## Run it locally (2 commands)

You need Node 18.18+ (ideally Node 20 or 22) installed.

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** in your browser.

- `.env.local` is already filled in with your Supabase URL + service key.
- The service key is secret — don't commit this folder to a public repo or share the zip.

## What's live

- Overview, Task board, Cancellations & DNAs, AI system, Team — all read live Supabase data.
- Patient record (click any patient, or open `/?patient=<id>`): full phone, call
  recordings (real audio + transcript from private storage), activity timeline.
- Enquiries, Payments, Patient progress, Assistants — navigable, waiting on their data pipelines.

## Notes

- Appointments are seed-dated into 2027, so some timeline items read "Today".
- Task resolve / on-time-late timer is pending the task write-back decision.
- Before deploying to Vercel, pin a security-patched Next version.
