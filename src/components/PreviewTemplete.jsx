import React from 'react';
import { forwardRef } from 'react';

const PreviewTemplate = forwardRef(({ order }, ref) => {
  // Date formatting function directly in the component
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Convert items Map to array for easier rendering
  const itemsArray = order?.items ? Array.from(order.items.values()) : [];
  
  // Calculate subtotal (without tax)
  const subtotal = itemsArray.reduce((acc, item) => {
    return acc + (item.retailPrice * item.quantity);
  }, 0);
  
  // Assuming tax rate of 18% (modify as needed)
  const taxRate = 0.18;
  const taxAmount = subtotal * taxRate;
  
  return (
    <div ref={ref} className="bg-white p-8 max-w-4xl mx-auto shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2">
            <img src="/api/placeholder/200/60" alt="Company Logo" className="h-12 w-auto" />
            <h1 className="text-2xl font-bold text-gray-900">MediMart</h1>
          </div>
          <p className="text-gray-500 mt-1">Your Trusted Medical Supplier</p>
        </div>
        
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-900">INVOICE</h2>
          <p className="text-gray-600">#ORD-{order?._id?.substring(0, 8).toUpperCase()}</p>
          <p className="text-gray-600">Date: {formatDate(order?.createdAt || new Date())}</p>
        </div>
      </div>
      
      {/* Customer and Company Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
          <p className="text-gray-700 font-medium">{order?.shippingAddress?.customerName}</p>
          <p className="text-gray-700">{order?.shippingAddress?.shopName}</p>
          <p className="text-gray-700">{order?.shippingAddress?.addressLine1}</p>
          <p className="text-gray-700">{order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.pincode}</p>
        </div>
        
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Payment Details:</h3>
          <div className="grid grid-cols-2 gap-1">
            <p className="text-gray-600">Status:</p>
            <p className="text-gray-700 font-medium capitalize">{order?.status}</p>
            
            <p className="text-gray-600">Method:</p>
            <p className="text-gray-700 font-medium capitalize">{order?.paymentMethod}</p>
            
            <p className="text-gray-600">Payment Status:</p>
            <p className={`font-medium capitalize ${
              order?.paymentStatus === 'paid' ? 'text-green-600' : 
              order?.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
            }`}>{order?.paymentStatus}</p>
          </div>
        </div>
      </div>
      
      {/* Order Items Table */}
      <div className="mb-8">
        <div className="border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Item</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">MRP</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Price</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Qty</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {itemsArray.map((item, index) => (
                <tr key={item._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <img src={item.image || "/api/placeholder/40/40"} alt={item.name} className="h-10 w-10 rounded object-cover mr-3" />
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        {item.scheme && <p className="text-xs text-gray-500">{item.scheme}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{item.category}</td>
                  <td className="px-4 py-3 text-gray-700 text-right">₹{item.MRP.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700 text-right">₹{item.retailPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700 text-right">{item.quantity}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 text-right">₹{(item.retailPrice * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Summary */}
      <div className="flex justify-end mb-8">
        <div className="w-64 border rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
            Order Summary
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (18%):</span>
              <span className="text-gray-800">₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span className="text-gray-700">Total Amount:</span>
                <span className="text-gray-900">₹{order?.totalAmount?.toFixed(2) || (subtotal + taxAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t pt-6 text-center text-gray-500 text-sm">
        <p className="mb-1">Thank you for your business!</p>
        <p>If you have any questions, please contact our customer support at support@medimart.com</p>
      </div>
    </div>
  );
});

export default PreviewTemplate;