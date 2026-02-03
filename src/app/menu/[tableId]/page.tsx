import MenuClient from '@/components/menu/MenuClient';
import { CartProvider } from '@/context/CartContext';

export default async function MenuPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const { tableId } = await params;
    return (
        <CartProvider tableId={tableId}>
            <MenuClient tableId={tableId} />
        </CartProvider>
    );
}
