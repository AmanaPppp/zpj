import { Building, Loader2, Fingerprint, Database, Globe, CreditCard, Check, Shield, Edit2, Plus, X, ChevronsUpDown } from 'lucide-react';
import type { FC } from 'react';
import ScrollFloat from '../components/ScrollFloat';

const features = [
  {
    title: 'SOC 2 Compliance',
    desc: 'Our product meets SOC 2 standards for secure handling of sensitive information',
    delay: '0.1s',
    graphic: 'soc2',
  },
  {
    title: 'SSO and Domain Capture',
    desc: 'Seamlessly manage users with SSO and domain capture',
    delay: '0.2s',
    graphic: 'sso',
  },
  {
    title: 'Fine-Grained Permissions',
    desc: 'Effortlessly assign and manage fine-grained permissions with our solution',
    delay: '0.3s',
    graphic: 'permissions',
  },
  {
    title: 'Role-Based Access Control',
    desc: 'Ensure enterprise security and compliance with role-based access management',
    delay: '0.4s',
    graphic: 'roles',
  },
  {
    title: 'Workspaces Per Organization',
    desc: 'Organize projects effectively with multiple workspaces per organization',
    delay: '0.5s',
    graphic: 'workspace',
  },
  {
    title: 'On-Premise Deployment',
    desc: 'Deploy Lumina on-premise for enhanced control and security',
    delay: '0.6s',
    graphic: 'onpremise',
  },
];

function Soc2Graphic() {
  return (
    <div
      className="w-full h-full bg-cover bg-center rounded-[1.25rem]"
      style={{
        backgroundImage: `url(./hero/black-box.jpg)`,
      }}
    />
  );
}

function SsoGraphic() {
  return (
    <div className="relative w-[85%] max-w-[260px] flex flex-col gap-2 z-10 transition-transform duration-500">
      {/* Login Box */}
      <div className="bg-[#09090b] border rounded-xl p-3.5 shadow-2xl relative border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800">
            <Building className="w-3 h-3 text-zinc-300" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-medium text-zinc-200">Sign in to Acme</span>
        </div>
        <div className="bg-[#131316] border rounded-lg p-2.5 flex items-center justify-between text-xs border-white/5">
          <span className="font-medium text-zinc-300">jane@acmecorp.com</span>
          <Loader2 className="w-3.5 h-3.5 text-zinc-500 animate-spin" strokeWidth={2} />
        </div>
      </div>

      {/* Routing Path */}
      <div className="flex flex-col items-center justify-center h-6 relative">
        <div className="absolute w-px h-full bg-gradient-to-b to-transparent from-white/20" />
        <div className="absolute w-2 h-2 rounded-full border bg-[#09090b] shadow-[0_0_8px_rgba(255,255,255,0.3)] border-white/20 anim-route-dot z-20" />
      </div>

      {/* IDP Box */}
      <div className="bg-[#09090b] border rounded-xl p-3 shadow-2xl flex items-center gap-3 w-4/5 mx-auto relative overflow-hidden border-white/10 anim-slide-idp">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 anim-idp-glow" />
        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Fingerprint className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-medium">Routing to</span>
          <span className="text-[11px] font-medium text-zinc-200">Identity Provider</span>
        </div>
      </div>
    </div>
  );
}

function PermissionsGraphic() {
  const rows = [
    { icon: Database, name: 'Core API', read: true, edit: false, admin: false },
    { icon: Globe, name: 'Marketing', read: true, edit: true, admin: false },
    { icon: CreditCard, name: 'Billing', read: true, edit: true, admin: true },
  ];

  return (
    <div className="relative w-[90%] max-w-[280px] bg-[#09090b] border rounded-xl overflow-hidden shadow-2xl z-10 flex flex-col transition-transform duration-500 border-white/10 anim-float">
      <div className="grid grid-cols-5 gap-2 p-3 border-b bg-white/[0.02] border-white/5">
        <div className="col-span-2 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">Resource</div>
        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider text-center">Read</div>
        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider text-center">Edit</div>
        <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider text-center">Admin</div>
      </div>
      <div className="flex flex-col p-2 gap-1 bg-[#0e0e11]">
        {rows.map((row, i) => (
          <div key={i} className={`grid grid-cols-5 gap-2 p-2 items-center rounded-lg transition-colors cursor-pointer anim-row-${i + 1}`}>
            <div className="col-span-2 flex items-center gap-2">
              <row.icon className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
              <span className="text-[11px] font-medium truncate text-zinc-300">{row.name}</span>
            </div>
            {[row.read, row.edit, row.admin].map((checked, j) => (
              <div key={j} className="flex justify-center">
                {checked ? (
                  <div className="w-3.5 h-3.5 rounded border bg-emerald-500/10 flex items-center justify-center border-white/10">
                    <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={2} />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 rounded border bg-[#131316] border-white/10" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function RolesGraphic() {
  return (
    <div className="relative w-[90%] max-w-[280px] bg-[#09090b] border rounded-xl p-3 shadow-2xl z-10 flex flex-col gap-4 transition-transform duration-500 border-white/10 anim-float">
      <div className="flex items-center gap-3 p-2 bg-white/[0.03] border rounded-lg border-white/5">
        <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/20 flex items-center justify-center text-[12px] font-medium text-zinc-200">
          JD
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-medium text-zinc-200">Jane Doe</span>
          <span className="text-[10px] text-zinc-500">Engineering Team</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-md text-[11px] font-medium shadow-sm text-blue-400 anim-tag-1">
          <Shield className="w-3 h-3" strokeWidth={1.5} /> Admin
          <X className="w-3 h-3 ml-1 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 border rounded-md text-[11px] font-medium shadow-sm bg-white/5 border-white/10 text-zinc-300 anim-tag-2">
          <Edit2 className="w-3 h-3 text-zinc-400" strokeWidth={1.5} /> Editor
          <X className="w-3 h-3 ml-1 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1.5 border border-dashed rounded-md text-[11px] font-medium text-zinc-500 cursor-pointer transition-colors bg-[#0e0e11] border-white/20 hover:text-zinc-300 hover:border-white/40 anim-tag-3">
          <Plus className="w-3 h-3" strokeWidth={2} /> Add Role
        </div>
      </div>
    </div>
  );
}

function WorkspaceGraphic() {
  return (
    <div className="relative w-[85%] max-w-[240px] z-10 flex flex-col transition-transform duration-500">
      {/* Dropdown Trigger */}
      <div className="bg-[#09090b] border rounded-xl p-2.5 flex items-center justify-between shadow-lg relative z-20 transition-colors cursor-pointer border-white/10 hover:border-white/20">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 flex items-center justify-center text-[11px] font-bold shadow-inner to-purple-600 text-white">A</div>
          <span className="text-xs font-medium text-zinc-200">Acme Global</span>
        </div>
        <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500 anim-menu-arrow" strokeWidth={1.5} />
      </div>
      {/* Dropdown Menu */}
      <div className="bg-[#0e0e11] border rounded-xl p-1.5 shadow-2xl flex flex-col gap-0.5 absolute top-[calc(100%+8px)] left-0 w-full overflow-hidden border-white/10 anim-menu">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-2xl" />
        <div className="text-[10px] font-medium text-zinc-500 px-2.5 py-2 uppercase tracking-wider relative z-10">Switch Workspace</div>
        <div className="flex items-center gap-2.5 p-2 bg-white/[0.04] rounded-lg border border-white/[0.02] relative z-10">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 flex items-center justify-center text-[11px] font-bold shadow-sm to-purple-600 text-white">A</div>
          <span className="text-xs font-medium text-zinc-200">Acme Global</span>
          <Check className="w-3.5 h-3.5 ml-auto text-white" strokeWidth={2} />
        </div>
        <div className="flex items-center gap-2.5 p-2 hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer relative z-10 group/item">
          <div className="w-6 h-6 rounded-md border flex items-center justify-center text-[11px] font-bold group-hover/item:text-zinc-200 transition-colors bg-zinc-800 border-white/10 text-zinc-400">E</div>
          <span className="text-xs font-medium group-hover/item:text-zinc-300 transition-colors text-zinc-400">Acme Europe</span>
        </div>
        <div className="h-px my-1 mx-2 relative z-10 bg-white/5" />
        <div className="flex items-center gap-2.5 p-2 hover:bg-white/[0.02] rounded-lg transition-colors cursor-pointer relative z-10 text-zinc-400 hover:text-zinc-200">
          <Plus className="w-4 h-4 ml-1" strokeWidth={1.5} />
          <span className="text-xs font-medium">Create Workspace</span>
        </div>
      </div>
    </div>
  );
}

function OnPremiseGraphic() {
  return (
    <div className="relative w-[90%] max-w-[280px] bg-[#000] border rounded-xl overflow-hidden shadow-2xl z-10 flex flex-col font-mono transition-transform duration-500 border-white/10 anim-float">
      <div className="bg-[#18181b] border-b px-3 py-2 flex items-center gap-2 border-white/5">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
        <span className="text-[10px] text-zinc-500 ml-2">root@on-prem-node:~</span>
      </div>
      <div className="p-3.5 flex flex-col gap-2 text-[11px] leading-relaxed bg-gradient-to-b from-transparent to-[#18181b]/30">
        <div className="flex gap-2 text-zinc-300">
          <span className="font-medium text-emerald-400">$</span>
          <span>lumina deploy --env production</span>
        </div>
        <div className="text-zinc-500">Initializing deployment sequence...</div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="font-medium text-emerald-400">[OK]</span> Provisioning containers
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="font-medium text-emerald-400">[OK]</span> Establishing VPC tunnel
        </div>
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="text-zinc-500 flex justify-between">
            <span>Starting services (3/3)</span>
            <span className="text-emerald-400">100%</span>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden bg-zinc-800">
            <div className="h-full rounded-full bg-emerald-400 anim-load-bar" style={{ width: '10%' }} />
          </div>
        </div>
        <div className="mt-1 text-emerald-400 anim-fade-text">Ready at 192.168.1.100</div>
      </div>
    </div>
  );
}

const graphicComponents: Record<string, FC> = {
  soc2: Soc2Graphic,
  sso: SsoGraphic,
  permissions: PermissionsGraphic,
  roles: RolesGraphic,
  workspace: WorkspaceGraphic,
  onpremise: OnPremiseGraphic,
};

export default function FeaturesSection() {
  return (
    <section id="features" className="z-20 container md:px-12 pointer-events-auto mr-auto ml-auto pt-16 pr-6 pb-16 pl-6 relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const GraphicComponent = graphicComponents[feature.graphic];
          return (
            <div
              key={feature.title}
              className="flex flex-col bg-[#0e0e11] border rounded-3xl p-1.5 hover:bg-white/[0.02] transition-all duration-500 ease-out hover:scale-[1.02] hover:z-10 relative shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-on-scroll border-white/5"
              style={{ animation: `animationIn 0.8s ease-out ${feature.delay} both` }}
            >
              <div className="h-64 rounded-[1.25rem] relative overflow-hidden flex items-center justify-center bg-[#131316] border border-white/5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_60%)] pointer-events-none" />
                <GraphicComponent />
              </div>
              <div className="px-5 py-6 flex flex-col gap-2">
                <ScrollFloat
                  as="h3"
                  containerClassName="text-xl font-medium tracking-tight text-white"
                  textClassName="font-geist"
                >
                  {feature.title}
                </ScrollFloat>
                <p className="text-base font-normal leading-relaxed text-zinc-400">{feature.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
