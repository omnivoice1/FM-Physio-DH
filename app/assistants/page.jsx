import { Stub } from '@/components/ui';
export const dynamic = 'force-dynamic';
export default function Assistants() {
  return <Stub title="Voice assistants" note="Per-assistant cost, call volume, booked count and outcomes come from the Retell API (and Vapi when it goes live). The Retell integration is verified and ready — this page wires to it next, reading cost per agent and booking outcomes." />;
}
