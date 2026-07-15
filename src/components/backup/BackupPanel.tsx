import { useEffect, useRef, useState } from 'react';
import { Cloud, Download, HardDrive, Trash2, Upload, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { exportJson, readFile, summarize, type BackupSummary } from '../../lib/backup';
import {
  deleteLocalSnapshot, listLocalSnapshots, restoreLocalSnapshot, saveLocalSnapshot,
  type LocalSnapshot,
} from '../../lib/storage';
import {
  deleteCloudSnapshot, listCloudSnapshots, restoreCloudSnapshot, saveCloudSnapshot,
  type CloudSnapshot,
} from '../../lib/cloud';
import type { AppState } from '../../types';

/* Backup — the least glamorous panel in the app and the one that saves it.

   Local snapshots are instant and free but live in this browser only. Cloud
   snapshots are the ones that matter: the shared crew doc is last-write-wins,
   so without a restore point one bad overwrite is unrecoverable. */

function n(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

function census(s: BackupSummary): string {
  return [
    n(s.shoots, 'shoot'), n(s.shootDays, 'day'), n(s.interviews, 'interview'),
    n(s.threads, 'thread'), n(s.notes, 'note'),
  ].join(' · ');
}

function when(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

type Pending = { state: AppState; summary: BackupSummary; from: string };

export function BackupPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, dispatch, cloudEnabled, session } = useApp();
  const [local, setLocal] = useState<LocalSnapshot[]>([]);
  const [remote, setRemote] = useState<CloudSnapshot[]>([]);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const signedIn = cloudEnabled && !!session;

  useEffect(() => {
    if (!open) return;
    setLocal(listLocalSnapshots());
    setMsg(null); setErr(null); setPending(null);
    if (signedIn) listCloudSnapshots().then(setRemote);
  }, [open, signedIn]);

  if (!open) return null;

  function flash(m: string) { setErr(null); setMsg(m); window.setTimeout(() => setMsg(null), 3500); }

  function doExport() {
    flash(`Downloaded ${exportJson(state)}`);
  }

  async function onFile(file: File) {
    const res = await readFile(file);
    if (!res.ok) { setMsg(null); setErr(res.error); return; }
    setErr(null);
    setPending({ state: res.state, summary: res.summary, from: file.name });
  }

  function confirmImport() {
    if (!pending) return;
    dispatch({ type: 'HYDRATE', state: pending.state });
    setPending(null);
    flash('Imported. Undo (⌘Z) still works if that was wrong.');
  }

  function takeLocal() {
    const snap = saveLocalSnapshot(name || `before ${new Date().toLocaleTimeString()}`, state);
    if (!snap) { setErr("Couldn't save — this browser's storage is full. Export a file instead."); return; }
    setName('');
    setLocal(listLocalSnapshots());
    flash('Local snapshot taken.');
  }

  async function takeCloud() {
    const label = name || `before ${new Date().toLocaleTimeString()}`;
    const { error } = await saveCloudSnapshot(label, state, session?.user.email ?? undefined);
    if (error) { setErr(error); return; }
    setName('');
    setRemote(await listCloudSnapshots());
    flash('Cloud snapshot taken — the whole crew can restore this.');
  }

  function restoreLocal(id: string, label: string) {
    if (!window.confirm(`Restore "${label}"?\n\nThis replaces everything currently in the app. Undo (⌘Z) can reverse it.`)) return;
    const restored = restoreLocalSnapshot(id);
    if (!restored) { setErr('That snapshot could not be read.'); return; }
    dispatch({ type: 'HYDRATE', state: restored });
    flash(`Restored "${label}".`);
  }

  async function restoreRemote(id: string, label: string) {
    if (!window.confirm(`Restore "${label}" for the whole crew?\n\nThis replaces the shared project everyone sees. Undo (⌘Z) can reverse it on your screen.`)) return;
    const restored = await restoreCloudSnapshot(id);
    if (!restored) { setErr('That snapshot could not be read.'); return; }
    dispatch({ type: 'HYDRATE', state: restored });
    flash(`Restored "${label}".`);
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-start justify-center p-4 sm:p-8 overflow-y-auto no-print" role="dialog" aria-modal="true" aria-label="Backup and restore">
      <button type="button" aria-label="close" className="fixed inset-0 bg-[color:var(--color-chrome-deep)]/70" onClick={onClose} />
      <div className="relative w-full max-w-[560px] bg-[color:var(--color-paper-light)] rounded-[4px] shadow-2xl border-[0.5px] border-[color:var(--color-border-paper-strong)] my-auto">
        <header className="flex items-baseline justify-between gap-3 px-5 pt-4 pb-3 border-b-[0.5px] border-[color:var(--color-border-paper)]">
          <div>
            <h2 className="display-italic text-[22px] text-[color:var(--color-on-paper)]">Backup &amp; restore</h2>
            <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] mt-0.5">
              {census(summarize(state))}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-on-paper)]">
            <X size={16} />
          </button>
        </header>

        <div className="px-5 py-4 space-y-5">
          {err && <p className="prose-body text-[12px] text-[color:var(--color-coral)]">{err}</p>}
          {msg && <p className="prose-body text-[12px] text-[color:var(--color-success)]">{msg}</p>}

          {/* Import confirmation — never swap the film out without showing what's inside. */}
          {pending && (
            <div className="rounded-[3px] border-[0.5px] border-[color:var(--color-border-brass)] bg-[color:var(--color-paper-card)] p-3">
              <p className="prose-body text-[13px] text-[color:var(--color-on-paper)]">
                <span className="italic">{pending.from}</span> holds:
              </p>
              <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-muted)] mt-1">{census(pending.summary)}</p>
              {pending.summary.exportedAt && (
                <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)] mt-0.5">
                  exported {when(pending.summary.exportedAt)}
                </p>
              )}
              <p className="prose-body text-[12px] text-[color:var(--color-on-paper-muted)] mt-2">
                Importing replaces everything currently in the app.
              </p>
              <div className="flex gap-2 mt-3">
                <button type="button" onClick={confirmImport} className="px-3 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[11px] tracking-[0.08em] uppercase hover:bg-[color:var(--color-brass-deep)]">
                  replace everything
                </button>
                <button type="button" onClick={() => setPending(null)} className="px-3 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper-strong)] text-[11px] tracking-[0.08em] uppercase text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]">
                  cancel
                </button>
              </div>
            </div>
          )}

          {/* File in / out */}
          <section>
            <h3 className="label-caps text-[color:var(--color-on-paper-muted)] mb-2">the whole film, as a file</h3>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={doExport} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] bg-[color:var(--color-chrome)] text-[color:var(--color-on-chrome)] text-[11px] tracking-[0.08em] uppercase hover:bg-[color:var(--color-chrome-elevated)] transition-colors">
                <Download size={12} /> export
              </button>
              <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper-strong)] text-[11px] tracking-[0.08em] uppercase text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)] transition-colors">
                <Upload size={12} /> import
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
              />
            </div>
            <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)] mt-1.5">
              Keep an export somewhere that isn't this browser. It's the only copy that survives everything else.
            </p>
          </section>

          {/* Snapshots */}
          <section>
            <h3 className="label-caps text-[color:var(--color-on-paper-muted)] mb-2">restore points</h3>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="name this moment…"
                className="flex-1 bg-[color:var(--color-paper-card)] rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper)] px-2.5 py-1.5 prose-body text-[13px] outline-none focus:border-[color:var(--color-border-brass)]"
              />
              <button type="button" onClick={takeLocal} title="snapshot in this browser" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px] border-[0.5px] border-[color:var(--color-border-paper-strong)] text-[11px] uppercase tracking-[0.08em] text-[color:var(--color-on-paper-muted)] hover:text-[color:var(--color-on-paper)]">
                <HardDrive size={12} /> local
              </button>
              {signedIn && (
                <button type="button" onClick={takeCloud} title="snapshot for the whole crew" className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px] bg-[color:var(--color-brass)] text-[color:var(--color-paper-light)] text-[11px] uppercase tracking-[0.08em] hover:bg-[color:var(--color-brass-deep)]">
                  <Cloud size={12} /> cloud
                </button>
              )}
            </div>

            {signedIn && remote.length > 0 && (
              <ul className="mt-3 space-y-1">
                {remote.map((s) => (
                  <li key={s.id} className="group flex items-center gap-2 px-2 py-1.5 rounded-[3px] hover:bg-[color:var(--color-paper-deep)]/50">
                    <Cloud size={11} className="text-[color:var(--color-brass)] shrink-0" />
                    <button type="button" onClick={() => restoreRemote(s.id, s.name)} className="flex-1 text-left min-w-0">
                      <span className="prose-body text-[13px] text-[color:var(--color-on-paper)] block truncate">{s.name}</span>
                      <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">
                        {when(s.createdAt)}{s.createdBy ? ` · ${s.createdBy}` : ''}
                      </span>
                    </button>
                    <button
                      type="button"
                      title="delete"
                      onClick={async () => { await deleteCloudSnapshot(s.id); setRemote(await listCloudSnapshots()); }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)]"
                    >
                      <Trash2 size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {local.length > 0 && (
              <ul className="mt-1 space-y-1">
                {local.map((s) => (
                  <li key={s.id} className="group flex items-center gap-2 px-2 py-1.5 rounded-[3px] hover:bg-[color:var(--color-paper-deep)]/50">
                    <HardDrive size={11} className="text-[color:var(--color-on-paper-faint)] shrink-0" />
                    <button type="button" onClick={() => restoreLocal(s.id, s.name)} className="flex-1 text-left min-w-0">
                      <span className="prose-body text-[13px] text-[color:var(--color-on-paper)] block truncate">{s.name}</span>
                      <span className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)]">{when(s.createdAt)} · this browser</span>
                    </button>
                    <button
                      type="button"
                      title="delete"
                      onClick={() => { deleteLocalSnapshot(s.id); setLocal(listLocalSnapshots()); }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-[color:var(--color-on-paper-faint)] hover:text-[color:var(--color-danger)]"
                    >
                      <Trash2 size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {local.length === 0 && remote.length === 0 && (
              <p className="prose-body italic text-[12px] text-[color:var(--color-on-paper-faint)] mt-2">
                No restore points yet. Take one before you change anything big.
              </p>
            )}
            {!signedIn && (
              <p className="prose-body italic text-[11px] text-[color:var(--color-on-paper-faint)] mt-2">
                Local snapshots live in this browser only. Sign in with the cloud on to keep crew-wide restore points.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
