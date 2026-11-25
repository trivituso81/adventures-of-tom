"""Applies the hosted-vault patch (auto-load on startup, non-destructive merge, Sync Hosted Defaults) to a fresh Script Studio .jsx.
Usage: python3 tools/script-studio/apply_vault_patch.py <plain-component.jsx> [out=tools/script-studio/src/App.jsx]
Run it again on every new version of the component Tom sends, then rebuild (npm run build) and run e2e_test.py."""
import sys, os
src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'src', 'App.jsx')
s = open(src, encoding='utf-8').read()
def rep(old, new):
    global s
    assert s.count(old) == 1, 'anchor not found exactly once: ' + old[:70]
    s = s.replace(old, new)

rep("const MODEL_PRESETS = [", """// Hosted reference vault: the six core docs live next to this page (script-studio/reference-vault/) and are fetched at
// runtime, so updating the .md files in the repo needs no rebuild. Relative to the page, so it works at any subpath.
const VAULT_BASE = './reference-vault/';

async function fetchHostedDocs() {
  const out = {};
  const failed = [];
  await Promise.all(
    CORE_VAULT_DOCS.map(async (d) => {
      try {
        const res = await fetch(`${VAULT_BASE}${encodeURIComponent(d.name)}`, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        out[d.name] = await res.text();
      } catch {
        failed.push(d.name);
      }
    })
  );
  return { docs: out, failed };
}

// Non-destructive startup merge. Never touches a slot's `content` unless it is empty.
function mergeHostedDefaults(vaultDocs, hosted) {
  const next = [...vaultDocs];
  for (const core of CORE_VAULT_DOCS) {
    const text = hosted[core.name];
    if (!text) continue;
    const idx = next.findIndex((d) => d.name.toLowerCase() === core.name.toLowerCase());
    if (idx < 0) {
      next.push({ ...core, content: text, uploadedContent: text, inject: true });
      continue;
    }
    const doc = next[idx];
    if (!doc.content || !doc.content.trim()) {
      next[idx] = { ...doc, content: text, uploadedContent: text, inject: true };
    } else if (!doc.uploadedContent || !doc.uploadedContent.trim()) {
      next[idx] = { ...doc, uploadedContent: text };
    }
  }
  return next;
}

// Sync Hosted Defaults: reset the six core slots to the hosted files (custom docs are left alone).
function resetCoreToHosted(vaultDocs, hosted) {
  const next = [...vaultDocs];
  for (const core of CORE_VAULT_DOCS) {
    const text = hosted[core.name];
    if (!text) continue;
    const idx = next.findIndex((d) => d.name.toLowerCase() === core.name.toLowerCase());
    if (idx < 0) next.push({ ...core, content: text, uploadedContent: text, inject: true });
    else next[idx] = { ...next[idx], content: text, uploadedContent: text, inject: true };
  }
  return next;
}

const MODEL_PRESETS = [""")

rep("  const showToast = (msg) => {", """  // Auto-load the six hosted reference docs on startup (merge keeps every local edit and upload).
  useEffect(() => {
    let cancelled = false;
    fetchHostedDocs().then(({ docs, failed }) => {
      if (cancelled) return;
      if (Object.keys(docs).length > 0) {
        setState((prev) => ({ ...prev, vaultDocs: mergeHostedDefaults(prev.vaultDocs, docs) }));
      }
      if (failed.length > 0) {
        setErrorBanner(`Could not load hosted reference file(s): ${failed.join(', ')}. Upload them in Tab 1 if needed.`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSyncHostedDefaults = () => {
    setConfirmModal({
      title: 'Sync Hosted Defaults?',
      message:
        'This re-fetches the six core reference docs from the website and replaces your current text in those six slots (edits and uploads included). Docs you added yourself are not touched.',
      confirmLabel: 'Sync Hosted Defaults',
      onConfirm: async () => {
        setConfirmModal(null);
        setErrorBanner('');
        setLoadingStatus('Fetching hosted reference docs...');
        try {
          const { docs, failed } = await fetchHostedDocs();
          if (failed.length === CORE_VAULT_DOCS.length) {
            throw new Error('Could not reach the hosted reference files. Nothing was changed.');
          }
          setState((prev) => ({ ...prev, vaultDocs: resetCoreToHosted(prev.vaultDocs, docs) }));
          const okCount = CORE_VAULT_DOCS.length - failed.length;
          showToast(
            failed.length
              ? `Synced ${okCount} of ${CORE_VAULT_DOCS.length}; failed: ${failed.join(', ')}.`
              : `Synced all ${CORE_VAULT_DOCS.length} hosted docs.`
          );
        } catch (err) {
          setErrorBanner(err.message || 'Sync failed.');
        } finally {
          setLoadingStatus('');
        }
      },
    });
  };

  const showToast = (msg) => {""")

rep("""              <div className="flex items-center gap-2">
                <button
                  onClick={() => vaultFileInputRef.current?.click()}""", """              <div className="flex items-center gap-2">
                <button
                  onClick={handleSyncHostedDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                  title="Reset the 6 core slots to the latest hosted files"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  Sync Hosted Defaults
                </button>
                <button
                  onClick={() => vaultFileInputRef.current?.click()}""")
open(out, 'w', encoding='utf-8').write(s)
print('patched ->', out)
