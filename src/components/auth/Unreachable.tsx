import { RefreshCw, WifiOff } from 'lucide-react';

/* Shown instead of the sign-in gate when the crew server cannot be reached at
   all. Before this existed, a paused Supabase project meant an endless blue
   "Deep Dive" screen: the stored session kept trying to refresh itself against
   a hostname that no longer resolved, and nothing ever said so. */

interface Props {
  /* true = the server exists but did not answer in time; false = its address
     does not resolve, or every request fails outright. */
  slow: boolean;
  onOffline: () => void;
}

export function Unreachable({ slow, onOffline }: Props) {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(ellipse at center, #0a2b4f 0%, #041531 70%, #000 100%)' }}
    >
      <div className="w-full max-w-[460px] text-center">
        <h1 className="display-italic text-[clamp(48px,9vw,84px)] text-[color:var(--color-paper)] leading-[0.95]">Deep&nbsp;Dive</h1>
        <div className="prose-body italic text-[13px] text-[color:var(--color-brass)] mt-3 mb-8">one person holds another in the world</div>

        <div className="bg-[color:var(--color-chrome)]/70 rounded-[4px] p-6 text-left">
          <div className="flex items-center gap-2 text-[color:var(--color-coral)] mb-2">
            <WifiOff size={16} />
            <span className="prose-body text-[15px]">The crew server isn’t answering.</span>
          </div>
          <p className="prose-body text-[13px] leading-snug text-[color:var(--color-paper-light)]/85">
            {slow
              ? 'It has not answered in eight seconds. It may be paused, or something on this network is blocking it.'
              : 'Its address does not resolve. On Supabase’s free plan a project is paused after a week without activity, and this is what that looks like from outside.'}
          </p>
          <p className="prose-body text-[13px] leading-snug text-[color:var(--color-paper-light)]/85 mt-2">
            Whoever runs the project restores it from the Supabase dashboard — one click, a few minutes — then try again here.
          </p>
          <div className="flex gap-2 mt-5">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[13px] tracking-wide hover:bg-[color:var(--color-brass-deep)] transition-colors"
            >
              <RefreshCw size={13} /> try again
            </button>
            <button
              type="button"
              onClick={onOffline}
              className="flex-1 py-2.5 rounded-[3px] border-[0.5px] border-[color:var(--color-paper-light)]/30 text-[color:var(--color-paper-light)]/80 text-[13px] tracking-wide hover:border-[color:var(--color-paper-light)]/60 transition-colors"
            >
              work on this browser’s copy
            </button>
          </div>
          <p className="prose-body italic text-[11px] leading-snug text-[color:var(--color-paper-light)]/45 mt-4">
            Offline, nothing you change reaches the crew. It stays on this browser and is sent up the next time you sign in, as long as nobody edited the crew copy in between.
          </p>
        </div>
      </div>
    </div>
  );
}

/* A bar across the top while working offline, so the state is never a secret. */
export function OfflineBar() {
  return (
    <div
      className="no-print fixed top-0 inset-x-0 z-[250] px-5 md:px-8 py-2 flex items-center justify-center gap-2.5 text-[color:var(--color-paper-light)]"
      style={{ background: 'var(--color-coral)' }}
    >
      <WifiOff size={13} className="shrink-0" />
      <span className="prose-body text-[12.5px] leading-snug">
        <b>Offline.</b> This is your browser’s copy — the crew server is unreachable and nothing here is saved to the crew.
      </span>
      <button type="button" onClick={() => window.location.reload()} className="ml-2 text-[12px] underline underline-offset-2 hover:opacity-80">
        try the server again
      </button>
    </div>
  );
}
