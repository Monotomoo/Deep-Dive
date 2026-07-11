import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { DivingRecord } from '../../types';

export function RecordsView() {
  const { state } = useApp();
  const t = useT();
  return (
    <div className="space-y-8 max-w-[1200px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('records.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('records.subtitle')}</p>
      </header>

      <div className="overflow-x-auto">
        <table className="text-[12px] w-full">
          <thead>
            <tr className="border-b-[0.5px] border-[color:var(--color-border-paper)] text-left">
              <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">person</th>
              <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('records.discipline')}</th>
              <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('records.depth')}/{t('records.time')}</th>
              <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">{t('records.scope')}</th>
              <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">event</th>
              <th className="p-2 label-caps text-[9px] text-[color:var(--color-brass-deep)]">status</th>
            </tr>
          </thead>
          <tbody>
            {state.records.map((r) => {
              const person = state.four.find((f) => f.key === r.personKey);
              return (
                <tr key={r.id} className="border-b-[0.5px] border-[color:var(--color-border-paper)]/50">
                  <td className="p-2 display-italic text-[16px] text-[color:var(--color-on-paper)]">{person?.name ?? r.otherPersonName ?? '—'}</td>
                  <td className="p-2 tabular-nums">{r.discipline}</td>
                  <td className="p-2 tabular-nums text-[color:var(--color-brass-deep)]">{formatMeasure(r)}</td>
                  <td className="p-2 tabular-nums">{r.scope}</td>
                  <td className="p-2 prose-body italic text-[color:var(--color-on-paper-muted)]">{r.event ?? '—'}</td>
                  <td className={`p-2 label-caps text-[9px] ${r.status === 'standing' ? 'text-[color:var(--color-success)]' : 'text-[color:var(--color-on-paper-faint)]'}`}>{r.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatMeasure(r: DivingRecord): string {
  if (r.depthM) return `${r.depthM} m`;
  if (r.timeSeconds) {
    const m = Math.floor(r.timeSeconds / 60);
    const s = r.timeSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  if (r.distanceM) return `${r.distanceM} m`;
  return '—';
}
