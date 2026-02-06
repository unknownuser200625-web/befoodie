
export interface Restaurant {
    id: string;
    name: string;
    slug: string; // unique
    logo_url?: string;
    owner_password_hash: string;
    staff_pin_hash: string;
    active_session_id?: string;
    created_at: number;
}

export interface Product {
    id: string;
    restaurant_id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    available: boolean;
    food_type?: 'veg' | 'non-veg' | 'egg';
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Category {
    id: string;
    restaurant_id: string;
    name: string;
    order_index: number;
}

export type OrderStatus = 'Pending' | 'Accepted' | 'Preparing' | 'Ready' | 'Served' | 'Paid' | 'Cancelled';

export interface Order {
    id: string;
    restaurant_id: string;
    sessionId: string;
    tableId: string;
    items: OrderItem[];
    totalPrice: number;
    status: OrderStatus;
    timestamp: number;
    businessDate?: string;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export interface TableSession {
    id: string;
    restaurant_id: string;
    tableId: string;
    businessDate: string;
    orderIds: string[];
    totalAmount: number;
    status: 'OPEN' | 'PAID';
    createdAt: number;
    paidAt?: number;
}

export interface DailyHistory {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    orders: Order[];
    sessions: TableSession[];
    closedAt: number;
}
