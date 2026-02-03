import MenuClient from '@/components/menu/MenuClient';
import { CartProvider } from '@/context/CartContext';

export default async function MenuPage({
    params,
}: {
    params: Promise<{ restaurantSlug: string; tableNumber: string }>;
}) {
    const { restaurantSlug, tableNumber } = await params;
    return (
        <CartProvider tableId={tableNumber} restaurantSlug={restaurantSlug}>
            <MenuClient tableId={tableNumber} restaurantSlug={restaurantSlug} />
        </CartProvider>
    );
}