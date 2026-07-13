import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { markSplashSeen } from '../../lib/storage';

/* A short, simple open — "Deep Dive" and the epigraph fade up on deep water,
   hold a beat, then fade away into the app. ~2 seconds, auto-enters, no click
   required (a click just skips the last half-second). */

interface Props {
  onComplete: () => void;
}

type Phase = 'in' | 'hold' | 'out' | 'done';

export function Splash({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('in');

  useEffect(() => {
    const advance = (n: Phase, ms: number) => {
      const id = window.setTimeout(() => setPhase(n), ms);
      return () => window.clearTimeout(id);
    };
    if (phase === 'in')   return advance('hold', 600);
    if (phase === 'hold') return advance('out', 850);
    if (phase === 'out')  return advance('done', 500);
    if (phase === 'done') {
      markSplashSeen();
      const id = window.setTimeout(onComplete, 60);
      return () => window.clearTimeout(id);
    }
    // onComplete is stable (useCallback in parent); intentionally omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const visible = phase === 'in' || phase === 'hold';

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden cursor-pointer"
          style={{ background: 'radial-gradient(ellipse at center, #0a2b4f 0%, #041531 62%, #000 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'out' ? 0 : 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setPhase('out')}
        >
          <motion.div
            className="text-center px-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -6 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="display-italic text-[clamp(64px,10vw,116px)] text-[color:var(--color-paper)] leading-[0.95]">
              Deep&nbsp;Dive
            </h1>
            <div className="prose-body italic text-[13px] md:text-[15px] text-[color:var(--color-brass)] mt-5 tracking-wide">
              one person holds another in the world
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
