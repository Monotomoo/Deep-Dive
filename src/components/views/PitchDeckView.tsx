import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Copy, Pencil, Play,
  Plus, Printer, Trash2, X,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useI18n } from '../../i18n';
import { FUNDING_SOURCES } from '../../lib/seed';
import type {
  AppState, DivingRecord, PitchAudience, PitchCard, PitchCardKind, PitchDeck,
} from '../../types';

/* Pitch Deck · a library of modular pitch CARDS you compose into audience
   DECKS, then Present live or export/send to a specific sponsor, co-producer
   or fund. Many cards bind to live workbook data so the pitch never goes stale. */

const AUDIENCES: { key: PitchAudience; label: string }[] = [
  { key: 'sponsor', label: 'Sponsor' },
  { key: 'coproducer', label: 'Co-production' },
  { key: 'fund', label: 'Public fund' },
  { key: 'broadcaster', label: 'Broadcaster' },
  { key: 'festival', label: 'Festival' },
  { key: 'general', label: 'General' },
];
const AUDIENCE_LABEL: Record<PitchAudience, string> = Object.fromEntries(
  AUDIENCES.map((a) => [a.key, a.label]),
) as Record<PitchAudience, string>;

const KINDS: PitchCardKind[] = [
  'cover', 'logline', 'thesis', 'four', 'records', 'stakes', 'etna', 'visual',
  'arc', 'access', 'team', 'comparables', 'budget', 'festivals', 'schedule',
  'offer', 'contact', 'custom',
];
const KIND_LABEL: Record<PitchCardKind, string> = {
  cover: 'Cover', logline: 'Logline', thesis: 'Thesis', four: 'The Four',
  records: 'Records', stakes: 'Why now', etna: 'Already captured', visual: 'Formal ambition',
  arc: 'The shape', access: 'Access', team: 'Team', comparables: 'Comparables',
  budget: 'Budget', festivals: 'Festivals', schedule: 'Status', offer: 'The offer',
  contact: 'Contact', custom: 'Custom',
};

function makeId(p: string) { return `${p}-${Math.random().toString(36).slice(2, 8)}`; }

function recordValue(r: DivingRecord): string {
  if (r.depthM != null) return `${r.depthM} m`;
  if (r.timeSeconds != null) { const m = Math.floor(r.timeSeconds / 60), s = r.timeSeconds % 60; return `${m}:${String(s).padStart(2, '0')}`; }
  if (r.distanceM != null) return `${r.distanceM} m`;
  return '—';
}

function budgetOf(state: AppState) {
  const sc = state.scenarios[state.activeScenario];
  const cost = Object.values(sc.costs).reduce((a, b) => a + b, 0);
  const fund = Object.values(sc.funding).reduce((a, b) => a + b, 0);
  return { sc, cost, fund, episodes: sc.episodes };
}

/* ---------- markdown export (for pasting into an email) ---------- */

function cardDataText(card: PitchCard, state: AppState, eur: (thousands: number) => string): string[] {
  const out: string[] = [];
  switch (card.kind) {
    case 'four':
      state.four.forEach((f) => out.push(`- ${f.name} — ${f.role}: ${f.arcNote}`));
      break;
    case 'records':
      state.records.filter((r) => r.status === 'standing').slice(0, 5).forEach((r) => {
        const p = state.four.find((f) => f.key === r.personKey);
        out.push(`- ${recordValue(r)} · ${r.discipline} — ${p?.name ?? r.otherPersonName ?? ''}`);
      });
      break;
    case 'budget': {
      const b = budgetOf(state);
      out.push(`- Budget (${state.activeScenario}): ${eur(b.cost)} · secured/targeted ${eur(b.fund)} · feature + ${b.episodes}-part series`);
      break;
    }
    case 'festivals':
      state.festivals.slice(0, 4).forEach((f) => out.push(`- ${f.name} — ${f.category ?? ''}`));
      break;
    case 'schedule': {
      const done = state.shoots.filter((s) => s.status === 'completed').length;
      out.push(`- ${done} of ${state.shoots.length} shoots complete`);
      break;
    }
    case 'contact': {
      const t = state.crew.find((c) => c.id === 'c-tomo');
      if (t) out.push(`- ${t.name} · ${t.role}${t.link ? ` · ${t.link}` : ''}`);
      break;
    }
    default: break;
  }
  return out;
}

function deckToMarkdown(deck: PitchDeck, state: AppState, eur: (thousands: number) => string): string {
  const byId = new Map(state.pitchCards.map((c) => [c.id, c]));
  const lines: string[] = [`# ${deck.name}`];
  if (deck.recipient) lines.push(`**To:** ${deck.recipient}`);
  if (deck.note) lines.push(`> ${deck.note}`);
  lines.push('');
  deck.cardIds.forEach((cid) => {
    const card = byId.get(cid);
    if (!card) return;
    lines.push(`## ${card.title}`);
    if (card.kicker) lines.push(`*${card.kicker}*`);
    if (card.body) lines.push(card.body);
    cardDataText(card, state, eur).forEach((l) => lines.push(l));
    if (card.imageNote) lines.push(`> still · ${card.imageNote}`);
    lines.push('');
  });
  lines.push('—');
  lines.push('Deep Dive · a feature documentary + 3-part series · 2026');
  return lines.join('\n');
}

/* ---------- the card face ---------- */

function CardContent({ card, big }: { card: PitchCard; big: boolean }) {
  const { state } = useApp();
  const { fmtCurrency } = useI18n();
  const eur = (thousands: number) => fmtCurrency(thousands * 1000);
  const bodyCls = big ? 'text-[15px]' : 'text-[12.5px]';
  const body = card.body ? (
    <p className={`prose-body ${bodyCls} text-[color:var(--color-on-paper)] leading-relaxed`}>{card.body}</p>
  ) : null;

  switch (card.kind) {
    case 'four':
      return (
        <div className="space-y-3">
          {body}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {state.four.map((f) => (
              <div key={f.key} className="flex items-baseline gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 translate-y-0.5" style={{ background: f.colorHint ?? '#d96c3d' }} />
                <span className="min-w-0">
                  <span className="display-italic text-[color:var(--color-on-paper)] block leading-tight" style={{ fontSize: big ? 17 : 14 }}>{f.name}</span>
                  <span className="prose-body italic text-[color:var(--color-brass)]" style={{ fontSize: big ? 11 : 10 }}>{f.role}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    case 'records':
      return (
        <div className="space-y-2.5">
          {body}
          <ul className="space-y-1.5">
            {state.records.filter((r) => r.status === 'standing').slice(0, 5).map((r) => {
              const p = state.four.find((f) => f.key === r.personKey);
              return (
                <li key={r.id} className="flex items-baseline gap-3">
                  <span className="display-italic tabular-nums text-[color:var(--color-on-paper)]" style={{ fontSize: big ? 22 : 17, color: p?.colorHint }}>{recordValue(r)}</span>
                  <span className="prose-body text-[color:var(--color-on-paper-muted)]" style={{ fontSize: big ? 12 : 11 }}>{r.discipline} · {p?.name.split(' ')[0] ?? r.otherPersonName}</span>
                </li>
              );
            })}
          </ul>
        </div>
      );
    case 'etna': {
      const s = state.shoots.find((x) => x.key === 'sicily');
      return (
        <div className="space-y-3">
          {s?.wonderfulness && (
            <p className="display-italic leading-snug text-[color:var(--color-on-paper)]" style={{ fontSize: big ? 20 : 15 }}>{s.wonderfulness}</p>
          )}
          {body}
        </div>
      );
    }
    case 'visual':
      return (
        <div className="space-y-2.5">
          {body}
          <ul className="space-y-1.5">
            {state.swings.slice(0, 4).map((sw) => (
              <li key={sw.id} className="prose-body text-[color:var(--color-on-paper)] leading-snug" style={{ fontSize: big ? 13 : 11.5 }}>
                <span className="display-italic text-[color:var(--color-brass-deep)]">{sw.title}</span>
                {sw.whyItMatters && <span className="text-[color:var(--color-on-paper-muted)]"> — {sw.whyItMatters}</span>}
              </li>
            ))}
          </ul>
        </div>
      );
    case 'team': {
      const film = state.crew.filter((c) => !c.role.toLowerCase().includes('talent'));
      const talent = state.crew.filter((c) => c.role.toLowerCase().includes('talent'));
      return (
        <div className="space-y-2.5">
          {body}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[...film, ...talent].map((c) => (
              <div key={c.id} className="prose-body leading-snug" style={{ fontSize: big ? 12 : 11 }}>
                <span className="text-[color:var(--color-on-paper)]">{c.name}</span>
                <span className="italic text-[color:var(--color-brass)]"> · {c.role}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'comparables': {
      const films = state.references.filter((r) => r.type === 'film');
      return (
        <div className="space-y-2.5">
          {body}
          <ul className="space-y-1.5">
            {films.map((r) => (
              <li key={r.id} className="prose-body leading-snug" style={{ fontSize: big ? 12.5 : 11 }}>
                <span className="display-italic text-[color:var(--color-on-paper)]">{r.title}</span>
                {r.director && <span className="italic text-[color:var(--color-on-paper-muted)]"> · {r.director}{r.year ? `, ${r.year}` : ''}</span>}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case 'budget': {
      const b = budgetOf(state);
      const lines = FUNDING_SOURCES.map((s) => ({ label: s.label, amt: b.sc.funding[s.key] ?? 0 })).filter((x) => x.amt > 0);
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <Stat label={`total · ${state.activeScenario}`} value={eur(b.cost)} big={big} />
            <Stat label="secured / targeted" value={eur(b.fund)} big={big} />
            <Stat label="format" value={`feature + ${b.episodes}×`} big={big} />
          </div>
          {body}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {lines.map((l) => (
              <span key={l.label} className="prose-body text-[color:var(--color-on-paper-muted)]" style={{ fontSize: big ? 11.5 : 10.5 }}>
                {l.label} <span className="tabular-nums text-[color:var(--color-on-paper)]">{eur(l.amt)}</span>
              </span>
            ))}
          </div>
        </div>
      );
    }
    case 'festivals':
      return (
        <div className="space-y-2.5">
          {body}
          <ul className="space-y-1">
            {state.festivals.slice(0, 5).map((f) => (
              <li key={f.id} className="flex items-baseline justify-between gap-3 prose-body" style={{ fontSize: big ? 12.5 : 11 }}>
                <span><span className="display-italic text-[color:var(--color-on-paper)]">{f.name}</span> <span className="italic text-[color:var(--color-on-paper-muted)]">· {f.category}</span></span>
                <span className="text-[color:var(--color-brass)] tabular-nums shrink-0">{'●'.repeat(f.fitScore ?? 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'schedule': {
      const sorted = [...state.shoots];
      return (
        <div className="space-y-2.5">
          {body}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {sorted.map((s) => {
              const done = s.status === 'completed';
              return (
                <div key={s.id} className="flex items-baseline gap-2 prose-body" style={{ fontSize: big ? 12 : 11 }}>
                  <span className="shrink-0" style={{ color: done ? 'var(--color-success)' : 'var(--color-on-paper-faint)' }}>{done ? '✓' : '○'}</span>
                  <span className={done ? 'text-[color:var(--color-on-paper)]' : 'text-[color:var(--color-on-paper-muted)]'}>{s.title.split('·')[0].trim()}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case 'contact': {
      const t = state.crew.find((c) => c.id === 'c-tomo');
      return (
        <div className="space-y-2">
          {t && (
            <div>
              <div className="display-italic text-[color:var(--color-on-paper)]" style={{ fontSize: big ? 22 : 17 }}>{t.name}</div>
              <div className="prose-body italic text-[color:var(--color-brass)]" style={{ fontSize: big ? 13 : 11 }}>{t.role}{t.link ? ` · ${t.link}` : ''}</div>
            </div>
          )}
          {body}
        </div>
      );
    }
    default:
      return body;
  }
}

function Stat({ label, value, big }: { label: string; value: string; big: boolean }) {
  return (
    <div>
      <div className="label-caps text-[color:var(--color-brass-deep)]" style={{ fontSize: 9 }}>{label}</div>
      <div className="display-italic text-[color:var(--color-on-paper)] tabular-nums leading-none" style={{ fontSize: big ? 30 : 22 }}>{value}</div>
    </div>
  );
}

function CardFace({ card, variant = 'thumb' }: { card: PitchCard; variant?: 'thumb' | 'full' | 'present' | 'page' }) {
  const accent = card.accent ?? 'var(--color-brass)';
  const big = variant === 'present' || variant === 'page';
  const pad = variant === 'present' ? 'p-10' : variant === 'page' ? 'p-9' : 'p-5';
  return (
    <div
      className={`relative bg-[color:var(--color-paper-light)] h-full w-full flex flex-col ${variant === 'thumb' ? 'rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] overflow-hidden' : ''}`}
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <div className={`${pad} flex-1 flex flex-col`}>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="label-caps" style={{ color: accent, fontSize: big ? 10 : 9 }}>{card.kicker ?? KIND_LABEL[card.kind]}</span>
        </div>
        <h3 className="display-italic text-[color:var(--color-on-paper)] leading-[1.05] mb-3" style={{ fontSize: big ? (variant === 'present' ? 44 : 34) : 21 }}>
          {card.title}
        </h3>
        <div className="flex-1"><CardContent card={card} big={big} /></div>
        {card.imageNote && (
          <div className="mt-4 pt-2.5 border-t-[0.5px] border-[color:var(--color-border-paper)] prose-body italic text-[color:var(--color-on-paper-faint)]" style={{ fontSize: big ? 11 : 9.5 }}>
            ▣ still · {card.imageNote}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- card editor ---------- */

const inputCls = 'w-full bg-white border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] px-2 py-1 text-[13px]';

function CardEditor({ card, onSave, onDelete, onCancel }: {
  card: PitchCard; onSave: (c: PitchCard) => void; onDelete: () => void; onCancel: () => void;
}) {
  const [c, setC] = useState<PitchCard>(card);
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4 no-print" onClick={onCancel}>
      <div className="bg-[color:var(--color-paper-light)] rounded-[4px] max-w-[560px] w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ borderTop: `4px solid ${c.accent ?? 'var(--color-brass)'}` }}>
        <header className="flex items-center justify-between">
          <div className="display-italic text-[22px]">Edit card</div>
          <button type="button" onClick={onCancel}><X size={16} /></button>
        </header>
        <div className="grid grid-cols-2 gap-3">
          <label className="block col-span-2">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">headline</div>
            <input className={inputCls} value={c.title} autoFocus onChange={(e) => setC({ ...c, title: e.target.value })} />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">kicker</div>
            <input className={inputCls} value={c.kicker ?? ''} onChange={(e) => setC({ ...c, kicker: e.target.value || undefined })} />
          </label>
          <label className="block">
            <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">kind (drives live data)</div>
            <select className={inputCls} value={c.kind} onChange={(e) => setC({ ...c, kind: e.target.value as PitchCardKind })}>
              {KINDS.map((k) => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}
            </select>
          </label>
        </div>
        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">body</div>
          <textarea className={`${inputCls} italic`} rows={4} value={c.body ?? ''} onChange={(e) => setC({ ...c, body: e.target.value || undefined })} />
        </label>
        <label className="block">
          <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-1">still / image note</div>
          <input className={inputCls} value={c.imageNote ?? ''} onChange={(e) => setC({ ...c, imageNote: e.target.value || undefined })} />
        </label>
        <label className="flex items-center gap-2">
          <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">accent</span>
          <input type="color" value={c.accent ?? '#c9a961'} onChange={(e) => setC({ ...c, accent: e.target.value })} className="w-8 h-7 rounded" />
          <span className="prose-body text-[11px] text-[color:var(--color-on-paper-muted)]">{c.accent}</span>
        </label>
        <div className="flex justify-between pt-2">
          <button type="button" onClick={onDelete} className="flex items-center gap-1 text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"><Trash2 size={11} /> delete</button>
          <div className="flex gap-2">
            <button type="button" onClick={onCancel} className="px-3 py-1.5 rounded-[3px] text-[12px] text-[color:var(--color-on-paper-muted)]">cancel</button>
            <button type="button" onClick={() => onSave(c)} disabled={!c.title.trim()} className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40">save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- present overlay ---------- */

function PresentOverlay({ cards, onClose }: { cards: PitchCard[]; onClose: () => void }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((p) => Math.max(0, Math.min(cards.length - 1, p + d)));
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      else if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);
  const card = cards[i];
  if (!card) return null;
  return (
    <div className="fixed inset-0 z-[120] no-print flex flex-col items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at center, #0a2b4f 0%, #041531 70%, #000 100%)' }}>
      <button type="button" onClick={onClose} className="absolute top-5 right-6 text-[color:var(--color-paper-light)]/60 hover:text-[color:var(--color-paper-light)]"><X size={22} /></button>
      <div className="w-full max-w-[920px] aspect-[16/10] shadow-[0_20px_80px_rgba(0,0,0,0.5)] rounded-[4px] overflow-hidden">
        <CardFace card={card} variant="present" />
      </div>
      <div className="flex items-center gap-6 mt-6 text-[color:var(--color-paper-light)]">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} className="disabled:opacity-25 hover:text-[color:var(--color-brass)]"><ArrowLeft size={22} /></button>
        <span className="tabular-nums text-[13px] text-[color:var(--color-paper-light)]/70">{i + 1} / {cards.length}</span>
        <button type="button" onClick={() => go(1)} disabled={i === cards.length - 1} className="disabled:opacity-25 hover:text-[color:var(--color-brass)]"><ArrowRight size={22} /></button>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 label-caps text-[9px] text-[color:var(--color-paper-light)]/30">← → to move · esc to close</div>
    </div>
  );
}

/* ---------- export overlay (print / copy) ---------- */

function ExportOverlay({ deck, cards, onClose }: { deck: PitchDeck; cards: PitchCard[]; onClose: () => void }) {
  const { state } = useApp();
  const { fmtCurrency } = useI18n();
  const [copied, setCopied] = useState(false);

  function copyText() {
    const md = deckToMarkdown(deck, state, (thousands) => fmtCurrency(thousands * 1000));
    navigator.clipboard?.writeText(md).then(() => { setCopied(true); window.setTimeout(() => setCopied(false), 1800); }).catch(() => { /* noop */ });
  }

  return (
    <div className="pitch-export fixed inset-0 z-[120] bg-[color:var(--color-paper)] overflow-y-auto">
      {/* toolbar */}
      <div className="no-print sticky top-0 z-10 flex items-center gap-3 px-5 py-3 bg-[color:var(--color-chrome)] text-[color:var(--color-paper-light)]">
        <div className="display-italic text-[16px]">{deck.name}</div>
        <span className="prose-body italic text-[11px] text-[color:var(--color-paper-light)]/60">{deck.cardIds.length} cards</span>
        <div className="flex-1" />
        <button type="button" onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[12px] hover:bg-[color:var(--color-brass-deep)]"><Printer size={13} /> Print / Save PDF</button>
        <button type="button" onClick={copyText} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-paper-light)]/40 text-[12px] hover:bg-[color:var(--color-paper-light)]/10">{copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy as text'}</button>
        <button type="button" onClick={onClose} className="px-2 py-1.5 text-[color:var(--color-paper-light)]/70 hover:text-[color:var(--color-paper-light)]"><X size={16} /></button>
      </div>
      {/* pages */}
      <div className="max-w-[820px] mx-auto py-8 px-5 space-y-8">
        {cards.map((card) => (
          <div key={card.id} className="print-slide bg-[color:var(--color-paper-light)] rounded-[4px] shadow-[0_2px_20px_rgba(14,30,54,0.10)] overflow-hidden min-h-[480px] flex">
            <CardFace card={card} variant="page" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- main ---------- */

export function PitchDeckView() {
  const { state, dispatch } = useApp();
  const { t } = useI18n();
  const [tab, setTab] = useState<'decks' | 'library'>('decks');
  const [selectedDeckId, setSelectedDeckId] = useState<string>(state.pitchDecks[0]?.id ?? '');
  const [editingCard, setEditingCard] = useState<PitchCard | null>(null);
  const [presentCards, setPresentCards] = useState<PitchCard[] | null>(null);
  const [exportDeck, setExportDeck] = useState<PitchDeck | null>(null);
  const [managing, setManaging] = useState(false);

  const cardById = useMemo(() => new Map(state.pitchCards.map((c) => [c.id, c])), [state.pitchCards]);
  const deck = state.pitchDecks.find((d) => d.id === selectedDeckId) ?? state.pitchDecks[0] ?? null;
  const deckCards = useMemo(
    () => (deck ? deck.cardIds.map((id) => cardById.get(id)).filter((c): c is PitchCard => !!c) : []),
    [deck, cardById],
  );

  function saveCard(c: PitchCard) {
    if (state.pitchCards.some((x) => x.id === c.id)) dispatch({ type: 'UPDATE_PITCH_CARD', id: c.id, patch: c });
    else dispatch({ type: 'ADD_PITCH_CARD', card: c });
    setEditingCard(null);
  }
  function newCard() {
    setEditingCard({ id: makeId('pc'), kind: 'custom', title: '', body: '', accent: '#c9a961' });
  }
  function newDeck() {
    const d: PitchDeck = { id: makeId('pd'), name: 'New deck', audience: 'general', cardIds: [], updatedAt: new Date().toISOString() };
    dispatch({ type: 'ADD_PITCH_DECK', deck: d });
    setSelectedDeckId(d.id);
    setTab('decks');
  }
  function patchDeck(patch: Partial<PitchDeck>) {
    if (!deck) return;
    dispatch({ type: 'UPDATE_PITCH_DECK', id: deck.id, patch: { ...patch, updatedAt: new Date().toISOString() } });
  }
  function toggleCardInDeck(cardId: string) {
    if (!deck) return;
    const has = deck.cardIds.includes(cardId);
    patchDeck({ cardIds: has ? deck.cardIds.filter((x) => x !== cardId) : [...deck.cardIds, cardId] });
  }
  function moveCard(idx: number, dir: -1 | 1) {
    if (!deck) return;
    const next = [...deck.cardIds];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    patchDeck({ cardIds: next });
  }

  return (
    <div className="space-y-6 max-w-[1300px]">
      <header className="no-print">
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('pitch-deck.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('pitch-deck.subtitle')}</p>
      </header>

      {/* tabs */}
      <div className="no-print flex rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] overflow-hidden w-fit">
        {(['decks', 'library'] as const).map((k) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`px-4 py-2 font-sans text-[12px] tracking-wide transition-colors ${tab === k ? 'bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)]' : 'text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]'}`}>
            {k === 'decks' ? 'Decks' : 'Card library'}
          </button>
        ))}
      </div>

      {tab === 'decks' && (
        <div className="no-print grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-5">
          {/* deck list */}
          <div className="space-y-1.5">
            {state.pitchDecks.map((d) => {
              const on = d.id === (deck?.id ?? '');
              return (
                <button key={d.id} type="button" onClick={() => setSelectedDeckId(d.id)}
                  className={`w-full text-left rounded-[3px] p-3 border-[0.5px] transition-colors ${on ? 'bg-[color:var(--color-paper-light)] border-[color:var(--color-brass)]' : 'border-[color:var(--color-border-paper)] hover:border-[color:var(--color-brass)]'}`}
                  style={{ borderLeft: `3px solid ${d.accent ?? 'var(--color-brass)'}` }}>
                  <div className="display-italic text-[15px] text-[color:var(--color-on-paper)] leading-tight">{d.name}</div>
                  <div className="prose-body italic text-[10px] text-[color:var(--color-brass)] mt-0.5">{AUDIENCE_LABEL[d.audience]} · {d.cardIds.length} cards</div>
                </button>
              );
            })}
            <button type="button" onClick={newDeck} className="w-full flex items-center justify-center gap-1.5 py-2 rounded-[3px] border-[0.5px] border-dashed border-[color:var(--color-border-paper)] text-[11px] text-[color:var(--color-on-paper-muted)] hover:border-[color:var(--color-brass)] hover:text-[color:var(--color-brass)]"><Plus size={12} /> new deck</button>
          </div>

          {/* deck detail */}
          {deck ? (
            <div className="space-y-4">
              {/* meta + actions */}
              <div className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-3">
                  <input className={inputCls + ' display-italic text-[18px]'} value={deck.name} onChange={(e) => patchDeck({ name: e.target.value })} />
                  <select className={inputCls} value={deck.audience} onChange={(e) => patchDeck({ audience: e.target.value as PitchAudience })}>
                    {AUDIENCES.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
                  </select>
                </div>
                <input className={inputCls} placeholder="recipient — e.g. Nordisk Film & TV Fond" value={deck.recipient ?? ''} onChange={(e) => patchDeck({ recipient: e.target.value || undefined })} />
                <textarea className={`${inputCls} italic`} rows={2} placeholder="cover note — the intro line for the send" value={deck.note ?? ''} onChange={(e) => patchDeck({ note: e.target.value || undefined })} />
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button type="button" onClick={() => deckCards.length && setPresentCards(deckCards)} disabled={!deckCards.length} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[color:var(--color-chrome)] text-[color:var(--color-paper-light)] text-[12px] disabled:opacity-40"><Play size={13} /> Present</button>
                  <button type="button" onClick={() => setExportDeck(deck)} disabled={!deckCards.length} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[12px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)] disabled:opacity-40"><Printer size={13} /> Export / Send</button>
                  <button type="button" onClick={() => setManaging((m) => !m)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] text-[12px] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]"><Plus size={13} /> {managing ? 'Done adding' : 'Add / remove cards'}</button>
                  <div className="flex-1" />
                  <button type="button" onClick={() => { dispatch({ type: 'DELETE_PITCH_DECK', id: deck.id }); setSelectedDeckId(state.pitchDecks.find((d) => d.id !== deck.id)?.id ?? ''); }} className="text-[11px] text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-coral)]"><Trash2 size={12} /></button>
                </div>
              </div>

              {/* card picker */}
              {managing && (
                <div className="bg-[color:var(--color-paper-card)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
                  <div className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mb-2">tap to add / remove · cards suited to {AUDIENCE_LABEL[deck.audience].toLowerCase()} are marked ★</div>
                  <div className="flex flex-wrap gap-1.5">
                    {state.pitchCards.map((c) => {
                      const inDeck = deck.cardIds.includes(c.id);
                      const suits = c.audiences?.includes(deck.audience);
                      return (
                        <button key={c.id} type="button" onClick={() => toggleCardInDeck(c.id)}
                          className={`px-2 py-1 rounded-[2px] text-[11px] border-[0.5px] transition-all ${inDeck ? 'text-[color:var(--color-paper-light)] border-transparent' : 'text-[color:var(--color-on-paper-muted)] border-[color:var(--color-border-paper)] hover:text-[color:var(--color-on-paper)]'}`}
                          style={inDeck ? { background: c.accent ?? 'var(--color-brass)' } : {}}>
                          {suits && <span className="mr-0.5">★</span>}{c.title.length > 26 ? c.title.slice(0, 24) + '…' : c.title}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* the deck's cards, in order */}
              {deckCards.length === 0 ? (
                <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-faint)]">No cards yet — “Add / remove cards” to build this deck.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {deckCards.map((card, idx) => (
                    <div key={card.id} className="relative group">
                      <div className="h-full min-h-[200px]"><CardFace card={card} variant="thumb" /></div>
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconBtn title="up" onClick={() => moveCard(idx, -1)}><ChevronUp size={12} /></IconBtn>
                        <IconBtn title="down" onClick={() => moveCard(idx, 1)}><ChevronDown size={12} /></IconBtn>
                        <IconBtn title="edit" onClick={() => setEditingCard(card)}><Pencil size={11} /></IconBtn>
                        <IconBtn title="remove from deck" onClick={() => toggleCardInDeck(card.id)}><X size={12} /></IconBtn>
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 tabular-nums text-[9px] text-[color:var(--color-on-paper-faint)] bg-[color:var(--color-paper-light)]/80 rounded px-1">{idx + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="prose-body italic text-[13px] text-[color:var(--color-on-paper-faint)]">No decks yet — make one to start.</p>
          )}
        </div>
      )}

      {tab === 'library' && (
        <div className="no-print space-y-3">
          <div className="flex justify-end">
            <button type="button" onClick={newCard} className="flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-brass)] text-[color:var(--color-brass)] text-[12px] hover:bg-[color:var(--color-brass)] hover:text-[color:var(--color-paper-light)]"><Plus size={13} /> new card</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {state.pitchCards.map((card) => (
              <div key={card.id} className="relative group cursor-pointer" onClick={() => setEditingCard(card)}>
                <div className="h-full min-h-[210px]"><CardFace card={card} variant="thumb" /></div>
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconBtn title="edit"><Pencil size={11} /></IconBtn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {editingCard && (
        <CardEditor
          card={editingCard}
          onSave={saveCard}
          onDelete={() => { dispatch({ type: 'DELETE_PITCH_CARD', id: editingCard.id }); setEditingCard(null); }}
          onCancel={() => setEditingCard(null)}
        />
      )}
      {presentCards && <PresentOverlay cards={presentCards} onClose={() => setPresentCards(null)} />}
      {exportDeck && <ExportOverlay deck={exportDeck} cards={exportDeck.cardIds.map((id) => cardById.get(id)).filter((c): c is PitchCard => !!c)} onClose={() => setExportDeck(null)} />}
    </div>
  );
}

function IconBtn({ children, onClick, title }: { children: ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button type="button" title={title} onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="w-6 h-6 flex items-center justify-center rounded-[2px] bg-[color:var(--color-chrome)]/85 text-[color:var(--color-paper-light)] hover:bg-[color:var(--color-chrome)]">
      {children}
    </button>
  );
}
