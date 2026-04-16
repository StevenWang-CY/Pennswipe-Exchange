import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import PriceChart from '../components/PriceChart';
import TradeHistory from '../components/TradeHistory';
import { getTrades } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import type { Trade } from '../types';

export default function TradeHistoryPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrades(50)
      .then((res) => setTrades(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleNewTrade = useCallback((trade: Trade) => {
    setTrades((prev) => [trade, ...prev]);
  }, []);

  useSocket('trade:executed', handleNewTrade);

  if (loading) {
    return <div className="text-center py-12 text-gray-400 text-sm">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-6"
    >
      <h1 className="text-xl font-bold mb-4">Trade History</h1>

      <div className="space-y-6">
        <PriceChart trades={trades} />
        <TradeHistory trades={trades} title="All Trades" />
      </div>
    </motion.div>
  );
}
