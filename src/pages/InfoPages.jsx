import { useNavigate } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { PublicNavbar, PublicFooter } from '../components/public';

function Wrapper({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <PublicNavbar />
      <main className="flex-1 max-w-[860px] w-full mx-auto px-4 lg:px-6 py-12">
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {updated && <p className="text-[12.5px] text-slate-500 font-medium mt-1">{updated}</p>}
        <div className="card p-6 lg:p-8 mt-6 text-[14px] leading-relaxed text-slate-700 space-y-4">{children}</div>
      </main>
      <PublicFooter />
    </div>
  );
}

export function Contact() {
  const navigate = useNavigate();
  return (
    <Wrapper title="Contact Us">
      <p>Questions about KaushalSetu, partnerships, or onboarding your institution? Reach out — we respond within two business days.</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 border p-4"><Mail className="w-5 h-5 text-blue-700 mb-2" /><div className="font-extrabold text-[13.5px]">Email</div><div className="text-[13px] font-medium">hello@kaushalsetu.in</div></div>
        <div className="rounded-xl bg-slate-50 border p-4"><Phone className="w-5 h-5 text-teal-700 mb-2" /><div className="font-extrabold text-[13.5px]">Phone</div><div className="text-[13px] font-medium">+91 20 4000 0000</div></div>
        <div className="rounded-xl bg-slate-50 border p-4"><MapPin className="w-5 h-5 text-violet-700 mb-2" /><div className="font-extrabold text-[13.5px]">Office</div><div className="text-[13px] font-medium">Pune, Maharashtra, India</div></div>
      </div>
      <button className="btn-p" onClick={() => navigate('/signup')}>Get Started with KaushalSetu</button>
    </Wrapper>
  );
}

export function Privacy() {
  return (
    <Wrapper title="Privacy Policy" updated="Last updated: September 2026">
      <p><b>1. What we collect.</b> Account details you provide (name, email), your selected workspace role, and usage analytics that help us improve the platform.</p>
      <p><b>2. How we use it.</b> To operate your workspace, personalize role-specific content, and improve our labour-market intelligence models. We never sell personal data.</p>
      <p><b>3. Demonstration data.</b> Labour-market figures shown in demo workspaces are illustrative and are not linked to any individual.</p>
      <p><b>4. Authentication.</b> Sign-in is handled by our authentication provider. Passwords are never stored in readable form on production systems.</p>
      <p><b>5. Your rights.</b> You may request export or deletion of your account data at any time via the Contact page.</p>
    </Wrapper>
  );
}

export function Terms() {
  return (
    <Wrapper title="Terms of Service" updated="Last updated: September 2026">
      <p><b>1. The service.</b> KaushalSetu provides labour-market intelligence, skill-gap analysis, curriculum alignment and training-capacity planning tools.</p>
      <p><b>2. Acceptable use.</b> Workspaces are role-separated. You may access only the workspace assigned to your account role.</p>
      <p><b>3. Demonstration content.</b> Statistics, recommendations and AI outputs in demo mode are illustrative and must not be cited as official figures.</p>
      <p><b>4. Availability.</b> The platform is provided on an as-is basis during the current release phase. Features may evolve without notice.</p>
      <p><b>5. Contact.</b> For questions about these terms, reach us via the Contact page.</p>
    </Wrapper>
  );
}

