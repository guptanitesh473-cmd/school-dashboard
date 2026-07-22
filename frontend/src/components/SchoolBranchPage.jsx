import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin, Phone, Mail, ChevronDown, CheckCircle2, Users, BookOpen,
  ShieldCheck, Bus, GraduationCap, ArrowRight, Music, Telescope, Bot,
  Palette, Code2, Sparkles, Menu, X, Quote, Building2,
} from "lucide-react";
import { LOGO } from "./brandAssets";
import { BRANCHES, WHY_CHOOSE, LABS, FACILITIES, GALLERY_CAPTIONS, FAQS } from "./branchData";

const LAB_ICONS = { music: Music, telescope: Telescope, bot: Bot, palette: Palette, code: Code2, graduation: GraduationCap };

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
.branch-page * { box-sizing: border-box; }
.branch-page { font-family: 'IBM Plex Sans', sans-serif; color: #1E2B5C; }
.branch-page .display { font-family: 'Bricolage Grotesque', sans-serif; }
.branch-page ::selection { background: #E07C24; color: #1E2B5C; }
`;

function PlaceholderImage({ label, accent = "#1E2B5C", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 ${className}`}
      style={{ background: `linear-gradient(135deg, ${accent}1A, ${accent}33)`, border: `1px dashed ${accent}66` }}
    >
      <Building2 size={28} style={{ color: accent }} />
      <span className="text-sm font-medium text-center px-4" style={{ color: accent }}>{label}</span>
    </div>
  );
}

function NavBar({ branch }) {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#why-choose", label: "Why Us" },
    { href: "#facilities", label: "Facilities" },
    { href: "#gallery", label: "Gallery" },
    { href: "#faq", label: "FAQs" },
    { href: "#enquire", label: "Admissions" },
  ];
  return (
    <header className="sticky top-0 z-30 bg-white border-b" style={{ borderColor: "#E3E0D6" }}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white border p-0.5 shrink-0" style={{ borderColor: "#E3E0D6" }}>
            <img src={LOGO} alt="Banyan International Academy logo" className="w-full h-full rounded-full object-cover" />
          </div>
          <div>
            <div className="display font-bold text-lg leading-tight">Banyan International Academy</div>
            <div className="text-sm" style={{ color: "#5B6B85" }}>{branch.city} Campus</div>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-base font-medium hover:opacity-70 transition-opacity" style={{ color: "#1E2B5C" }}>
              {l.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <a href="#enquire" className="px-5 py-2.5 rounded-lg font-semibold text-base" style={{ background: "#E07C24", color: "#1E2B5C" }}>
            Enquire Now
          </a>
          <Link to="/" className="text-sm hover:underline" style={{ color: "#5B6B85" }}>Staff Login →</Link>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="md:hidden p-2" style={{ color: "#1E2B5C" }}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t px-6 py-4 space-y-3" style={{ borderColor: "#E3E0D6" }}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-base font-medium">{l.label}</a>
          ))}
          <a href="#enquire" onClick={() => setOpen(false)} className="block px-5 py-2.5 rounded-lg font-semibold text-base text-center" style={{ background: "#E07C24", color: "#1E2B5C" }}>
            Enquire Now
          </a>
          <Link to="/" className="block text-sm" style={{ color: "#5B6B85" }}>Staff Login →</Link>
        </div>
      )}
    </header>
  );
}

function Hero({ branch }) {
  return (
    <section className="relative overflow-hidden" style={{ background: "#1E2B5C" }}>
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-6" style={{ background: `${branch.heroAccent}33`, color: "#fff" }}>
            <Sparkles size={14} /> CBSE Affiliated · Nursery to Grade X
          </div>
          <h1 className="display text-5xl md:text-6xl font-extrabold leading-tight">
            {branch.tagline}
          </h1>
          <p className="mt-6 text-xl max-w-lg leading-relaxed" style={{ color: "#C6D0E2" }}>
            {branch.name} blends a globally-minded CBSE curriculum with modern infrastructure, giving every child in {branch.city} a strong foundation to begin, become, and belong.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href="#enquire" className="px-6 py-3.5 rounded-lg font-semibold text-lg inline-flex items-center gap-2" style={{ background: "#E07C24", color: "#1E2B5C" }}>
              Book a Campus Visit <ArrowRight size={18} />
            </a>
            <a href="#facilities" className="px-6 py-3.5 rounded-lg font-semibold text-lg border-2 border-white/30 text-white">
              Explore Campus
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-8">
            {[["Est.", branch.established], ["Grades", "Nursery–X"], ["Curriculum", "CBSE"]].map(([k, v]) => (
              <div key={k}>
                <div className="display text-2xl font-bold">{v}</div>
                <div className="text-sm" style={{ color: "#9FB0CC" }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
        <PlaceholderImage label={`Campus photo — ${branch.name}`} accent="#E07C24" className="rounded-2xl h-80 md:h-[26rem]" />
      </div>
    </section>
  );
}

function WhyChoose({ branch }) {
  return (
    <section id="why-choose" className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#E07C24" }}>Why Choose Us</div>
        <h2 className="display text-4xl font-bold mt-2">Why Choose Banyan {branch.city}</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {WHY_CHOOSE.map((w, i) => (
          <div key={w.title} className="p-8 rounded-2xl border" style={{ borderColor: "#E3E0D6" }}>
            <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: "#FBEEDF" }}>
              <CheckCircle2 size={26} style={{ color: "#E07C24" }} />
            </div>
            <div className="display text-xl font-bold mb-3">{w.title}</div>
            <p className="text-base leading-relaxed" style={{ color: "#5B6B85" }}>{w.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AboutIntro({ branch }) {
  return (
    <section className="py-20" style={{ background: "#FBF9F3" }}>
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">
        <PlaceholderImage label={`Campus overview — ${branch.city}`} accent="#2E7D5B" className="rounded-2xl h-80 order-2 md:order-1" />
        <div className="order-1 md:order-2">
          <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#2E7D5B" }}>About the Campus</div>
          <h2 className="display text-4xl font-bold mt-2 mb-5">A Nurturing Campus in the Heart of {branch.city}</h2>
          <p className="text-lg leading-relaxed mb-4" style={{ color: "#5B6B85" }}>
            Banyan International Academy, {branch.city} is conveniently located near {branch.landmark}, making the daily commute easy for
            families across the region. Our campus is designed to support a nurturing learning environment with smart classrooms,
            modern labs, and dedicated spaces for sports and the arts.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: "#5B6B85" }}>
            From Nursery to Grade X, we build strong foundational knowledge while integrating co-curricular programs that develop
            confident, well-rounded learners ready for the world beyond the classroom.
          </p>
        </div>
      </div>
    </section>
  );
}

function PrincipalMessage({ branch }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid md:grid-cols-3 gap-10 items-center p-10 md:p-14 rounded-2xl" style={{ background: "#1E2B5C" }}>
        <div className="flex flex-col items-center md:items-start">
          <div className="w-32 h-32 rounded-full flex items-center justify-center text-white display font-bold text-4xl shrink-0" style={{ background: "#2C3B72" }}>
            {branch.principalName.split(" ").slice(-1)[0][0]}
          </div>
          <div className="mt-4 text-center md:text-left">
            <div className="display font-bold text-xl text-white">{branch.principalName}</div>
            <div className="text-base" style={{ color: "#9FB0CC" }}>Principal, {branch.city} Campus</div>
          </div>
        </div>
        <div className="md:col-span-2">
          <Quote size={32} style={{ color: "#E07C24" }} />
          <p className="display text-2xl md:text-3xl font-bold text-white mt-3 mb-5 leading-snug">
            "Every child who walks through our gates deserves to be seen, challenged, and celebrated."
          </p>
          <p className="text-lg leading-relaxed" style={{ color: "#C6D0E2" }}>
            With years of experience in education, {branch.principalName} believes in teamwork between school and family, and
            constantly encourages teachers and students alike to pursue curiosity, discipline, and kindness together.
          </p>
        </div>
      </div>
    </section>
  );
}

function Facilities() {
  return (
    <section id="facilities" className="py-20" style={{ background: "#FBF9F3" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#E07C24" }}>Infrastructure</div>
          <h2 className="display text-4xl font-bold mt-2">Modern Infrastructure & Student Safety</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FACILITIES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border p-6" style={{ borderColor: "#E3E0D6" }}>
              <PlaceholderImage label={f.title} accent="#1E2B5C" className="rounded-xl h-36 mb-5" />
              <div className="display text-lg font-bold mb-2">{f.title}</div>
              <p className="text-base leading-relaxed" style={{ color: "#5B6B85" }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Labs({ branch }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#2E7D5B" }}>Co-Curricular Programs</div>
        <h2 className="display text-4xl font-bold mt-2">Co-Curricular Programs at Banyan {branch.city}</h2>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {LABS.map((lab) => {
          const Icon = LAB_ICONS[lab.icon] || Sparkles;
          return (
            <div key={lab.title} className="p-6 rounded-2xl border flex items-center gap-4" style={{ borderColor: "#E3E0D6" }}>
              <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#EAF3EE" }}>
                <Icon size={24} style={{ color: "#2E7D5B" }} />
              </div>
              <div className="display text-lg font-bold">{lab.title}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Gallery({ branch }) {
  const accents = ["#E07C24", "#2E7D5B", "#1E2B5C", "#C4452E", "#5B6B85", "#E07C24"];
  return (
    <section id="gallery" className="py-20" style={{ background: "#FBF9F3" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#E07C24" }}>Gallery</div>
          <h2 className="display text-4xl font-bold mt-2">Life at Banyan {branch.city}</h2>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {GALLERY_CAPTIONS.map((caption, i) => (
            <PlaceholderImage key={caption} label={caption} accent={accents[i % accents.length]} className="rounded-2xl h-56" />
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-14">
        <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#E07C24" }}>FAQs</div>
        <h2 className="display text-4xl font-bold mt-2">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = openIdx === i;
          return (
            <div key={f.q} className="border rounded-xl overflow-hidden" style={{ borderColor: "#E3E0D6" }}>
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-semibold text-lg">{f.q}</span>
                <ChevronDown size={20} className="shrink-0 transition-transform" style={{ color: "#E07C24", transform: isOpen ? "rotate(180deg)" : "none" }} />
              </button>
              {isOpen && (
                <div className="px-6 pb-5 text-base leading-relaxed" style={{ color: "#5B6B85" }}>{f.a}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function EnquireForm({ branch }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", grade: "" });
  const [submitted, setSubmitted] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    setSubmitted(true);
  };

  const input = "w-full border rounded-lg px-4 py-3 text-base bg-white";

  return (
    <section id="enquire" className="py-20" style={{ background: "#1E2B5C" }}>
      <div className="max-w-3xl mx-auto px-6 text-center text-white mb-10">
        <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#E07C24" }}>Admissions Open</div>
        <h2 className="display text-4xl font-bold mt-2">Book a Campus Visit in {branch.city}</h2>
        <p className="mt-4 text-lg" style={{ color: "#C6D0E2" }}>Share your details and our admissions team will reach out to schedule a tour.</p>
      </div>
      <div className="max-w-xl mx-auto px-6">
        <div className="bg-white rounded-2xl p-8">
          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 size={40} className="mx-auto mb-4" style={{ color: "#2E7D5B" }} />
              <div className="display text-xl font-bold mb-2">Thank you!</div>
              <p className="text-base" style={{ color: "#5B6B85" }}>We've received your enquiry and will contact you shortly.</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <input required placeholder="Parent's full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} style={{ borderColor: "#D8D4C6" }} />
              <input required placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={input} style={{ borderColor: "#D8D4C6" }} />
              <input type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={input} style={{ borderColor: "#D8D4C6" }} />
              <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })} className={input} style={{ borderColor: "#D8D4C6" }}>
                <option value="">Grade interested in</option>
                {["Nursery", "LKG", "UKG", ...Array.from({ length: 10 }, (_, i) => `Grade ${i + 1}`)].map((g) => <option key={g}>{g}</option>)}
              </select>
              <button type="submit" className="w-full py-3.5 rounded-lg font-semibold text-lg" style={{ background: "#E07C24", color: "#1E2B5C" }}>
                Submit Enquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

function Footer({ branch }) {
  const otherBranches = Object.values(BRANCHES).filter((b) => b.slug !== branch.slug);
  return (
    <footer className="text-white" style={{ background: "#151F42" }}>
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white p-0.5 shrink-0">
              <img src={LOGO} alt="Banyan International Academy logo" className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="display font-bold text-lg">Banyan International Academy</span>
          </div>
          <p className="text-base" style={{ color: "#9FB0CC" }}>Rooted in values, skilled for life.</p>
        </div>
        <div>
          <div className="font-semibold text-lg mb-4">Contact {branch.city}</div>
          <div className="space-y-3 text-base" style={{ color: "#C6D0E2" }}>
            <div className="flex items-start gap-2"><MapPin size={18} className="shrink-0 mt-0.5" /> {branch.address}</div>
            <div className="flex items-center gap-2"><Phone size={18} className="shrink-0" /> {branch.phone}</div>
            <div className="flex items-center gap-2"><Mail size={18} className="shrink-0" /> {branch.email}</div>
          </div>
        </div>
        <div>
          <div className="font-semibold text-lg mb-4">Other Campuses</div>
          <div className="space-y-3 text-base">
            {otherBranches.map((b) => (
              <Link key={b.slug} to={`/school/${b.slug}`} className="block hover:underline" style={{ color: "#C6D0E2" }}>
                {b.city}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="font-semibold text-lg mb-4">Quick Links</div>
          <div className="space-y-3 text-base">
            <a href="#facilities" className="block hover:underline" style={{ color: "#C6D0E2" }}>Facilities</a>
            <a href="#faq" className="block hover:underline" style={{ color: "#C6D0E2" }}>FAQs</a>
            <a href="#enquire" className="block hover:underline" style={{ color: "#C6D0E2" }}>Admissions</a>
            <Link to="/" className="block hover:underline" style={{ color: "#C6D0E2" }}>Staff Login</Link>
          </div>
        </div>
      </div>
      <div className="border-t px-6 py-6 text-center text-sm" style={{ borderColor: "#2C3B72", color: "#7A88AC" }}>
        © {new Date().getFullYear()} Banyan International Academy. All content on this page is placeholder and pending final review.
      </div>
    </footer>
  );
}

export default function SchoolBranchPage({ slug }) {
  const branch = BRANCHES[slug];

  if (!branch) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4" style={{ background: "#FAF9F4" }}>
        <div className="display text-2xl font-bold" style={{ color: "#1E2B5C" }}>Campus not found</div>
        <Link to="/" className="text-base hover:underline" style={{ color: "#E07C24" }}>← Back to OIS Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="branch-page" style={{ background: "#FAF9F4" }}>
      <style>{styles}</style>
      <NavBar branch={branch} />
      <Hero branch={branch} />
      <WhyChoose branch={branch} />
      <AboutIntro branch={branch} />
      <PrincipalMessage branch={branch} />
      <Facilities />
      <Labs branch={branch} />
      <Gallery branch={branch} />
      <Faq />
      <EnquireForm branch={branch} />
      <Footer branch={branch} />
    </div>
  );
}
