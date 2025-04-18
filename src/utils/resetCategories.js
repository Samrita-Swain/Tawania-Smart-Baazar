import { categories as demoCategories } from '../data/demoData';

// The main categories we want to keep
const mainCategoryNames = [
  'Groceries',
  'Home & Lifestyle',
  'Electronics',
  'Industrial & Professional Supplies',
  'Sports, Toys & Luggage',
  'Crafts of India',
  'Books, Music & Stationery',
  'Furniture',
  'Wellness'
];

// Function to reset categories to only include the specified main categories
export const resetCategoriesToMain = () => {
  try {
    // Get only the main categories that match our list
    const mainCategories = demoCategories.filter(
      cat => cat.parentId === null && mainCategoryNames.includes(cat.name)
    );
    
    // Get subcategories of these main categories
    const subcategories = demoCategories.filter(
      cat => cat.parentId !== null && mainCategories.some(main => main.id === cat.parentId)
    );
    
    // Combine main categories and their subcategories
    const filteredCategories = [...mainCategories, ...subcategories];
    
    // Save to localStorage
    localStorage.setItem('twania_categories', JSON.stringify(filteredCategories));
    
    console.log('Categories reset to main categories only:', filteredCategories);
    return filteredCategories;
  } catch (err) {
    console.error('Error resetting categories:', err);
    return null;
  }
};

export default resetCategoriesToMain;
