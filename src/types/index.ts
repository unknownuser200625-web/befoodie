export type Category =
    | 'Veg Burger'
    | 'Non Veg Burger'
    | 'Wrap'
    | 'Chicken Broast'
    | 'Sandwich'
    | 'Veg Pasta / Non Veg Pasta'
    | 'French Fries'
    | 'Waffles'
    | 'Veg Combo'
    | 'Non Veg Combo'
    | 'Hot Coffee'
    | 'Cold Coffee'
    | 'Shakes'
    | 'Mocktail';

export type OrderStatus = 'Pending' | 'Accepted' | 'Ready' | 'Served' | 'Paid';

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    category: Category;
    image: string;
    available: boolean;
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Order {
    id: string;
    tableId: string;
    sessionId: string;
    businessDate: string; // YYYY-MM-DD
    items: CartItem[];
    totalPrice: number;
    status: OrderStatus;
    timestamp: number;
}

export interface TableSession {
    id: string;
    tableId: string;
    businessDate: string; // YYYY-MM-DD
    orderIds: string[];
    totalAmount: number;
    status: 'OPEN' | 'PAID';
    createdAt: number;
    paidAt?: number;
}

export interface DailyHistory {
    date: string; // YYYY-MM-DD
    totalOrders: number;
    totalRevenue: number;
    orders: Order[];
    sessions: TableSession[];
    closedAt: number;
}
