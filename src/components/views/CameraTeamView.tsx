import { useState } from 'react';
import { Camera as CamIcon, Aperture, Mic, Lightbulb, User } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useT } from '../../i18n';
import type { StringKey } from '../../i18n';
import type { Camera, KitOwnership, Lens, Light, Microphone } from '../../types';

type Tab = 'all' | 'bags' | 'shoot';

export function CameraTeamView() {
  const { state } = useApp();
  const t = useT();
  const [tab, setTab] = useState<Tab>('all');

  const operators = state.crew.filter((c) => c.role.toLowerCase().includes('camera') || c.role.toLowerCase().includes('director'));

  return (
    <div className="space-y-6 max-w-[1400px]">
      <header>
        <h2 className="display-italic text-[36px] text-[color:var(--color-on-paper)] leading-tight">{t('camera-team.title')}</h2>
        <p className="prose-body italic text-[14px] text-[color:var(--color-on-paper-muted)] mt-0.5">{t('camera-team.subtitle')}</p>
      </header>

      {/* Tab strip */}
      <div className="flex items-baseline gap-2 border-b-[0.5px] border-[color:var(--color-border-paper)]">
        {(['all','bags','shoot'] as Tab[]).map((tk) => (
          <button key={tk} onClick={() => setTab(tk)}
            className={`px-3 py-2 label-caps text-[10px] transition-colors ${tab === tk ? 'text-[color:var(--color-brass)] border-b-2 border-[color:var(--color-brass)] -mb-[0.5px]' : 'text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper-muted)]'}`}
          >
            {t(`camera-team.tab.${tk}` as StringKey)}
          </button>
        ))}
      </div>

      {tab === 'all' && (
        <>
          <InventorySection title={t('camera-team.cameras')} icon={<CamIcon size={16} />} count={state.cameras.length}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.cameras.map((c) => (<CameraCard key={c.id} camera={c} />))}
            </div>
          </InventorySection>
          <InventorySection title={t('camera-team.lenses')} icon={<Aperture size={16} />} count={state.lenses.length}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.lenses.map((l) => (<LensCard key={l.id} lens={l} />))}
            </div>
          </InventorySection>
          <InventorySection title={t('camera-team.mics')} icon={<Mic size={16} />} count={state.microphones.length}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.microphones.map((m) => (<MicCard key={m.id} mic={m} />))}
            </div>
          </InventorySection>
          <InventorySection title={t('camera-team.lights')} icon={<Lightbulb size={16} />} count={state.lights.length}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {state.lights.map((l) => (<LightCard key={l.id} light={l} />))}
            </div>
          </InventorySection>
        </>
      )}

      {tab === 'bags' && (
        <div className="space-y-6">
          {operators.map((op) => {
            const opCams = state.cameras.filter((c) => c.operatorId === op.id);
            const opLenses = state.lenses.filter((l) => l.operatorId === op.id);
            const opMics = state.microphones.filter((m) => m.operatorId === op.id);
            const opLights = state.lights.filter((li) => li.operatorId === op.id);
            const totalItems = opCams.length + opLenses.length + opMics.length + opLights.length;
            return (
              <article key={op.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-5">
                <header className="flex items-center justify-between mb-4 pb-3 border-b-[0.5px] border-[color:var(--color-border-paper)]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[color:var(--color-brass)]/20 flex items-center justify-center">
                      <User size={18} className="text-[color:var(--color-brass-deep)]" />
                    </div>
                    <div>
                      <div className="display-italic text-[22px] text-[color:var(--color-on-paper)]">{op.name}</div>
                      <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{op.role}</div>
                    </div>
                  </div>
                  <div className="tabular-nums text-[12px] text-[color:var(--color-on-paper-muted)]">{totalItems} items in bag</div>
                </header>
                {totalItems === 0 && <div className="prose-body italic text-[color:var(--color-on-paper-faint)]">No items assigned yet.</div>}
                {opCams.length > 0 && (<KitBagList title={t('camera-team.cameras')} icon={<CamIcon size={12} />}>{opCams.map((c) => (<div key={c.id} className="text-[12px]">{c.brand} {c.model} <span className="text-[color:var(--color-on-paper-faint)]">· {c.kind}</span></div>))}</KitBagList>)}
                {opLenses.length > 0 && (<KitBagList title={t('camera-team.lenses')} icon={<Aperture size={12} />}>{opLenses.map((l) => (<div key={l.id} className="text-[12px]">{l.brand} {l.focal} {l.maxAperture} <span className="text-[color:var(--color-on-paper-faint)]">· {l.mount}</span></div>))}</KitBagList>)}
                {opMics.length > 0 && (<KitBagList title={t('camera-team.mics')} icon={<Mic size={12} />}>{opMics.map((m) => (<div key={m.id} className="text-[12px]">{m.brand} {m.model} <span className="text-[color:var(--color-on-paper-faint)]">· {m.type}</span></div>))}</KitBagList>)}
                {opLights.length > 0 && (<KitBagList title={t('camera-team.lights')} icon={<Lightbulb size={12} />}>{opLights.map((li) => (<div key={li.id} className="text-[12px]">{li.brand} {li.model}{li.watts && ` · ${li.watts}W`}</div>))}</KitBagList>)}
              </article>
            );
          })}
        </div>
      )}

      {tab === 'shoot' && (
        <div className="space-y-4">
          {state.shoots.map((s) => {
            const shootCams = state.cameras.filter((c) => c.assignedShootIds?.includes(s.id));
            const shootLenses = state.lenses.filter((l) => l.assignedShootIds?.includes(s.id));
            const shootMics = state.microphones.filter((m) => m.assignedShootIds?.includes(s.id));
            const shootLights = state.lights.filter((li) => li.assignedShootIds?.includes(s.id));
            const total = shootCams.length + shootLenses.length + shootMics.length + shootLights.length;
            return (
              <article key={s.id} className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-4">
                <div className="flex items-baseline justify-between mb-2">
                  <div className="display-italic text-[18px] text-[color:var(--color-on-paper)]">{s.title}</div>
                  <div className="tabular-nums text-[11px] text-[color:var(--color-on-paper-muted)]">{total} items assigned</div>
                </div>
                {total === 0 && <div className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)]">Nothing assigned to this shoot yet.</div>}
                {shootCams.length > 0 && <div className="prose-body text-[12px] text-[color:var(--color-on-paper)]"><span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mr-2">CAMERAS</span>{shootCams.map((c) => `${c.brand} ${c.model}`).join(' · ')}</div>}
                {shootLenses.length > 0 && <div className="prose-body text-[12px] text-[color:var(--color-on-paper)]"><span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mr-2">LENSES</span>{shootLenses.map((l) => `${l.focal} ${l.maxAperture}`).join(' · ')}</div>}
                {shootMics.length > 0 && <div className="prose-body text-[12px] text-[color:var(--color-on-paper)]"><span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mr-2">MICS</span>{shootMics.map((m) => `${m.brand} ${m.model}`).join(' · ')}</div>}
                {shootLights.length > 0 && <div className="prose-body text-[12px] text-[color:var(--color-on-paper)]"><span className="label-caps text-[9px] text-[color:var(--color-brass-deep)] mr-2">LIGHTS</span>{shootLights.map((li) => `${li.brand} ${li.model}`).join(' · ')}</div>}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InventorySection({ title, icon, count, children }: { title: string; icon: React.ReactNode; count: number; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <header className="flex items-center gap-2 mb-3 pb-2 border-b-[0.5px] border-[color:var(--color-border-paper)]">
        <span className="text-[color:var(--color-brass-deep)]">{icon}</span>
        <h3 className="label-caps text-[color:var(--color-brass)]">{title}</h3>
        <span className="tabular-nums text-[11px] text-[color:var(--color-on-paper-muted)]">{count}</span>
      </header>
      {children}
    </section>
  );
}

function KitBagList({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[color:var(--color-brass-deep)]">{icon}</span>
        <span className="label-caps text-[9px] text-[color:var(--color-brass-deep)]">{title}</span>
      </div>
      <div className="ml-4 space-y-0.5 text-[color:var(--color-on-paper)]">{children}</div>
    </div>
  );
}

function OwnershipPill({ v }: { v: KitOwnership }) {
  const cls = v === 'owned' ? 'text-[color:var(--color-success)]' : v === 'rented' ? 'text-[color:var(--color-brass)]' : 'text-[color:var(--color-on-paper-muted)]';
  return <span className={`label-caps text-[9px] ${cls}`}>{v}</span>;
}

function CameraCard({ camera }: { camera: Camera }) {
  const { state } = useApp();
  const t = useT();
  const op = state.crew.find((c) => c.id === camera.operatorId);
  return (
    <article className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{camera.brand} {camera.model}</div>
        <OwnershipPill v={camera.ownership} />
      </div>
      <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">
        {camera.kind}{camera.kind === 'uw-rig' && camera.underwaterDepthM && ` · ${camera.underwaterDepthM}m`}
        {camera.sensor && ` · ${camera.sensor}`}
      </div>
      {(camera.maxResolution || camera.maxFrameRate) && (
        <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)]">
          {camera.maxResolution}{camera.maxResolution && camera.maxFrameRate && ' · '}{camera.maxFrameRate}
        </div>
      )}
      {op && <div className="mt-2 text-[11px] text-[color:var(--color-on-paper-muted)]">→ {op.name}</div>}
      {!op && <div className="mt-2 text-[11px] text-[color:var(--color-on-paper-faint)]">{t('camera-team.no.operator')}</div>}
      {camera.notes && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">{camera.notes}</div>}
    </article>
  );
}

function LensCard({ lens }: { lens: Lens }) {
  const { state } = useApp();
  const op = state.crew.find((c) => c.id === lens.operatorId);
  return (
    <article className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{lens.brand} {lens.focal}</div>
        <OwnershipPill v={lens.ownership} />
      </div>
      <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{lens.maxAperture} · {lens.mount} · {lens.type}</div>
      {lens.characterNotes && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">{lens.characterNotes}</div>}
      {op && <div className="mt-2 text-[11px] text-[color:var(--color-on-paper-muted)]">→ {op.name}</div>}
    </article>
  );
}

function MicCard({ mic }: { mic: Microphone }) {
  return (
    <article className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{mic.brand} {mic.model}</div>
        <OwnershipPill v={mic.ownership} />
      </div>
      <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{mic.type}{mic.channels && ` · ${mic.channels}ch`}</div>
      {mic.notes && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">{mic.notes}</div>}
    </article>
  );
}

function LightCard({ light }: { light: Light }) {
  return (
    <article className="bg-[color:var(--color-paper-light)] border-[0.5px] border-[color:var(--color-border-paper)] rounded-[3px] p-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="display-italic text-[16px] text-[color:var(--color-on-paper)]">{light.brand} {light.model}</div>
        <OwnershipPill v={light.ownership} />
      </div>
      <div className="prose-body italic text-[11px] text-[color:var(--color-brass-deep)]">{light.type}{light.watts && ` · ${light.watts}W`}{light.colorTempK && ` · ${light.colorTempK}`}</div>
      {light.notes && <div className="prose-body italic text-[11px] text-[color:var(--color-on-paper-muted)] mt-2 leading-snug">{light.notes}</div>}
    </article>
  );
}
