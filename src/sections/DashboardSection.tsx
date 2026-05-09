import { Icon } from '@iconify/react';
import AnimatedCTAButton from '../components/AnimatedCTAButton';
import ScrollFloat from '../components/ScrollFloat';

const sidebarIcons = [
  'solar:widget-linear',
  'solar:star-linear',
  'solar:calendar-linear',
  'solar:document-text-linear',
  'solar:buildings-linear',
  'solar:user-linear',
];

const quickActions = [
  { icon: 'solar:home-2-linear', label: 'Home Loan' },
  { icon: 'solar:bus-linear', label: 'Car Loan' },
  { icon: 'solar:tuning-square-2-linear', label: 'Maintenance' },
  { icon: 'solar:battery-charge-linear', label: 'Boosters' },
];

const stats = [
  { icon: 'solar:arrow-left-down-linear', label: 'Harvested losses', value: '$0.00' },
  { icon: 'solar:arrow-right-up-linear', label: 'Total earnings', value: '$10,596.80' },
  { icon: 'solar:chart-square-linear', label: 'Total net worth', value: '$5,250.90' },
  { icon: 'solar:target-linear', label: 'Total for all goals', value: '$5,596.80' },
];

const transactions = [
  {
    date: '10 Jun, 2022',
    items: [
      { icon: 'solar:transfer-horizontal-linear', iconColor: 'text-zinc-500', name: 'Amazon Support', time: '10 Sep, 2020 at 3:30 PM', category: 'Supplies', categoryIcon: 'solar:bag-3-linear', docIcon: 'solar:document-text-linear', amount: '-$20.200', amountColor: 'text-zinc-500' },
    ],
  },
  {
    date: '08 Jun, 2022',
    items: [
      { icon: 'solar:download-square-linear', iconColor: 'text-zinc-300', name: 'Roland GmbH', time: '10 Sep, 2020 at 3:30 PM', category: 'Marketing', categoryIcon: 'solar:pie-chart-2-linear', docIcon: 'solar:check-read-linear', docBg: 'bg-white/10 text-white', amount: '+$30.400', amountColor: 'text-white' },
      { icon: 'solar:arrow-right-up-linear', iconColor: 'text-zinc-500', name: 'Bank of America', time: '10 Sep, 2020 at 3:30 PM', category: 'Office supplies', categoryIcon: 'solar:case-minimalistic-linear', docIcon: 'solar:document-text-linear', amount: '-$10.200', amountColor: 'text-zinc-500' },
    ],
  },
];

const chartBars = [20, 35, 25, 45, 60, 80, 90, 100, 60, 40, 30];
const chartLabels = ['9', '11', '13', '15', '17', '19', '21', '23', '25', '27'];

export default function DashboardSection() {
  return (
    <section id="dashboard" className="relative z-20 container mx-auto px-6 md:px-8 py-24 pointer-events-auto">
      {/* Section Header */}
      <div
        className="flex flex-col items-center justify-center text-center mb-16 relative animate-on-scroll"
        style={{ animation: 'animationIn 0.8s ease-out 0.1s both' }}
      >
        <div className="absolute -top-8 -left-4 md:left-12 flex flex-col gap-2 opacity-80">
          <div className="w-2 h-6 rounded-full rotate-45 origin-bottom-right bg-zinc-400" />
          <div className="w-2 h-4 rounded-full rotate-45 origin-bottom-right ml-4 bg-zinc-400" />
          <div className="w-2 h-3 rounded-full rotate-45 origin-bottom-right ml-8 bg-zinc-400" />
        </div>

        <ScrollFloat
          as="h2"
          containerClassName="text-3xl md:text-5xl font-medium tracking-tight mb-4 text-white"
          textClassName="font-geist"
        >
          Meet your financial platform
        </ScrollFloat>
        <p className="text-lg font-normal max-w-2xl text-zinc-400">
          Built for any business and every customer. Flexible and user friendly.
        </p>
      </div>

      {/* Dashboard UI Container */}
      <div
        className="w-full max-w-[1300px] mx-auto bg-[#0e0e11]/80 backdrop-blur-2xl rounded-[2rem] border shadow-2xl flex flex-col md:flex-row overflow-hidden min-h-[850px] animate-on-scroll animate border-white/10"
        style={{
          boxShadow: '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.05), inset 0 -1px 1px rgba(0,0,0,0.3)',
          animation: 'animationIn 0.8s ease-out 0.3s both',
        }}
      >
        {/* Sidebar Navigation */}
        <div className="w-full md:w-24 bg-transparent flex md:flex-col items-center justify-between py-6 px-4 border-b md:border-b-0 md:border-r relative z-10 border-white/5">
          <div className="flex md:flex-col items-center gap-10 md:gap-12 w-full md:w-auto overflow-x-auto md:overflow-visible no-scrollbar">
            {/* Logo */}
            <a href="#" className="relative w-10 h-10 flex-shrink-0 group">
              <div className="absolute inset-0 rounded-full opacity-80 group-hover:opacity-100 transition-opacity bg-white/80" />
              <div className="absolute top-1/4 left-1/4 w-full h-full backdrop-blur-sm rounded-full mix-blend-overlay bg-white/20" />
            </a>

            {/* Nav Icons */}
            <div className="flex md:flex-col items-center gap-8 text-zinc-500">
              {sidebarIcons.map((icon, i) => (
                <button key={i} className="transition-colors hover:text-white relative">
                  <Icon icon={icon} className="w-6 h-6" />
                  {icon === 'solar:document-text-linear' && (
                    <span className="absolute top-0 right-0 w-2 h-2 rounded-full border border-[#18181b] shadow-[0_0_10px_rgba(255,255,255,0.5)] bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Add Button */}
          <AnimatedCTAButton
            text=""
            size="small"
            className="hidden md:flex mt-8 w-12 h-12 !min-w-0 !px-0 !rounded-full"
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row md:p-8 overflow-y-auto dash-scroll pt-6 pr-6 pb-6 pl-6 gap-x-8 gap-y-8">
          
          {/* Left Column (Main Dashboard Core) */}
          <div className="flex-1 flex flex-col gap-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <ScrollFloat
                as="h2"
                containerClassName="text-2xl md:text-3xl font-medium tracking-tight text-white"
                textClassName="font-geist"
              >
                Welcome Back Joan!
              </ScrollFloat>
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors relative border border-transparent hover:bg-white/5 text-zinc-400 hover:border-white/10">
                  <Icon icon="solar:bell-linear" className="w-5 h-5" />
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-full bg-white" />
                </button>
                <button className="flex items-center gap-2 border px-4 py-2 rounded-full font-medium text-xs transition-colors bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white">
                  <Icon icon="solar:restart-linear" className="w-3 h-3" />
                  2 NEW UPDATES
                </button>
                <button className="w-10 h-10 rounded-full bg-[#18181b] border flex items-center justify-center transition-colors border-white/10 text-zinc-400 hover:text-white hover:border-white/20">
                  <Icon icon="solar:user-linear" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button key={action.label} className="bg-white/[0.02] border border-white/[0.03] rounded-3xl p-6 flex flex-col items-center justify-center gap-3 hover:bg-white/[0.05] transition-colors group">
                  <div className="w-12 h-12 rounded-full border shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300 bg-white/5 border-white/10">
                    <Icon icon={action.icon} className="w-5 h-5 group-hover:text-white transition-colors text-zinc-300" />
                  </div>
                  <span className="text-xs font-medium group-hover:text-zinc-200 text-zinc-400">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-2xl p-4 border border-white/[0.02]">
                  <div className="w-14 h-14 rounded-xl bg-[#18181b] border shadow-[0_0_15px_rgba(255,255,255,0.02)] flex items-center justify-center border-white/10 text-zinc-200">
                    <Icon icon={stat.icon} className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-normal text-zinc-400">{stat.label}</span>
                    <span className="text-2xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Geist', sans-serif" }}>{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity Graph & Recent Activity Combined Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-4">
              
              {/* Recent Activity Table */}
              <div className="xl:col-span-2 flex flex-col gap-6">
                <ScrollFloat
                  as="h3"
                  containerClassName="text-xl font-medium text-white"
                  textClassName="font-geist"
                >
                  Recent Activity
                </ScrollFloat>
                
                {/* Tabs & Filters */}
                <div className="flex items-center justify-between border-b pb-4 border-white/10">
                  <div className="flex gap-8">
                    <button className="text-sm font-medium relative pb-4 -mb-4 border-b-2 text-white border-white">History</button>
                    <button className="text-sm font-medium text-zinc-500 pb-4 -mb-4 border-b-2 border-transparent hover:text-zinc-300">Upcoming</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 border px-4 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10">
                      <Icon icon="solar:calendar-linear" className="w-3.5 h-3.5" />
                      2 Sep 20 - 20 Sep 20
                    </button>
                    <button className="w-8 h-8 rounded-lg border flex items-center justify-center transition-colors bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10">
                      <Icon icon="solar:download-square-linear" className="w-4 h-4" />
                    </button>
                    <AnimatedCTAButton text="" size="small" className="!w-8 !h-8 !min-w-0 !px-0 !rounded-lg" />
                  </div>
                </div>

                {/* Transaction Table */}
                <div className="flex flex-col gap-6">
                  {transactions.map((group) => (
                    <div key={group.date} className="flex flex-col gap-4">
                      <span className="text-xs font-medium text-zinc-500">{group.date}</span>
                      {group.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between group hover:bg-white/[0.04] p-2 -mx-2 rounded-xl transition-colors">
                          <div className="flex items-center gap-4 w-1/3 min-w-[180px]">
                            <div className={item.iconColor}>
                              <Icon icon={item.icon} className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-200">{item.name}</span>
                              <span className="text-xs text-zinc-500">{item.time}</span>
                            </div>
                          </div>
                          <div className="hidden sm:flex items-center gap-2 w-1/3">
                            <div className="w-6 h-6 rounded border flex items-center justify-center bg-white/5 border-white/10 text-zinc-400">
                              <Icon icon={item.categoryIcon} className="w-3 h-3" />
                            </div>
                            <span className="text-xs text-zinc-400">{item.category}</span>
                          </div>
                          <div className="flex items-center justify-end gap-6 w-1/3">
                            <div className={`w-6 h-6 rounded-md border flex items-center justify-center ${item.docBg || 'bg-white/5 border-white/5 text-zinc-400'}`}>
                              <Icon icon={item.docIcon} className="w-3 h-3" />
                            </div>
                            <span className={`text-sm font-medium w-20 text-right ${item.amountColor}`}>{item.amount}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Graph */}
              <div className="xl:col-span-1 flex flex-col justify-between gap-4 bg-white/[0.02] p-6 rounded-3xl border border-white/[0.03] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <div>
                  <ScrollFloat
                    as="h4"
                    containerClassName="text-sm font-medium mb-2 text-zinc-400"
                    textClassName="font-geist"
                  >
                    Activity Graph
                  </ScrollFloat>
                  <span className="text-3xl font-semibold tracking-tight text-white" style={{ fontFamily: "'Geist', sans-serif" }}>$186k</span>
                </div>
                <div className="flex-1 flex flex-col justify-end mt-4">
                  <div className="flex justify-end mb-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-zinc-600">Between Sep 9 - 27</span>
                  </div>
                  <div className="h-32 w-full flex items-end justify-between gap-1 pb-2 border-b relative mt-auto border-white/5">
                    <div className="absolute left-0 top-0 bottom-2 flex flex-col justify-between text-xs w-6 text-zinc-600">
                      <span>25k</span>
                      <span>15k</span>
                      <span>5k</span>
                      <span>0</span>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-1 ml-8 h-full">
                      {chartBars.map((height, i) => (
                        <div
                          key={i}
                          className="w-full bg-gradient-to-t rounded-t-sm from-zinc-600/30 to-white/90"
                          style={{
                            height: `${height}%`,
                            opacity: i === 5 ? 0.7 : i === 3 ? 0.5 : i === 8 ? 0.6 : i === 6 ? 1 : 1,
                            boxShadow: i === 6 ? '0 0 15px rgba(255,255,255,0.4)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between ml-8 text-xs mt-2 text-zinc-600">
                    {chartLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
