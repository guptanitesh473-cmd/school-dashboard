import { useState } from 'react';

const W = 192;   // node card width
const G = 32;    // connector gap
const LO = W + G; // left offset (M&A box + connector)

const PS = {
  M: { numBg:'#e2e8f0', numColor:'#475569', lblColor:'#64748b', bg:'#f8fafc', border:'#cbd5e1' },
  A: { numBg:'#cffafe', numColor:'#0e7490', lblColor:'#0e7490', bg:'#ecfeff', border:'#a5f3fc' },
  B: { numBg:'#dcfce7', numColor:'#15803d', lblColor:'#16a34a', bg:'#f0fdf4', border:'#bbf7d0' },
  C: { numBg:'#e0e7ff', numColor:'#4338ca', lblColor:'#4f46e5', bg:'#eef2ff', border:'#c7d2fe' },
  D: { numBg:'#ede9fe', numColor:'#7c3aed', lblColor:'#7c3aed', bg:'#f5f3ff', border:'#ddd6fe' },
};

const CHIPS = {
  A: { label:'2.1 — SCHOOL VISIT',  bg:'#cffafe', color:'#0e7490', icon:'🏫' },
  B: { label:'2.2 — PROCUREMENT',   bg:'#dcfce7', color:'#15803d', icon:'📦' },
  C: { label:'2.3 — LEGAL',         bg:'#e0e7ff', color:'#4338ca', icon:'⚖️' },
  D: { label:'2.4 — BRANCH',        bg:'#ede9fe', color:'#7c3aed', icon:'🌿' },
};

const STEPS = [
  { id:'s1',  num:'01',  path:'M', lbl:'Step 1 · Acads',         title:'Stakeholder Introduction',        dept:'Academic Expansion',      sub:'Central Academic Impl.',     spocs:['SPOC Name 1','SPOC Name 2'], after:[] },
  { id:'s2a', num:'2.1', path:'A', lbl:'Step 2.1 · Acads',       title:'School Visit & Assessment',       dept:'Academic Expansion',      sub:'School Operations',          spocs:['SPOC Name 1','SPOC Name 2'], after:['s1'] },
  { id:'s2b', num:'2.2', path:'B', lbl:'Step 2.2 · Procurement', title:'Books & Uniform Procurement',     dept:'Procurement Dept.',       sub:'Central Procurement',        spocs:['SPOC Name 1','SPOC Name 2'], after:['s1'] },
  { id:'s2c', num:'2.3', path:'C', lbl:'Step 2.3 · Legal',       title:'Legal – Name Change',             dept:'Legal Team',              sub:'Compliance & Registrations', spocs:['SPOC Name 1','SPOC Name 2'], after:['s1'] },
  { id:'s2d', num:'2.4', path:'D', lbl:'Step 2.4 · Branch',      title:'Branch Onboarding',               dept:'Branch Operations',       sub:'Academic Config.',           spocs:['SPOC Name 1','SPOC Name 2'], after:['s1'] },
  { id:'s3',  num:'03',  path:'A', lbl:'Step 3 · Data',           title:'Data Preparation',                dept:'Finance & Data',          sub:'Central Data Mgmt.',         spocs:['SPOC Name 1','SPOC Name 2'], after:['s2a','s2b','s2c','s2d'] },
  { id:'s4',  num:'04',  path:'A', lbl:'Step 4 · Parents',        title:'Parents Orientation',             dept:'Parent Relations',        sub:'Community Engagement',       spocs:['SPOC Name 1','SPOC Name 2'], after:['s3'] },
  { id:'s5',  num:'05',  path:'A', lbl:'Step 5 · Feedback',       title:'Survey Form',                     dept:'Quality & Feedback',      sub:'Central Quality Team',       spocs:['SPOC Name 1','SPOC Name 2'], after:['s4'] },
  { id:'s7',  num:'07',  path:'D', lbl:'Step 7 · Acads',          title:'Student Onboarding',              dept:'Academic Expansion',      sub:'Student Onboarding',         spocs:['SPOC Name 1','SPOC Name 2'], after:['s2d'] },
  { id:'s8',  num:'08',  path:'A', lbl:'Step 8 · Acads',          title:'Teacher 1-on-1 & Final List',     dept:'Academic Expansion',      sub:'Teacher Engagement',         spocs:['SPOC Name 1','SPOC Name 2'], after:['s5'] },
  { id:'s9',  num:'09',  path:'C', lbl:'Step 9 · Marketing',      title:'Marketing – Print & Digital',     dept:'Marketing Department',    sub:'Brand & Digital Team',       spocs:['SPOC Name 1','SPOC Name 2'], after:['s2c'] },
  { id:'s10', num:'10',  path:'C', lbl:'Step 10 · HR',            title:'Sales & Admin Hiring',            dept:'HR & Talent Acquisition', sub:'Sales & Admin Hiring',       spocs:['SPOC Name 1','SPOC Name 2'], after:['s9'] },
  { id:'s12', num:'12',  path:'D', lbl:'Step 12 · HR',            title:'Staff Onboarding',                dept:'HR Department',           sub:'Staff Onboarding',           spocs:['SPOC Name 1','SPOC Name 2'], after:['s7'] },
  { id:'s13', num:'13',  path:'A', lbl:'Step 13 · Admin',         title:'Inventory List',                  dept:'Administration',          sub:'Inventory & Assets',         spocs:['SPOC Name 1','SPOC Name 2'], after:['s8'] },
  { id:'s14', num:'14',  path:'A', lbl:'Step 14 · Projects',      title:'Project & Infra Finalisation',    dept:'Projects & Infra',        sub:'Project Planning',           spocs:['SPOC Name 1','SPOC Name 2'], after:['s13'] },
  { id:'s15', num:'15',  path:'B', lbl:'Step 15 · Procurement',   title:'Teacher Books & Sample Uniform',  dept:'Academic Expansion',      sub:'Procurement Coord.',         spocs:['SPOC Name 1','SPOC Name 2'], after:['s2b'] },
  { id:'s16', num:'16',  path:'A', lbl:'Step 16 · Acads',         title:'BLA Exam',                        dept:'Academic Expansion',      sub:'Assessment & Evaluation',    spocs:['SPOC Name 1','SPOC Name 2'], after:['s14'] },
  { id:'s17', num:'17',  path:'A', lbl:'Step 17 · CRM',           title:'Retention Project',               dept:'Academic & CRM',          sub:'Retention Cell',             spocs:['SPOC Name 1','SPOC Name 2'], after:['s16'] },
  { id:'s18', num:'18',  path:'D', lbl:'Step 18 · Finance',       title:'Fee Mapping & Promotion',         dept:'Finance & Marketing',     sub:'Fee Planning',               spocs:['SPOC Name 1','SPOC Name 2'], after:['s12'] },
  { id:'s20', num:'20',  path:'A', lbl:'Step 20 · HR / TA',       title:'Teacher Hiring',                  dept:'HR – Talent Acquisition', sub:'Teacher Recruitment',        spocs:['SPOC Name 1','SPOC Name 2'], after:['s17','s18'] },
  { id:'s21', num:'21',  path:'A', lbl:'Step 21 · Ops',           title:'Template Finalisation & Sharing', dept:'Operations',              sub:'Template & Process',         spocs:['SPOC Name 1','SPOC Name 2'], after:['s20'] },
  { id:'s22', num:'22',  path:'B', lbl:'Step 22 · Procurement',   title:'Clicker & Inventory Tagging',     dept:'Procurement & IT',        sub:'Asset Tagging',              spocs:['SPOC Name 1','SPOC Name 2'], after:['s15'] },
  { id:'s23', num:'23',  path:'A', lbl:'Step 23 · Acads',         title:'Bridge Course',                   dept:'Academic Expansion',      sub:'Curriculum & Delivery',      spocs:['SPOC Name 1','SPOC Name 2'], after:['s21'] },
  { id:'s24', num:'24',  path:'A', lbl:'Step 24 · Acads',         title:'Subject Training',                dept:'Academic Expansion',      sub:'Training & Development',     spocs:['SPOC Name 1','SPOC Name 2'], after:['s23'] },
  { id:'s25', num:'25',  path:'A', lbl:'Step 25 · All Depts',     title:'Preparation for 1st Day Opening', dept:'All Departments',         sub:'Central Coordination',       spocs:['SPOC Name 1','SPOC Name 2'], after:['s24'] },
];

const TOTAL = STEPS.length;

// ── Sub-components (defined outside to avoid reconciliation issues) ────────────

function FlowNode({ step, isDone, locked, onToggle }) {
  const ps = PS[step.path];
  const ini = n => n.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div
      style={{
        width: W, flexShrink: 0,
        background: isDone ? '#f0fdf4' : ps.bg,
        border: `1.5px solid ${isDone ? '#86efac' : ps.border}`,
        opacity: locked ? 0.35 : 1,
        pointerEvents: locked ? 'none' : 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        borderRadius: 10, padding: '12px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
    >
      {/* Head */}
      <div style={{ display:'flex', alignItems:'flex-start', gap: 8 }}>
        <div style={{
          flexShrink: 0, width: 26, height: 26, borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, fontWeight: 700,
          background: ps.numBg, color: isDone ? '#16a34a' : ps.numColor,
        }}>
          {isDone ? '✓' : step.num}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2, color: isDone ? '#16a34a' : ps.lblColor }}>
            {step.lbl}
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3, color: isDone ? '#15803d' : '#1a1814' }}>
            {step.title}
          </div>
        </div>
        {/* Toggle */}
        <div
          onClick={() => onToggle(step.id)}
          style={{
            flexShrink: 0, marginTop: 2, cursor: 'pointer',
            position: 'relative', width: 34, height: 18, borderRadius: 99,
            background: isDone ? '#16a34a' : '#d1cfc9',
            transition: 'background .3s',
          }}
        >
          <div style={{
            position: 'absolute', width: 12, height: 12, borderRadius: '50%',
            background: '#fff', top: 3, transition: 'transform .3s',
            transform: `translateX(${isDone ? 17 : 3}px)`,
            boxShadow: '0 1px 2px rgba(0,0,0,.2)',
          }} />
        </div>
      </div>

      {/* Meta */}
      <div style={{ borderTop: `1px solid ${isDone ? '#bbf7d0' : '#dddbd5'}`, paddingTop: 7, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div>
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f' }}>Department</div>
          <div style={{ fontSize: 10, color: isDone ? '#15803d' : '#5a5750', lineHeight: 1.3, marginTop: 1 }}>
            {step.dept} · {step.sub}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#a0998f' }}>SPOC</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 2 }}>
            {step.spocs.map(name => (
              <span key={name} style={{
                display: 'inline-flex', alignItems: 'center', gap: 3,
                padding: '1px 6px 1px 2px', borderRadius: 99,
                background: isDone ? '#dcfce7' : '#f1f0ed',
                fontSize: 9, color: isDone ? '#15803d' : '#5a5750',
              }}>
                <span style={{
                  width: 13, height: 13, borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 7, fontWeight: 700, color: '#fff',
                  background: ps.numColor, flexShrink: 0,
                }}>
                  {ini(name)}
                </span>
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HConn({ on }) {
  return (
    <div style={{ width: G, flexShrink: 0, display: 'flex', alignItems: 'center', height: 26 }}>
      <div style={{ flex: 1, height: 2, borderRadius: 99, background: on ? '#16a34a' : '#d1cfc9', transition: 'background .3s' }} />
    </div>
  );
}

function VConn({ on, width = W }) {
  return (
    <div style={{ width, flexShrink: 0, height: 28, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: 2, height: '100%', borderRadius: 99, background: on ? '#16a34a' : '#d1cfc9', transition: 'background .3s' }} />
    </div>
  );
}

function Sp({ w }) {
  return <div style={{ width: w, flexShrink: 0 }} />;
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function OnboardingProgress() {
  const [done, setDone] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('onboarding_done') || '[]')); }
    catch { return new Set(); }
  });

  function toggle(id) {
    setDone(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem('onboarding_done', JSON.stringify([...next]));
      return next;
    });
  }

  const isUnlocked = step => step.after.every(id => done.has(id));
  const get = id => STEPS.find(s => s.id === id);

  // Shorthand: render a node cell, optionally with a note label above
  const N = (id, note) => {
    const step = get(id);
    const locked = !isUnlocked(step);
    return (
      <div style={{ flexShrink: 0 }}>
        {note && (
          <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 4 }}>
            ↑ {note}
          </div>
        )}
        <FlowNode
          step={step}
          isDone={done.has(id)}
          locked={locked}
          onToggle={id => !locked && toggle(id)}
        />
      </div>
    );
  };

  const doneCount = done.size;
  const pct = Math.round((doneCount / TOTAL) * 100);
  const mergeAll4 = done.has('s2a') && done.has('s2b') && done.has('s2c') && done.has('s2d');
  const mergeS20  = done.has('s17') && done.has('s18');
  const midChain  = ['s13', 's14', 's16', 's17'];
  const tail      = ['s21', 's23', 's24', 's25'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ background: '#f4f2ee', borderRadius: 16, border: '1px solid #dddbd5', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'system-ui,sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: '#1a1814', margin: 0 }}>
            School Onboarding Tracker
          </h1>
          <p style={{ fontSize: 12, color: '#5a5750', marginTop: 2, marginBottom: 0 }}>
            M&amp;A handover → full school operational readiness
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 160, height: 6, background: '#dddbd5', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: '#16a34a', borderRadius: 99, transition: 'width .5s ease' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#16a34a', whiteSpace: 'nowrap' }}>
            {doneCount} / {TOTAL}
          </span>
        </div>
      </div>

      {/* ── Flow canvas ──────────────────────────────────────────────────────── */}
      <div style={{ overflowX: 'auto', background: '#f4f2ee', borderRadius: 16, border: '1px solid #dddbd5' }}>
        <div style={{ padding: '32px 32px 40px', minWidth: 'max-content', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Section label */}
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a0998f', marginBottom: 16 }}>
            M&amp;A Handover → Your Department
          </div>

          {/* ROW 0: Handover box → s1 */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: W, flexShrink: 0, borderRadius: 10,
              background: 'linear-gradient(135deg,#1e293b,#0f172a)',
              border: '1.5px solid #334155', padding: '12px 14px',
              boxShadow: '0 2px 8px rgba(0,0,0,.15)',
            }}>
              <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8' }}>M&amp;A Team</div>
              <div style={{ fontFamily: 'system-ui,sans-serif', fontSize: 11, fontWeight: 700, color: '#f1f5f9', marginTop: 3 }}>
                Paper Signing Complete
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 6,
                fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 99,
                background: 'rgba(34,197,94,.2)', color: '#4ade80',
              }}>
                ✓ Handover Done
              </div>
            </div>
            <HConn on={true} />
            {N('s1')}
          </div>

          {/* V from s1 */}
          <div style={{ display: 'flex' }}><Sp w={LO} /><VConn on={done.has('s1')} /></div>

          {/* Path chips */}
          <div style={{ display: 'flex' }}>
            <Sp w={LO} />
            {['A', 'B', 'C', 'D'].map((p, i) => (
              <div key={p} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <Sp w={G} />}
                <div style={{
                  width: W, flexShrink: 0, fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '4px 10px', borderRadius: 6, marginBottom: 6,
                  background: CHIPS[p].bg, color: CHIPS[p].color,
                }}>
                  {CHIPS[p].icon} {CHIPS[p].label}
                </div>
              </div>
            ))}
          </div>

          {/* ROW 1: 4 parallel paths */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Sp w={LO} />
            {N('s2a')}
            <HConn on={done.has('s2a')} />
            {N('s2b')}
            <HConn on={done.has('s2b')} />
            {N('s2c')}
            <HConn on={done.has('s2c')} />
            {N('s2d')}
          </div>

          {/* V × 4 */}
          <div style={{ display: 'flex' }}>
            <Sp w={LO} />
            <VConn on={mergeAll4} />
            <Sp w={G} /><VConn on={done.has('s2b')} />
            <Sp w={G} /><VConn on={done.has('s2c')} />
            <Sp w={G} /><VConn on={done.has('s2d')} />
          </div>

          {/* ROW 2: s3 | s15 | s9 | s7 */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Sp w={LO} />
            {N('s3', 'waits for all 4')}
            <Sp w={G} />{N('s15')}
            <Sp w={G} />{N('s9')}
            <Sp w={G} />{N('s7')}
          </div>

          {/* V × 4 */}
          <div style={{ display: 'flex' }}>
            <Sp w={LO} />
            <VConn on={done.has('s3')} />
            <Sp w={G} /><VConn on={done.has('s15')} />
            <Sp w={G} /><VConn on={done.has('s9')} />
            <Sp w={G} /><VConn on={done.has('s7')} />
          </div>

          {/* ROW 3: s4 | s22 | s10 | s12 */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Sp w={LO} />
            {N('s4')}
            <Sp w={G} />{N('s22')}
            <Sp w={G} />{N('s10')}
            <Sp w={G} />{N('s12')}
          </div>

          {/* V: col0→s5, col3→s18 */}
          <div style={{ display: 'flex' }}>
            <Sp w={LO} />
            <VConn on={done.has('s4')} />
            <Sp w={G + W + G + W + G} />
            <VConn on={done.has('s12')} />
          </div>

          {/* ROW 4: s5 | _ | _ | s18 */}
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <Sp w={LO} />
            {N('s5')}
            <Sp w={G + W + G + W + G} />
            {N('s18')}
          </div>

          {/* V: s5→s8, s18(+s17)→s20 */}
          <div style={{ display: 'flex' }}>
            <Sp w={LO} />
            <VConn on={done.has('s5')} />
            <Sp w={G + W + G + W + G} />
            <VConn on={mergeS20} />
          </div>

          {/* s8 */}
          <div style={{ display: 'flex' }}><Sp w={LO} />{N('s8')}</div>

          {/* mid-chain: s13 → s14 → s16 → s17 */}
          {midChain.map((id, i) => (
            <div key={id}>
              <div style={{ display: 'flex' }}>
                <Sp w={LO} />
                <VConn on={done.has(i === 0 ? 's8' : midChain[i - 1])} />
              </div>
              <div style={{ display: 'flex' }}><Sp w={LO} />{N(id)}</div>
            </div>
          ))}

          {/* V: s17 + s18 → s20 */}
          <div style={{ display: 'flex' }}><Sp w={LO} /><VConn on={mergeS20} /></div>

          {/* s20 — waits for s17 + s18 */}
          <div style={{ display: 'flex' }}><Sp w={LO} />{N('s20', 'waits for s17 + s18')}</div>

          {/* tail: s21 → s23 → s24 → s25 */}
          {tail.map((id, i) => (
            <div key={id}>
              <div style={{ display: 'flex' }}>
                <Sp w={LO} />
                <VConn on={done.has(i === 0 ? 's20' : tail[i - 1])} />
              </div>
              <div style={{ display: 'flex' }}><Sp w={LO} />{N(id)}</div>
            </div>
          ))}

          {/* Footer */}
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#a0998f' }}>{TOTAL - doneCount} steps remaining</span>
            {doneCount > 0 && (
              <button
                onClick={() => { setDone(new Set()); localStorage.removeItem('onboarding_done'); }}
                style={{
                  background: '#fff', border: '1px solid #dddbd5', color: '#5a5750',
                  fontFamily: 'inherit', fontSize: 12, padding: '7px 18px',
                  borderRadius: 8, cursor: 'pointer',
                }}
                onMouseOver={e => { e.target.style.color = '#1a1814'; e.target.style.borderColor = '#a0998f'; }}
                onMouseOut={e => { e.target.style.color = '#5a5750'; e.target.style.borderColor = '#dddbd5'; }}
              >
                Reset &amp; start over
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
