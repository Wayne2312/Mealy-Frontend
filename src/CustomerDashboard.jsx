import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [todaysMenu, setTodaysMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('menu');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTodaysMenu();
    fetchOrders();
  }, []);

  const fetchTodaysMenu = async () => {
    try {
      const response = await axios.get(`${API}/daily-menu/today/menu/`);
      setTodaysMenu(response.data.meals || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/orders/`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const placeOrder = async (mealId) => {
    setLoading(true);
    try {
      await axios.post(`${API}/orders/`, { meal_id: mealId, quantity: 1 });
      await fetchOrders();
      alert('Order placed successfully!');
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const processPayment = async (orderId) => {
    const phone = prompt('Enter your M-Pesa phone number (254XXXXXXXXX):');
    if (!phone) return;

    setLoading(true);
    try {
      const response = await axios.post(`${API}/payment/mpesa/`, { 
        order_id: orderId,
        phone: phone
      });
      
      if (response.data.success) {
        alert(`Payment successful! Transaction ID: ${response.data.transaction_id}`);
        await fetchOrders();
      }
    } catch (error) {
      alert('Payment failed: ' + (error.response?.data?.detail || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back, {user.name}!</h2>
        <p className="text-gray-600">What would you like to eat today?</p>
      </div>

      <div className="mb-6">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('menu')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'menu'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Today's Menu
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Orders ({orders.length})
          </button>
        </nav>
      </div>

      {activeTab === 'menu' && (
        <div>
          {todaysMenu.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">🍽️</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No menu available today</h3>
              <p className="text-gray-500">Check back later or contact your caterer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todaysMenu.map((meal) => (
                <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {meal.image_url ? (
                      <img 
                        src={meal.image_url} 
                        alt={meal.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">🍽️</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{meal.name}</h3>
                    <p className="text-gray-600 mb-4">{meal.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-orange-600">KSh {meal.price}</span>
                      <button
                        onClick={() => placeOrder(meal.id)}
                        disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                      >
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500">Place your first order from today's menu!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.meal_name}</h3>
                      <p className="text-gray-600">Quantity: {order.quantity} × KSh {order.price}</p>
                      <p className="text-sm text-gray-500">Order Date: {order.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-600 mb-2">KSh {order.total}</div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          order.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                        {order.payment_status === 'pending' && (
                          <button
                            onClick={() => processPayment(order.id)}
                            disabled={loading}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 rounded-md text-sm font-medium disabled:opacity-50"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
