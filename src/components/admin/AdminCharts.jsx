// Статистика графиктери (recharts)
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { useI18n } from '../../context/I18nContext.jsx';
import site from '../../site.js';

const P = site.theme.primary;
const A = site.theme.accent;
const COLORS = [P, A, '#1d4e89', '#d4a017', '#6b7280', '#0ea5a4', '#8b5cf6', '#ef4444'];
const tip = { contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' } };

export function ActivityChart({ data }) {
  const { t } = useI18n();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gO" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P} stopOpacity={0.45} /><stop offset="100%" stopColor={P} stopOpacity={0} /></linearGradient>
          <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={A} stopOpacity={0.35} /><stop offset="100%" stopColor={A} stopOpacity={0} /></linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
        <YAxis allowDecimals={false} stroke="var(--muted)" fontSize={12} />
        <Tooltip {...tip} />
        <Legend />
        <Area type="monotone" dataKey="orders" name={t('adm.orders')} stroke={P} fill="url(#gO)" strokeWidth={2} />
        <Area type="monotone" dataKey="bookings" name={t('adm.bookings')} stroke={A} fill="url(#gB)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }) {
  const { t } = useI18n();
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="date" stroke="var(--muted)" fontSize={12} />
        <YAxis stroke="var(--muted)" fontSize={12} />
        <Tooltip {...tip} />
        <Bar dataKey="revenue" name={t('adm.revenue')} fill="#1d4e89" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PieBlock({ data, nameMap = (x) => x }) {
  const shown = data.filter((d) => d.value > 0).map((d) => ({ ...d, name: nameMap(d.name) }));
  if (!shown.length) return <p className="muted center">—</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={shown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
          {shown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip {...tip} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HBarChart({ data }) {
  if (!data.length) return <p className="muted center">—</p>;
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <XAxis type="number" allowDecimals={false} stroke="var(--muted)" fontSize={12} />
        <YAxis type="category" dataKey="name" width={120} stroke="var(--muted)" fontSize={12} />
        <Tooltip {...tip} />
        <Bar dataKey="value" fill={P} radius={[0, 6, 6, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
