import { Stub } from '@/components/ui';
export const dynamic = 'force-dynamic';
export default function Progress() {
  return <Stub title="Patient progress" note="Check-in responses, pain scores and NPS aren't stored yet (the messages table is empty and there's no scores structure). This page — day-after/after-session-3/reassessment check-ins and the review-request flow — wires up once those replies start landing in Supabase." />;
}
