import { api } from '@/utils/api';
import React, { useContext, useEffect, useRef, useState,userRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Package, TruckIcon, Wallet, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import html2pdf from 'html2pdf.js';
import PreviewTemplate from '@/components/PreviewTemplete';
import { SocketContext } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const Orders = ({selectedOrder}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const socket = useContext(SocketContext);
  const pdfRef = useRef();

  useEffect(() => {
    if (!socket) return

    const handleOrderPlaced = (data) => {
      if (data.success) {
        // console.log(data.order);

        setOrders((prevOrders) => [data.order.order, ...prevOrders]);
      }
    }

    const handleOrderStatusUpdated = (data) => {
      if (data.success) {
        setOrders((prevOrders) => prevOrders.map(order => order._id === data.order._id ? data.order : order));
      }
    }
    const handlePaymentStatusUpdated = (data) => {
      if (data.success) {
        setOrders((prevOrders) => prevOrders.map(order => order._id === data.order._id ? data.order : order))
      }
    }
    socket.on('orderPlaced', handleOrderPlaced)
    socket.on('orderStatusUpdated', handleOrderStatusUpdated)
    socket.on('paymentStatusUpdated', handlePaymentStatusUpdated)

    return () => {
      socket.off('orderPlaced', handleOrderPlaced)
      socket.off('orderStatusUpdated', handleOrderStatusUpdated)
      socket.off('paymentStatusUpdated', handlePaymentStatusUpdated)
    }
  }, [socket])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('api/products/fetchOrders');
        if (response.success) {
          // Sort orders by createdAt date (newest first)
          // console.log(response.orders);
          const sortedOrders = [...response.orders].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sortedOrders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const calculateBoxes = (quantity) => {
    const boxes = Math.floor(quantity / 100);
    const pieces = quantity % 100;

    if (boxes > 0 && pieces > 0) {
      return `${boxes} box${boxes > 1 ? 'es' : ''} + ${pieces} pc${pieces > 1 ? 's' : ''}`;
    } else if (boxes > 0) {
      return `${boxes} box${boxes > 1 ? 'es' : ''}`;
    } else {
      return `${pieces} pc${pieces > 1 ? 's' : ''}`;
    }
  };

  const handlePreview = (order) => {
   
      // const element = pdfRef.current;
      // const options = {
      //   margin:0.5,
      //   filename : `order-${order._id}`,
      //   image:{type:'jpeg',quality:0.98},
      //   html2canvas:{scale:2},
      //   jsPDF:{unit:"in",format:"letter",orientation:"portrait"}
      // }
      // html2pdf().set(options).from(element).output('dataurlnewwindow')
    toast.error("currently not implimented")
  }


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Separate orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const otherOrders = orders.filter(order => order.status !== 'pending');
  const sortedOrders = [...pendingOrders, ...otherOrders];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
        <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
        <div className="flex flex-wrap gap-2">
          {pendingOrders.length > 0 && (
            <Badge variant="warning" className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {pendingOrders.length} Pending
            </Badge>
          )}
          <Badge variant="outline" className="text-sm">
            {orders.length} Orders
          </Badge>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground mt-2">
              You haven't placed any orders yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <Card
              key={order._id}
              className={`overflow-hidden ${order.status === 'pending' ? 'border-l-4 border-l-warning' : ''}`}
            >
              <CardHeader className="cursor-pointer" onClick={() => toggleOrderExpand(order._id)}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                  <div className="flex flex-col">
                    <CardTitle className="text-lg flex items-center">
                      Order #{order._id.substring(order._id.length - 6)}
                      {expandedOrder === order._id ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </CardTitle>
                    <CardDescription>{formatDate(order.createdAt)}</CardDescription>
                  </div>
                  <div className="flex flex-col mt-2 md:mt-0 md:items-end w-full md:w-auto">
                    <div className="flex flex-wrap gap-2 mb-1">
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">Order:</span>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-sm">Payment:</span>
                        <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-lg font-semibold text-foreground">₹{order.totalAmount.toLocaleString()}</div>
                  </div>
                </div>
              </CardHeader>

              {expandedOrder === order._id && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center text-foreground">
                        <TruckIcon className="h-4 w-4 mr-2" /> Shipping Address
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">{order.shippingAddress.shopName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                          {order.shippingAddress.pincode}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 flex items-center text-foreground">
                        <Wallet className="h-4 w-4 mr-2" /> Payment Method
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {order.paymentMethod}
                        {order.paymentStatus === 'pending' && (
                          <Badge variant="warning" className="ml-2">Payment Pending</Badge>
                        )}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <h3 className="font-medium mb-2 text-foreground">Order Items</h3>
                  <div className="space-y-3">
                    {Object.values(order.items).map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg bg-accent/30 gap-3"
                      >
                        <div className="flex items-center w-full sm:w-auto">
                          <div className="h-12 w-12 rounded bg-muted overflow-hidden flex-shrink-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="ml-3 flex-grow">
                            <p className="font-medium text-foreground">{item.name}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.category && (
                                <span className="inline-block mr-2">Category: {item.category}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 sm:mt-0 sm:text-right flex flex-col w-full sm:w-auto">
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">₹{item.retailPrice}</span>
                            {item.MRP > item.retailPrice && (
                              <span className="text-muted-foreground/60 line-through text-sm">
                                ₹{item.MRP}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Box: <Badge variant="secondary">{item.quantity}</Badge>
                          </div>
                          <div className="font-medium text-foreground">
                            Total: ₹{(item.retailPrice * item.boxQuantity * item.quantity).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-end">
                    <div className="text-right">
                      <div className="flex justify-between w-full md:w-64">
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-bold text-foreground">₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button onClick={() => handlePreview(order)}>
                      Preview
                    </Button>
                    <Button variant='outline'>
                      Download
                    </Button>
                  </div>

                  {order.status === 'pending' && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                      <p className="text-sm flex items-center text-warning-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        This order is pending delivery. Expected delivery time: 2-3 business days.
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;