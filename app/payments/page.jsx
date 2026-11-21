import { Stub } from '@/components/ui';
export const dynamic = 'force-dynamic';
export default function Payments() {
  return <Stub title="Payments check" note="No financial data is written to Supabase yet — appointment charge outcomes are null and there's no price list, package or deposit data. This page (expected vs taken, part-paid packages, Stripe-vs-PracticeHub reconciliation) builds automatically once the payments pipeline starts writing." />;
}
