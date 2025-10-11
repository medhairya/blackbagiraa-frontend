import React, { useState, useEffect, useContext } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ChevronDown, ChevronUp, Package, TruckIcon, Wallet, AlertCircle, Check, FilterIcon, Search, XCircle, Download, FileText } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { api } from '@/utils/api'
import { SocketContext } from '@/context/SocketContext'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import toast from 'react-hot-toast'

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [exporting, setExporting] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return

    const handleOrderPlaced = (data) => {
      if (data.success) {
        setOrders((prevOrders) => [data.order.order, ...prevOrders]);
        toast.success('New order received!');
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
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('api/products/admin/fetchOrders');
      if (response.success) {
        console.log(response)
        const sortedOrders = [...response.orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.put(`api/products/admin/updateOrderStatus/${orderId}`, { status });
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Internal server error");
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    console.log(orderId, paymentStatus);
    try {
      const response = await api.put(`api/products/admin/updatePaymentStatus/${orderId}`, { paymentStatus });
      if (response.success) {
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Internal server error");
    }
  };

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
      case 'processing':
        return 'default';
      case 'shipped':
        return 'primary';
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

  // Get pending orders for export
  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending');
  };

  // Export to CSV
  const exportToCSV = () => {
    setExporting(true);
    try {
      const pendingOrders = getPendingOrders();

      if (pendingOrders.length === 0) {
        toast.error('No pending orders to export');
        return;
      }

      // CSV Headers
      const headers = [
        'Order ID',
        'Customer Name',
        'Shop Name',
        'Address',
        'City',
        'State',
        'Pincode',
        'Payment Method',
        'Payment Status',
        'Total Amount',
        'Order Date',
        'Items'
      ];

      // Convert orders to CSV format
      const csvData = pendingOrders.map(order => {
        const items = Object.values(order.items).map(item =>
          `${item.name} (Box: ${calculateBoxes(item.quantity)}, Price: ₹${item.retailPrice})`
        ).join('; ');

        return [
          order._id.substring(order._id.length - 6),
          order.shippingAddress.customerName || 'N/A',
          order.shippingAddress.shopName || 'N/A',
          order.shippingAddress.addressLine1 || 'N/A',
          order.shippingAddress.city || 'N/A',
          order.shippingAddress.state || 'N/A',
          order.shippingAddress.pincode || 'N/A',
          order.paymentMethod || 'N/A',
          order.paymentStatus,
          order.totalAmount,
          new Date(order.createdAt).toLocaleDateString(),
          items
        ];
      });

      // Create CSV content
      const csvContent = [headers, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `pending-orders-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${pendingOrders.length} pending orders to CSV`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    setExporting(true);
    try {
      const pendingOrders = getPendingOrders();

      if (pendingOrders.length === 0) {
        toast.error('No pending orders to export');
        return;
      }

      // Dynamic import of jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // PDF Title
      doc.setFontSize(20);
      doc.text('Pending Orders Report', 20, 20);

      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      doc.text(`Total Pending Orders: ${pendingOrders.length}`, 20, 40);

      let yPosition = 60;
      const pageHeight = doc.internal.pageSize.height;

      pendingOrders.forEach((order, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = 20;
        }

        // Order header
        doc.setFontSize(14);
        doc.text(`Order #${order._id.substring(order._id.length - 6)}`, 20, yPosition);
        yPosition += 10;

        doc.setFontSize(10);

        // Customer info
        doc.text(`Customer: ${order.shippingAddress.customerName || 'N/A'}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Shop: ${order.shippingAddress.shopName || 'N/A'}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Address: ${order.shippingAddress.addressLine1 || 'N/A'}`, 20, yPosition);
        yPosition += 6;
        doc.text(`City: ${order.shippingAddress.city || 'N/A'}, State: ${order.shippingAddress.state || 'N/A'}, PIN: ${order.shippingAddress.pincode || 'N/A'}`, 20, yPosition);
        yPosition += 6;

        // Order details
        doc.text(`Payment: ${order.paymentMethod || 'N/A'} (${order.paymentStatus})`, 20, yPosition);
        yPosition += 6;
        doc.text(`Total Amount: ₹${order.totalAmount.toLocaleString()}`, 20, yPosition);
        yPosition += 6;
        doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 20, yPosition);
        yPosition += 10;

        // Items
        doc.text('Items:', 20, yPosition);
        yPosition += 6;

        Object.values(order.items).forEach((item) => {
          doc.text(`• ${item.name} - Box: ${calculateBoxes(item.quantity)} - ₹${item.retailPrice}`, 25, yPosition);
          yPosition += 6;
        });

        yPosition += 10;

        // Add separator line
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
      });

      // Save PDF
      doc.save(`pending-orders-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Exported ${pendingOrders.length} pending orders to PDF`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Apply all filters and sorting
  const filteredOrders = orders.filter(order => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        order._id.toLowerCase().includes(query) ||
        order.customer?.toLowerCase().includes(query) ||
        order.shippingAddress?.shopName?.toLowerCase().includes(query) ||
        order.shippingAddress?.customerName?.toLowerCase().includes(query) ||
        order.status.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }

    // Payment filter
    if (paymentFilter !== 'all' && order.paymentStatus !== paymentFilter) {
      return false;
    }

    return true;
  });

  // Sort orders based on the selected sorting option
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortBy === 'highest') {
      return b.totalAmount - a.totalAmount;
    } else if (sortBy === 'lowest') {
      return a.totalAmount - b.totalAmount;
    }
    return 0;
  });

  // Counts for summary stats
  const pendingCount = orders.filter(order => order.status === 'pending').length;
  const processingCount = orders.filter(order => order.status === 'processing').length;
  const shippedCount = orders.filter(order => order.status === 'shipped').length;
  const pendingPaymentCount = orders.filter(
    order => order.paymentStatus === 'pending' && order.status !== 'cancelled'
  ).length;

  const resetFilters = () => {
    setStatusFilter('all');
    setPaymentFilter('all');
    setSortBy('newest');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Stats */}
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-foreground">Order Management</h1>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  disabled={exporting || pendingCount === 0}
                  className="sm:w-auto w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Pending ({pendingCount})
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={exportToCSV} disabled={exporting}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF} disabled={exporting}>
                  <FileText className="h-4 w-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={fetchOrders} variant="outline" className="sm:w-auto w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Orders
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-warning opacity-80" />
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold">{processingCount + shippedCount}</p>
              </div>
              <TruckIcon className="h-8 w-8 text-primary opacity-80" />
            </CardContent>
          </Card>
          <Card className="bg-card/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payment</p>
                <p className="text-2xl font-bold">{pendingPaymentCount}</p>
              </div>
              <Wallet className="h-8 w-8 text-destructive opacity-80" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Order ID, customer..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort orders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="highest">Highest Amount</SelectItem>
                    <SelectItem value="lowest">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <XCircle className="h-4 w-4 mr-2" />
                Reset Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">
          {sortedOrders.length} {sortedOrders.length === 1 ? 'Order' : 'Orders'} Found
        </h2>
      </div>

      {sortedOrders.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No orders found</p>
            <p className="text-sm text-muted-foreground mt-2">
              {searchQuery || statusFilter !== 'all' || paymentFilter !== 'all'
                ? 'Try changing your filters or search terms'
                : 'There are no orders in the system'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map((order) => (
            <Card
              key={order._id}
              className={`overflow-hidden ${order.status === 'pending'
                ? 'border-l-4 border-l-warning'
                : order.status === 'shipped'
                  ? 'border-l-4 border-l-primary'
                  : order.status === 'processing'
                    ? 'border-l-4 border-l-secondary'
                    : order.status === 'delivered'
                      ? 'border-l-4 border-l-success'
                      : order.status === 'cancelled'
                        ? 'border-l-4 border-l-destructive'
                        : ''
                }`}
            >
              <CardHeader className="cursor-pointer pb-3" onClick={() => toggleOrderExpand(order._id)}>
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
                    <div className="text-sm text-muted-foreground">
                      {order.shippingAddress.customerName || "Customer"} • {formatDate(order.createdAt)}
                      {order.paymentMethod && (
                        <span className="ml-2 inline-flex items-center">
                          • <Wallet className="h-3 w-3 mx-1" /> {order.paymentMethod}
                        </span>
                      )}
                    </div>
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
                  {/* Admin Actions */}
                  <div className="mb-4 p-3 bg-accent/30 rounded-lg">
                    <h3 className="font-medium mb-3 text-foreground">Admin Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Update Order Status</p>
                        <div className="flex gap-2">
                          <Select
                            disabled={updatingOrder === order._id}
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order._id, value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          {order.status !== 'cancelled' && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will mark order #{order._id.substring(order._id.length - 6)} as cancelled.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Nevermind</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => updateOrderStatus(order._id, 'cancelled')}
                                  >
                                    Cancel Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Update Payment Status</p>
                        <Select
                          disabled={updatingOrder === order._id}
                          value={order.paymentStatus}
                          onValueChange={(value) => updatePaymentStatus(order._id, value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center text-foreground">
                        <TruckIcon className="h-4 w-4 mr-2" /> Shipping Address
                      </h3>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">{order.shippingAddress.shopName}</p>
                        <p>{order.shippingAddress.customerName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                          {order.shippingAddress.pincode}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2 flex items-center text-foreground">
                        <Wallet className="h-4 w-4 mr-2" /> Payment Information
                      </h3>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Method:</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge variant={getStatusBadgeVariant(order.paymentStatus)}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Order Date:</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
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
                                src={item.image || "/placeholder.svg"}
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
                            Box: <Badge variant="secondary">{calculateBoxes(item.quantity)}</Badge>
                          </div>
                          <div className="font-medium text-foreground">
                            1 Box : {item.boxQuantity} qty
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
                  {order.status === 'pending' && (
                    <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
                      <p className="text-sm flex items-center text-warning-foreground">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        This order is pending. Please update the status when processing begins.
                      </p>
                    </div>
                  )}
                  {order.status === 'processing' && (
                    <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md">
                      <p className="text-sm flex items-center text-primary">
                        <TruckIcon className="h-4 w-4 mr-2" />
                        This order is being processed. Update to "Shipped" when dispatched.
                      </p>
                    </div>
                  )}
                  {order.paymentStatus === 'pending' && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm flex items-center text-destructive">
                        <Wallet className="h-4 w-4 mr-2" />
                        Payment is pending for this order. Update payment status when received.
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

// Missing RefreshCw icon
const RefreshCw = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export default Orders
