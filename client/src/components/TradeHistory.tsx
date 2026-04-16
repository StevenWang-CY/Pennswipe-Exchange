import type { Trade } from '../types';

interface Props {
  trades: Trade[];
  title?: string;
}

export default function TradeHistory({ trades, title = 'Recent Trades' }: Props) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-2">{title}</h3>
      {trades.length === 0 ? (
        <p className="text-sm text-gray-400 py-3">No trades yet</p>
      ) : (
        <table className="w-full text-sm border border-gray-200">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500">
              <th className="px-3 py-2 font-medium">Price</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Buyer</th>
              <th className="px-3 py-2 font-medium">Seller</th>
              <th className="px-3 py-2 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id} className="border-t border-gray-100">
                <td className="px-3 py-2 font-medium">${trade.price.toFixed(2)}</td>
                <td className="px-3 py-2">{trade.quantity}</td>
                <td className="px-3 py-2">{trade.buyerUsername}</td>
                <td className="px-3 py-2">{trade.sellerUsername}</td>
                <td className="px-3 py-2 text-gray-500">
                  {new Date(trade.executedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
