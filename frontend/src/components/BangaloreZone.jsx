import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ExternalLink, FileSpreadsheet, FileBarChart } from 'lucide-react';

// ── Sheet URL ─────────────────────────────────────────────────────────────
const SHEET_ID = '1Zal-ay0pfrKpDhEDRMk3pFYIsRDU4reVUzDRboWV9Gs';
const GID = '1772969052';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

// ── CSV parser ────────────────────────────────────────────────────────────
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQ && text[i + 1] === '"') { field += '"'; i++; } else inQ = !inQ;
    } else if (ch === ',' && !inQ) {
      row.push(field.trim()); field = '';
    } else if ((ch === '\n' || ch === '\r') && !inQ) {
      row.push(field.trim()); rows.push(row); row = []; field = '';
      if (ch === '\r' && text[i + 1] === '\n') i++;
    } else { field += ch; }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }
  return rows.filter(r => r.some(Boolean));
}

// ── Google Sheet URL → spreadsheet ID ────────────────────────────────────
function extractSheetId(url) {
  const m = url && url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return m ? m[1] : null;
}

// Every branch workbook has a tab literally named "Master Scorecard" — fetch
// it by name rather than by the gid a link happens to point to, since Column I
// sometimes links to a different (raw/pointer) tab in the same workbook.
function masterScorecardUrl(sheetId) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Master Scorecard')}`;
}

// For a handful of workbooks, the by-name gviz endpoint above returns the
// whole tab collapsed into one or two garbled rows (a Google-side quirk, not
// tied to sheet content). Fetching the same tab by its gid is reliable, so
// that's the fallback once we can tell the by-name response is bad.
function gidCsvUrl(editUrl) {
  const id = extractSheetId(editUrl);
  const gidMatch = editUrl && editUrl.match(/gid=(\d+)/);
  if (!id || !gidMatch) return null;
  return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gidMatch[1]}`;
}

function isValidScorecard(rows) {
  if (rows.length < 3) return false;
  const cols = resolveColumns(rows);
  return !!cols && cols.category >= 0 && cols.checkPoint >= 0;
}

// Try the by-name Master Scorecard fetch; if it comes back malformed, retry
// against the exact gid the branch's Report/Raw Data link points to.
async function fetchScorecardRows(branch) {
  const byNameText = await fetch(masterScorecardUrl(branch.scorecardSheetId))
    .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); });
  const byNameRows = parseCSV(byNameText);
  if (isValidScorecard(byNameRows)) return byNameRows;

  const fallback = gidCsvUrl(branch.reportSheet) || gidCsvUrl(branch.rawSheet);
  if (fallback) {
    const fallbackText = await fetch(fallback).then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); });
    const fallbackRows = parseCSV(fallbackText);
    if (isValidScorecard(fallbackRows)) return fallbackRows;
  }
  return byNameRows;
}

// ── Sheet parser (skips title row + header row) ─────────────────────────
function parseBranches(rows) {
  const data = [];
  for (let r = 2; r < rows.length; r++) {
    const [sno, name, tag, member, date, students, days, rawSheet, reportSheet, remark, timetable] = rows[r];
    if (!name || name.startsWith('Total')) continue;
    data.push({
      sno, name, tag: tag || '', member: member || '', date: date || '',
      students: +students || 0, days: days || '',
      rawSheet: rawSheet || '', reportSheet: reportSheet || '',
      remark: remark || '', timetable: timetable || '',
      scorecardSheetId: extractSheetId(reportSheet) || extractSheetId(rawSheet),
    });
  }
  return data;
}

const TAG_COLORS = { Old: 'bg-blue-100 text-blue-800', New: 'bg-amber-100 text-amber-800' };

function timetableStatus(v) {
  const s = (v || '').trim().toLowerCase();
  if (s === 'done') return { label: 'Done', cls: 'bg-green-100 text-green-800' };
  if (!s) return { label: 'Not scheduled', cls: 'bg-gray-100 text-gray-500' };
  return { label: v, cls: 'bg-amber-100 text-amber-800' };
}

// ── Generic report table (handles varying per-school sheet layouts) ─────
const HEADER_KEYWORDS = ['category', 'check point', 'key finding', 'status', 'grade', 'section',
  'active', 'actual', 'difference', 'flag', 'observation', 'count / data', 'responsible team', '#'];

function classifyRow(row) {
  const nonEmpty = row.filter(c => c && c.trim());
  if (nonEmpty.length <= 2) return 'banner';
  const lower = row.map(c => c.trim().toLowerCase());
  const isHeader = lower.some(c => HEADER_KEYWORDS.includes(c));
  return isHeader ? 'header' : 'data';
}

function sentimentOf(text) {
  if (/^✅/.test(text)) return 'good';
  if (/^🔴/.test(text)) return 'bad';
  if (/^⚠/.test(text)) return 'warn';
  if (/^⏳/.test(text)) return 'pending';
  if (/^ℹ/.test(text)) return 'info';
  return null;
}

const SENTIMENT_STYLE = {
  good:    { pill: 'bg-green-100 text-green-800', bar: 'border-green-400 text-green-800' },
  warn:    { pill: 'bg-amber-100 text-amber-800', bar: 'border-amber-400 text-amber-800' },
  bad:     { pill: 'bg-red-100 text-red-800',     bar: 'border-red-400 text-red-800' },
  pending: { pill: 'bg-gray-100 text-gray-600',   bar: 'border-gray-300 text-gray-600' },
  info:    { pill: 'bg-blue-100 text-blue-800',   bar: 'border-blue-400 text-blue-800' },
};

// Split cell text on URLs and render them as compact links instead of raw
// wrapped strings — auditors sometimes paste a sheet link into a remark cell.
const URL_RE = /(https?:\/\/[^\s]+)/g;
function linkify(text) {
  const parts = text.split(URL_RE);
  if (parts.length === 1) return text;
  return parts.map((part, i) => (
    /^https?:\/\//.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 underline font-medium">
          🔗 Linked sheet
        </a>
      : part
  ));
}

function ReportCell({ text }) {
  if (!text) return <span className="text-gray-300">—</span>;
  const sentiment = sentimentOf(text);
  if (!sentiment) return <span className="whitespace-pre-wrap">{linkify(text)}</span>;
  const st = SENTIMENT_STYLE[sentiment];
  if (text.length <= 34) {
    return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${st.pill}`}>{text}</span>;
  }
  return <div className={`border-l-2 pl-2 whitespace-pre-wrap ${st.bar}`}>{linkify(text)}</div>;
}

// Columns whose header matches one of these are spreadsheet-merged group
// labels (e.g. "Category" is only written on the first row of each step, and
// left blank on the rows below it) — carry the last value down so the table
// doesn't show ragged blanks for what is really one continuous group.
const GROUP_FILL_KEYWORDS = ['category'];

// Size each column by how much text it actually holds, instead of one
// blanket width for every column — short columns (Status, Count/Data) stay
// compact while long-form columns (Key Finding, Remarks) get real width so
// text wraps into a few wide lines rather than many narrow ones.
function widthClass(maxLen) {
  if (maxLen <= 12) return '';
  if (maxLen <= 30) return 'min-w-[170px] max-w-[260px]';
  if (maxLen <= 60) return 'min-w-[240px] max-w-[360px]';
  return 'min-w-[320px] max-w-[480px]';
}

// Some sheets merge the school title into the first header cell (e.g.
// "OIS BANNERGHATTA — MASTER SCORECARD #"), which forces that column wide
// just to fit one unbroken line. The title is already shown in the summary
// banner above, so collapse it back to its real label (the trailing token).
function cleanHeaderLabel(text) {
  const trimmed = text.trim();
  if (trimmed.length <= 20) return trimmed;
  const parts = trimmed.split(/\s+/);
  const last = parts[parts.length - 1];
  return last.length <= 3 ? last : trimmed;
}

function GenericReportTable({ rows }) {
  const maxCols = Math.max(...rows.map(r => r.length));
  const padded = rows.map(r => Array.from({ length: maxCols }, (_, i) => r[i] || ''));
  const keepCols = [];
  for (let c = 0; c < maxCols; c++) if (padded.some(r => r[c].trim())) keepCols.push(c);
  const trimmed = padded.map(r => keepCols.map(c => r[c]));

  const classified = trimmed.map(row => ({ row, kind: classifyRow(row) }));
  let groupCols = [];
  let carry = {};
  const displayRows = classified.map(({ row, kind }) => {
    if (kind === 'header') {
      groupCols = row.reduce((acc, c, ci) => GROUP_FILL_KEYWORDS.includes(c.trim().toLowerCase()) ? [...acc, ci] : acc, []);
      carry = {};
      return row;
    }
    if (kind === 'banner') { carry = {}; return row; }
    const filledRow = row.slice();
    groupCols.forEach(ci => {
      if (filledRow[ci].trim()) carry[ci] = filledRow[ci];
      else if (carry[ci]) filledRow[ci] = carry[ci];
    });
    return filledRow;
  });

  const narrowCols = new Set();
  const colWidths = keepCols.map((_, ci) => {
    const maxLen = displayRows.reduce((m, row, ri) =>
      classified[ri].kind === 'data' ? Math.max(m, (row[ci] || '').length) : m, 0);
    if (maxLen <= 12) narrowCols.add(ci);
    return widthClass(maxLen);
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-300 shadow-sm">
      <table className="text-sm border-collapse">
        <tbody>
          {classified.map(({ kind, row: originalRow }, ri) => {
            const row = displayRows[ri];
            if (kind === 'banner') {
              const text = originalRow.find(c => c.trim()) || '';
              return (
                <tr key={ri}>
                  <td colSpan={originalRow.length} className="bg-indigo-950 text-white font-semibold text-[13px] px-4 py-2.5 tracking-wide border border-indigo-900">
                    {text}
                  </td>
                </tr>
              );
            }
            if (kind === 'header') {
              return (
                <tr key={ri} className="bg-gray-100">
                  {row.map((c, ci) => (
                    <th key={ci} className={`text-left px-3 py-2 font-semibold text-gray-700 text-[11px] uppercase tracking-wide border border-gray-300 whitespace-normal break-words ${colWidths[ci]}`}>
                      {cleanHeaderLabel(c)}
                    </th>
                  ))}
                </tr>
              );
            }
            return (
              <tr key={ri} className={`hover:bg-indigo-50/40 ${ri % 2 ? 'bg-gray-50/60' : 'bg-white'}`}>
                {row.map((c, ci) => (
                  <td key={ci} className={`px-3 py-2.5 align-top text-gray-700 text-[13px] border border-gray-200 ${colWidths[ci]} ${narrowCols.has(ci) ? 'whitespace-nowrap' : ''}`}>
                    <ReportCell text={c} />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const LEGEND = [
  { e: '✅', l: 'Satisfactory',     cls: 'bg-green-100 text-green-800' },
  { e: '⚠',  l: 'Needs Attention',  cls: 'bg-amber-100 text-amber-800' },
  { e: '🔴', l: 'Critical',         cls: 'bg-red-100 text-red-800' },
  { e: '⏳', l: 'Pending',          cls: 'bg-gray-100 text-gray-600' },
  { e: 'ℹ',  l: 'Info',             cls: 'bg-blue-100 text-blue-800' },
];

function ReportTab({ branches }) {
  const withReports = useMemo(() => branches.filter(b => b.scorecardSheetId), [branches]);
  const [selected, setSelected] = useState('');
  const [rows, setRows]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState('');

  const branch = branches.find(b => b.name === selected);
  const sourceLink = branch?.reportSheet || branch?.rawSheet;

  useEffect(() => {
    if (!branch?.scorecardSheetId) { setRows(null); return; }
    setLoading(true); setErr('');
    fetchScorecardRows(branch)
      .then(setRows)
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [branch?.scorecardSheetId]); // eslint-disable-line

  return (
    <div className="space-y-4">
      {/* School selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select school</label>
        <select
          value={selected}
          onChange={e => setSelected(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg min-w-[260px] bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        >
          <option value="">Choose a branch…</option>
          {withReports.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
        </select>
        <span className="text-xs text-gray-400">{withReports.length} branches have a Master Scorecard available</span>
        {sourceLink && (
          <a href={sourceLink} target="_blank" rel="noopener noreferrer"
            className="ml-auto flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
            Open in Google Sheets <ExternalLink size={12} />
          </a>
        )}
      </div>

      {!selected && (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl py-16 text-center text-gray-400 text-sm">
          Select a branch above to view its audit report.
        </div>
      )}

      {selected && branch && (
        <>
          {/* Summary banner */}
          <div className="bg-gradient-to-r from-indigo-950 to-indigo-800 rounded-xl px-6 py-5 text-white">
            <div className="flex flex-wrap items-center justify-between gap-5">
              <div>
                <div className="text-lg font-semibold">{branch.name}</div>
                <div className="text-xs text-indigo-200 mt-1">School audit report</div>
              </div>
              <div className="flex flex-wrap gap-6">
                {[
                  { l: 'Tag', v: branch.tag || '—' },
                  { l: 'Assigned', v: branch.member || '—' },
                  { l: 'Audit Date', v: branch.date || '—' },
                  { l: 'Students', v: branch.students || '—' },
                  { l: 'Timetable', v: branch.timetable || 'Not scheduled' },
                ].map(({ l, v }) => (
                  <div key={l} className="text-center">
                    <div className="text-[10px] uppercase tracking-wide text-indigo-300">{l}</div>
                    <div className="text-sm font-semibold mt-0.5">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 text-xs">
            {LEGEND.map(({ e, l, cls }) => (
              <span key={l} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${cls}`}>{e} {l}</span>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
            </div>
          )}
          {err && (
            <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm">Failed to load report: {err}</div>
          )}
          {rows && !loading && !err && <GenericReportTable rows={rows} />}
        </>
      )}
    </div>
  );
}

// ── Ranking (scores each branch's Master Scorecard against fixed pointers) ──
// Pointers are matched against the Check Point / Category text, not by fixed
// column position, since that text is the one thing that stays consistent
// across the differently-shaped sheets each branch uses.
const POINTER_DEFS = [
  { key: 'teacherAllocation', label: 'Teacher Allocation',  tier: 'high',   match: (cat, cp) => cp.includes('teacher allocation') },
  { key: 'portionCompletion', label: 'Portion Completion',  tier: 'high',   match: (cat, cp) => cp.includes('portion completion') },
  { key: 'notebookCorrection',label: 'Notebook Correction', tier: 'high',   match: (cat, cp) => cp.includes('notebook correction') },
  { key: 'workbookCorrection',label: 'Workbook Correction', tier: 'high',   match: (cat, cp) => cp.includes('workbook correction') },
  { key: 'substitution',     label: 'Substitution (Eduvate)',tier: 'high',  match: (cat, cp) => cat.includes('substitution') || cp.includes('substitution') },
  { key: 'clickerUsage',     label: 'Clicker Usage',        tier: 'second', match: (cat, cp) => cp.includes('clicker usage') },
  { key: 'chatReply',        label: 'Chat Reply',           tier: 'second', match: (cat, cp) => cat.includes('chat reply') || cp.includes('chat') },
  { key: 'studentMapping',   label: 'Student Mapping',      tier: 'second', match: (cat, cp) => cp.includes('student mapping') },
];
const HIGH_KEYS = POINTER_DEFS.filter(p => p.tier === 'high').map(p => p.key);
const SECOND_KEYS = POINTER_DEFS.filter(p => p.tier === 'second').map(p => p.key);
const SENTIMENT_SCORE = { good: 10, info: 7, warn: 5, pending: 2, bad: 0 };

// Find the header row (reusing the same classifier as the report table) and
// map each column name to its index — column order/width differs per sheet.
function resolveColumns(rows) {
  for (const row of rows) {
    if (classifyRow(row) !== 'header') continue;
    const lower = row.map(c => c.trim().toLowerCase());
    const find = (...names) => { for (const n of names) { const i = lower.indexOf(n); if (i >= 0) return i; } return -1; };
    return {
      category: find('category'),
      checkPoint: find('check point'),
      finding: find('key finding', 'detail / sub-points'),
      status: find('status'),
    };
  }
  return null;
}

function scoreFromText(status, finding) {
  const s = sentimentOf(status) || sentimentOf(finding);
  return s ? SENTIMENT_SCORE[s] : null;
}

function computePointerScores(rows) {
  const cols = resolveColumns(rows);
  if (!cols || cols.checkPoint < 0) return {};
  const scores = {};
  for (const row of rows) {
    if (classifyRow(row) !== 'data') continue;
    const cat = (cols.category >= 0 ? row[cols.category] || '' : '').toLowerCase();
    const cp = (row[cols.checkPoint] || '').toLowerCase();
    if (!cp) continue;
    const status = cols.status >= 0 ? row[cols.status] || '' : '';
    const finding = cols.finding >= 0 ? row[cols.finding] || '' : '';
    for (const p of POINTER_DEFS) {
      if (scores[p.key] != null) continue; // first matching row wins
      if (p.match(cat, cp)) {
        const sc = scoreFromText(status, finding);
        if (sc != null) scores[p.key] = sc;
      }
    }
  }
  return scores;
}

function avgOf(scores, keys) {
  const vals = keys.map(k => scores[k]).filter(v => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function scoreCellClass(score) {
  if (score == null) return 'text-gray-300';
  if (score >= 8) return 'text-green-700 font-semibold';
  if (score >= 5) return 'text-amber-700 font-semibold';
  return 'text-red-700 font-semibold';
}

function ScoreCell({ score }) {
  return <span className={scoreCellClass(score)}>{score == null ? '—' : score.toFixed(1)}</span>;
}

// Click a pointer score to override it — the sheet-derived value is a
// starting point, not the final word, so auditors can correct it by hand.
// Clearing the field back to blank reverts to the auto-computed score.
function EditableScoreCell({ value, overridden, onChange }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (editing) {
    return (
      <input
        autoFocus
        type="number" min={0} max={10} step={0.5}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') setEditing(false);
        }}
        className="w-14 text-center border border-indigo-400 rounded px-1 py-0.5 text-sm focus:outline-none"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => { setDraft(value == null ? '' : String(value)); setEditing(true); }}
      title="Click to edit"
      className={`w-full rounded px-1.5 py-0.5 cursor-text hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-200 ${overridden ? 'bg-indigo-50/70 ring-1 ring-indigo-200' : ''}`}
    >
      <span className={scoreCellClass(value)}>{value == null ? '—' : value.toFixed(1)}</span>
      {overridden && <span className="ml-1 text-indigo-400 text-[9px] align-top">●</span>}
    </button>
  );

  function commit() {
    setEditing(false);
    if (draft.trim() === '') { onChange(null); return; }
    const n = parseFloat(draft);
    if (!isNaN(n)) onChange(Math.max(0, Math.min(10, n)));
  }
}

const RANKING_CONCURRENCY = 6;
const OVERRIDES_KEY = 'bz_ranking_overrides';

function loadOverrides() {
  try { return JSON.parse(localStorage.getItem(OVERRIDES_KEY) || '{}'); } catch { return {}; }
}

function RankingTab({ branches }) {
  const targets = useMemo(() => branches.filter(b => b.scorecardSheetId), [branches]);
  const [scoresByBranch, setScoresByBranch] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState(loadOverrides);

  useEffect(() => {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  }, [overrides]);

  const setOverride = (branchName, key, val) => {
    setOverrides(prev => {
      const next = { ...prev };
      const b = { ...(next[branchName] || {}) };
      if (val == null) delete b[key]; else b[key] = val;
      if (Object.keys(b).length) next[branchName] = b; else delete next[branchName];
      return next;
    });
  };

  useEffect(() => {
    if (!targets.length) { setScoresByBranch({}); setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setProgress(0);
    const results = {};
    let idx = 0;
    async function worker() {
      while (idx < targets.length) {
        const b = targets[idx++];
        try {
          const rows = await fetchScorecardRows(b);
          results[b.name] = computePointerScores(rows);
        } catch {
          results[b.name] = {};
        }
        if (!cancelled) setProgress(p => p + 1);
      }
    }
    Promise.all(Array.from({ length: Math.min(RANKING_CONCURRENCY, targets.length) }, worker))
      .then(() => { if (!cancelled) { setScoresByBranch(results); setLoading(false); } });
    return () => { cancelled = true; };
  }, [targets]);

  const ranked = useMemo(() => {
    if (!scoresByBranch) return [];
    return targets
      .map(b => {
        const auto = scoresByBranch[b.name] || {};
        const branchOverrides = overrides[b.name] || {};
        const scores = { ...auto, ...branchOverrides };
        return { branch: b, scores, branchOverrides, highAvg: avgOf(scores, HIGH_KEYS), secondAvg: avgOf(scores, SECOND_KEYS) };
      })
      .sort((a, b) => (b.highAvg ?? -1) - (a.highAvg ?? -1));
  }, [scoresByBranch, targets, overrides]);

  const hasOverrides = Object.keys(overrides).length > 0;

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-40 gap-3">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
      <div className="text-xs text-gray-400">Scoring branches… {progress}/{targets.length}</div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-600 flex items-start justify-between gap-4">
        <p>Each pointer is scored 0–10 from its Master Scorecard status: <span className="text-green-700 font-medium">✅ Satisfactory = 10</span>, <span className="text-blue-700 font-medium">ℹ Info = 7</span>, <span className="text-amber-700 font-medium">⚠ Needs Attention = 5</span>, <span className="text-gray-500 font-medium">⏳ Pending = 2</span>, <span className="text-red-700 font-medium">🔴 Critical = 0</span>. Ranked by High Priority average, highest first. <span className="text-gray-400">Click any score to edit it — </span><span className="text-indigo-500">●</span><span className="text-gray-400"> marks a manual override.</span></p>
        {hasOverrides && (
          <button onClick={() => setOverrides({})}
            className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 whitespace-nowrap">
            Reset all overrides
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-300 overflow-x-auto shadow-sm">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-gray-100">
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-[11px] uppercase align-bottom">Rank</th>
              <th rowSpan={2} className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-700 text-[11px] uppercase align-bottom min-w-[180px]">Branch</th>
              <th colSpan={HIGH_KEYS.length + 1} className="border border-gray-300 px-3 py-2 text-center font-semibold text-indigo-900 text-[11px] uppercase bg-indigo-50">High Priority</th>
              <th colSpan={SECOND_KEYS.length + 1} className="border border-gray-300 px-3 py-2 text-center font-semibold text-teal-900 text-[11px] uppercase bg-teal-50">2nd Priority</th>
            </tr>
            <tr className="bg-gray-100">
              {HIGH_KEYS.map(k => (
                <th key={k} className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-600 text-[10.5px] uppercase whitespace-nowrap bg-indigo-50/60">
                  {POINTER_DEFS.find(p => p.key === k).label}
                </th>
              ))}
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-indigo-900 text-[10.5px] uppercase whitespace-nowrap bg-indigo-100">Avg</th>
              {SECOND_KEYS.map(k => (
                <th key={k} className="border border-gray-300 px-2 py-2 text-center font-medium text-gray-600 text-[10.5px] uppercase whitespace-nowrap bg-teal-50/60">
                  {POINTER_DEFS.find(p => p.key === k).label}
                </th>
              ))}
              <th className="border border-gray-300 px-2 py-2 text-center font-semibold text-teal-900 text-[10.5px] uppercase whitespace-nowrap bg-teal-100">Avg</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map(({ branch, scores, branchOverrides, highAvg, secondAvg }, i) => (
              <tr key={branch.name} className={`hover:bg-indigo-50/40 ${i % 2 ? 'bg-gray-50/60' : 'bg-white'}`}>
                <td className="border border-gray-200 px-3 py-2 text-gray-500 font-medium">{i + 1}</td>
                <td className="border border-gray-200 px-3 py-2 font-medium text-gray-800 whitespace-nowrap">{branch.name}</td>
                {HIGH_KEYS.map(k => (
                  <td key={k} className="border border-gray-200 p-0 text-center">
                    <EditableScoreCell value={scores[k]} overridden={branchOverrides[k] != null}
                      onChange={v => setOverride(branch.name, k, v)} />
                  </td>
                ))}
                <td className="border border-gray-200 px-2 py-2 text-center bg-indigo-50/50"><ScoreCell score={highAvg} /></td>
                {SECOND_KEYS.map(k => (
                  <td key={k} className="border border-gray-200 p-0 text-center">
                    <EditableScoreCell value={scores[k]} overridden={branchOverrides[k] != null}
                      onChange={v => setOverride(branch.name, k, v)} />
                  </td>
                ))}
                <td className="border border-gray-200 px-2 py-2 text-center bg-teal-50/50"><ScoreCell score={secondAvg} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BangaloreZone() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('branches');

  const load = () => {
    setLoading(true); setError('');
    fetch(SHEET_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(text => setBranches(parseBranches(parseCSV(text))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const filtered = useMemo(() => {
    return branches.filter(b => {
      if (tagFilter !== 'all' && b.tag !== tagFilter) return false;
      if (search && !b.name.toLowerCase().includes(search.toLowerCase()) &&
          !b.member.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [branches, tagFilter, search]);

  const stats = useMemo(() => {
    const total = branches.length;
    const oldCount = branches.filter(b => b.tag === 'Old').length;
    const newCount = branches.filter(b => b.tag === 'New').length;
    const students = branches.reduce((a, b) => a + b.students, 0);
    const reportsReady = branches.filter(b => b.scorecardSheetId).length;
    const pendingReport = branches.filter(b => b.tag === 'Old' && !b.scorecardSheetId).length;
    return { total, oldCount, newCount, students, reportsReady, pendingReport };
  }, [branches]);

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
    </div>
  );
  if (error) return (
    <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm">
      Failed to load: {error}
      <button onClick={load} className="ml-3 underline">Retry</button>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[['branches', 'All Branches'], ['report', 'Audit Report'], ['ranking', 'Ranking']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'branches' && (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-indigo-600 text-white rounded-xl px-4 py-3 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs opacity-80 mt-0.5">Total Branches</div>
            </div>
            {[
              { label: 'Existing (Old)', val: stats.oldCount, cls: 'text-blue-700' },
              { label: 'New Branches', val: stats.newCount, cls: 'text-amber-700' },
              { label: 'Total Students', val: stats.students.toLocaleString(), cls: 'text-gray-800' },
              { label: 'Reports Ready', val: stats.reportsReady, cls: 'text-green-700' },
              { label: 'Reports Pending', val: stats.pendingReport, cls: 'text-red-700' },
            ].map(({ label, val, cls }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-xl px-3 py-3 flex flex-col items-center">
                <div className={`text-xl font-bold ${cls}`}>{val}</div>
                <div className="text-[10px] text-gray-400 text-center mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'Old', 'New'].map(t => (
              <button key={t} onClick={() => setTagFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  tagFilter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}>
                {t === 'all' ? 'All Branches' : t === 'Old' ? 'Existing' : 'New'}
              </button>
            ))}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search branch or auditor..."
              className="ml-1 px-3 py-1.5 text-xs border border-gray-200 rounded-full w-56 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <button onClick={load} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
              <RefreshCw size={11} /> Refresh
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 min-w-[200px]">Branch</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-700">Tag</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-700">Assigned Member</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-700">Audit Date</th>
                  <th className="text-right px-3 py-3 font-semibold text-gray-700">Students</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-700">Timetable</th>
                  <th className="text-left px-3 py-3 font-semibold text-gray-700">Links</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => {
                  const ts = timetableStatus(b.timetable);
                  return (
                    <tr key={b.name} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{b.name}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${TAG_COLORS[b.tag] || 'bg-gray-100 text-gray-600'}`}>
                          {b.tag || '—'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-gray-600">{b.member || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{b.date || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2.5 text-right text-gray-700">{b.students || <span className="text-gray-300">—</span>}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${ts.cls}`}>{ts.label}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          {b.rawSheet ? (
                            <a href={b.rawSheet} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600">
                              <FileSpreadsheet size={13} /> Raw data
                            </a>
                          ) : <span className="text-xs text-gray-300">Raw data</span>}
                          {b.scorecardSheetId ? (
                            <a href={b.reportSheet || b.rawSheet} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800">
                              <FileBarChart size={13} /> Report <ExternalLink size={11} />
                            </a>
                          ) : <span className="text-xs text-gray-300">Report pending</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">No branches match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'report' && <ReportTab branches={branches} />}
      {tab === 'ranking' && <RankingTab branches={branches} />}
    </div>
  );
}
