import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTrades } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';
import type { Trade } from '../types';

export default function HomePage() {
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    getTrades(5).then((res) => setRecentTrades(res.data)).catch(console.error);
  }, []);

  const handleNewTrade = useCallback((trade: Trade) => {
    setRecentTrades((prev) => [trade, ...prev].slice(0, 5));
  }, []);

  useSocket('trade:executed', handleNewTrade);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto px-4 py-10"
    >
      <h1 className="text-2xl font-bold mb-2">PennSwipe Exchange</h1>
      <p className="text-gray-500 text-sm mb-6">
        A real-time marketplace for trading Penn dining swipes. Place bids and asks, and watch trades happen live.
      </p>

      <div className="flex gap-3 mb-8">
        <Link to="/book" className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
          View Order Book
        </Link>
        {!isAuthenticated && (
          <Link to="/register" className="px-4 py-2 border border-gray-300 text-sm rounded text-gray-700 hover:bg-gray-50">
            Get Started
          </Link>
        )}
      </div>

      <div>
        <h2 className="font-medium text-sm mb-2">Live Trades</h2>
        {recentTrades.length === 0 ? (
          <p className="text-sm text-gray-400">No trades yet. Be the first!</p>
        ) : (
          <table className="w-full text-sm border border-gray-200">
            <thead>
              <tr className="bg-gray-50 text-left text-gray-500">
                <th className="px-3 py-2 font-medium">Buyer</th>
                <th className="px-3 py-2 font-medium">Seller</th>
                <th className="px-3 py-2 font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade, i) => (
                <tr key={trade.id || i} className="border-t border-gray-100">
                  <td className="px-3 py-2">{trade.buyerUsername}</td>
                  <td className="px-3 py-2">{trade.sellerUsername}</td>
                  <td className="px-3 py-2 font-medium">${trade.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
}
