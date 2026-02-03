import MenuClient from '@/components/menu/MenuClient';

export default async function MenuPage({
    params,
}: {
    params: Promise<{ tableId: string }>;
}) {
    const { tableId } = await params;
    // Legacy route - hardcode restaurant slug to 'demo'
    const restaurantSlug = 'demo';

    return <MenuClient tableId={tableId} restaurantSlug={restaurantSlug} />;
}
