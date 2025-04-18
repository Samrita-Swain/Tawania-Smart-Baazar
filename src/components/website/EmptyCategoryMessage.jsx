import React from 'react';
import { Link } from 'react-router-dom';

const EmptyCategoryMessage = ({ categoryName }) => {
  return (
    <div className="text-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="mx-auto max-w-md">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>

            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No Products in {typeof categoryName === 'object' ? JSON.stringify(categoryName) : (categoryName || 'This Category')}
            </h3>

            <div className="mt-4 text-sm text-gray-500">
              <p>Products will be coming soon!</p>
              <p className="mt-2">We're working hard to add new products to this category.</p>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCategoryMessage;
