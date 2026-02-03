import { CartProvider } from '@/context/CartContext';

export default async function MenuLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ tableId: string }>;
}) {
    const { tableId } = await params;
    // Legacy route - hardcode restaurant slug to 'demo'
    const restaurantSlug = 'demo';

    return (
        <CartProvider tableId={tableId} restaurantSlug={restaurantSlug}>
            {children}
        </CartProvider>
    );
}
