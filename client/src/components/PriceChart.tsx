import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { Trade } from '../types';

interface Props {
  trades: Trade[];
}

export default function PriceChart({ trades }: Props) {
  if (trades.length === 0) {
    return (
      <div className="text-sm text-gray-400 py-8 text-center border border-gray-200 rounded-lg">
        No trade data for chart
      </div>
    );
  }

  // Sort ascending by time for the chart
  const data = [...trades]
    .sort((a, b) => new Date(a.executedAt).getTime() - new Date(b.executedAt).getTime())
    .map((t) => ({
      time: new Date(t.executedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      price: t.price,
    }));

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Price History</h3>
      <div className="border border-gray-200 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="time" fontSize={12} tick={{ fill: '#6b7280' }} />
            <YAxis fontSize={12} tick={{ fill: '#6b7280' }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ r: 3, fill: '#2563eb' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
