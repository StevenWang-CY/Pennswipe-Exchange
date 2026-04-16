import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BalanceDisplay from '../components/BalanceDisplay';
import OpenOrders from '../components/OpenOrders';
import TradeHistory from '../components/TradeHistory';
import { getMyTrades } from '../lib/api';
import type { Trade } from '../types';

export default function DashboardPage() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    getMyTrades().then((res) => setTrades(res.data)).catch(console.error);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>

      <div className="space-y-6">
        <BalanceDisplay />
        <OpenOrders />
        <TradeHistory trades={trades} title="My Trade History" />
      </div>
    </motion.div>
  );
}
