import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Package, ShoppingCart, Users, CheckCircle, Clock } from 'lucide-react';
import { api } from '@/utils/api';

const AdminDashboard = () => {
  
  const [statsData, setStatsData] = useState({})
  const [monthlySalesData, setMonthlySalesData] = useState([])
  const [orderStatusData, setOrderStatusData] = useState([])

  // Define color map separate from data
  const colorMap = {
    delivered: 'hsl(var(--success))',
    shipped: 'hsl(var(--primary))',
    pending: 'hsl(var(--warning))',
    processing: 'hsl(var(--muted))',
    cancelled: 'hsl(var(--destructive))'
  };

  useEffect(() => {
    const fetchStatsData = async () => {
      const response = await api.get("api/products/admin/fetchStatsData");
      if(response.success){
        console.log(response.stats);
        setStatsData(response.stats);
      }else{
        toast.error(response.message);
      }
    }

    const fetchMonthlySalesData = async () => {
      const response = await api.get("api/products/admin/fetchMonthlySalesData");
      if(response.success){
        setMonthlySalesData(response.salesData);
      }
    }
    
    const fetchOrderStatusData = async () => {
      const response = await api.get("api/products/admin/fetchOrderStatusData");
      if(response.success){
        // Map colors to the data here
        const dataWithColors = response.orderStatusData.map(item => {
          // Convert status name to lowercase to match colorMap keys
          const status = item.name.toLowerCase();
          return {
            ...item,
            color: colorMap[status] || 'hsl(var(--muted))' // Fallback color
          };
        });
        setOrderStatusData(dataWithColors);
      }
    }
    
    fetchStatsData();
    fetchMonthlySalesData();
    fetchOrderStatusData();
  }, [])

  // Custom renderer for Legend that ensures text color is consistent
  const renderColorfulLegendText = (value, entry) => {
    return <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>;
  };

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Card>
          <CardContent className="flex flex-col items-center pt-6 pb-4">
            <div className="rounded-full bg-primary/20 p-2 mb-2">
              <ShoppingCart className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Orders</p>
            <h3 className="text-lg sm:text-2xl font-bold">{statsData.totalOrders}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center pt-6 pb-4">
            <div className="rounded-full bg-warning/20 p-2 mb-2">
              <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-warning" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
            <h3 className="text-lg sm:text-2xl font-bold">{statsData.pendingOrders}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center pt-6 pb-4">
            <div className="rounded-full bg-success/20 p-2 mb-2">
              <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Completed</p>
            <h3 className="text-lg sm:text-2xl font-bold">{statsData.completedOrders}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center pt-6 pb-4">
            <div className="rounded-full bg-secondary/20 p-2 mb-2">
              <div className="h-4 w-4 sm:h-6 sm:w-6 text-secondary flex items-center justify-center font-bold">$</div>
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Sales</p>
            <h3 className="text-lg sm:text-2xl font-bold">{statsData.totalSales}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center pt-6 pb-4">
            <div className="rounded-full bg-destructive/20 p-2 mb-2">
              <Package className="h-4 w-4 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Products</p>
            <h3 className="text-lg sm:text-2xl font-bold">{statsData.totalProducts}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center pt-6 pb-4">
            <div className="rounded-full bg-accent/20 p-2 mb-2">
              <Users className="h-4 w-4 sm:h-6 sm:w-6 text-accent" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Shopkeepers</p>
            <h3 className="text-lg sm:text-2xl font-bold">{statsData.totalShopkeepers}</h3>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Sales Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="line">
              <TabsList className="mb-4">
                <TabsTrigger value="line">Line</TabsTrigger>
                <TabsTrigger value="bar">Bar</TabsTrigger>
              </TabsList>
              <TabsContent value="line">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="hsl(var(--primary))" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="bar">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="sales" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Order Status Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg sm:text-xl">Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ color: 'hsl(var(--foreground))' }} />
                <Legend formatter={renderColorfulLegendText} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default AdminDashboard;