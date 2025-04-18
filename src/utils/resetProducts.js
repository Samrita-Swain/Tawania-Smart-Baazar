// Utility to reset products with properly categorized demo data

// Sample product data organized by category
const demoProducts = [
  // Groceries (category_id: 1)
  {
    name: 'Organic Rice',
    description: 'Premium quality organic rice, grown without pesticides.',
    price: 12.99,
    category_id: '10', // Packaged Foods subcategory
    category_name: 'Packaged Foods',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'GROC-001'
  },
  {
    name: 'Herbal Tea Collection',
    description: 'Assortment of premium herbal teas from around the world.',
    price: 18.50,
    category_id: '11', // Beverages subcategory
    category_name: 'Beverages',
    image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'GROC-002'
  },
  {
    name: 'Organic Honey',
    description: 'Pure, raw organic honey sourced from sustainable apiaries.',
    price: 9.99,
    category_id: '10', // Packaged Foods subcategory
    category_name: 'Packaged Foods',
    image: 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'GROC-003'
  },
  {
    name: 'Cold-Pressed Juice Pack',
    description: 'Variety pack of cold-pressed fruit and vegetable juices.',
    price: 24.99,
    category_id: '11', // Beverages subcategory
    category_name: 'Beverages',
    image: 'https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'GROC-004'
  },
  
  // Home & Lifestyle (category_id: 2)
  {
    name: 'Decorative Wall Clock',
    description: 'Modern wall clock with a minimalist design, perfect for any room.',
    price: 45.99,
    category_id: '12', // Home Decor subcategory
    category_name: 'Home Decor',
    image: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'HOME-001'
  },
  {
    name: 'Premium Cookware Set',
    description: 'High-quality stainless steel cookware set with non-stick coating.',
    price: 199.99,
    category_id: '13', // Kitchen & Dining subcategory
    category_name: 'Kitchen & Dining',
    image: 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'HOME-002'
  },
  {
    name: 'Scented Candle Set',
    description: 'Set of 3 premium scented candles in decorative glass jars.',
    price: 29.99,
    category_id: '12', // Home Decor subcategory
    category_name: 'Home Decor',
    image: 'https://images.unsplash.com/photo-1603006905393-c279c4320be5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'HOME-003'
  },
  {
    name: 'Ceramic Dinner Set',
    description: 'Complete 16-piece ceramic dinner set for 4 people.',
    price: 89.99,
    category_id: '13', // Kitchen & Dining subcategory
    category_name: 'Kitchen & Dining',
    image: 'https://images.unsplash.com/photo-1603199506016-b9a594b593c0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'HOME-004'
  },
  
  // Electronics (category_id: 3)
  {
    name: 'Smartphone X',
    description: 'Latest smartphone with advanced features including a high-resolution camera, fast processor, and long-lasting battery.',
    price: 999.99,
    category_id: '14', // Smartphones subcategory
    category_name: 'Smartphones',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'ELEC-001'
  },
  {
    name: 'Laptop Pro',
    description: 'Powerful laptop with high-performance processor, ample storage, and stunning display.',
    price: 1499.99,
    category_id: '15', // Laptops & Computers subcategory
    category_name: 'Laptops & Computers',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'ELEC-002'
  },
  {
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling wireless headphones with long battery life.',
    price: 299.99,
    category_id: '16', // Audio & Video subcategory
    category_name: 'Audio & Video',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'ELEC-003'
  },
  {
    name: 'Smart TV 55"',
    description: '55-inch 4K Ultra HD Smart TV with built-in streaming apps.',
    price: 699.99,
    category_id: '16', // Audio & Video subcategory
    category_name: 'Audio & Video',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'ELEC-004'
  },
  
  // Industrial & Professional Supplies (category_id: 4)
  {
    name: 'Professional Tool Kit',
    description: 'Comprehensive tool kit for professional use with 150+ pieces.',
    price: 249.99,
    category_id: '17', // Tools & Hardware subcategory
    category_name: 'Tools & Hardware',
    image: 'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'INDUS-001'
  },
  {
    name: 'Safety Helmet',
    description: 'High-impact resistant safety helmet for construction sites.',
    price: 34.99,
    category_id: '18', // Safety Equipment subcategory
    category_name: 'Safety Equipment',
    image: 'https://images.unsplash.com/photo-1578255321055-10fa8ae5b727?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'INDUS-002'
  },
  {
    name: 'Cordless Drill Set',
    description: 'Professional-grade cordless drill with multiple attachments and two batteries.',
    price: 179.99,
    category_id: '17', // Tools & Hardware subcategory
    category_name: 'Tools & Hardware',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'INDUS-003'
  },
  {
    name: 'High-Visibility Vest',
    description: 'ANSI-compliant high-visibility safety vest with reflective strips.',
    price: 19.99,
    category_id: '18', // Safety Equipment subcategory
    category_name: 'Safety Equipment',
    image: 'https://images.unsplash.com/photo-1622398925373-3f91b1e275f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'INDUS-004'
  },
  
  // Sports, Toys & Luggage (category_id: 5)
  {
    name: 'Professional Basketball',
    description: 'Official size and weight basketball for indoor and outdoor play.',
    price: 29.99,
    category_id: '19', // Sports Equipment subcategory
    category_name: 'Sports Equipment',
    image: 'https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'SPORT-001'
  },
  {
    name: 'Board Game Collection',
    description: 'Set of 3 classic strategy board games for family game night.',
    price: 49.99,
    category_id: '20', // Toys & Games subcategory
    category_name: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'SPORT-002'
  },
  {
    name: 'Travel Backpack',
    description: 'Durable travel backpack with multiple compartments and laptop sleeve.',
    price: 79.99,
    category_id: '21', // Luggage & Bags subcategory
    category_name: 'Luggage & Bags',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'SPORT-003'
  },
  {
    name: 'Remote Control Car',
    description: 'High-speed remote control car with rechargeable battery.',
    price: 59.99,
    category_id: '20', // Toys & Games subcategory
    category_name: 'Toys & Games',
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'SPORT-004'
  },
  
  // Crafts of India (category_id: 6)
  {
    name: 'Handcrafted Wooden Elephant',
    description: 'Traditional wooden elephant statue handcrafted by Indian artisans.',
    price: 59.99,
    category_id: '22', // Handicrafts subcategory
    category_name: 'Handicrafts',
    image: 'https://images.unsplash.com/photo-1509112756314-34a0badb29d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'CRAFT-001'
  },
  {
    name: 'Madhubani Painting',
    description: 'Authentic Madhubani painting on handmade paper, depicting rural life.',
    price: 149.99,
    category_id: '23', // Traditional Art subcategory
    category_name: 'Traditional Art',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'CRAFT-002'
  },
  {
    name: 'Brass Diya Set',
    description: 'Set of 5 intricately designed brass diyas (oil lamps) for festive occasions.',
    price: 39.99,
    category_id: '22', // Handicrafts subcategory
    category_name: 'Handicrafts',
    image: 'https://images.unsplash.com/photo-1605369179590-014a88d4560e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'CRAFT-003'
  },
  {
    name: 'Rajasthani Puppet Set',
    description: 'Traditional hand-painted Rajasthani puppets, set of 4 characters.',
    price: 49.99,
    category_id: '23', // Traditional Art subcategory
    category_name: 'Traditional Art',
    image: 'https://images.unsplash.com/photo-1602511216792-d8ccd92b6f9e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'CRAFT-004'
  },
  
  // Books, Music & Stationery (category_id: 7)
  {
    name: 'Bestseller Novel Collection',
    description: 'Set of 3 bestselling novels from acclaimed authors.',
    price: 45.99,
    category_id: '24', // Books subcategory
    category_name: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'BOOK-001'
  },
  {
    name: 'Acoustic Guitar',
    description: 'Full-size acoustic guitar with spruce top and mahogany back and sides.',
    price: 299.99,
    category_id: '25', // Music subcategory
    category_name: 'Music',
    image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'BOOK-002'
  },
  {
    name: 'Premium Notebook Set',
    description: 'Set of 3 premium notebooks with acid-free paper and leather covers.',
    price: 24.99,
    category_id: '26', // Stationery subcategory
    category_name: 'Stationery',
    image: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'BOOK-003'
  },
  {
    name: 'Vinyl Record Collection',
    description: 'Collection of 5 classic albums on high-quality vinyl records.',
    price: 129.99,
    category_id: '25', // Music subcategory
    category_name: 'Music',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'BOOK-004'
  },
  
  // Furniture (category_id: 8)
  {
    name: 'Modern Sofa',
    description: 'Contemporary 3-seater sofa with premium fabric upholstery.',
    price: 899.99,
    category_id: '27', // Living Room subcategory
    category_name: 'Living Room',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'FURN-001'
  },
  {
    name: 'Queen Size Bed Frame',
    description: 'Solid wood queen size bed frame with headboard and under-bed storage.',
    price: 499.99,
    category_id: '28', // Bedroom subcategory
    category_name: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'FURN-002'
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Adjustable office chair with lumbar support and breathable mesh back.',
    price: 199.99,
    category_id: '29', // Office Furniture subcategory
    category_name: 'Office Furniture',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'FURN-003'
  },
  {
    name: 'Dining Table Set',
    description: 'Wooden dining table with 6 matching chairs, perfect for family meals.',
    price: 649.99,
    category_id: '27', // Living Room subcategory
    category_name: 'Living Room',
    image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'FURN-004'
  },
  
  // Wellness (category_id: 9)
  {
    name: 'Yoga Mat',
    description: 'Eco-friendly, non-slip yoga mat with alignment markings.',
    price: 39.99,
    category_id: '32', // Fitness Equipment subcategory
    category_name: 'Fitness Equipment',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'WELL-001'
  },
  {
    name: 'Organic Face Cream',
    description: 'Nourishing face cream made with organic ingredients for all skin types.',
    price: 24.99,
    category_id: '31', // Beauty Products subcategory
    category_name: 'Beauty Products',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'WELL-002'
  },
  {
    name: 'Multivitamin Supplements',
    description: 'Complete daily multivitamin supplements for overall health and wellbeing.',
    price: 29.99,
    category_id: '30', // Health Supplements subcategory
    category_name: 'Health Supplements',
    image: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'WELL-003'
  },
  {
    name: 'Adjustable Dumbbell Set',
    description: 'Space-saving adjustable dumbbell set with weight range from 5-25kg per dumbbell.',
    price: 249.99,
    category_id: '32', // Fitness Equipment subcategory
    category_name: 'Fitness Equipment',
    image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    sku: 'WELL-004'
  }
];

// Function to reset products with properly categorized demo data
export const resetProductsWithCategorizedData = () => {
  try {
    // Add stock information and created_at date to each product
    const productsWithDetails = demoProducts.map((product, index) => ({
      ...product,
      id: (index + 1).toString(),
      stock: {
        warehouse: 50,
        stores: {
          '1': 20,
          '2': 15,
          '3': 10
        }
      },
      created_at: new Date().toISOString().split('T')[0]
    }));
    
    // Save to localStorage
    localStorage.setItem('twania_products', JSON.stringify(productsWithDetails));
    console.log(`Reset products with ${productsWithDetails.length} categorized items`);
    
    return productsWithDetails.length;
  } catch (err) {
    console.error('Error resetting products:', err);
    return 0;
  }
};

export default resetProductsWithCategorizedData;
