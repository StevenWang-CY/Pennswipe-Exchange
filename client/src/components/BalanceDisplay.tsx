import { useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

export default function BalanceDisplay() {
  const { user, updateUser } = useAuth();

  const handleBalanceUpdate = useCallback(
    (data: { diningDollarBalance: number; swipeBalance: number }) => {
      if (user) {
        updateUser({ ...user, ...data });
      }
    },
    [user, updateUser]
  );

  useSocket('balance:update', handleBalanceUpdate);

  if (!user) return null;

  return (
    <div className="flex gap-4 text-sm">
      <div className="border border-gray-200 rounded px-4 py-2 flex-1">
        <span className="text-gray-500">Dining Dollars: </span>
        <span className="font-semibold">${user.diningDollarBalance.toFixed(2)}</span>
      </div>
      <div className="border border-gray-200 rounded px-4 py-2 flex-1">
        <span className="text-gray-500">Swipes: </span>
        <span className="font-semibold">{user.swipeBalance}</span>
      </div>
    </div>
  );
}
