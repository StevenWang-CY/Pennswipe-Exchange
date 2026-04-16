export type Side = 'BID' | 'ASK';
export type OrderStatus = 'OPEN' | 'FILLED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  diningDollarBalance: number;
  swipeBalance: number;
  createdAt: string;
}

export interface Order {
  id: string;
  side: Side;
  price: number;
  quantity: number;
  status: OrderStatus;
  createdAt: string;
  username?: string;
}

export interface Trade {
  id: string;
  price: number;
  quantity: number;
  buyerUsername: string;
  sellerUsername: string;
  executedAt: string;
}

export interface OrderBook {
  bids: Order[];
  asks: Order[];
}
