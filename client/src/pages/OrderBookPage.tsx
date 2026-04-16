import { motion } from 'framer-motion';
import OrderBook from '../components/OrderBook';
import OrderForm from '../components/OrderForm';
import BalanceDisplay from '../components/BalanceDisplay';
import { useAuth } from '../hooks/useAuth';

export default function OrderBookPage() {
  const { isAuthenticated } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto px-4 py-6"
    >
      <h1 className="text-xl font-bold mb-4">Order Book</h1>

      {isAuthenticated && (
        <div className="mb-4">
          <BalanceDisplay />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderBook />
        </div>
        <div>
          <OrderForm />
        </div>
      </div>
    </motion.div>
  );
}
