import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getMyOrders, cancelOrder } from '../lib/api';
import { useSocket } from '../hooks/useSocket';
import type { Order, OrderBook } from '../types';

export default function OpenOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleBookUpdate = useCallback((_data: OrderBook) => {
    fetchOrders();
  }, [fetchOrders]);

  useSocket('orderBook:update', handleBookUpdate);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await cancelOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      console.error('Failed to cancel order', err);
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-sm py-4">Loading orders...</div>;
  }

  return (
    <div>
      <h3 className="font-medium text-sm mb-2">Open Orders</h3>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-400 py-3">No open orders</p>
      ) : (
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">Side</th>
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Time</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100"
                >
                  <td className={`px-3 py-2 ${order.side === 'BID' ? 'text-green-700' : 'text-red-600'}`}>
                    {order.side}
                  </td>
                  <td className="px-3 py-2">${order.price.toFixed(2)}</td>
                  <td className="px-3 py-2">{order.quantity}</td>
                  <td className="px-3 py-2 text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancelling === order.id}
                      className="text-xs text-red-500 hover:underline disabled:opacity-50"
                    >
                      {cancelling === order.id ? '...' : 'Cancel'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      )}
    </div>
  );
}
