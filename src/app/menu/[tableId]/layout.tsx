import { CartProvider } from '@/context/CartContext';

export default async function MenuLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ tableId: string }>;
}) {
    const { tableId } = await params;

    return (
        <CartProvider tableId={tableId}>
            {children}
        </CartProvider>
    );
}
