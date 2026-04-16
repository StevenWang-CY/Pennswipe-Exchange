import { useState } from 'react';
import { motion } from 'framer-motion';
import { placeOrder } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import type { Side } from '../types';

export default function OrderForm() {
  const { isAuthenticated } = useAuth();
  const [side, setSide] = useState<Side>('BID');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="border border-gray-200 rounded p-5 text-center text-sm">
        <p className="text-gray-500 mb-3">Log in to place orders</p>
        <Link to="/login" className="text-blue-600 hover:underline">
          Login
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const priceNum = parseFloat(price);
    if (!priceNum || priceNum <= 0) {
      setError('Enter a valid price');
      return;
    }

    setLoading(true);
    try {
      const res = await placeOrder({ side, price: priceNum, quantity: 1 });
      if (res.data.trade) {
        setSuccess(`Trade executed at $${res.data.trade.price.toFixed(2)}!`);
      } else {
        setSuccess(`${side} order placed at $${priceNum.toFixed(2)}`);
      }
      setPrice('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded p-4">
      <h3 className="font-medium text-sm mb-3">Place Order</h3>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setSide('BID')}
          className={`flex-1 py-1.5 text-sm rounded border ${
            side === 'BID'
              ? 'bg-green-600 text-white border-green-600'
              : 'border-gray-300 text-gray-600'
          }`}
        >
          Buy (Bid)
        </button>
        <button
          type="button"
          onClick={() => setSide('ASK')}
          className={`flex-1 py-1.5 text-sm rounded border ${
            side === 'ASK'
              ? 'bg-red-500 text-white border-red-500'
              : 'border-gray-300 text-gray-600'
          }`}
        >
          Sell (Ask)
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Price per swipe</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block text-xs text-gray-500 mb-1">Quantity</label>
          <input
            type="number"
            value={1}
            disabled
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm bg-gray-50 text-gray-400"
          />
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="mb-3 text-sm text-green-600">{success}</p>
        )}

        <motion.button
          type="submit"
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          className={`w-full py-1.5 rounded text-sm text-white ${
            side === 'BID' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-500 hover:bg-red-600'
          } disabled:opacity-50`}
        >
          {loading ? 'Placing...' : `Place ${side === 'BID' ? 'Buy' : 'Sell'} Order`}
        </motion.button>
      </form>
    </div>
  );
}
