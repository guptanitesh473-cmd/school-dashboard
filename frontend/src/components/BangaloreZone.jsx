import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ExternalLink, FileSpreadsheet, FileBarChart, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

// ── Zones — each is a tab in the same audit-plan workbook ────────────────
const ZONE_SHEET_ID = '1Zal-ay0pfrKpDhEDRMk3pFYIsRDU4reVUzDRboWV9Gs';
const ZONES = [
  { key: 'bangalore',  label: 'Bangalore',  gid: '1772969052' },
  { key: 'chennai',    label: 'Chennai',    gid: '294605648' },
  { key: 'hyderabad',  label: 'Hyderabad',  gid: '435799059' },
  { key: 'mumbai',     label: 'Mumbai',     gid: '1669902267' },
  { key: 'pune',       label: 'Pune',       gid: '62717054' },
];
const zoneSheetUrl = gid => `https://docs.google.com/spreadsheets/d/${ZONE_SHEET_ID}/export?format=csv&gid=${gid}`;

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

// Each zone's tab has its own column order/count (Hyderabad has 3 extra
// blank columns, only Bangalore has a Timetable column, header labels vary
// slightly in wording) — resolve by header text instead of fixed position.
function resolveZoneColumns(headerRow) {
  const lower = headerRow.map(c => c.trim().toLowerCase());
  const find = (...keywords) => {
    for (let i = 0; i < lower.length; i++) if (keywords.some(k => lower[i].includes(k))) return i;
    return -1;
  };
  return {
    name: find('school name'),
    tag: find('tag'),
    member: find('assigned member'),
    date: find('audit date'),
    students: find('strength', 'total students'),
    days: find('no of days'),
    rawSheet: find('raw data', 'raw data sheet'),
    reportSheet: find('report sheet'),
    remark: find('manjula'),
    timetable: find('time table', 'timetable'),
  };
}

// ── Sheet parser (skips title row + header row) ─────────────────────────
function parseBranches(rows) {
  if (rows.length < 2) return [];
  const cols = resolveZoneColumns(rows[1]);
  if (cols.name < 0) return [];
  const get = (row, key) => (cols[key] >= 0 ? row[cols[key]] || '' : '');
  const data = [];
  const seen = new Set();
  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    const name = get(row, 'name');
    if (!name || name.startsWith('Total') || seen.has(name)) continue;
    seen.add(name);
    const rawSheet = get(row, 'rawSheet');
    const reportSheet = get(row, 'reportSheet');
    data.push({
      name, tag: get(row, 'tag'), member: get(row, 'member'), date: get(row, 'date'),
      students: +get(row, 'students') || 0, days: get(row, 'days'),
      rawSheet, reportSheet,
      remark: get(row, 'remark'), timetable: get(row, 'timetable'),
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

// ── Excel export helpers ──────────────────────────────────────────────────
function downloadSheet(rows, filename, sheetName) {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);
}

function exportBranchesExcel(branches, zoneLabel) {
  const header = ['Branch', 'Tag', 'Assigned Member', 'Audit Date', 'Total Students', 'No of Days', 'Timetable Upload', 'Raw Data Sheet', 'Report Sheet'];
  const rows = branches.map(b => [b.name, b.tag, b.member, b.date, b.students, b.days, b.timetable, b.rawSheet, b.reportSheet]);
  downloadSheet([header, ...rows], `${zoneLabel}_Zone_Branches.xlsx`, 'Branches');
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
      count: find('count / data'),
      status: find('status'),
      remarks: find('remarks', 'remark by auditor'),
    };
  }
  return null;
}

function scoreFromText(status, finding) {
  const s = sentimentOf(status) || sentimentOf(finding);
  return s ? SENTIMENT_SCORE[s] : null;
}

const round1 = n => Math.round(n * 10) / 10;
const clamp10 = n => Math.max(0, Math.min(10, n));

// Pulls the first "X/Y", "X out of Y" or "X of Y" pair out of free text — the
// sheets don't have separate numerator/denominator columns, so the ratio has
// to be read out of whatever text the auditor wrote.
function extractRatio(text) {
  if (!text) return null;
  const m = text.match(/(\d+)\s*(?:\/|out of|of)\s*(\d+)/i);
  if (!m) return null;
  const y = +m[2];
  if (!y) return null;
  return { x: +m[1], y };
}

// Rule: "how many are not matching" → score = (count / total) * 10.
function ratioScore(count, finding) {
  const ratio = extractRatio(count) || extractRatio(finding);
  return ratio ? clamp10(round1((ratio.x / ratio.y) * 10)) : null;
}

const MONTH_ABBR = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const PENDING_WORDS = /(pending|not\s+(?:started|done|corrected|checked)|no\s+work|last\s+corrected)/i;

// Rule: notebook/workbook items pending for more than ~1 month lose an extra
// 0.5 — approximated by comparing a month name mentioned near "pending"
// language against the branch's audit month.
function monthPendingPenalty(text, auditDateStr) {
  if (!text || !PENDING_WORDS.test(text)) return 0;
  const m = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\b/i);
  if (!m) return 0;
  const mentioned = MONTH_ABBR.indexOf(m[1].slice(0, 3).toLowerCase());
  if (mentioned < 0) return 0;
  const dateParts = auditDateStr && auditDateStr.split('/');
  if (!dateParts || dateParts.length !== 3) return 0.5; // can't compare, but signal is strong enough
  const auditMonth = parseInt(dateParts[0], 10) - 1;
  const monthsBehind = (auditMonth - mentioned + 12) % 12;
  return monthsBehind >= 1 ? 0.5 : 0;
}

// Rule: substitution is binary — zero if the sheet says it wasn't done.
function substitutionScore(status, finding) {
  const text = `${status} ${finding}`;
  if (/not\s+done/i.test(text)) return 0;
  if (/partial/i.test(text)) return 5;
  if (/\bdone\b|compliant|verified/i.test(text)) return 10;
  return ratioScore('', finding) ?? scoreFromText(status, finding);
}

// Rule: chat reply is scored by how many of the mentioned teams (PRM, SM,
// Transport, Finance…) show a resolved/no-issue mention vs. a pending one.
const CHAT_TEAMS = ['prm', 'sm', 'transport', 'finance', 'account', 'cic'];
function chatReplyScore(finding) {
  const explicit = extractRatio(finding);
  if (explicit) return clamp10(round1((explicit.x / explicit.y) * 10));
  const lower = (finding || '').toLowerCase();
  const mentioned = CHAT_TEAMS.filter(t => lower.includes(t));
  if (!mentioned.length) return null;
  let positive = 0;
  mentioned.forEach(team => {
    const idx = lower.indexOf(team);
    const window = lower.slice(Math.max(0, idx - 10), idx + 60);
    if (/(no issue|fine|resolved|replying|responded|promptly|✅)/.test(window) &&
        !/(pending|late|delay|unanswered|not closed|lag|partial|⚠|🔴)/.test(window)) positive++;
  });
  return clamp10(round1((positive / mentioned.length) * 10));
}

function computePointerScores(rows, branch) {
  const cols = resolveColumns(rows);
  if (!cols || cols.checkPoint < 0) return {};
  const scores = {};
  for (const row of rows) {
    if (classifyRow(row) !== 'data') continue;
    const cat = (cols.category >= 0 ? row[cols.category] || '' : '').toLowerCase();
    const cp = (row[cols.checkPoint] || '').toLowerCase();
    if (!cp) continue;
    const status  = cols.status  >= 0 ? row[cols.status]  || '' : '';
    const finding = cols.finding >= 0 ? row[cols.finding] || '' : '';
    const count   = cols.count   >= 0 ? row[cols.count]   || '' : '';
    const remarks = cols.remarks >= 0 ? row[cols.remarks] || '' : '';
    for (const p of POINTER_DEFS) {
      if (scores[p.key] != null || !p.match(cat, cp)) continue;
      let sc;
      if (p.key === 'substitution') {
        sc = substitutionScore(status, finding);
      } else if (p.key === 'chatReply') {
        sc = chatReplyScore(finding);
      } else if (p.key === 'notebookCorrection' || p.key === 'workbookCorrection') {
        const base = ratioScore(count, finding) ?? scoreFromText(status, finding);
        if (base != null) sc = clamp10(round1(base - monthPendingPenalty(`${finding} ${remarks}`, branch?.date)));
      } else {
        sc = ratioScore(count, finding) ?? scoreFromText(status, finding);
      }
      if (sc != null) scores[p.key] = sc;
    }
  }
  return scores;
}

// ── Overall Audit cross-reference ────────────────────────────────────────
// The Overall Audit tab holds the actual per-grade/section rows the Master
// Scorecard's summary counts were rolled up from (e.g. one row per section
// with its own ✅/⚠/🔴 status), so counting those rows directly gives a real
// numerator/denominator instead of parsing a vague summary sentence.
function overallAuditUrl(sheetId) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Overall Audit')}`;
}

async function fetchOverallAuditRows(branch) {
  if (!branch.scorecardSheetId) return null;
  try {
    const text = await fetch(overallAuditUrl(branch.scorecardSheetId)).then(r => { if (!r.ok) throw new Error(); return r.text(); });
    const rows = parseCSV(text);
    const preview = rows.slice(0, 5).map(r => r.join(' ')).join(' ');
    if (!/pointer\s*\d/i.test(preview)) return null; // tab missing — gviz silently returned a different sheet
    return rows;
  } catch { return null; }
}

// Splits rows into blocks keyed by "POINTER n" / "POINTERS n-m" marker rows.
function splitPointerBlocks(rows) {
  const blocks = {};
  let current = null;
  for (const row of rows) {
    const first = (row[0] || '').trim();
    const m = first.match(/^pointers?\s*(\d+)/i);
    if (m) { current = m[1]; blocks[current] = []; continue; }
    if (current) blocks[current].push(row);
  }
  return blocks;
}

// Splits a block further on "4a." / "4b." style sub-headers.
function splitSubBlocks(rows, prefixRegex) {
  const blocks = {};
  let current = null;
  for (const row of rows) {
    const first = (row[0] || '').trim();
    const m = first.match(prefixRegex);
    if (m) { current = m[1].toLowerCase(); blocks[current] = []; continue; }
    if (current) blocks[current].push(row);
  }
  return blocks;
}

// Counts how many data rows in a block end in a ✅ vs another status emoji —
// each row is one graded grade/section/channel, so this is an exact count,
// not a text-mined guess. Also collects the non-✅ rows' text for the
// month-pending penalty scan.
function tallyStatusRows(rows) {
  let total = 0, good = 0, flaggedText = '';
  for (const row of rows) {
    const nonEmpty = row.map(c => c.trim()).filter(Boolean);
    if (!nonEmpty.length) continue;
    const last = nonEmpty[nonEmpty.length - 1];
    if (/^status$/i.test(last)) continue; // sub-table header row
    const sentiment = sentimentOf(last);
    if (!sentiment) continue;
    total++;
    if (sentiment === 'good') good++;
    else flaggedText += ' ' + row.join(' ');
  }
  return { total, good, flaggedText };
}

function computeOverallAuditScores(rows, branch) {
  const blocks = splitPointerBlocks(rows);
  const out = {};

  if (blocks['3']) {
    const { total, good } = tallyStatusRows(blocks['3']);
    if (total) out.portionCompletion = clamp10(round1(((total - good) / total) * 10));
  }

  if (blocks['4']) {
    const sub = splitSubBlocks(blocks['4'], /^(4[a-c])\./i);
    if (sub['4a']) {
      const { total, good, flaggedText } = tallyStatusRows(sub['4a']);
      if (total) out.notebookCorrection = clamp10(round1(((total - good) / total) * 10 - monthPendingPenalty(flaggedText, branch?.date)));
    }
    if (sub['4b']) {
      const { total, good, flaggedText } = tallyStatusRows(sub['4b']);
      if (total) out.workbookCorrection = clamp10(round1(((total - good) / total) * 10 - monthPendingPenalty(flaggedText, branch?.date)));
    }
  }

  if (blocks['5']) {
    const { total, good } = tallyStatusRows(blocks['5']);
    if (total) out.clickerUsage = clamp10(round1((good / total) * 10));
  }

  if (blocks['7']) {
    const { total, good } = tallyStatusRows(blocks['7']);
    if (total) out.chatReply = clamp10(round1((good / total) * 10));
  }

  return out;
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

function exportRankingExcel(ranked, zoneLabel) {
  const header = ['Rank', 'Branch',
    ...HIGH_KEYS.map(k => POINTER_DEFS.find(p => p.key === k).label), 'High Priority Avg',
    ...SECOND_KEYS.map(k => POINTER_DEFS.find(p => p.key === k).label), '2nd Priority Avg'];
  const rows = ranked.map(({ branch, scores, highAvg, secondAvg }, i) => [
    i + 1, branch.name,
    ...HIGH_KEYS.map(k => scores[k] ?? ''), highAvg ?? '',
    ...SECOND_KEYS.map(k => scores[k] ?? ''), secondAvg ?? '',
  ]);
  downloadSheet([header, ...rows], `${zoneLabel}_Zone_Ranking.xlsx`, 'Ranking');
}

// Excluded from Ranking: their Master Scorecard/Overall Audit is a generic
// unfilled template (blanket "✅ Checked and updated in the sheet" with no
// real findings), not actual audit data, which was skewing the ranking.
const RANKING_EXCLUDED_BRANCHES = ['OIS Majestic'];

function RankingTab({ branches, zoneLabel }) {
  const targets = useMemo(() =>
    branches.filter(b => b.scorecardSheetId && !RANKING_EXCLUDED_BRANCHES.includes(b.name)),
  [branches]);
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
        let scores = {};
        try {
          const rows = await fetchScorecardRows(b);
          scores = computePointerScores(rows, b);
        } catch { /* Master Scorecard unavailable — Overall Audit may still fill in below */ }
        try {
          const oaRows = await fetchOverallAuditRows(b);
          if (oaRows) scores = { ...scores, ...computeOverallAuditScores(oaRows, b) };
        } catch { /* Overall Audit unavailable — keep Master Scorecard scores as-is */ }
        results[b.name] = scores;
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
        <p>Each pointer is scored 0–10 from ratios and rules read off its Master Scorecard (see the <span className="font-medium text-gray-700">Scoring Criteria</span> tab for the exact formula per pointer). Ranked by High Priority average, highest first. <span className="text-gray-400">Click any score to edit it — </span><span className="text-indigo-500">●</span><span className="text-gray-400"> marks a manual override. Blank cells mean the sheet didn't state a clear total to compute from — fill them in by hand.</span></p>
        <div className="flex-shrink-0 flex items-center gap-2">
          <button onClick={() => exportRankingExcel(ranked, zoneLabel)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
            <Download size={13} /> Download Excel
          </button>
          {hasOverrides && (
            <button onClick={() => setOverrides({})}
              className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 whitespace-nowrap">
              Reset all overrides
            </button>
          )}
        </div>
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

function CriteriaBlock({ tone, title, items }) {
  const heading = tone === 'high' ? 'text-indigo-900' : 'text-teal-900';
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className={`font-semibold text-base mb-3 ${heading}`}>{title}</h3>
      <ol className="space-y-3 list-decimal list-inside marker:font-semibold marker:text-gray-400">
        {items.map(({ label, rule, example }) => (
          <li key={label} className="text-sm text-gray-700">
            <span className="font-medium text-gray-900">{label}</span> — {rule}
            {example && <div className="text-xs text-gray-500 mt-0.5 pl-5">e.g. {example}</div>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ScoringCriteriaTab() {
  return (
    <div className="space-y-4">
      <CriteriaBlock tone="high" title="High Priority (averaged together)" items={[
        { label: 'Teacher Allocation', rule: 'score = (count not matching the condition ÷ total) × 10.', example: '5 out of 20 not matching → 2.5 / 10.' },
        { label: 'Portion Completion', rule: 'score = (sections not matching ÷ total) × 10.', example: '4 out of 10 not matching → 4 / 10.' },
        { label: 'Notebook Correction', rule: 'score = (sections not matching ÷ total) × 10, minus an extra 0.5 if a pending item is more than ~1 month old.', example: '4 out of 10 → 4 / 10, or 3.5 / 10 if something has been pending since a month or more before the audit.' },
        { label: 'Workbook Correction', rule: 'same formula as Notebook Correction, including the 1-month pending penalty.' },
        { label: 'Substitution (Eduvate)', rule: '0 if the sheet says substitution was not done in Eduvate; otherwise scored from status (Done = 10, Partial = 5).' },
      ]} />
      <CriteriaBlock tone="second" title="2nd Priority (averaged separately)" items={[
        { label: 'Clicker Usage', rule: 'score = (grades matching ÷ total grades) × 10.', example: '4 out of 10 grades matching → 4 / 10.' },
        { label: 'Chat Reply', rule: 'score = (teams that replied ÷ total teams mentioned — PRM, SM, Transport, Finance, etc.) × 10.', example: '1 out of 5 teams replied → 2 / 10.' },
        { label: 'Student Mapping', rule: 'score = (sections not matching ÷ total) × 10.', example: '4 out of 10 not matching → 4 / 10.' },
      ]} />
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900">
        Where available, Portion Completion, Notebook Correction, Workbook Correction, Clicker Usage and Chat Reply are computed from the branch's <b>Overall Audit</b> tab by directly counting its per-grade/section/channel ✅ / ⚠ / 🔴 rows — a real numerator and denominator, not text parsed from a summary sentence. This takes priority over the Master Scorecard estimate below whenever that tab exists and is readable.
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
        Otherwise, ratios fall back to being read from the branch's Master Scorecard ("Count / Data" and "Key Finding" columns). Some rows don't state a clean count and total in either sheet — those are left blank in the Ranking tab rather than guessed. Click any blank (or any score) there to fill it in or correct it by hand.
      </div>
    </div>
  );
}

export default function BangaloreZone() {
  const [zoneKey, setZoneKey]   = useState(ZONES[0].key);
  const zone = ZONES.find(z => z.key === zoneKey);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [tagFilter, setTagFilter] = useState('all');
  const [search, setSearch]     = useState('');
  const [tab, setTab]           = useState('branches');

  const load = () => {
    setLoading(true); setError('');
    fetch(zoneSheetUrl(zone.gid))
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
      .then(text => setBranches(parseBranches(parseCSV(text))))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [zoneKey]); // eslint-disable-line

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

  return (
    <div className="space-y-4">
      {/* Zone selector */}
      <div className="flex flex-wrap items-center gap-2">
        {ZONES.map(z => (
          <button key={z.key} onClick={() => setZoneKey(z.key)}
            className={`px-3.5 py-1.5 text-sm font-medium rounded-full border transition-colors ${
              zoneKey === z.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}>
            {z.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full" />
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-xl text-red-700 text-sm">
          Failed to load: {error}
          <button onClick={load} className="ml-3 underline">Retry</button>
        </div>
      ) : (
      <div key={zoneKey} className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {[['branches', 'All Branches'], ['report', 'Audit Report'], ['ranking', 'Ranking'], ['criteria', 'Scoring Criteria']].map(([key, label]) => (
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
            <button onClick={() => exportBranchesExcel(filtered, zone.label)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              <Download size={13} /> Download Excel
            </button>
            <button onClick={load} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600">
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
      {tab === 'ranking' && <RankingTab branches={branches} zoneLabel={zone.label} />}
      {tab === 'criteria' && <ScoringCriteriaTab />}
      </div>
      )}
    </div>
  );
}
