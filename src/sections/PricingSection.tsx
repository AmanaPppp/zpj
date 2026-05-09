import { Check, Minus } from 'lucide-react';
import { Fragment } from 'react';
import ScrollFloat from '../components/ScrollFloat';

const plans = [
  {
    name: 'Hobby',
    desc: 'Perfect for side projects and learning.',
    price: '$0',
    period: '/mo',
    button: 'Get Started',
    highlighted: false,
    features: [
      'Up to 1,000 active users',
      'Community support',
      'Basic analytics',
    ],
  },
  {
    name: 'Pro',
    desc: 'For scaling startups and growing teams.',
    price: '$49',
    period: '/mo',
    button: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      'Up to 50,000 active users',
      'Priority email support',
      'Advanced analytics',
      'Custom domains',
    ],
  },
  {
    name: 'Enterprise',
    desc: 'Custom solutions for large scale operations.',
    price: 'Custom',
    period: '',
    button: 'Contact Sales',
    highlighted: false,
    features: [
      'Unlimited active users',
      '24/7 dedicated support',
      'Custom integrations',
      'SLA & SOC 2 compliance',
    ],
  },
];

const tableData = {
  'Core Features': [
    { feature: 'Monthly Active Users', hobby: '1,000', pro: '50,000', enterprise: 'Unlimited' },
    { feature: 'API Requests', hobby: '10K/mo', pro: '1M/mo', enterprise: 'Unlimited' },
    { feature: 'Data Retention', hobby: '7 days', pro: '30 days', enterprise: '365 days' },
  ],
  'Advanced Tools': [
    { feature: 'Custom Domains', hobby: false, pro: true, enterprise: true },
    { feature: 'Role-based Access', hobby: false, pro: true, enterprise: true },
    { feature: 'Audit Logs', hobby: false, pro: false, enterprise: true },
    { feature: 'Single Sign-On (SSO)', hobby: false, pro: false, enterprise: true },
  ],
};

export default function PricingSection() {
  return (
    <section id="pricing" className="container md:px-12 z-20 pointer-events-auto mr-auto ml-auto pt-32 pr-6 pb-24 pl-6 relative">
      {/* Section Header */}
      <div
        className="flex flex-col items-center justify-center text-center mb-16 relative animate-on-scroll"
        style={{ animation: 'animationIn 0.8s ease-out 0.1s both' }}
      >
        <ScrollFloat
          as="h2"
          containerClassName="text-3xl md:text-5xl font-medium tracking-tight mb-4 text-white"
          textClassName="font-geist"
        >
          Simple, transparent pricing
        </ScrollFloat>
        <p className="text-lg font-normal max-w-2xl text-zinc-400">
          Choose the plan that best fits your needs. All plans include core features.
        </p>
      </div>

      {/* Pricing Cards */}
      <div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-24 animate-on-scroll"
        style={{ animation: 'animationIn 0.8s ease-out 0.2s both' }}
      >
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`flex flex-col border rounded-3xl p-8 transition-colors relative shadow-[0_20px_40px_rgba(0,0,0,0.3)] ${
              plan.highlighted
                ? 'bg-[#131316] border-white/10 transform md:-translate-y-4'
                : 'bg-[#0e0e11] border-white/5 hover:bg-white/[0.02]'
            }`}
          >
            {plan.highlighted && (
              <>
                <div className="absolute inset-0 bg-gradient-to-b to-transparent rounded-3xl pointer-events-none from-white/5" />
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent to-transparent via-zinc-400" />
              </>
            )}

            <div className="flex justify-between items-center mb-2">
              <ScrollFloat
                as="h3"
                containerClassName="text-xl font-medium tracking-tight text-white"
                textClassName="font-geist"
              >
                {plan.name}
              </ScrollFloat>
              {plan.badge && (
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-full border bg-white/10 text-zinc-200 border-white/5">
                  {plan.badge}
                </span>
              )}
            </div>
            <p className="text-sm mb-6 h-10 text-zinc-400">{plan.desc}</p>
            <div className="mb-6">
              <span className="text-4xl font-medium tracking-tight text-white" style={{ fontFamily: "'Geist', sans-serif" }}>
                {plan.price}
              </span>
              {plan.period && <span className="text-sm text-zinc-500">{plan.period}</span>}
            </div>
            <button
              className={`w-full px-4 py-2.5 rounded-full text-sm font-medium transition-colors mb-8 ${
                plan.highlighted
                  ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                  : 'border bg-transparent border-zinc-800 text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
              }`}
            >
              {plan.button}
            </button>
            <div className="flex flex-col gap-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-center gap-3 text-sm text-zinc-300">
                  <Check
                    className={`w-4 h-4 ${plan.highlighted ? 'text-emerald-400' : 'text-zinc-500'}`}
                    strokeWidth={2}
                  />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div
        className="max-w-5xl mx-auto bg-[#09090b] border rounded-3xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-on-scroll relative border-white/5"
        style={{ animation: 'animationIn 0.8s ease-out 0.3s both' }}
      >
        <div className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b bg-white/[0.02] border-white/5">
                <th className="p-6 font-medium text-base text-white">Compare Plans</th>
                <th className="p-6 font-medium w-1/5 text-center text-white">Hobby</th>
                <th className="p-6 font-medium w-1/5 text-center text-white">Pro</th>
                <th className="p-6 font-medium w-1/5 text-center text-white">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {Object.entries(tableData).map(([section, rows]) => (
                <Fragment key={section}>
                  <tr>
                    <td colSpan={4} className="p-6 pb-2 text-xs font-medium text-zinc-500 uppercase tracking-wider bg-white/[0.01]">
                      {section}
                    </td>
                  </tr>
                  {rows.map((row) => (
                    <tr key={row.feature} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-zinc-300">{row.feature}</td>
                      <td className="px-6 py-4 text-center text-zinc-400">
                        {typeof row.hobby === 'boolean' ? (
                          <div className="flex justify-center">
                            {row.hobby ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} /> : <Minus className="w-4 h-4 text-zinc-700" />}
                          </div>
                        ) : (
                          row.hobby
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-400">
                        {typeof row.pro === 'boolean' ? (
                          <div className="flex justify-center">
                            {row.pro ? <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} /> : <Minus className="w-4 h-4 text-zinc-700" />}
                          </div>
                        ) : (
                          row.pro
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-zinc-400">
                        {typeof row.enterprise === 'boolean' ? (
                          <div className="flex justify-center">
                            {row.enterprise ? <Check className="w-4 h-4 text-zinc-400" strokeWidth={2} /> : <Minus className="w-4 h-4 text-zinc-700" />}
                          </div>
                        ) : (
                          row.enterprise
                        )}
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
