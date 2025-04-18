import demoData from '../data/demoData';

// Mock API service that uses the demo data
export const mockOrderService = {
  getOrders: async () => {
    console.log('Mock API: Fetching all orders');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: {
        success: true,
        data: demoData.orders
      }
    };
  },

  getOrder: async (id) => {
    console.log(`Mock API: Fetching order ${id}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const order = demoData.orders.find(order => order.id === id);

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      data: {
        success: true,
        data: order
      }
    };
  },

  createOrder: async (orderData) => {
    console.log('Mock API: Creating order', orderData);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Generate a new ID
    const newId = (Math.max(...demoData.orders.map(o => parseInt(o.id))) + 1).toString();

    const newOrder = {
      id: newId,
      ...orderData,
      date: new Date().toISOString().split('T')[0]
    };

    // Add to demo data
    demoData.orders.push(newOrder);

    return {
      data: {
        success: true,
        data: newOrder
      }
    };
  },

  updateOrder: async (id, orderData) => {
    console.log(`Mock API: Updating order ${id}`, orderData);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    const orderIndex = demoData.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    // Update the order
    const updatedOrder = {
      ...demoData.orders[orderIndex],
      ...orderData
    };

    demoData.orders[orderIndex] = updatedOrder;

    return {
      data: {
        success: true,
        data: updatedOrder
      }
    };
  },

  updateOrderStatus: async (id, status) => {
    console.log(`Mock API: Updating order ${id} status to ${status}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const orderIndex = demoData.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    // Update the order status
    demoData.orders[orderIndex].status = status;

    return {
      data: {
        success: true,
        data: demoData.orders[orderIndex]
      }
    };
  },

  deleteOrder: async (id) => {
    console.log(`Mock API: Deleting order ${id}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const orderIndex = demoData.orders.findIndex(order => order.id === id);

    if (orderIndex === -1) {
      throw new Error('Order not found');
    }

    // Remove the order
    const deletedOrder = demoData.orders[orderIndex];
    demoData.orders.splice(orderIndex, 1);

    return {
      data: {
        success: true,
        data: deletedOrder
      }
    };
  }
};

// Mock API service for users
export const mockUserService = {
  getUsers: async () => {
    console.log('Mock API: Fetching all users');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: {
        success: true,
        data: demoData.users
      }
    };
  },

  getUser: async (id) => {
    console.log(`Mock API: Fetching user ${id}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const user = demoData.users.find(user => user.id === id);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      data: {
        success: true,
        data: user
      }
    };
  }
};

// Mock API service for stores
export const mockStoreService = {
  getStores: async () => {
    console.log('Mock API: Fetching all stores');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: {
        success: true,
        data: demoData.stores
      }
    };
  },

  getStore: async (id) => {
    console.log(`Mock API: Fetching store ${id}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const store = demoData.stores.find(store => store.id === id);

    if (!store) {
      throw new Error('Store not found');
    }

    return {
      data: {
        success: true,
        data: store
      }
    };
  }
};

// Mock API service for products
export const mockProductService = {
  getProducts: async () => {
    console.log('Mock API: Fetching all products');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: {
        success: true,
        data: demoData.products
      }
    };
  },

  getFrontendProducts: async () => {
    console.log('Mock API: Fetching frontend products');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: {
        success: true,
        data: demoData.products
      }
    };
  },

  getProduct: async (id) => {
    console.log(`Mock API: Fetching product ${id}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const product = demoData.products.find(product => product.id === id);

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      data: {
        success: true,
        data: product
      }
    };
  },

  getFrontendProduct: async (id) => {
    console.log(`Mock API: Fetching frontend product ${id}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const product = demoData.products.find(product => product.id === id);

    if (!product) {
      throw new Error('Product not found');
    }

    return {
      data: {
        success: true,
        data: product
      }
    };
  }
};

// Mock API service for categories
export const mockCategoryService = {
  getCategories: async () => {
    console.log('Mock API: Fetching all categories');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      data: {
        success: true,
        data: demoData.categories
      }
    };
  },

  getCategory: async (id) => {
    console.log(`Mock API: Fetching category ${id}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const category = demoData.categories.find(category => category.id === id);

    if (!category) {
      throw new Error('Category not found');
    }

    return {
      data: {
        success: true,
        data: category
      }
    };
  }
};

// Export all mock services
export default {
  orderService: mockOrderService,
  userService: mockUserService,
  storeService: mockStoreService,
  productService: mockProductService,
  categoryService: mockCategoryService
};
