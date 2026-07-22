import { Link } from "react-router-dom";
import { MapPin, ArrowRight } from "lucide-react";
import { LOGO } from "./brandAssets";
import { BRANCHES } from "./branchData";

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=IBM+Plex+Sans:wght@400;500;600&display=swap');
.branch-index * { box-sizing: border-box; }
.branch-index { font-family: 'IBM Plex Sans', sans-serif; color: #1E2B5C; }
.branch-index .display { font-family: 'Bricolage Grotesque', sans-serif; }
`;

export default function SchoolBranchIndex() {
  return (
    <div className="branch-index min-h-screen" style={{ background: "#FAF9F4" }}>
      <style>{styles}</style>
      <header className="border-b" style={{ borderColor: "#E3E0D6" }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-white border p-0.5 shrink-0" style={{ borderColor: "#E3E0D6" }}>
            <img src={LOGO} alt="Banyan International Academy logo" className="w-full h-full rounded-full object-cover" />
          </div>
          <span className="display font-bold text-xl">Banyan International Academy</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-base font-semibold tracking-widest uppercase" style={{ color: "#E07C24" }}>Our Campuses</div>
        <h1 className="display text-4xl font-bold mt-2 mb-12">Find a Banyan Campus Near You</h1>

        <div className="grid sm:grid-cols-2 gap-6">
          {Object.values(BRANCHES).map((b) => (
            <Link
              key={b.slug}
              to={`/school/${b.slug}`}
              className="p-8 rounded-2xl border flex items-center justify-between gap-4 hover:border-orange-300 transition-colors group"
              style={{ borderColor: "#E3E0D6" }}
            >
              <div>
                <div className="display text-2xl font-bold mb-1">{b.city}</div>
                <div className="text-base flex items-center gap-1.5" style={{ color: "#5B6B85" }}>
                  <MapPin size={16} /> {b.address}
                </div>
              </div>
              <ArrowRight size={22} className="shrink-0 text-gray-400 group-hover:text-orange-500" />
            </Link>
          ))}
        </div>

        <Link to="/" className="inline-block mt-14 text-base hover:underline" style={{ color: "#5B6B85" }}>
          ← Back to OIS Dashboard (Staff Login)
        </Link>
      </div>
    </div>
  );
}
