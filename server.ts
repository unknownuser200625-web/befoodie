import { createServer } from 'node:http';
import dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: '.env.local', override: true });
import next from 'next';
import { Server } from 'socket.io';
import { parse } from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as jwt from 'jsonwebtoken';
import * as cookie from 'cookie';
import { PRODUCTS } from './src/lib/data';
import { getDB, saveDB } from './src/lib/db';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Initial DB reference
let db = getDB();

function loadDB() {
    db = getDB();
    // Migrations
    if (!db.activeSessionId) {
        console.log('> Migrating old DB to session structure...');
        db.activeSessionId = db.currentBusinessDate || new Date().toISOString().split('T')[0];
        const orders = db.orders || [];
        const tableSessions = db.sessions || [];
        db.sessions = { [db.activeSessionId]: { orders, tableSessions } };
        delete db.orders;
        delete db.currentBusinessDate;
        saveDB();
    }
    // Seed
    if (db.products.length === 0) {
        console.log('> Seeding products...');
        db.products = PRODUCTS.map((p: any) => ({ ...p, available: true }));
        db.categories = db.categories?.length ? db.categories : [
            'Veg Burger', 'Non Veg Burger', 'Wrap', 'Chicken Broast', 'Sandwich',
            'Veg Pasta / Non Veg Pasta', 'French Fries', 'Waffles', 'Veg Combo',
            'Non Veg Combo', 'Hot Coffee', 'Cold Coffee', 'Shakes', 'Mocktail'
        ];
        if (!db.sessions[db.activeSessionId]) {
            db.sessions[db.activeSessionId] = { orders: [], tableSessions: [] };
        }
        saveDB();
    }
}

app.prepare().then(() => {
    // 1. Load Data
    loadDB();
    console.log(`> Security initialized. Owner Password configured: ${process.env.OWNER_PASSWORD ? 'YES' : 'NO'}`);

    let io: Server;
    (global as any).io = undefined; // Initialize

    const httpServer = createServer((req, res) => {
        const parsedUrl = parse(req.url!, true);
        const pathname = parsedUrl.pathname?.replace(/\/$/, '') || '';

        // --- API ROUTES ---

        // Helper: Auth Check
        const getAuth = () => {
            const cookies = cookie.parse(req.headers.cookie || '');
            const token = cookies['auth-token'];
            if (!token) return null;
            try {
                return jwt.verify(token, JWT_SECRET) as { role: string };
            } catch (e) {
                return null;
            }
        };

        // Auth routes (/api/auth/login, logout, status) are now handled by App Router

        // GET /api/categories
        if (pathname === '/api/categories' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(db.categories));
            return;
        }

        // POST /api/categories (CREATE)
        if (pathname === '/api/categories' && req.method === 'POST') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { name } = JSON.parse(body);
                    if (!name) throw new Error('Missing name');
                    if (db.categories.includes(name)) throw new Error('Exists');

                    db.categories.push(name);
                    saveDB();
                    if (io) io.emit('category_update', db.categories);
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, categories: db.categories }));
                } catch (e) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Failed' }));
                }
            });
            return;
        }

        // PUT /api/categories (RENAME)
        if (pathname === '/api/categories' && req.method === 'PUT') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { oldName, newName } = JSON.parse(body);
                    const index = db.categories.indexOf(oldName);
                    if (index !== -1) {
                        db.categories[index] = newName;
                        db.products.forEach((p: any) => {
                            if (p.category === oldName) p.category = newName;
                        });
                        saveDB();
                        if (io) {
                            io.emit('category_update', db.categories);
                            io.emit('products_refresh');
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Not found' }));
                    }
                } catch (e) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'System error' }));
                }
            });
            return;
        }

        // DELETE /api/categories
        if (pathname === '/api/categories' && req.method === 'DELETE') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            const name = parsedUrl.query.name as string;
            const hasProducts = db.products.some((p: any) => p.category === name);
            if (hasProducts) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Category not empty' }));
                return;
            }
            const index = db.categories.indexOf(name);
            if (index !== -1) {
                db.categories.splice(index, 1);
                saveDB();
                if (io) io.emit('category_update', db.categories);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
            } else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Not found' }));
            }
            return;
        }

        // GET /api/business-date
        if (pathname === '/api/business-date' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ date: db.activeSessionId }));
            return;
        }

        // GET /api/history handled by App Router

        // POST /api/admin/start-new-day (Session Reset)
        if (pathname === '/api/admin/start-new-day' && req.method === 'POST') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Forbidden: Owner only' }));
                return;
            }
            try {
                const currentSess = db.sessions[db.activeSessionId];
                if (currentSess) {
                    currentSess.tableSessions.forEach((ts: any) => {
                        if (ts.status === 'OPEN') {
                            ts.status = 'PAID';
                            ts.paidAt = Date.now();
                            currentSess.orders.forEach((o: any) => {
                                if (o.sessionId === ts.id) o.status = 'Paid';
                            });
                        }
                    });

                    db.history.push({
                        date: db.activeSessionId,
                        totalOrders: currentSess.orders.length,
                        totalRevenue: currentSess.tableSessions.reduce((sum: number, s: any) => sum + s.totalAmount, 0),
                        orders: currentSess.orders,
                        sessions: currentSess.tableSessions,
                        closedAt: Date.now()
                    });
                }

                const newSessionId = new Date().toISOString().split('T')[0] + '-' + Date.now();
                db.activeSessionId = newSessionId;
                db.sessions[newSessionId] = { orders: [], tableSessions: [] };

                saveDB();

                if (io) {
                    console.log(`> Broasting Session Reset: ${newSessionId}`);
                    io.emit('day_reset', { date: newSessionId });
                    io.emit('orders_refresh');
                    io.emit('session_updated', null);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true, newDate: newSessionId }));
            } catch (e) {
                console.error('Reset error', e);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Reset failed' }));
            }
            return;
        }

        // GET /api/products
        if (pathname === '/api/products' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(db.products));
            return;
        }

        // GET /api/orders
        if (pathname === '/api/orders' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            const sess = db.sessions[db.activeSessionId];
            res.end(JSON.stringify(sess?.orders || []));
            return;
        }

        // GET /api/sessions (Active table sessions)
        if (pathname === '/api/sessions' && req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            const sess = db.sessions[db.activeSessionId];
            res.end(JSON.stringify(sess?.tableSessions || []));
            return;
        }

        // PUT /api/sessions/pay (Mark Paid)
        if (pathname === '/api/sessions/pay' && req.method === 'PUT') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { sessionId } = JSON.parse(body);
                    const currentSess = db.sessions[db.activeSessionId];
                    const ts = currentSess?.tableSessions.find((s: any) => s.id === sessionId);
                    if (ts) {
                        ts.status = 'PAID';
                        ts.paidAt = Date.now();
                        currentSess.orders.forEach((o: any) => {
                            if (o.sessionId === sessionId) o.status = 'Paid';
                        });
                        saveDB();
                        if (io) {
                            io.emit('session_updated', ts);
                            io.emit('orders_refresh');
                        }
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(ts));
                    } else {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Table session not found' }));
                    }
                } catch (e) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Payment failed' }));
                }
            });
            return;
        }

        // PUT /api/orders (Update Status)
        if (pathname === '/api/orders' && req.method === 'PUT') {
            const auth = getAuth();
            if (!auth) {
                res.statusCode = 401;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { id, status } = JSON.parse(body);
                    const currentSess = db.sessions[db.activeSessionId];
                    const order = currentSess?.orders.find((o: any) => o.id === id);
                    if (order) {
                        order.status = status;
                        saveDB();
                        if (io) io.emit('order_updated', order);
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(order));
                    } else {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Order not found' }));
                    }
                } catch (e) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Update failed' }));
                }
            });
            return;
        }

        // POST /api/orders (Create Order)
        if (pathname === '/api/orders' && req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const orderData = JSON.parse(body);
                    if (!orderData.items || !orderData.totalPrice || !orderData.tableId) throw new Error('Invalid order');

                    const currentSess = db.sessions[db.activeSessionId];
                    if (!currentSess) throw new Error('No active session found');

                    let ts = currentSess.tableSessions.find((s: any) => s.tableId === orderData.tableId && s.status === 'OPEN');
                    if (!ts) {
                        ts = {
                            id: `ts-${Date.now()}`,
                            tableId: orderData.tableId,
                            businessDate: db.activeSessionId,
                            orderIds: [],
                            totalAmount: 0,
                            status: 'OPEN',
                            createdAt: Date.now()
                        };
                        currentSess.tableSessions.push(ts);
                    }

                    const newOrder = {
                        ...orderData,
                        id: `ord-${Date.now()}`,
                        sessionId: ts.id,
                        businessDate: db.activeSessionId,
                        status: 'Pending',
                        timestamp: Date.now()
                    };

                    currentSess.orders.push(newOrder);
                    ts.orderIds.push(newOrder.id);
                    ts.totalAmount += newOrder.totalPrice;

                    saveDB();
                    if (io) {
                        io.emit('new_order', newOrder);
                        io.emit('session_updated', ts);
                    }
                    console.log(`API: New Order ${newOrder.id} for Table ${orderData.tableId}`);
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(newOrder));
                } catch (e) {
                    console.error('API: Order Error', e);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Order creation failed' }));
                }
            });
            return;
        }

        // POST /api/products/toggle
        if (pathname === '/api/products/toggle' && req.method === 'POST') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const { id, available } = JSON.parse(body);
                    const product = db.products.find((p: any) => p.id === id);
                    if (product) {
                        product.available = available;
                        saveDB();
                        if (io) io.emit('product_updated', product);
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ success: true }));
                    } else {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Not found' }));
                    }
                } catch (e) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Error' }));
                }
            });
            return;
        }

        // POST /api/products (CREATE)
        if (pathname === '/api/products' && req.method === 'POST') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const newProduct = JSON.parse(body);
                    newProduct.id = `prod-${Date.now()}`;
                    newProduct.available = newProduct.available ?? true;
                    db.products.push(newProduct);
                    saveDB();
                    if (io) io.emit('product_added', newProduct);
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(newProduct));
                } catch (e) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Error' }));
                }
            });
            return;
        }

        // PUT /api/products (UPDATE)
        if (pathname === '/api/products' && req.method === 'PUT') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const updatedData = JSON.parse(body);
                    const index = db.products.findIndex((p: any) => p.id === updatedData.id);
                    if (index !== -1) {
                        db.products[index] = { ...db.products[index], ...updatedData };
                        saveDB();
                        if (io) io.emit('product_updated', db.products[index]);
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(db.products[index]));
                    } else {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'Not found' }));
                    }
                } catch (e) {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Error' }));
                }
            });
            return;
        }

        // DELETE /api/products
        if (pathname === '/api/products' && req.method === 'DELETE') {
            const auth = getAuth();
            if (auth?.role !== 'owner') {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Owner only' }));
                return;
            }
            const query = parsedUrl.query;
            const id = query.id as string;
            if (id) {
                const index = db.products.findIndex((p: any) => p.id === id);
                if (index !== -1) {
                    db.products.splice(index, 1);
                    saveDB();
                    if (io) io.emit('product_deleted', id);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true, id }));
                } else {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Not found' }));
                }
            } else {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Missing ID' }));
            }
            return;
        }

        handle(req, res, parsedUrl);
    });

    io = new Server(httpServer);
    (global as any).io = io;

    io.on('connection', (socket) => {
        const slug = socket.handshake.query.restaurantSlug as string;
        if (slug) {
            socket.join(slug);
            console.log(`> Socket connected to restaurant room: ${slug}`);
        }

        socket.on('join_restaurant', (slug: string) => {
            socket.join(slug);
            console.log(`> Socket joined restaurant room: ${slug}`);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
