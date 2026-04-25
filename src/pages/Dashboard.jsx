import { useApp } from '../context/AppContext';
import Layout from '../components/Layout';
import { BED_CAPACITY, EXPECTED_MORTALITY } from '../lib/constants';
import { hasTempToday, hasVisitToday, daysBetween, todayStr } from '../lib/clinical';
import { Activity, AlertTriangle, TrendingDown, TrendingUp, Users, BedDouble, Stethoscope, Thermometer } from 'lucide-react';

export default function Dashboard() {
  const { patients } = useApp();

  const admitted = patients.filter((p) => p.status === 'admitted');
  const discharged = patients.filter((p) => p.status === 'discharged');
  const deceased = patients.filter((p) => p.status === 'deceased');
  const totalClosed = discharged.length + deceased.length;
  const mortalityRate = totalClosed > 0 ? (deceased.length / totalClosed) * 100 : 0;
  const successRate = 100 - mortalityRate;

  const tempCompletionRate = admitted.length > 0
    ? Math.round((admitted.filter(hasTempToday).length / admitted.length) * 100)
    : 100;
  const visitCompletionRate = admitted.length > 0
    ? Math.round((admitted.filter(hasVisitToday).length / admitted.length) * 100)
    : 100;

  const avgStay = discharged.length > 0
    ? (discharged.reduce((sum, p) => sum + daysBetween(p.admittedOn, p.dischargedOn), 0) / discharged.length).toFixed(1)
    : '—';

  const occupancyPct = Math.round((admitted.length / BED_CAPACITY) * 100);
  const mortaltyOverTarget = mortalityRate > EXPECTED_MORTALITY;

  return (
    <Layout
      title="Facility Dashboard"
      subtitle="Real-time operational and clinical metrics"
    >
      {/* Critical alerts */}
      {mortaltyOverTarget && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-critical mt-0.5" />
          <div className="flex-1">
            <div className="font-semibold text-red-900">Mortality rate exceeds target benchmark</div>
            <div className="text-sm text-red-800 mt-0.5">
              Current mortality is {mortalityRate.toFixed(1)}%, above the expected {EXPECTED_MORTALITY}%. Review treatment protocols and patient acuity.
            </div>
          </div>
        </div>
      )}

      {/* Primary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          icon={Activity}
          label="Success rate"
          value={`${successRate.toFixed(1)}%`}
          sub={`Target: ${100 - EXPECTED_MORTALITY}%`}
          tone={successRate >= (100 - EXPECTED_MORTALITY) ? 'positive' : 'negative'}
          trend={successRate >= (100 - EXPECTED_MORTALITY) ? TrendingUp : TrendingDown}
        />
        <MetricCard
          icon={BedDouble}
          label="Occupancy"
          value={`${admitted.length} / ${BED_CAPACITY}`}
          sub={`${occupancyPct}% capacity`}
          tone={occupancyPct >= 95 ? 'negative' : 'neutral'}
        />
        <MetricCard
          icon={Users}
          label="Avg. length of stay"
          value={`${avgStay} days`}
          sub={`Based on ${discharged.length} discharges`}
          tone="neutral"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Mortality rate"
          value={`${mortalityRate.toFixed(1)}%`}
          sub={`Benchmark: ${EXPECTED_MORTALITY}%`}
          tone={mortalityRate <= EXPECTED_MORTALITY ? 'positive' : 'negative'}
        />
      </div>

      {/* Today's ops metrics */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Today's operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ProgressCard
            icon={Thermometer}
            label="Temperature recording"
            done={admitted.filter(hasTempToday).length}
            total={admitted.length}
            percent={tempCompletionRate}
          />
          <ProgressCard
            icon={Stethoscope}
            label="Doctor visits"
            done={admitted.filter(hasVisitToday).length}
            total={admitted.length}
            percent={visitCompletionRate}
          />
        </div>
      </section>

      {/* Patient status breakdown */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">Patient outcomes</h2>
        <div className="card p-6">
          <div className="flex items-end justify-between gap-8">
            <OutcomeStat label="Currently admitted" value={admitted.length} color="primary" />
            <OutcomeStat label="Recovered & discharged" value={discharged.length} color="success" />
            <OutcomeStat label="Deceased" value={deceased.length} color="critical" />
            <OutcomeStat label="Total treated" value={totalClosed + admitted.length} color="slate" />
          </div>

          {/* Simple bar */}
          <div className="mt-6 h-2 rounded-full overflow-hidden bg-slate-100 flex">
            {admitted.length > 0 && (
              <div style={{ width: `${(admitted.length / (admitted.length + totalClosed)) * 100}%` }} className="bg-primary-500" />
            )}
            {discharged.length > 0 && (
              <div style={{ width: `${(discharged.length / (admitted.length + totalClosed)) * 100}%` }} className="bg-success" />
            )}
            {deceased.length > 0 && (
              <div style={{ width: `${(deceased.length / (admitted.length + totalClosed)) * 100}%` }} className="bg-critical" />
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}

function MetricCard({ icon: Icon, label, value, sub, tone, trend: Trend }) {
  const toneClass = {
    positive: 'text-success',
    negative: 'text-critical',
    neutral: 'text-slate-700',
  }[tone];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</div>
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div className={`font-display text-3xl ${toneClass} flex items-baseline gap-2`}>
        {value}
        {Trend && <Trend className="w-5 h-5" />}
      </div>
      <div className="text-xs text-slate-500 mt-1">{sub}</div>
    </div>
  );
}

function ProgressCard({ icon: Icon, label, done, total, percent }) {
  const low = percent < 70;
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          <div className="text-sm font-medium text-slate-900">{label}</div>
        </div>
        <div className={`text-sm font-semibold ${low ? 'text-warning' : 'text-success'}`}>{percent}%</div>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${low ? 'bg-warning' : 'bg-success'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="text-xs text-slate-500 mt-2">
        {done} of {total} patients completed
      </div>
    </div>
  );
}

function OutcomeStat({ label, value, color }) {
  const colorClass = {
    primary: 'text-primary-700',
    success: 'text-success',
    critical: 'text-critical',
    slate: 'text-slate-700',
  }[color];
  return (
    <div>
      <div className={`font-display text-4xl ${colorClass}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}
