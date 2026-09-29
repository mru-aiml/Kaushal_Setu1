// KAUSHALSETU — export service (Phase 1).
//
// Centralizes all report downloads. Phase 1 generates a clearly-labeled
// prototype file (never claims to be an official government report).
// Phase 2: replace the body with backend report-generation endpoints.

function downloadBlob(name, text) {
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export function prototypeExport(name, notify) {
  const body = [
    'KAUSHALSETU — Prototype export',
    `File: ${name}`,
    `Generated: ${new Date().toLocaleString()}`,
    '',
    'Status: PROTOTYPE EXPORT — demonstration data only.',
    'This file is illustrative and is not an official government report.',
    'District scenario: Pune · Automotive / EV · EV Service Technician.',
  ].join('\n');
  downloadBlob(name, body);
  if (notify) notify(`<b>${name}</b> downloaded — prototype export (demonstration data).`, 'info');
  return true;
}

// Backwards-compatible alias used across existing pages/modals.
export const mockDownload = prototypeExport;
