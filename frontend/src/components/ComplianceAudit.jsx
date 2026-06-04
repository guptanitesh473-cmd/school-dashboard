import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const SECTIONS = [
  {n:1,title:'Class observation',goal:'Classroom infrastructure, inventory, session delivery and notebook corrections.',items:[
    ['Health check – infrastructure and classroom condition','branch'],
    ['Inventory check – count and functionality','both'],
    ['Session delivery – methodology, engagement, lesson delivery','branch'],
    ['Notebook correction – completion, corrections, teacher signature','branch'],
  ]},
  {n:2,title:'Test audit',goal:'Test processes, marking quality and weekly test schedule compliance.',items:[
    ['Collect answer bundles from all classes','branch'],
    ['Check principal and coordinator audit compliance','both'],
    ['Cross-verify marks against uploaded sheet','both'],
    ['Check weekly test conducted date and schedule','both'],
  ]},
  {n:3,title:'Lab audit',goal:'Lab infrastructure, inventory, LP usage and teacher training status.',items:[
    ['Health check – infrastructure and arrangement','branch'],
    ['Inventory check – quantity and condition','both'],
    ['LP assigning and use check','both'],
    ['Teachers training status check','both'],
  ]},
  {n:4,title:'Student insights (tutor test data)',goal:'Identify and address student performance gaps.',items:[
    ['Identify underperforming grades from tutor test data','backend'],
    ['Talk to students from those grades individually','branch'],
    ['Probe and document real reasons behind performance gaps','branch'],
  ]},
  {n:5,title:'Timetable cross-check',goal:'Timetable accuracy, coverage and alignment with academic calendar.',items:[
    ['Verify timetable accuracy for all classes','both'],
    ['Confirm alignment with academic calendar and events','both'],
    ['Academic calendar – update upcoming events','backend'],
    ['Check remedial class timetable','both'],
    ['Check remedial session students list and cross-check with NS list','both'],
  ]},
  {n:6,title:'Eduvate data check',goal:'Platform data completeness and compliance.',items:[
    ['Clicker mapping – session and class mapping accuracy','both'],
    ['Substitution entries – accuracy and timeliness','backend'],
    ['Students attendance by clicker – completeness and sync','both'],
    ['Feedback submission data and feedback calls – logged and completed','backend'],
    ['Chat replies – response time and quality','backend'],
    ['LP completion – lesson plan upload status','both'],
  ]},
  {n:7,title:'Coordinator KPI checks',goal:'Coordinator performance against defined KPIs.',items:[
    ['Review KPI list for each coordinator','backend'],
    ['Verify target vs actual performance metrics','backend'],
    ['Flag gaps and prepare follow-up actions','both'],
  ]},
  {n:8,title:'Teacher utilisation',goal:'Confirm all teachers are productively engaged.',items:[
    ['Check utilisation for all regular teachers','both'],
    ['Identify free periods – confirm productive use','both'],
    ['Section strength random check – count vs register','branch'],
  ]},
  {n:9,title:'Resource hiring and training status',goal:'Open positions, ageing of MRFs and training compliance for new teachers.',items:[
    ['Open MRF – review all open manpower requisition forms','both'],
    ['Ageing of MRF – track how long positions have been open','backend'],
    ['Training of newly joined teachers – completion and status check','both'],
  ]},
  {n:10,title:'PTM schedule, attendance and feedback tracker',goal:'PTM sessions scheduled, attended and feedback captured.',items:[
    ['PTM schedule – dates, slots detail and communication tracker','both'],
    ['PTM attendance tracker – parent and teacher attendance records','both'],
    ['Feedback forms and tracker cross-check – forms collected and logged','both'],
  ]},
  {n:11,title:'Sports infra and inventory check',goal:'Sports infrastructure condition and inventory availability.',items:[
    ['Health check – sports infrastructure condition and arrangement','branch'],
    ['Sports inventory – quantity and condition check','branch'],
  ]},
];

const WHERE = {
  branch:  {label:'In branch',       bg:'#fff8e6',color:'#7b5800',dot:'#f0c040'},
  backend: {label:'Backend/Eduvate', bg:'#e8f6ee',color:'#1a5c36',dot:'#52c27a'},
  both:    {label:'Both',            bg:'#ede9fb',color:'#3d2a8a',dot:'#9b85e0'},
};

const TA  = {width:'100%',border:'none',background:'transparent',fontSize:13,color:'#1e2d3d',resize:'none',minHeight:34,fontFamily:'inherit'};
const IN  = {border:'none',background:'transparent',fontSize:13,color:'#1e2d3d',fontFamily:'inherit',width:'100%'};
const DT  = {width:'100%',border:'1px solid #dce8f4',borderRadius:5,fontSize:12,padding:'3px 6px',background:'#fff',color:'#6b7f95',fontFamily:'inherit'};
const SEL = {width:'100%',border:'1px solid #dce8f4',borderRadius:5,fontSize:12,padding:'3px 6px',background:'#fff',fontFamily:'inherit'};

const statusColor = s => s==='open'?'#d85a30':s==='wip'?'#ba7517':s==='done'?'#3b6d11':'#6b7f95';

const INIT_ACTIONS = Array(3).fill(null).map(() => ({action:'',responsible:'',deadline:'',status:''}));

export default function ComplianceAudit() {
  const [meta, setMeta] = useState({
    school:'', branch:'', auditor:'',
    date: new Date().toISOString().split('T')[0],
    academic_year:'', coordinator:'',
  });
  const [checked,   setChecked]   = useState({});
  const [cells,     setCells]     = useState({});
  const [secNotes,  setSecNotes]  = useState({});
  const [openSecs,  setOpenSecs]  = useState({0:true});
  const [actions,   setActions]   = useState(INIT_ACTIONS);
  const [obs,       setObs]       = useState('');

  const total = SECTIONS.reduce((a,s) => a + s.items.length, 0);
  const done  = Object.values(checked).filter(Boolean).length;
  const pct   = total ? Math.round(done/total*100) : 0;

  const countBy = (type) => SECTIONS.reduce((a,s) => a + s.items.filter(([,w])=>w===type).length, 0);
  const k   = (si,ii) => `${si}-${ii}`;
  const gc  = (si,ii,f) => cells[k(si,ii)]?.[f] ?? '';
  const sc  = (si,ii,f) => v => setCells(p => ({...p, [k(si,ii)]: {...(p[k(si,ii)]||{}), [f]:v}}));
  const secDone = si => SECTIONS[si].items.filter((_,ii) => checked[k(si,ii)]).length;

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",color:'#1e2d3d',fontSize:14,lineHeight:1.6}}>
      <style>{`
        @media print {
          .ca-no-print { display:none!important; }
          .ca-sec-body { display:block!important; }
          body { background:#fff; }
        }
        .ca-input, .ca-ta, .ca-sel { font-family:inherit; }
        .ca-input:focus, .ca-ta:focus, .ca-sel:focus { outline:none; }
        .ca-cbk { width:17px;height:17px;cursor:pointer;accent-color:#2e6fba; }
        .ca-row:hover td { background:rgba(247,250,253,0.8); }
        .ca-row-done td { opacity:0.45; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{background:'#1a2f4e',borderRadius:14,padding:'28px 36px 24px',marginBottom:18,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:220,height:220,borderRadius:'50%',background:'rgba(255,255,255,0.04)'}} />
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:20,position:'relative'}}>
          <div>
            <div style={{fontSize:22,fontWeight:600,color:'#fff',letterSpacing:'-0.3px'}}>School audit & compliance dashboard</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.55)',marginTop:4}}>Overall agenda: ensure 80% product implementation</div>
          </div>
          <div style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.18)',borderRadius:10,padding:'10px 20px',textAlign:'center',flexShrink:0}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.45)',textTransform:'uppercase',letterSpacing:1}}>Target</div>
            <div style={{fontSize:22,fontWeight:600,color:'#fff'}}>80%</div>
          </div>
        </div>
        <div style={{display:'flex',gap:24,flexWrap:'wrap',marginTop:22,paddingTop:18,borderTop:'1px solid rgba(255,255,255,0.1)',position:'relative'}}>
          {[
            {l:'School',n:'school',ph:'School name'},
            {l:'Branch / location',n:'branch',ph:'Branch'},
            {l:'Auditor',n:'auditor',ph:'Auditor name'},
            {l:'Audit date',n:'date',ph:'',type:'date'},
            {l:'Academic year',n:'academic_year',ph:'e.g. 2024-25'},
            {l:'Coordinator present',n:'coordinator',ph:'Yes / No'},
          ].map(({l,n,ph,type}) => (
            <div key={n} style={{display:'flex',flexDirection:'column',gap:3}}>
              <span style={{fontSize:10,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:.7}}>{l}</span>
              <input
                className="ca-input"
                name={n} value={meta[n]} type={type||'text'} placeholder={ph}
                onChange={e => setMeta(p => ({...p,[n]:e.target.value}))}
                style={{background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,0.2)',
                  color:'rgba(255,255,255,0.85)',fontSize:13,fontWeight:500,width:140,padding:'2px 0',colorScheme:'dark'}}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI row 1 ──────────────────────────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:12}}>
        {[
          {l:'Total items',  v:total,      sub:'across 11 sections',c:'#1e2d3d'},
          {l:'Completed',    v:done,        sub:'items checked',    c:'#3b6d11'},
          {l:'Pending',      v:total-done,  sub:'items remaining',  c:'#a32d2d'},
          {l:'Compliance',   v:pct+'%',     sub:'target: 80%',      c:pct>=80?'#3b6d11':'#a32d2d'},
        ].map(({l,v,sub,c}) => (
          <div key={l} style={{background:'#fff',borderRadius:10,padding:'14px 18px',border:'1px solid #dce8f4'}}>
            <div style={{fontSize:12,color:'#6b7f95',marginBottom:5}}>{l}</div>
            <div style={{fontSize:24,fontWeight:600,color:c,fontFamily:'monospace'}}>{v}</div>
            <div style={{fontSize:11,color:'#99afc4',marginTop:2}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── KPI row 2 ──────────────────────────────────────────────────── */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:14}}>
        {[
          {l:'In branch',       v:countBy('branch'),  sub:'on-site verification required', bl:'#f0c040',c:'#7b5800'},
          {l:'Both',            v:countBy('both'),    sub:'system + on-site check',        bl:'#9b85e0',c:'#3d2a8a'},
          {l:'Backend/Eduvate', v:countBy('backend'), sub:'data available in system',      bl:'#52c27a',c:'#1a5c36'},
        ].map(({l,v,sub,bl,c}) => (
          <div key={l} style={{background:'#fff',borderRadius:10,padding:'14px 18px',border:'1px solid #dce8f4',borderLeft:`3px solid ${bl}`}}>
            <div style={{fontSize:12,color:'#6b7f95',marginBottom:5}}>{l}</div>
            <div style={{fontSize:24,fontWeight:600,color:c,fontFamily:'monospace'}}>{v}</div>
            <div style={{fontSize:11,color:'#99afc4',marginTop:2}}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── Progress bar ───────────────────────────────────────────────── */}
      <div style={{display:'flex',alignItems:'center',gap:12,background:'#fff',borderRadius:10,padding:'14px 20px',marginBottom:14,border:'1px solid #dce8f4'}}>
        <span style={{fontSize:13,color:'#6b7f95',whiteSpace:'nowrap'}}>Overall compliance</span>
        <div style={{flex:1,height:8,background:'#e8f0fb',borderRadius:4,overflow:'hidden'}}>
          <div style={{width:`${pct}%`,height:'100%',background:pct>=80?'#3b6d11':'#2e6fba',borderRadius:4,transition:'width .4s'}} />
        </div>
        <span style={{fontSize:14,fontWeight:600,color:'#1e2d3d',fontFamily:'monospace',minWidth:42,textAlign:'right'}}>{pct}%</span>
      </div>

      {/* ── Legend ─────────────────────────────────────────────────────── */}
      <div style={{display:'flex',flexWrap:'wrap',gap:10,marginBottom:16,alignItems:'center'}}>
        {Object.entries(WHERE).map(([wk,w]) => (
          <span key={wk} style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 13px',borderRadius:20,fontSize:12,fontWeight:500,border:'1px solid',background:w.bg,color:w.color,borderColor:w.dot}}>
            <span style={{width:7,height:7,borderRadius:'50%',background:w.dot,flexShrink:0}} />
            {w.label}
          </span>
        ))}
        <span style={{fontSize:12,color:'#6b7f95',marginLeft:4}}>
          Column tints: <span style={{color:'#1a5c36',fontWeight:600}}>▪</span> Central action &nbsp;
          <span style={{color:'#7a4e00',fontWeight:600}}>▪</span> Branch action &nbsp;
          <span style={{color:'#085041',fontWeight:600}}>▪</span> Central follow-up &nbsp;
          <span style={{color:'#7b5800',fontWeight:600}}>▪</span> Branch follow-up
        </span>
      </div>

      {/* ── Sections ───────────────────────────────────────────────────── */}
      {SECTIONS.map((sec, si) => {
        const isOpen = !!openSecs[si];
        const sd = secDone(si);
        return (
          <div key={si} style={{background:'#fff',borderRadius:12,border:'1px solid #dce8f4',marginBottom:10,overflow:'hidden'}}>
            {/* Header */}
            <div onClick={() => setOpenSecs(p => ({...p,[si]:!p[si]}))}
              style={{display:'flex',alignItems:'center',gap:12,padding:'12px 18px',background:'#f5f8fd',cursor:'pointer',borderBottom:'1px solid #dce8f4',userSelect:'none'}}>
              <div style={{width:28,height:28,borderRadius:7,background:'#1a2f4e',color:'#fff',fontSize:12,fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                {sec.n}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:14,fontWeight:600,color:'#1a2f4e'}}>{sec.title}</div>
                <div style={{fontSize:12,color:'#6b7f95',marginTop:1}}>{sec.goal}</div>
              </div>
              <span style={{fontSize:12,fontWeight:600,padding:'3px 10px',borderRadius:12,background:'#e8f0fb',color:'#2e6fba',fontFamily:'monospace',flexShrink:0}}>
                {sd}/{sec.items.length}
              </span>
              <ChevronDown size={14} color="#99afc4" style={{flexShrink:0,transform:isOpen?'rotate(180deg)':'none',transition:'transform .2s'}} />
            </div>

            {/* Body */}
            {isOpen && (
              <div className="ca-sec-body">
                <div style={{overflowX:'auto'}}>
                  <table style={{width:'100%',borderCollapse:'collapse',minWidth:1320}}>
                    <thead>
                      <tr style={{fontSize:11,fontWeight:600,borderBottom:'2px solid #dce8f4'}}>
                        {[
                          {l:'Checklist item',            bg:'#f5f8fd',c:'#2a4470',w:'15%'},
                          {l:'Done',                      bg:'#f5f8fd',c:'#2a4470',w:'4%',center:true},
                          {l:'Where',                     bg:'#f5f8fd',c:'#2a4470',w:'8%'},
                          {l:'Remark by auditor',         bg:'#f5f8fd',c:'#2a4470',w:'9%'},
                          {l:'Rec. action – central team',bg:'#dff0e8',c:'#1a5c36',w:'11%'},
                          {l:'Central SPOC',              bg:'#dff0e8',c:'#1a5c36',w:'7%'},
                          {l:'Rec. action – branch',      bg:'#fdf0cc',c:'#7a4e00',w:'11%'},
                          {l:'Branch SPOC',               bg:'#fdf0cc',c:'#7a4e00',w:'7%'},
                          {l:'Central follow-up remarks', bg:'#c8eedd',c:'#085041',w:'10%'},
                          {l:'TAT',                       bg:'#c8eedd',c:'#085041',w:'5%'},
                          {l:'Branch follow-up remarks',  bg:'#ffe8a0',c:'#7b5800',w:'10%'},
                          {l:'TAT',                       bg:'#ffe8a0',c:'#7b5800',w:'5%'},
                        ].map(({l,bg,c,w,center},i) => (
                          <th key={i} style={{padding:'9px 12px',textAlign:center?'center':'left',background:bg,color:c,width:w,whiteSpace:'nowrap'}}>{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.items.map(([label, where], ii) => {
                        const w   = WHERE[where];
                        const isDone = !!checked[k(si,ii)];
                        const g  = f => gc(si,ii,f);
                        const s  = f => v => sc(si,ii,f)(v);
                        return (
                          <tr key={ii} className={`ca-row${isDone?' ca-row-done':''}`} style={{borderBottom:'1px solid #eef3fb'}}>
                            <td style={{padding:'10px 12px',fontSize:13,verticalAlign:'top',textDecoration:isDone?'line-through':'none'}}>{label}</td>
                            <td style={{padding:'10px 12px',textAlign:'center',verticalAlign:'top'}}>
                              <input type="checkbox" className="ca-cbk" checked={isDone}
                                onChange={() => setChecked(p => ({...p,[k(si,ii)]:!p[k(si,ii)]}))} />
                            </td>
                            <td style={{padding:'10px 12px',verticalAlign:'top'}}>
                              <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:'3px 9px',borderRadius:10,fontSize:11.5,fontWeight:600,background:w.bg,color:w.color,whiteSpace:'nowrap'}}>
                                <span style={{width:6,height:6,borderRadius:'50%',background:w.dot,flexShrink:0}} />
                                {w.label}
                              </span>
                            </td>
                            {/* Auditor remark */}
                            <td style={{padding:'8px 10px',verticalAlign:'top'}}>
                              <textarea className="ca-ta" rows={2} placeholder="Auditor remark..." value={g('rem')}
                                onChange={e=>s('rem')(e.target.value)} style={TA} />
                            </td>
                            {/* Central action */}
                            <td style={{padding:'8px 10px',background:'rgba(234,243,222,0.35)',verticalAlign:'top'}}>
                              <textarea className="ca-ta" rows={2} placeholder="Central team action..." value={g('ca')}
                                onChange={e=>s('ca')(e.target.value)} style={{...TA,color:'#0c447c'}} />
                            </td>
                            {/* Central SPOC */}
                            <td style={{padding:'8px 10px',background:'rgba(234,243,222,0.35)',verticalAlign:'top'}}>
                              <input className="ca-input" placeholder="SPOC..." value={g('cs')}
                                onChange={e=>s('cs')(e.target.value)} style={{...IN,color:'#0c447c'}} />
                            </td>
                            {/* Branch action */}
                            <td style={{padding:'8px 10px',background:'rgba(250,238,218,0.35)',verticalAlign:'top'}}>
                              <textarea className="ca-ta" rows={2} placeholder="Branch action..." value={g('ba')}
                                onChange={e=>s('ba')(e.target.value)} style={{...TA,color:'#633806'}} />
                            </td>
                            {/* Branch SPOC */}
                            <td style={{padding:'8px 10px',background:'rgba(250,238,218,0.35)',verticalAlign:'top'}}>
                              <input className="ca-input" placeholder="SPOC..." value={g('bs')}
                                onChange={e=>s('bs')(e.target.value)} style={{...IN,color:'#633806'}} />
                            </td>
                            {/* Central follow-up */}
                            <td style={{padding:'8px 10px',background:'rgba(200,238,221,0.28)',verticalAlign:'top'}}>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                <input className="ca-input" placeholder="Central remarks..." value={g('fuc_r')}
                                  onChange={e=>s('fuc_r')(e.target.value)} style={IN} />
                                <input type="date" value={g('fuc_d')} onChange={e=>s('fuc_d')(e.target.value)} style={DT} />
                                <select className="ca-sel" value={g('fuc_s')} onChange={e=>s('fuc_s')(e.target.value)}
                                  style={{...SEL,color:statusColor(g('fuc_s'))}}>
                                  <option value="">— status —</option>
                                  <option value="open">Open</option>
                                  <option value="wip">In progress</option>
                                  <option value="done">Completed</option>
                                </select>
                              </div>
                            </td>
                            {/* Central TAT */}
                            <td style={{padding:'8px 10px',background:'rgba(200,238,221,0.28)',verticalAlign:'top'}}>
                              <input type="date" value={g('tat_c')} onChange={e=>s('tat_c')(e.target.value)} style={DT} />
                            </td>
                            {/* Branch follow-up */}
                            <td style={{padding:'8px 10px',background:'rgba(255,232,160,0.25)',verticalAlign:'top'}}>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                <input className="ca-input" placeholder="Branch remarks..." value={g('fub_r')}
                                  onChange={e=>s('fub_r')(e.target.value)} style={IN} />
                                <input type="date" value={g('fub_d')} onChange={e=>s('fub_d')(e.target.value)} style={DT} />
                                <select className="ca-sel" value={g('fub_s')} onChange={e=>s('fub_s')(e.target.value)}
                                  style={{...SEL,color:statusColor(g('fub_s'))}}>
                                  <option value="">— status —</option>
                                  <option value="open">Open</option>
                                  <option value="wip">In progress</option>
                                  <option value="done">Completed</option>
                                </select>
                              </div>
                            </td>
                            {/* Branch TAT */}
                            <td style={{padding:'8px 10px',background:'rgba(255,232,160,0.25)',verticalAlign:'top'}}>
                              <input type="date" value={g('tat_b')} onChange={e=>s('tat_b')(e.target.value)} style={DT} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Section notes */}
                <div style={{padding:'8px 16px',background:'#f9fbff',borderTop:'1px solid #eef3fb',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:11,fontWeight:600,color:'#99afc4',textTransform:'uppercase',letterSpacing:.5,whiteSpace:'nowrap'}}>Section notes</span>
                  <input className="ca-input" placeholder="Add notes for this section..."
                    value={secNotes[si]||''} onChange={e=>setSecNotes(p=>({...p,[si]:e.target.value}))}
                    style={{flex:1,border:'none',background:'transparent',fontSize:13,color:'#1e2d3d'}} />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* ── Audit summary ──────────────────────────────────────────────── */}
      <div style={{fontSize:11,fontWeight:600,color:'#6b7f95',textTransform:'uppercase',letterSpacing:.8,margin:'22px 0 10px'}}>Audit summary</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #dce8f4',padding:'20px 24px'}}>
          <h3 style={{fontSize:13,fontWeight:600,color:'#1a2f4e',marginBottom:14,paddingBottom:10,borderBottom:'2px solid #e8f0fb'}}>Compliance overview</h3>
          {[
            {k:'Total checklist items', v:total,     c:'#1e2d3d'},
            {k:'Completed (✓)',          v:done,      c:'#1e2d3d'},
            {k:'Pending (–)',            v:total-done,c:'#1e2d3d'},
            {k:'Compliance %',           v:pct+'%',   c:pct>=80?'#3b6d11':'#a32d2d'},
            {k:'80% target met?', v:total===0?'—':pct>=80?'✓ Yes':'✗ Not yet', c:total===0?'#6b7f95':pct>=80?'#3b6d11':'#a32d2d'},
          ].map(({k:lbl,v,c}) => (
            <div key={lbl} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'1px solid #eef3fb',fontSize:13}}>
              <span style={{color:'#6b7f95'}}>{lbl}</span>
              <span style={{fontFamily:'monospace',fontWeight:600,color:c}}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{background:'#fff',borderRadius:12,border:'1px solid #dce8f4',padding:'20px 24px'}}>
          <h3 style={{fontSize:13,fontWeight:600,color:'#1a2f4e',marginBottom:14,paddingBottom:10,borderBottom:'2px solid #e8f0fb'}}>Key observations</h3>
          <textarea className="ca-ta" placeholder="Write key observations here..." value={obs} onChange={e=>setObs(e.target.value)}
            style={{width:'100%',minHeight:120,border:'1px solid #dce8f4',borderRadius:7,padding:10,fontSize:13,color:'#1e2d3d',resize:'vertical',fontFamily:'inherit'}} />
        </div>
      </div>

      {/* ── Action items ───────────────────────────────────────────────── */}
      <div style={{background:'#fff',borderRadius:12,border:'1px solid #dce8f4',padding:'20px 24px',marginBottom:14}}>
        <h3 style={{fontSize:13,fontWeight:600,color:'#1a2f4e',marginBottom:14,paddingBottom:10,borderBottom:'2px solid #e8f0fb'}}>Action items & follow-ups</h3>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              {['Action item','Responsible person','TAT / deadline','Status'].map(h => (
                <th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:600,color:'#2a4470',background:'#f5f8fd',textAlign:'left',borderBottom:'2px solid #dce8f4'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {actions.map((a,i) => (
              <tr key={i} style={{borderBottom:'1px solid #eef3fb'}}>
                <td style={{padding:'8px 10px',width:'44%'}}>
                  <input className="ca-input" placeholder="Action item..." value={a.action}
                    onChange={e=>setActions(p=>p.map((r,j)=>j===i?{...r,action:e.target.value}:r))}
                    style={{...IN}} />
                </td>
                <td style={{padding:'8px 10px',width:'22%'}}>
                  <input className="ca-input" placeholder="Responsible person..." value={a.responsible}
                    onChange={e=>setActions(p=>p.map((r,j)=>j===i?{...r,responsible:e.target.value}:r))}
                    style={{...IN}} />
                </td>
                <td style={{padding:'8px 10px',width:'18%'}}>
                  <input type="date" value={a.deadline}
                    onChange={e=>setActions(p=>p.map((r,j)=>j===i?{...r,deadline:e.target.value}:r))}
                    style={{border:'none',background:'transparent',fontSize:12,color:'#6b7f95',fontFamily:'inherit'}} />
                </td>
                <td style={{padding:'8px 10px',width:'16%'}}>
                  <select className="ca-sel" value={a.status}
                    onChange={e=>setActions(p=>p.map((r,j)=>j===i?{...r,status:e.target.value}:r))}
                    style={{...SEL,color:statusColor(a.status)}}>
                    <option value="">— status —</option>
                    <option value="open">Open</option>
                    <option value="wip">In progress</option>
                    <option value="done">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setActions(p=>[...p,{action:'',responsible:'',deadline:'',status:''}])}
          style={{marginTop:10,padding:'6px 14px',fontSize:12,fontWeight:500,color:'#2e6fba',background:'#e8f0fb',border:'1px solid #b5d4f4',borderRadius:7,cursor:'pointer'}}>
          + Add row
        </button>
      </div>

      {/* ── Sign-off ───────────────────────────────────────────────────── */}
      <div style={{fontSize:11,fontWeight:600,color:'#6b7f95',textTransform:'uppercase',letterSpacing:.8,margin:'20px 0 10px'}}>Sign-off</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
        {['Auditor','School principal','Coordinator'].map(r => (
          <div key={r} style={{background:'#fff',borderRadius:12,border:'1px solid #dce8f4',padding:20,textAlign:'center'}}>
            <div style={{fontSize:12,fontWeight:600,color:'#6b7f95',textTransform:'uppercase',letterSpacing:.7,marginBottom:44}}>{r}</div>
            <div style={{borderTop:'1px solid #dce8f4',paddingTop:8,fontSize:11,color:'#99afc4'}}>Signature & date</div>
          </div>
        ))}
      </div>

      {/* ── Print button ───────────────────────────────────────────────── */}
      <div className="ca-no-print" style={{paddingBottom:24}}>
        <button onClick={() => window.print()}
          style={{display:'inline-flex',alignItems:'center',gap:8,padding:'10px 22px',background:'#1a2f4e',color:'#fff',border:'none',borderRadius:10,fontSize:14,fontWeight:500,cursor:'pointer'}}>
          🖨 Print / Export PDF
        </button>
      </div>
    </div>
  );
}
