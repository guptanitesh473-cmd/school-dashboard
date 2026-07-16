import { useState } from "react";
import {
  BookOpen, CalendarCheck, FileText, Send, LogOut, ChevronRight,
  CheckCircle2, Clock, XCircle, User, Layers, GraduationCap, Inbox, Plus, ArrowLeft,
  Mail, Phone, MapPin, Pencil, Save, BadgeCheck
} from "lucide-react";


const LOGO = "data:image/webp;base64,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";

/* ------------------------------------------------------------------ */
/*  Design tokens — "Banyan" — from the school logo                   */
/*  ink navy #1E2B5C · paper #FAF9F4 · marigold #E07C24 ·              */
/*  chalk slate #5B6B85 · leaf #2E7D5B · brick #C4452E                 */
/* ------------------------------------------------------------------ */

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
.erp * { box-sizing: border-box; }
.erp { font-family: 'IBM Plex Sans', sans-serif; color: #1E2B5C; }
.erp .display { font-family: 'Bricolage Grotesque', sans-serif; }
.erp ::selection { background:#E07C24; color:#1E2B5C; }
.erp .margin-rule { box-shadow: inset 2px 0 0 #E07C24; }
.erp button:focus-visible, .erp input:focus-visible, .erp select:focus-visible, .erp textarea:focus-visible {
  outline: 2px solid #E07C24; outline-offset: 2px;
}
@media (prefers-reduced-motion: reduce) { .erp * { transition: none !important; } }
`;

/* ------------------------------------------------------------------ */
/*  Demo data                                                          */
/* ------------------------------------------------------------------ */

const CURRICULUM = {
  "Grade 6": {
    Mathematics: {
      "Ch 1 · Knowing Our Numbers": ["LP 1.1 Place value & comparison", "LP 1.2 Estimation in daily life", "LP 1.3 Roman numerals"],
      "Ch 2 · Whole Numbers": ["LP 2.1 Number line", "LP 2.2 Properties of operations"],
      "Ch 3 · Playing with Numbers": ["LP 3.1 Factors & multiples", "LP 3.2 Tests of divisibility", "LP 3.3 HCF & LCM"],
    },
    Science: {
      "Ch 1 · Food: Where Does It Come From?": ["LP 1.1 Plant & animal sources", "LP 1.2 Food habits survey"],
      "Ch 2 · Components of Food": ["LP 2.1 Nutrients & tests", "LP 2.2 Balanced diet planning"],
    },
    English: {
      "Ch 1 · Who Did Patrick's Homework?": ["LP 1.1 Reading & comprehension", "LP 1.2 Vocabulary in context"],
      "Ch 2 · How the Dog Found Himself a Master": ["LP 2.1 Guided reading", "LP 2.2 Character mapping"],
    },
  },
  "Grade 7": {
    Mathematics: {
      "Ch 1 · Integers": ["LP 1.1 Operations on integers", "LP 1.2 Properties & word problems"],
      "Ch 2 · Fractions and Decimals": ["LP 2.1 Multiplication of fractions", "LP 2.2 Division & applications"],
    },
    Science: {
      "Ch 1 · Nutrition in Plants": ["LP 1.1 Photosynthesis demo", "LP 1.2 Modes of nutrition"],
      "Ch 2 · Nutrition in Animals": ["LP 2.1 Human digestive system", "LP 2.2 Digestion in ruminants"],
    },
    "Social Studies": {
      "Ch 1 · Tracing Changes Through a Thousand Years": ["LP 1.1 Maps & sources", "LP 1.2 Historians' terms"],
    },
  },
  "Grade 8": {
    Mathematics: {
      "Ch 1 · Rational Numbers": ["LP 1.1 Properties of rationals", "LP 1.2 Representation on number line"],
      "Ch 2 · Linear Equations": ["LP 2.1 Solving one-variable equations", "LP 2.2 Applications & word problems", "LP 2.3 Equations reducible to linear form"],
    },
    Science: {
      "Ch 1 · Crop Production": ["LP 1.1 Agricultural practices", "LP 1.2 Irrigation methods"],
      "Ch 2 · Microorganisms": ["LP 2.1 Friend & foe", "LP 2.2 Food preservation"],
    },
  },
};

const LP_STATUS = ["Completed", "In progress", "Not started"];

const INITIAL_ATTENDANCE = [
  { date: "Jul 15", day: "Wed", status: "Present", in: "8:42 AM", out: "4:15 PM" },
  { date: "Jul 14", day: "Tue", status: "Present", in: "8:38 AM", out: "4:20 PM" },
  { date: "Jul 13", day: "Mon", status: "Present", in: "8:51 AM", out: "4:05 PM" },
  { date: "Jul 10", day: "Fri", status: "On leave", in: "—", out: "—" },
  { date: "Jul 09", day: "Thu", status: "Present", in: "8:45 AM", out: "4:12 PM" },
  { date: "Jul 08", day: "Wed", status: "Present", in: "8:40 AM", out: "4:18 PM" },
  { date: "Jul 07", day: "Tue", status: "Half day", in: "8:44 AM", out: "12:30 PM" },
  { date: "Jul 06", day: "Mon", status: "Present", in: "8:36 AM", out: "4:22 PM" },
];

const LEAVE_BALANCE = [
  { type: "Casual leave", used: 3, total: 12 },
  { type: "Sick leave", used: 1, total: 10 },
  { type: "Earned leave", used: 0, total: 15 },
];

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

const StatusPill = ({ label }) => {
  const map = {
    Present: "bg-emerald-50 text-emerald-800 border-emerald-200",
    "On leave": "bg-amber-50 text-amber-800 border-amber-200",
    "Half day": "bg-sky-50 text-sky-800 border-sky-200",
    Absent: "bg-red-50 text-red-800 border-red-200",
    Approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
    Rejected: "bg-red-50 text-red-800 border-red-200",
    Open: "bg-sky-50 text-sky-800 border-sky-200",
    Resolved: "bg-emerald-50 text-emerald-800 border-emerald-200",
    Completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    "In progress": "bg-amber-50 text-amber-800 border-amber-200",
    "Not started": "bg-gray-100 text-gray-600 border-gray-200",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${map[label] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
      {label}
    </span>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border rounded-lg ${className}`} style={{ borderColor: "#E3E0D6" }}>
    {children}
  </div>
);

const SectionTitle = ({ eyebrow, title }) => (
  <div className="mb-6">
    <div className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#E07C24" }}>{eyebrow}</div>
    <h1 className="display text-2xl font-bold mt-1" style={{ color: "#1E2B5C" }}>{title}</h1>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Login                                                              */
/* ------------------------------------------------------------------ */

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!email.trim() || !pw.trim()) { setErr("Enter both email and password to sign in."); return; }
    onLogin(email.trim());
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#FAF9F4" }}>
      {/* Left panel — the "school register" */}
      <div className="hidden md:flex flex-col justify-between w-1/2 p-12 text-white" style={{ background: "#1E2B5C" }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white p-0.5 shrink-0">
            <img src={LOGO} alt="Banyan International Academy logo" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <div className="display font-bold text-lg leading-tight">Banyan International Academy</div>
            <div className="text-xs" style={{ color: "#9FB0CC" }}>Staff portal · Begin · Become · Belong</div>
          </div>
        </div>
        <div>
          <div className="display text-4xl font-bold leading-tight">
            Rooted in values,<br />skilled for life.
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed" style={{ color: "#9FB0CC" }}>
            Plan lessons chapter by chapter, mark your attendance, apply for leave,
            and raise requests to admin — all from one place.
          </p>
        </div>
        <div className="text-xs" style={{ color: "#6B7C99" }}>Academic year 2026–27 · Term 1</div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <img src={LOGO} alt="Banyan International Academy logo" className="w-10 h-10 rounded-full object-cover" />
            <span className="display font-bold text-lg">Banyan International Academy</span>
          </div>
          <h1 className="display text-2xl font-bold">Sign in</h1>
          <p className="text-sm mt-1 mb-6" style={{ color: "#5B6B85" }}>Use your staff email to continue.</p>

          <label className="block text-sm font-medium mb-1">Staff email</label>
          <input
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="a.rao@banyanacademy.edu"
            className="w-full border rounded-md px-3 py-2 text-sm mb-4 bg-white"
            style={{ borderColor: "#D8D4C6" }}
          />
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => { setPw(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="••••••••"
            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
            style={{ borderColor: "#D8D4C6" }}
          />
          {err && <div className="text-sm mt-3" style={{ color: "#C4452E" }}>{err}</div>}
          <button
            onClick={submit}
            className="w-full mt-6 py-2.5 rounded-md font-semibold text-sm transition-transform active:scale-[0.99]"
            style={{ background: "#E07C24", color: "#1E2B5C" }}
          >
            Sign in to portal
          </button>
          <p className="text-xs mt-4" style={{ color: "#8A8672" }}>
            Demo build — any email and password will sign you in.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Curriculum: Grade → Subject → Chapter → LPs                        */
/* ------------------------------------------------------------------ */

function Curriculum() {
  const [grade, setGrade] = useState(null);
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [lpStatus, setLpStatus] = useState({}); // key: `${grade}|${subject}|${chapter}|${lp}`

  const crumbs = [
    { label: "Grades", onClick: () => { setGrade(null); setSubject(null); setChapter(null); } },
    grade && { label: grade, onClick: () => { setSubject(null); setChapter(null); } },
    subject && { label: subject, onClick: () => setChapter(null) },
    chapter && { label: chapter.split(" · ")[0], onClick: () => {} },
  ].filter(Boolean);

  const key = (lp) => `${grade}|${subject}|${chapter}|${lp}`;
  const cycleStatus = (lp) => {
    setLpStatus((s) => {
      const cur = s[key(lp)] || "Not started";
      const next = LP_STATUS[(LP_STATUS.indexOf(cur) + 2) % 3]; // Not started → In progress → Completed
      return { ...s, [key(lp)]: next };
    });
  };

  const Tile = ({ label, meta, onClick }) => (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border rounded-lg p-4 flex items-center justify-between hover:border-amber-400 transition-colors group"
      style={{ borderColor: "#E3E0D6" }}
    >
      <div>
        <div className="font-semibold text-sm">{label}</div>
        <div className="text-xs mt-0.5" style={{ color: "#5B6B85" }}>{meta}</div>
      </div>
      <ChevronRight size={16} className="text-gray-400 group-hover:text-amber-500" />
    </button>
  );

  return (
    <div>
      <SectionTitle eyebrow="Curriculum" title="Lesson planning" />

      {/* Breadcrumb */}
      <div className="flex items-center flex-wrap gap-1 text-sm mb-5">
        {crumbs.map((c, i) => (
          <span key={c.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-gray-400" />}
            <button
              onClick={c.onClick}
              className={`px-1.5 py-0.5 rounded ${i === crumbs.length - 1 ? "font-semibold" : "hover:underline"}`}
              style={{ color: i === crumbs.length - 1 ? "#1E2B5C" : "#5B6B85" }}
            >
              {c.label}
            </button>
          </span>
        ))}
      </div>

      {/* Level 1: Grades */}
      {!grade && (
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.keys(CURRICULUM).map((g) => (
            <Tile key={g} label={g} meta={`${Object.keys(CURRICULUM[g]).length} subjects`} onClick={() => setGrade(g)} />
          ))}
        </div>
      )}

      {/* Level 2: Subjects */}
      {grade && !subject && (
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.keys(CURRICULUM[grade]).map((s) => (
            <Tile key={s} label={s} meta={`${Object.keys(CURRICULUM[grade][s]).length} chapters`} onClick={() => setSubject(s)} />
          ))}
        </div>
      )}

      {/* Level 3: Chapters */}
      {grade && subject && !chapter && (
        <div className="grid gap-3">
          {Object.keys(CURRICULUM[grade][subject]).map((c) => (
            <Tile key={c} label={c} meta={`${CURRICULUM[grade][subject][c].length} lesson plans`} onClick={() => setChapter(c)} />
          ))}
        </div>
      )}

      {/* Level 4: Lesson plans */}
      {grade && subject && chapter && (
        <Card className="margin-rule">
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "#E3E0D6" }}>
            <div>
              <div className="font-semibold text-sm">{chapter}</div>
              <div className="text-xs" style={{ color: "#5B6B85" }}>{grade} · {subject} · tap a status to update it</div>
            </div>
            <button onClick={() => setChapter(null)} className="text-xs flex items-center gap-1 hover:underline" style={{ color: "#5B6B85" }}>
              <ArrowLeft size={13} /> Chapters
            </button>
          </div>
          <ul>
            {CURRICULUM[grade][subject][chapter].map((lp, i) => {
              const st = lpStatus[key(lp)] || "Not started";
              return (
                <li key={lp} className={`flex items-center justify-between gap-3 px-4 py-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "#F0EDE3" }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <Layers size={16} className="shrink-0" style={{ color: "#E07C24" }} />
                    <span className="text-sm truncate">{lp}</span>
                  </div>
                  <button onClick={() => cycleStatus(lp)} className="shrink-0" title="Change status">
                    <StatusPill label={st} />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Attendance                                                         */
/* ------------------------------------------------------------------ */

function Attendance() {
  const present = INITIAL_ATTENDANCE.filter((d) => d.status === "Present").length;
  const stats = [
    { label: "Working days", value: INITIAL_ATTENDANCE.length, icon: CalendarCheck, color: "#1E2B5C" },
    { label: "Present", value: present, icon: CheckCircle2, color: "#2E7D5B" },
    { label: "Half days", value: INITIAL_ATTENDANCE.filter((d) => d.status === "Half day").length, icon: Clock, color: "#E07C24" },
    { label: "Leaves", value: INITIAL_ATTENDANCE.filter((d) => d.status === "On leave").length, icon: XCircle, color: "#C4452E" },
  ];

  return (
    <div>
      <SectionTitle eyebrow="Attendance" title="My attendance · July 2026" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-4">
            <s.icon size={18} style={{ color: s.color }} />
            <div className="display text-2xl font-bold mt-2">{s.value}</div>
            <div className="text-xs" style={{ color: "#5B6B85" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide" style={{ color: "#5B6B85" }}>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Check in</th>
              <th className="px-4 py-3 font-semibold hidden sm:table-cell">Check out</th>
              <th className="px-4 py-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {INITIAL_ATTENDANCE.map((d) => (
              <tr key={d.date} className="border-t" style={{ borderColor: "#F0EDE3" }}>
                <td className="px-4 py-3 font-medium">{d.date} <span className="font-normal" style={{ color: "#5B6B85" }}>· {d.day}</span></td>
                <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "#5B6B85" }}>{d.in}</td>
                <td className="px-4 py-3 hidden sm:table-cell" style={{ color: "#5B6B85" }}>{d.out}</td>
                <td className="px-4 py-3 text-right"><StatusPill label={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Leaves                                                             */
/* ------------------------------------------------------------------ */

function Leaves() {
  const [leaves, setLeaves] = useState([
    { id: 1, type: "Casual leave", from: "Jul 10", to: "Jul 10", reason: "Personal work", status: "Approved" },
    { id: 2, type: "Sick leave", from: "Jun 18", to: "Jun 19", reason: "Fever", status: "Approved" },
  ]);
  const [form, setForm] = useState({ type: "Casual leave", from: "", to: "", reason: "" });
  const [msg, setMsg] = useState("");

  const apply = () => {
    if (!form.from || !form.to || !form.reason.trim()) {
      setMsg("Fill in the dates and a reason before applying.");
      return;
    }
    setLeaves([{ id: Date.now(), ...form, status: "Pending" }, ...leaves]);
    setForm({ type: "Casual leave", from: "", to: "", reason: "" });
    setMsg("Leave applied — sent to the principal for approval.");
  };

  const input = "w-full border rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <SectionTitle eyebrow="Leaves" title="Apply for leave" />

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {LEAVE_BALANCE.map((b) => (
          <Card key={b.type} className="p-4">
            <div className="text-xs" style={{ color: "#5B6B85" }}>{b.type}</div>
            <div className="display text-2xl font-bold mt-1">
              {b.total - b.used}<span className="text-sm font-normal" style={{ color: "#5B6B85" }}> / {b.total} left</span>
            </div>
            <div className="h-1.5 rounded-full mt-3" style={{ background: "#F0EDE3" }}>
              <div className="h-1.5 rounded-full" style={{ width: `${((b.total - b.used) / b.total) * 100}%`, background: "#E07C24" }} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 margin-rule">
          <div className="font-semibold text-sm mb-4">New leave application</div>
          <label className="block text-xs font-medium mb-1">Leave type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={`${input} mb-3`} style={{ borderColor: "#D8D4C6" }}>
            {LEAVE_BALANCE.map((b) => <option key={b.type}>{b.type}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium mb-1">From</label>
              <input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} className={input} style={{ borderColor: "#D8D4C6" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">To</label>
              <input type="date" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className={input} style={{ borderColor: "#D8D4C6" }} />
            </div>
          </div>
          <label className="block text-xs font-medium mb-1">Reason</label>
          <textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Brief reason for leave" className={`${input} mb-3 resize-none`} style={{ borderColor: "#D8D4C6" }} />
          {msg && <div className="text-xs mb-3" style={{ color: msg.startsWith("Leave applied") ? "#2E7D5B" : "#C4452E" }}>{msg}</div>}
          <button onClick={apply} className="px-4 py-2 rounded-md text-sm font-semibold" style={{ background: "#E07C24", color: "#1E2B5C" }}>
            Apply for leave
          </button>
        </Card>

        <Card>
          <div className="p-4 border-b font-semibold text-sm" style={{ borderColor: "#E3E0D6" }}>Leave history</div>
          <ul>
            {leaves.map((l, i) => (
              <li key={l.id} className={`px-4 py-3 flex items-start justify-between gap-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "#F0EDE3" }}>
                <div>
                  <div className="text-sm font-medium">{l.type}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#5B6B85" }}>{l.from} – {l.to} · {l.reason}</div>
                </div>
                <StatusPill label={l.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Requests                                                           */
/* ------------------------------------------------------------------ */

function Requests() {
  const [reqs, setReqs] = useState([
    { id: 1, category: "IT support", subject: "Projector in Room 6B not working", date: "Jul 12", status: "Open" },
    { id: 2, category: "Supplies", subject: "Need Grade 7 Science lab kits", date: "Jul 02", status: "Resolved" },
  ]);
  const [form, setForm] = useState({ category: "IT support", subject: "", details: "" });
  const [msg, setMsg] = useState("");

  const raise = () => {
    if (!form.subject.trim()) { setMsg("Give your request a subject."); return; }
    setReqs([{ id: Date.now(), category: form.category, subject: form.subject, date: "Jul 16", status: "Open" }, ...reqs]);
    setForm({ category: "IT support", subject: "", details: "" });
    setMsg("Request raised — the admin office has been notified.");
  };

  const input = "w-full border rounded-md px-3 py-2 text-sm bg-white";

  return (
    <div>
      <SectionTitle eyebrow="Requests" title="Raise a request" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 margin-rule">
          <div className="font-semibold text-sm mb-4">New request</div>
          <label className="block text-xs font-medium mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`${input} mb-3`} style={{ borderColor: "#D8D4C6" }}>
            <option>IT support</option>
            <option>Supplies</option>
            <option>Maintenance</option>
            <option>HR / Payroll</option>
            <option>Other</option>
          </select>
          <label className="block text-xs font-medium mb-1">Subject</label>
          <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Smartboard pen missing in Room 4A" className={`${input} mb-3`} style={{ borderColor: "#D8D4C6" }} />
          <label className="block text-xs font-medium mb-1">Details (optional)</label>
          <textarea rows={3} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Anything the admin team should know" className={`${input} mb-3 resize-none`} style={{ borderColor: "#D8D4C6" }} />
          {msg && <div className="text-xs mb-3" style={{ color: msg.startsWith("Request raised") ? "#2E7D5B" : "#C4452E" }}>{msg}</div>}
          <button onClick={raise} className="px-4 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-2" style={{ background: "#E07C24", color: "#1E2B5C" }}>
            <Send size={14} /> Raise request
          </button>
        </Card>

        <Card>
          <div className="p-4 border-b font-semibold text-sm" style={{ borderColor: "#E3E0D6" }}>My requests</div>
          <ul>
            {reqs.map((r, i) => (
              <li key={r.id} className={`px-4 py-3 flex items-start justify-between gap-3 ${i > 0 ? "border-t" : ""}`} style={{ borderColor: "#F0EDE3" }}>
                <div>
                  <div className="text-sm font-medium">{r.subject}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#5B6B85" }}>{r.category} · raised {r.date}</div>
                </div>
                <StatusPill label={r.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function Dashboard({ name, go }) {
  const shortcuts = [
    { id: "curriculum", icon: BookOpen, title: "Plan lessons", desc: "Pick a grade, subject and chapter to open its lesson plans." },
    { id: "attendance", icon: CalendarCheck, title: "Check attendance", desc: "See your monthly record, check-ins and half days." },
    { id: "leaves", icon: FileText, title: "Apply for leave", desc: "Check your balance and send a leave application." },
    { id: "requests", icon: Inbox, title: "Raise a request", desc: "Report an issue or ask admin for supplies and support." },
  ];
  return (
    <div>
      <SectionTitle eyebrow="Today · Thu, 16 Jul 2026" title={`Good morning, ${name.split("@")[0]}`} />
      <div className="grid sm:grid-cols-2 gap-4">
        {shortcuts.map((s) => (
          <button
            key={s.id}
            onClick={() => go(s.id)}
            className="text-left bg-white border rounded-lg p-5 hover:border-amber-400 transition-colors group"
            style={{ borderColor: "#E3E0D6" }}
          >
            <div className="w-9 h-9 rounded flex items-center justify-center mb-3" style={{ background: "#FBEEDF" }}>
              <s.icon size={18} style={{ color: "#B45E12" }} />
            </div>
            <div className="font-semibold text-sm flex items-center gap-1">
              {s.title} <ChevronRight size={14} className="text-gray-400 group-hover:text-amber-500" />
            </div>
            <div className="text-xs mt-1 leading-relaxed" style={{ color: "#5B6B85" }}>{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile                                                            */
/* ------------------------------------------------------------------ */

function Profile({ email }) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState("");
  const [p, setP] = useState({
    name: "Anita Rao",
    designation: "TGT · Mathematics",
    empId: "BIA-T-0142",
    department: "Mathematics",
    joined: "12 Jun 2021",
    phone: "+91 98450 12345",
    email: email,
    address: "HSR Layout, Bengaluru",
    emergency: "R. Rao · +91 98860 67890",
    blood: "B+",
    qualifications: "M.Sc. Mathematics, B.Ed.",
  });
  const [draft, setDraft] = useState(p);

  const classes = [
    { grade: "Grade 6", section: "A & B", subject: "Mathematics", periods: 10 },
    { grade: "Grade 7", section: "A", subject: "Mathematics", periods: 6 },
    { grade: "Grade 8", section: "C", subject: "Mathematics", periods: 6 },
  ];

  const startEdit = () => { setDraft(p); setEditing(true); setSaved(""); };
  const save = () => { setP(draft); setEditing(false); setSaved("Profile updated."); };

  const input = "w-full border rounded-md px-3 py-1.5 text-sm bg-white";
  const field = (label, k, Icon) => (
    <div key={k}>
      <div className="text-xs font-medium mb-1 flex items-center gap-1.5" style={{ color: "#5B6B85" }}>
        {Icon && <Icon size={12} />} {label}
      </div>
      {editing ? (
        <input value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} className={input} style={{ borderColor: "#D8D4C6" }} />
      ) : (
        <div className="text-sm font-medium">{p[k]}</div>
      )}
    </div>
  );

  return (
    <div>
      <SectionTitle eyebrow="Profile" title="My profile" />

      {/* Identity card */}
      <Card className="p-5 mb-6 margin-rule">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-white display font-bold text-xl" style={{ background: "#1E2B5C" }}>
            {p.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="display text-xl font-bold flex items-center gap-2">
              {p.name} <BadgeCheck size={18} style={{ color: "#2E7D5B" }} />
            </div>
            <div className="text-sm" style={{ color: "#5B6B85" }}>{p.designation} · Employee ID {p.empId}</div>
            <div className="text-xs mt-0.5" style={{ color: "#5B6B85" }}>Joined {p.joined} · {p.department} department</div>
          </div>
          {editing ? (
            <button onClick={save} className="px-4 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-2 shrink-0" style={{ background: "#E07C24", color: "#1E2B5C" }}>
              <Save size={14} /> Save changes
            </button>
          ) : (
            <button onClick={startEdit} className="px-4 py-2 rounded-md text-sm font-semibold inline-flex items-center gap-2 shrink-0 border" style={{ borderColor: "#D8D4C6", color: "#1E2B5C" }}>
              <Pencil size={14} /> Edit profile
            </button>
          )}
        </div>
        {saved && !editing && <div className="text-xs mt-3" style={{ color: "#2E7D5B" }}>{saved}</div>}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Contact & personal */}
        <Card className="p-5">
          <div className="font-semibold text-sm mb-4">Contact & personal details</div>
          <div className="grid sm:grid-cols-2 gap-4">
            {field("Phone", "phone", Phone)}
            {field("Email", "email", Mail)}
            {field("Address", "address", MapPin)}
            {field("Emergency contact", "emergency", Phone)}
            {field("Blood group", "blood")}
            {field("Qualifications", "qualifications")}
          </div>
        </Card>

        {/* Teaching load */}
        <Card>
          <div className="p-4 border-b font-semibold text-sm" style={{ borderColor: "#E3E0D6" }}>My classes this term</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide" style={{ color: "#5B6B85" }}>
                <th className="px-4 py-2.5 font-semibold">Class</th>
                <th className="px-4 py-2.5 font-semibold">Subject</th>
                <th className="px-4 py-2.5 font-semibold text-right">Periods / wk</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((c) => (
                <tr key={c.grade + c.section} className="border-t" style={{ borderColor: "#F0EDE3" }}>
                  <td className="px-4 py-2.5 font-medium">{c.grade} · {c.section}</td>
                  <td className="px-4 py-2.5" style={{ color: "#5B6B85" }}>{c.subject}</td>
                  <td className="px-4 py-2.5 text-right">{c.periods}</td>
                </tr>
              ))}
              <tr className="border-t" style={{ borderColor: "#F0EDE3" }}>
                <td className="px-4 py-2.5 font-semibold" colSpan={2}>Total teaching load</td>
                <td className="px-4 py-2.5 text-right font-semibold">{classes.reduce((s, c) => s + c.periods, 0)}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shell                                                              */
/* ------------------------------------------------------------------ */

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: GraduationCap },
  { id: "curriculum", label: "Curriculum", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: CalendarCheck },
  { id: "leaves", label: "Leaves", icon: FileText },
  { id: "requests", label: "Requests", icon: Inbox },
  { id: "profile", label: "My profile", icon: User },
];

export default function ERPSystem({ onExit }) {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");

  if (!user) {
    return (
      <div className="erp">
        <style>{styles}</style>
        <Login onLogin={(email) => { setUser(email); setTab("dashboard"); }} />
        {onExit && (
          <button
            onClick={onExit}
            className="fixed top-4 right-4 z-50 text-xs px-3 py-1.5 rounded-md bg-white/90 border border-gray-200 shadow-sm hover:bg-white"
            style={{ color: "#1E2B5C" }}
          >
            ← Back to OIS Dashboard
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="erp min-h-screen flex flex-col md:flex-row" style={{ background: "#FAF9F4" }}>
      <style>{styles}</style>

      {/* Sidebar */}
      <aside className="md:w-60 shrink-0 flex md:flex-col justify-between text-white md:min-h-screen" style={{ background: "#1E2B5C" }}>
        <div className="flex md:block items-center w-full overflow-x-auto">
          <div className="hidden md:flex items-center gap-2.5 p-5">
            <div className="w-9 h-9 rounded-full bg-white p-0.5 shrink-0">
              <img src={LOGO} alt="Banyan International Academy logo" className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="display font-bold text-sm leading-tight">Banyan International<br />Academy</span>
          </div>
          <nav className="flex md:flex-col gap-1 p-2 md:px-3 w-full">
            {NAV.map((n) => {
              const active = tab === n.id;
              return (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm whitespace-nowrap transition-colors"
                  style={{
                    background: active ? "#E07C24" : "transparent",
                    color: active ? "#1E2B5C" : "#C6D0E2",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <n.icon size={16} /> {n.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="hidden md:block p-4 border-t" style={{ borderColor: "#2C3B72" }}>
          {onExit && (
            <button onClick={onExit} className="flex items-center gap-2 text-xs hover:underline mb-3" style={{ color: "#9FB0CC" }}>
              <ArrowLeft size={13} /> Back to OIS Dashboard
            </button>
          )}
          <div className="flex items-center gap-2 text-sm mb-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#2C3B72" }}>
              <User size={14} />
            </div>
            <div className="truncate text-xs" style={{ color: "#C6D0E2" }}>{user}</div>
          </div>
          <button onClick={() => setUser(null)} className="flex items-center gap-2 text-xs hover:underline" style={{ color: "#9FB0CC" }}>
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-5 md:p-10 max-w-5xl w-full mx-auto">
        {tab === "dashboard" && <Dashboard name={user} go={setTab} />}
        {tab === "curriculum" && <Curriculum />}
        {tab === "attendance" && <Attendance />}
        {tab === "leaves" && <Leaves />}
        {tab === "requests" && <Requests />}
        {tab === "profile" && <Profile email={user} />}
        <div className="md:hidden mt-8">
          <button onClick={() => setUser(null)} className="flex items-center gap-2 text-xs" style={{ color: "#5B6B85" }}>
            <LogOut size={13} /> Sign out ({user})
          </button>
        </div>
      </main>
    </div>
  );
}
