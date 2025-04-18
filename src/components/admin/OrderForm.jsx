import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService, productService, storeService } from '../../services/api';

const OrderForm = ({ orderId = null, initialData = null, isEditing = false, onUpdateSuccess = null }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1, price: 0 }]);

  // Order form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    storeId: '',
    status: 'pending',
    paymentStatus: 'pending',
    notes: ''
  });

  // Initialize form with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        customerName: initialData.customerName || '',
        customerEmail: initialData.customerEmail || '',
        customerPhone: initialData.customerPhone || '',
        shippingAddress: initialData.shippingAddress || '',
        storeId: initialData.storeId || '',
        status: initialData.status || 'pending',
        paymentStatus: initialData.paymentStatus || 'pending',
        notes: initialData.notes || ''
      });

      if (initialData.items && Array.isArray(initialData.items)) {
        setOrderItems(initialData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        })));
      }
    }
  }, [initialData]);

  // Fetch products and stores on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse = await productService.getProducts();
        if (productsResponse.data && Array.isArray(productsResponse.data)) {
          setProducts(productsResponse.data);
        } else if (productsResponse.data && productsResponse.data.data && Array.isArray(productsResponse.data.data)) {
          setProducts(productsResponse.data.data);
        } else if (Array.isArray(productsResponse)) {
          setProducts(productsResponse);
        } else {
          console.error('Unexpected products response format:', productsResponse);
          setProducts([]);
        }

        // Fetch stores
        const storesResponse = await storeService.getStores();
        if (storesResponse.data && Array.isArray(storesResponse.data)) {
          setStores(storesResponse.data);
        } else if (storesResponse.data && storesResponse.data.data && Array.isArray(storesResponse.data.data)) {
          setStores(storesResponse.data.data);
        } else if (Array.isArray(storesResponse)) {
          setStores(storesResponse);
        } else {
          console.error('Unexpected stores response format:', storesResponse);
          setStores([]);
        }

        // If editing an existing order and no initialData was provided, fetch its data
        if (orderId && orderId !== 'new' && !initialData) {
          try {
            const orderResponse = await orderService.getOrder(orderId);
            const orderData = orderResponse.data.data;

            if (orderData) {
              setFormData({
                customerName: orderData.customerName || '',
                customerEmail: orderData.customerEmail || '',
                customerPhone: orderData.customerPhone || '',
                shippingAddress: orderData.shippingAddress || '',
                storeId: orderData.storeId || '',
                status: orderData.status || 'pending',
                paymentStatus: orderData.paymentStatus || 'pending',
                notes: orderData.notes || ''
              });

              if (orderData.items && Array.isArray(orderData.items)) {
                setOrderItems(orderData.items.map(item => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  price: item.price
                })));
              }
            }
          } catch (err) {
            console.error('Error fetching order:', err);
            // Don't set error for new orders
            if (orderId !== 'new') {
              setError('Failed to load order data');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load required data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, initialData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle order item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };

    // If product changed, update the price
    if (field === 'productId') {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].price = selectedProduct.price || 0;
      }
    }

    setOrderItems(updatedItems);
  };

  // Add a new order item
  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { productId: '', quantity: 1, price: 0 }
    ]);
  };

  // Remove an order item
  const handleRemoveItem = (index) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
    }
  };

  // Calculate order total
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // Validate form
      if (!formData.customerName || !formData.storeId || orderItems.some(item => !item.productId)) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare order data
      const orderData = {
        ...formData,
        total: calculateTotal(),
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity) || 1,
          price: parseFloat(item.price) || 0
        }))
      };

      console.log('Submitting order data:', orderData);

      // Create or update order
      let response;
      try {
        if (orderId) {
          console.log('Updating order with ID:', orderId);
          response = await orderService.updateOrder(orderId, orderData);
          console.log('Order updated response:', response);
        } else {
          console.log('Creating new order with data:', JSON.stringify(orderData));
          response = await orderService.createOrder(orderData);
          console.log('Order created response:', response);

          // Log the response data structure
          if (response && response.data) {
            console.log('Response data structure:', JSON.stringify(response.data));
          }
        }
      } catch (err) {
        console.error('Error in API call:', err);
        throw err;
      }

      // Check if the response indicates success
      if (response && response.data && response.data.success === false) {
        throw new Error(response.data.message || 'Operation failed');
      }

      // Show success message and handle success
      setSuccess(true);

      // If this is an update and we have a callback, use it
      if (isEditing && onUpdateSuccess) {
        setTimeout(() => {
          onUpdateSuccess();
        }, 1500);
      } else {
        // Otherwise, redirect to the orders list after a short delay
        setTimeout(() => {
          navigate('/admin/orders', { state: { refresh: true } });
        }, 1500);
      }
    } catch (err) {
      console.error('Error saving order:', err);
      setError(orderId ? 'Failed to update order' : 'Failed to create order');

      // Log detailed error information
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !products.length) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2.5"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isEditing ? 'Edit Order' : 'Create New Order'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Order {orderId ? 'updated' : 'created'} successfully! Redirecting...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="customerName"
              id="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Email
            </label>
            <input
              type="email"
              name="customerEmail"
              id="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
              Customer Phone
            </label>
            <input
              type="text"
              name="customerPhone"
              id="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="storeId" className="block text-sm font-medium text-gray-700 mb-1">
              Store *
            </label>
            <select
              name="storeId"
              id="storeId"
              value={formData.storeId}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
              required
            >
              <option value="">Select a store</option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="shippingAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Shipping Address
            </label>
            <textarea
              name="shippingAddress"
              id="shippingAddress"
              rows="3"
              value={formData.shippingAddress}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            ></textarea>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Order Status
            </label>
            <select
              name="status"
              id="status"
              value={formData.status}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">
              Payment Status
            </label>
            <select
              name="paymentStatus"
              id="paymentStatus"
              value={formData.paymentStatus}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Order Notes
            </label>
            <textarea
              name="notes"
              id="notes"
              rows="2"
              value={formData.notes}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
            ></textarea>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-md font-medium text-gray-700 mb-2">Order Items</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product *
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value, 10))}
                        min="1"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                        step="0.01"
                        min="0"
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-900"
                        disabled={orderItems.length === 1}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-2">
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Add Item
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <div className="text-lg font-medium">
              Total: ${calculateTotal().toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/orders')}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Order' : 'Create Order')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
