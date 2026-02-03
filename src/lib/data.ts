import { Product } from '@/types';

export const PRODUCTS: Product[] = [
    // Veg Burger
    { id: 'vb-1', name: 'Aloo Tikki Burger', description: '', price: 40, category: 'Veg Burger', image: '', available: true },
    { id: 'vb-2', name: 'Cheese Burger', description: '', price: 50, category: 'Veg Burger', image: '', available: true },
    { id: 'vb-3', name: 'Double Cheese Burger', description: '', price: 60, category: 'Veg Burger', image: '', available: true },
    { id: 'vb-4', name: 'Paneer Tikki Burger', description: '', price: 60, category: 'Veg Burger', image: '', available: true },
    { id: 'vb-5', name: 'Veggie Burger', description: '', price: 60, category: 'Veg Burger', image: '', available: true },

    // Non Veg Burger
    { id: 'nvb-1', name: 'Chicken Zinger Burger', description: '', price: 80, category: 'Non Veg Burger', image: '', available: true },
    { id: 'nvb-2', name: 'Chicken Cheese Burger', description: '', price: 90, category: 'Non Veg Burger', image: '', available: true },
    { id: 'nvb-3', name: 'Double Cheese Burger', description: '', price: 100, category: 'Non Veg Burger', image: '', available: true },
    { id: 'nvb-4', name: 'Jumbo Zinger Burger', description: '', price: 130, category: 'Non Veg Burger', image: '', available: true },
    { id: 'nvb-5', name: 'Chicken Patty Burger', description: '', price: 80, category: 'Non Veg Burger', image: '', available: true },
    { id: 'nvb-6', name: 'Chicken Tandoori Burger', description: '', price: 80, category: 'Non Veg Burger', image: '', available: true },

    // Wrap
    { id: 'wr-1', name: 'Veg Wrap', description: '', price: 50, category: 'Wrap', image: '', available: true },
    { id: 'wr-2', name: 'Paneer Wrap', description: '', price: 70, category: 'Wrap', image: '', available: true },
    { id: 'wr-3', name: 'Paneer Cheese Wrap', description: '', price: 80, category: 'Wrap', image: '', available: true },
    { id: 'wr-4', name: 'Chicken Wrap', description: '', price: 100, category: 'Wrap', image: '', available: true },
    { id: 'wr-5', name: 'Chicken Cheese Wrap', description: '', price: 110, category: 'Wrap', image: '', available: true },

    // Chicken Broast
    { id: 'cb-1-s', name: 'Chicken Popcorn (S)', description: '', price: 100, category: 'Chicken Broast', image: '', available: true },
    { id: 'cb-1-m', name: 'Chicken Popcorn (M)', description: '', price: 200, category: 'Chicken Broast', image: '', available: true },
    { id: 'cb-1-l', name: 'Chicken Popcorn (L)', description: '', price: 300, category: 'Chicken Broast', image: '', available: true },
    { id: 'cb-2', name: 'Chicken Strips (5pcs)', description: '', price: 150, category: 'Chicken Broast', image: '', available: true },
    { id: 'cb-3', name: 'Chicken Hot Wings (5pcs)', description: '', price: 130, category: 'Chicken Broast', image: '', available: true },

    // Sandwich
    { id: 'sw-1', name: 'Veg Sandwich', description: '', price: 50, category: 'Sandwich', image: '', available: true },
    { id: 'sw-2', name: 'Paneer Sandwich', description: '', price: 70, category: 'Sandwich', image: '', available: true },
    { id: 'sw-3', name: 'Chicken Sandwich', description: '', price: 90, category: 'Sandwich', image: '', available: true },
    { id: 'sw-4', name: 'Chicken Tandoori Sandwich', description: '', price: 100, category: 'Sandwich', image: '', available: true },

    // Veg Pasta / Non Veg Pasta
    { id: 'pst-1', name: 'Red Sauce Pasta', description: '', price: 100, category: 'Veg Pasta / Non Veg Pasta', image: '', available: true },
    { id: 'pst-2', name: 'White Sauce Pasta', description: '', price: 120, category: 'Veg Pasta / Non Veg Pasta', image: '', available: true },
    { id: 'pst-3', name: 'Chicken Pasta', description: '', price: 180, category: 'Veg Pasta / Non Veg Pasta', image: '', available: true },

    // French Fries
    { id: 'ff-1', name: 'Classic French Fries', description: '', price: 50, category: 'French Fries', image: '', available: true },
    { id: 'ff-2', name: 'Peri Peri Masala Fries', description: '', price: 60, category: 'French Fries', image: '', available: true },
    { id: 'ff-3', name: 'Cheesy Loaded Fries', description: '', price: 100, category: 'French Fries', image: '', available: true },
    { id: 'ff-4', name: 'Chicken Cheese Loaded Fries', description: '', price: 150, category: 'French Fries', image: '', available: true },

    // Waffles
    { id: 'wf-1', name: 'Belgian Classic', description: '', price: 80, category: 'Waffles', image: '', available: true },
    { id: 'wf-2', name: 'Banana Walnut Delight', description: '', price: 100, category: 'Waffles', image: '', available: true },
    { id: 'wf-3', name: 'Chocolate Dream', description: '', price: 90, category: 'Waffles', image: '', available: true },
    { id: 'wf-4', name: 'Nutella Thrill', description: '', price: 100, category: 'Waffles', image: '', available: true },
    { id: 'wf-5', name: 'Kit Kat', description: '', price: 100, category: 'Waffles', image: '', available: true },
    { id: 'wf-6', name: 'Choco Chip', description: '', price: 100, category: 'Waffles', image: '', available: true },
    { id: 'wf-7', name: 'Red Velvet', description: '', price: 120, category: 'Waffles', image: '', available: true },

    // Veg Combo
    { id: 'vc-1', name: 'Veg Burger, Fries, Cold Drink', description: '', price: 100, category: 'Veg Combo', image: '', available: true },
    { id: 'vc-2', name: 'Paneer Burger, Fries, Cold Drink', description: '', price: 110, category: 'Veg Combo', image: '', available: true },
    { id: 'vc-3', name: 'Bronze Pizza, Fries, Cold Drink', description: '', price: 150, category: 'Veg Combo', image: '', available: true },
    { id: 'vc-4', name: 'Silver Pizza, Fries, Cold Drink', description: '', price: 220, category: 'Veg Combo', image: '', available: true },
    { id: 'vc-5', name: 'Gold Pizza, Fries, Cold Drink', description: '', price: 280, category: 'Veg Combo', image: '', available: true },
    { id: 'vc-6', name: 'Bronze Pizza, Aloo Tikki Burger, Fries, Cold Drink', description: '', price: 200, category: 'Veg Combo', image: '', available: true },
    { id: 'vc-7', name: 'Silver Pizza, Paneer Burger, Fries, Cold Drink', description: '', price: 280, category: 'Veg Combo', image: '', available: true },
    { id: 'vc-8', name: 'Gold Pizza, Veggie Burger, Fries, Cold Drink', description: '', price: 340, category: 'Veg Combo', image: '', available: true },

    // Non Veg Combo
    { id: 'nvc-1', name: 'Zinger Burger, Fries, Cold Drink', description: '', price: 130, category: 'Non Veg Combo', image: '', available: true },
    { id: 'nvc-2', name: 'Wrap, Fries, Cold Drink', description: '', price: 150, category: 'Non Veg Combo', image: '', available: true },
    { id: 'nvc-3', name: 'Chicken Popcorn, Fries, Cold Drink', description: '', price: 180, category: 'Non Veg Combo', image: '', available: true },
    { id: 'nvc-4', name: 'Chicken Strips, Fries, Cold Drink', description: '', price: 200, category: 'Non Veg Combo', image: '', available: true },
    { id: 'nvc-5', name: 'Chicken Wings, Fries, Cold Drink', description: '', price: 180, category: 'Non Veg Combo', image: '', available: true },
    { id: 'nvc-6', name: 'Popcorn, Strips, Wings, Cold Drink', description: '', price: 380, category: 'Non Veg Combo', image: '', available: true },
    { id: 'nvc-7', name: 'Chicken Broast Pizza, Zinger Burger, Cold Drink', description: '', price: 290, category: 'Non Veg Combo', image: '', available: true },
    { id: 'nvc-8', name: 'Chicken Tandoori Pizza, Zinger Burger, Cold Drink', description: '', price: 330, category: 'Non Veg Combo', image: '', available: true },

    // Hot Coffee
    { id: 'hc-1', name: 'Coffee', description: '', price: 40, category: 'Hot Coffee', image: '', available: true },
    { id: 'hc-2', name: 'Espresso', description: '', price: 70, category: 'Hot Coffee', image: '', available: true },
    { id: 'hc-3', name: 'Capaccino', description: '', price: 80, category: 'Hot Coffee', image: '', available: true },
    { id: 'hc-4', name: 'Americano', description: '', price: 80, category: 'Hot Coffee', image: '', available: true },
    { id: 'hc-5', name: 'Latte', description: '', price: 90, category: 'Hot Coffee', image: '', available: true },
    { id: 'hc-6', name: 'Frapaccino', description: '', price: 90, category: 'Hot Coffee', image: '', available: true },
    { id: 'hc-7', name: 'Mocha', description: '', price: 90, category: 'Hot Coffee', image: '', available: true },

    // Cold Coffee
    { id: 'cc-1', name: 'Iced Coffee', description: '', price: 80, category: 'Cold Coffee', image: '', available: true },
    { id: 'cc-2', name: 'Iced Capaccino', description: '', price: 90, category: 'Cold Coffee', image: '', available: true },
    { id: 'cc-3', name: 'Cold Brew', description: '', price: 90, category: 'Cold Coffee', image: '', available: true },
    { id: 'cc-4', name: 'Frapaccino', description: '', price: 100, category: 'Cold Coffee', image: '', available: true },
    { id: 'cc-5', name: 'Iced Latte', description: '', price: 110, category: 'Cold Coffee', image: '', available: true },
    { id: 'cc-6', name: 'Iced Americano', description: '', price: 110, category: 'Cold Coffee', image: '', available: true },
    { id: 'cc-7', name: 'Iced Mocha', description: '', price: 110, category: 'Cold Coffee', image: '', available: true },

    // Shakes
    { id: 'sh-1', name: 'Chocolate', description: '', price: 80, category: 'Shakes', image: '', available: true },
    { id: 'sh-2', name: 'Vanilla', description: '', price: 80, category: 'Shakes', image: '', available: true },
    { id: 'sh-3', name: 'Strawberry', description: '', price: 80, category: 'Shakes', image: '', available: true },
    { id: 'sh-4', name: 'Butter Scotch', description: '', price: 80, category: 'Shakes', image: '', available: true },
    { id: 'sh-5', name: 'Kitkat', description: '', price: 80, category: 'Shakes', image: '', available: true },
    { id: 'sh-6', name: 'Oreo', description: '', price: 80, category: 'Shakes', image: '', available: true },
    { id: 'sh-7', name: 'Chocolate Vanilla', description: '', price: 100, category: 'Shakes', image: '', available: true },
    { id: 'sh-8', name: 'Choco Strawberry', description: '', price: 100, category: 'Shakes', image: '', available: true },
    { id: 'sh-9', name: 'Oreo Strawberry', description: '', price: 100, category: 'Shakes', image: '', available: true },

    // Mocktail
    { id: 'mt-1', name: 'Virgin Mojito', description: '', price: 80, category: 'Mocktail', image: '', available: true },
    { id: 'mt-2', name: 'Strawberry Lemonade', description: '', price: 90, category: 'Mocktail', image: '', available: true },
    { id: 'mt-3', name: 'Blue Lagoon', description: '', price: 90, category: 'Mocktail', image: '', available: true },
    { id: 'mt-4', name: 'Orange Mocktail', description: '', price: 90, category: 'Mocktail', image: '', available: true },
    { id: 'mt-5', name: 'Blueberry Lime', description: '', price: 90, category: 'Mocktail', image: '', available: true },
];
