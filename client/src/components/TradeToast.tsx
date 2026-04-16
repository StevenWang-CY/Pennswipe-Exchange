import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import type { Trade } from '../types';

export default function TradeToast() {
  const [toasts, setToasts] = useState<(Trade & { key: number })[]>([]);

  const handleTrade = useCallback((trade: Trade) => {
    const key = Date.now();
    setToasts((prev) => [...prev, { ...trade, key }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.key !== key));
    }, 3000);
  }, []);

  useSocket('trade:executed', handleTrade);

  return (
    <div className="fixed top-14 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.key}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="bg-white border border-gray-300 shadow rounded px-4 py-2 text-sm"
          >
            <span className="font-medium">{toast.buyerUsername}</span>
            {' bought from '}
            <span className="font-medium">{toast.sellerUsername}</span>
            {' at '}
            <span className="font-semibold">${toast.price.toFixed(2)}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
