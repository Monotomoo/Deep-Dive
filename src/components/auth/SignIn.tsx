import { useState, type FormEvent } from 'react';
import { Mail } from 'lucide-react';
import { signInWithEmail } from '../../lib/cloud';

/* Sign-in gate — only shown when the cloud is configured and no one is signed
   in. Passwordless: we email a one-time magic link. */

export function SignIn() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const addr = email.trim();
    if (!addr || busy) return;
    setBusy(true); setErr(null);
    const { error } = await signInWithEmail(addr);
    setBusy(false);
    if (error) {
      /* Invite-only: Supabase rejects un-invited emails with a signups-disabled
         error. Translate that into something a crew member understands. */
      const invite = /signup|not allowed|disabled/i.test(error);
      setErr(invite ? "That email isn't on the crew list yet — ask to be added." : error);
    } else setSent(true);
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #0a2b4f 0%, #041531 70%, #000 100%)' }}
    >
      <div className="w-full max-w-[400px] text-center">
        <h1 className="display-italic text-[clamp(48px,9vw,84px)] text-[color:var(--color-paper)] leading-[0.95]">Deep&nbsp;Dive</h1>
        <div className="prose-body italic text-[13px] text-[color:var(--color-brass)] mt-3 mb-8">one person holds another in the world</div>

        {sent ? (
          <div className="bg-[color:var(--color-chrome)]/70 rounded-[4px] p-6">
            <Mail size={22} className="text-[color:var(--color-brass)] mx-auto mb-3" />
            <div className="prose-body text-[14px] text-[color:var(--color-paper-light)] leading-snug">
              A sign-in link is on its way to <span className="italic text-[color:var(--color-brass)]">{email}</span>. Open it on this device.
            </div>
            <button type="button" onClick={() => setSent(false)} className="mt-4 text-[11px] text-[color:var(--color-paper-light)]/50 hover:text-[color:var(--color-paper-light)]">
              use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              autoFocus
              className="w-full bg-[color:var(--color-paper-light)] rounded-[3px] px-4 py-3 text-[15px] text-center outline-none"
            />
            <button
              type="submit"
              disabled={busy || !email.trim()}
              className="w-full py-3 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[13px] tracking-wide disabled:opacity-40 hover:bg-[color:var(--color-brass-deep)] transition-colors"
            >
              {busy ? 'sending…' : 'Send me a sign-in link'}
            </button>
            {err && <div className="prose-body text-[12px] text-[color:var(--color-coral)]">{err}</div>}
            <div className="prose-body italic text-[11px] text-[color:var(--color-paper-light)]/40 pt-2">Invite-only · no password — we email you a one-time link.</div>
          </form>
        )}
      </div>
    </div>
  );
}
