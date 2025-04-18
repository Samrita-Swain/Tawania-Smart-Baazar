/**
 * Utility functions for working with categories
 */

/**
 * Find categories that have no products
 * @param {Array} categories - The list of categories
 * @param {Array} products - The list of products
 * @returns {Array} - Categories with no products
 */
export const findEmptyCategories = (categories, products) => {
  if (!categories || !products) return [];

  return categories.filter(category => {
    // Check if any products are directly in this category
    const hasDirectProducts = products.some(product => product.category_id === category.id);

    // If this is a parent category, check if any products are in its subcategories
    if (!hasDirectProducts && category.parentId === null) {
      const subcategoryIds = categories
        .filter(cat => cat.parentId === category.id)
        .map(cat => cat.id);

      const hasSubcategoryProducts = products.some(product =>
        subcategoryIds.includes(product.category_id)
      );

      return !hasSubcategoryProducts;
    }

    return !hasDirectProducts;
  });
};

/**
 * Check if a category has any products
 * @param {string} categoryId - The category ID to check
 * @param {Array} categories - The list of categories
 * @param {Array} products - The list of products
 * @returns {boolean} - True if the category has products, false otherwise
 */
export const categoryHasProducts = (categoryId, categories, products) => {
  if (!categoryId || !categories || !products) return false;

  // Convert categoryId to number for consistent comparison
  const categoryIdNum = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
  console.log(`Checking if category ${categoryIdNum} has products...`);

  // Check if any products are directly in this category
  const hasDirectProducts = products.some(product => {
    // Convert product.category_id to number for consistent comparison
    const productCategoryId = product.category_id ?
      (typeof product.category_id === 'string' ? parseInt(product.category_id, 10) : product.category_id) :
      null;
    const match = productCategoryId === categoryIdNum;

    if (match) {
      console.log(`Found direct match: Product ${product.name} has category_id ${productCategoryId}`);
    }

    return match;
  });

  // If this is a parent category, check if any products are in its subcategories
  if (!hasDirectProducts) {
    console.log(`No direct products found for category ${categoryIdNum}, checking subcategories...`);

    // Find the category object by ID, comparing as numbers
    const category = categories.find(cat => {
      const catId = typeof cat.id === 'string' ? parseInt(cat.id, 10) : cat.id;
      return catId === categoryIdNum;
    });

    if (category && !category.parentId) {
      console.log(`Category ${category.name} (${categoryIdNum}) is a parent category, checking subcategories...`);

      // Get all subcategory IDs for this parent category
      const subcategoryIds = categories
        .filter(cat => {
          const parentId = cat.parentId ?
            (typeof cat.parentId === 'string' ? parseInt(cat.parentId, 10) : cat.parentId) :
            null;
          return parentId === categoryIdNum;
        })
        .map(cat => typeof cat.id === 'string' ? parseInt(cat.id, 10) : cat.id);

      console.log(`Found ${subcategoryIds.length} subcategories:`, subcategoryIds);

      // Check if any products are in these subcategories
      const hasSubcategoryProducts = products.some(product => {
        // Convert product.category_id to number for consistent comparison
        const productCategoryId = product.category_id ?
          (typeof product.category_id === 'string' ? parseInt(product.category_id, 10) : product.category_id) :
          null;
        const match = subcategoryIds.includes(productCategoryId);

        if (match) {
          console.log(`Found subcategory match: Product ${product.name} has category_id ${productCategoryId}`);
        }

        return match;
      });

      console.log(`Category ${category.name} has subcategory products: ${hasSubcategoryProducts}`);
      return hasSubcategoryProducts;
    }
  }

  console.log(`Category ${categoryIdNum} has direct products: ${hasDirectProducts}`);
  return hasDirectProducts;
};

export default {
  findEmptyCategories,
  categoryHasProducts
};
