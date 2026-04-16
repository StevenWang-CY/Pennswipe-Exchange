import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getOrderBook } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import type { OrderBook as OrderBookType } from '../types';

export default function OrderBook() {
  const [book, setBook] = useState<OrderBookType>({ bids: [], asks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderBook()
      .then((res) => setBook(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = useCallback((data: OrderBookType) => {
    setBook(data);
  }, []);

  useSocket('orderBook:update', handleUpdate);

  if (loading) {
    return <div className="text-center py-8 text-gray-400 text-sm">Loading order book...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Bids */}
      <div>
        <h3 className="font-medium mb-2 text-sm">Bids (Buy Orders)</h3>
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">User</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {book.bids.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-400">
                    No bids
                  </td>
                </tr>
              ) : (
                book.bids.map((bid) => (
                  <motion.tr
                    key={bid.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="border-t border-gray-100"
                  >
                    <td className="px-3 py-2 text-green-700 font-medium">
                      ${bid.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{bid.quantity}</td>
                    <td className="px-3 py-2 text-gray-500">{bid.username}</td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Asks */}
      <div>
        <h3 className="font-medium mb-2 text-sm">Asks (Sell Orders)</h3>
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">User</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {book.asks.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-4 text-center text-gray-400">
                    No asks
                  </td>
                </tr>
              ) : (
                book.asks.map((ask) => (
                  <motion.tr
                    key={ask.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="border-t border-gray-100"
                  >
                    <td className="px-3 py-2 text-red-600 font-medium">
                      ${ask.price.toFixed(2)}
                    </td>
                    <td className="px-3 py-2">{ask.quantity}</td>
                    <td className="px-3 py-2 text-gray-500">{ask.username}</td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
