import { useState } from 'react';

const ProductFilters = ({
  categories,
  selectedCategory,
  priceRange,
  sortBy,
  searchQuery,
  onCategoryChange,
  onPriceRangeChange,
  onSortChange,
  onSearchChange
}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [localPriceMin, setLocalPriceMin] = useState(priceRange.min);
  const [localPriceMax, setLocalPriceMax] = useState(priceRange.max);

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    onPriceRangeChange(Number(localPriceMin), Number(localPriceMax));
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center md:hidden mb-4">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        >
          {isFiltersOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      <div className={`${isFiltersOpen ? 'block' : 'hidden'} md:block`}>
        {/* Search */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              name="search"
              id="search"
              className="focus:ring-[#c69133] focus:border-[#c69133] block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="mb-6">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            id="sort"
            name="sort"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#c69133]focus:border-[#c69133] sm:text-sm rounded-md"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="featured">Featured</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="newest">Newest</option>
            <option value="name-a-z">Name: A to Z</option>
            <option value="name-z-a">Name: Z to A</option>
          </select>
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="category-all"
                name="category"
                type="radio"
                className="focus:ring-[#c69133] h-4 w-4 text-[#c69133] border-gray-300"
                checked={selectedCategory === 'all'}
                onChange={() => onCategoryChange('all')}
              />
              <label htmlFor="category-all" className="ml-3 text-sm text-gray-600">
                All Categories
              </label>
            </div>

            {categories
              .filter(category => !category.parentId)
              .map((category) => {
                // Convert category.id to number if it's a string
                const categoryId = typeof category.id === 'string' ? parseInt(category.id, 10) : category.id;
                // Convert selectedCategory to number for comparison if it's a string
                const selectedCategoryNum = typeof selectedCategory === 'string' && selectedCategory !== 'all' ?
                  parseInt(selectedCategory, 10) : selectedCategory;
                // Make sure category.name is a string
                const categoryName = typeof category.name === 'object' ?
                  JSON.stringify(category.name) : String(category.name);

                return (
                  <div key={categoryId} className="flex items-center">
                    <input
                      id={`category-${categoryId}`}
                      name="category"
                      type="radio"
                      className="focus:ring-[#c69133] h-4 w-4 text-[#c69133] border-gray-300"
                      checked={selectedCategoryNum === categoryId}
                      onChange={() => onCategoryChange(categoryId)}
                    />
                    <label htmlFor={`category-${categoryId}`} className="ml-3 text-sm text-gray-600">
                      {categoryName}
                    </label>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
          <form onSubmit={handlePriceSubmit} className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="price-min" className="sr-only">
                Minimum Price
              </label>
              <input
                type="number"
                id="price-min"
                name="price-min"
                placeholder="Min"
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#c69133] focus:border-[#c69133] sm:text-sm"
                value={localPriceMin}
                onChange={(e) => setLocalPriceMin(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="price-max" className="sr-only">
                Maximum Price
              </label>
              <input
                type="number"
                id="price-max"
                name="price-max"
                placeholder="Max"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#c69133] focus:border-[#c69133] sm:text-sm"
                value={localPriceMax}
                onChange={(e) => setLocalPriceMax(e.target.value)}
                min="0"
              />
            </div>
            <div className="col-span-2 mt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#c69133] hover:bg-[#9f7324] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#c69133]"
              >
                Apply
              </button>
            </div>
          </form>
        </div>

        {/* Reset Filters */}
        <div>
          <button
            type="button"
            className="text-sm text-[#c69133] hover:text-[#9f7324]"
            onClick={() => {
              onCategoryChange('all');
              onPriceRangeChange(0, 10000);
              onSortChange('featured');
              onSearchChange('');
              setLocalPriceMin(0);
              setLocalPriceMax(10000);
            }}
          >
            Reset all filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
