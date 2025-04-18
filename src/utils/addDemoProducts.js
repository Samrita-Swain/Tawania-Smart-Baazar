// This function adds demo products for each category

// Function to add demo products for each category
export const addDemoProductsForCategories = () => {
  // Get categories from localStorage or use default
  let categories = [];
  try {
    const storedCategories = localStorage.getItem('twania_categories');
    if (storedCategories) {
      categories = JSON.parse(storedCategories);
    }
  } catch (err) {
    console.error('Error loading categories from localStorage:', err);
  }

  // Sample product data for each main category
  const productTemplates = [
    // Groceries (category_id: 1)
    {
      name: 'Organic Rice',
      description: 'Premium quality organic rice, grown without pesticides.',
      price: 12.99,
      category_id: '10', // Packaged Foods subcategory
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'GROC-001'
    },
    {
      name: 'Herbal Tea Collection',
      description: 'Assortment of premium herbal teas from around the world.',
      price: 18.50,
      category_id: '11', // Beverages subcategory
      image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'GROC-002'
    },

    // Home & Lifestyle (category_id: 2)
    {
      name: 'Decorative Wall Clock',
      description: 'Modern wall clock with a minimalist design, perfect for any room.',
      price: 45.99,
      category_id: '12', // Home Decor subcategory
      image: 'https://images.unsplash.com/photo-1507646227500-4d389b0012be?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'HOME-001'
    },
    {
      name: 'Premium Cookware Set',
      description: 'High-quality stainless steel cookware set with non-stick coating.',
      price: 199.99,
      category_id: '13', // Kitchen & Dining subcategory
      image: 'https://images.unsplash.com/photo-1584990347449-a5d9f800a783?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'HOME-002'
    },

    // Electronics (category_id: 3) - Already has products

    // Industrial & Professional Supplies (category_id: 4)
    {
      name: 'Professional Tool Kit',
      description: 'Comprehensive tool kit for professional use with 150+ pieces.',
      price: 249.99,
      category_id: '17', // Tools & Hardware subcategory
      image: 'https://images.unsplash.com/photo-1581147036324-c47a03a81d48?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'INDUS-001'
    },
    {
      name: 'Safety Helmet',
      description: 'High-impact resistant safety helmet for construction sites.',
      price: 34.99,
      category_id: '18', // Safety Equipment subcategory
      image: 'https://images.unsplash.com/photo-1578255321055-10fa8ae5b727?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'INDUS-002'
    },

    // Sports, Toys & Luggage (category_id: 5)
    {
      name: 'Professional Basketball',
      description: 'Official size and weight basketball for indoor and outdoor play.',
      price: 29.99,
      category_id: '19', // Sports Equipment subcategory
      image: 'https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'SPORT-001'
    },
    {
      name: 'Travel Backpack',
      description: 'Durable travel backpack with multiple compartments and laptop sleeve.',
      price: 79.99,
      category_id: '21', // Luggage & Bags subcategory
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'SPORT-002'
    },

    // Crafts of India (category_id: 6)
    {
      name: 'Handcrafted Wooden Elephant',
      description: 'Traditional wooden elephant statue handcrafted by Indian artisans.',
      price: 59.99,
      category_id: '22', // Handicrafts subcategory
      image: 'https://images.unsplash.com/photo-1509112756314-34a0badb29d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'CRAFT-001'
    },
    {
      name: 'Madhubani Painting',
      description: 'Authentic Madhubani painting on handmade paper, depicting rural life.',
      price: 149.99,
      category_id: '23', // Traditional Art subcategory
      image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'CRAFT-002'
    },

    // Books, Music & Stationery (category_id: 7)
    {
      name: 'Premium Notebook Set',
      description: 'Set of 3 premium notebooks with acid-free paper and leather covers.',
      price: 24.99,
      category_id: '26', // Stationery subcategory
      image: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'BOOK-001'
    },
    {
      name: 'Acoustic Guitar',
      description: 'Full-size acoustic guitar with spruce top and mahogany back and sides.',
      price: 299.99,
      category_id: '25', // Music subcategory
      image: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'BOOK-002'
    },

    // Furniture (category_id: 8)
    {
      name: 'Ergonomic Office Chair',
      description: 'Adjustable office chair with lumbar support and breathable mesh back.',
      price: 199.99,
      category_id: '29', // Office Furniture subcategory
      image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'FURN-002'
    },
    {
      name: 'Queen Size Bed Frame',
      description: 'Solid wood queen size bed frame with headboard and under-bed storage.',
      price: 499.99,
      category_id: '28', // Bedroom subcategory
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'FURN-003'
    },

    // Wellness (category_id: 9)
    {
      name: 'Yoga Mat',
      description: 'Eco-friendly, non-slip yoga mat with alignment markings.',
      price: 39.99,
      category_id: '32', // Fitness Equipment subcategory
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'WELL-001'
    },
    {
      name: 'Multivitamin Supplements',
      description: 'Complete daily multivitamin supplements for overall health and wellbeing.',
      price: 29.99,
      category_id: '30', // Health Supplements subcategory
      image: 'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      sku: 'WELL-002'
    }
  ];

  // Get existing products from localStorage
  let products = [];
  try {
    const storedProducts = localStorage.getItem('twania_products');
    if (storedProducts) {
      products = JSON.parse(storedProducts);
    }
  } catch (err) {
    console.error('Error loading products from localStorage:', err);
  }

  // Add each product with a unique ID
  const newProducts = productTemplates.map((product, index) => {
    const newId = (products.length + index + 1).toString();
    return {
      ...product,
      id: newId,
      stock: {
        warehouse: 50,
        stores: {
          '1': 20,
          '2': 15,
          '3': 10
        }
      },
      created_at: new Date().toISOString().split('T')[0]
    };
  });

  // Combine existing and new products
  const updatedProducts = [...products, ...newProducts];

  // Save to localStorage
  try {
    localStorage.setItem('twania_products', JSON.stringify(updatedProducts));
    console.log(`Added ${newProducts.length} new products. Total products: ${updatedProducts.length}`);
  } catch (err) {
    console.error('Error saving products to localStorage:', err);
    return 0;
  }

  return newProducts.length;
};

export default addDemoProductsForCategories;
