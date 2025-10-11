import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus,Minus } from 'lucide-react'
import  useCart  from '@/hooks/useCart'
import { api } from '@/utils/api'

const Product = () => {
  const [productData, setProductData] = useState([])
  const {cart,addToCart,removeFromCart}= useCart();
  const params = useParams();
  const category = params.category;
  const filteredProducts = productData.filter((product) => product.category === category);

  useEffect(() => {
    const fetchProducts = async()=>{
      const response = await api.get('api/products/fetchProducts');
      console.log(response);
      setProductData(response.products);
    }
    fetchProducts();
  }, [])
  

  

  return (
    <div className='container mx-auto px-4 py-8 min-h-screen'>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{category}</h1>
        <p className="text-muted-foreground mt-2">Explore our collection of {category}</p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filteredProducts.map((product) => (
          <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-0">
              <div className="relative h-48 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                {/*product.scheme && (
                  <Badge variant="secondary" className="absolute top-2 right-2 bg-primary text-primary-foreground">
                    {product.scheme}
                  </Badge>
                )*/}
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-xl mb-2">{product.name}</CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold text-primary">MRP: ₹{product.MRP} ({product.MRP}*{product.boxQuantity} pieces) ₹{product.MRP * product.boxQuantity}</span>
                <span className="text-lg text-muted-foreground">Retail Price: ₹{product.retailPrice} ({product.retailPrice}*{product.boxQuantity}) ₹{product.retailPrice * product.boxQuantity}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex items-center justify-between">
              {cart.has(product._id) ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => removeFromCart(product._id)}><Minus /></Button>
                  <span className="text-lg font-semibold">{cart.get(product._id).quantity}</span>
                  <Button variant="outline" onClick={() => addToCart(product)}><Plus /></Button>
                </div>
              ) : (
                <Button className="w-full" onClick={() => addToCart(product)}>Add to Cart</Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Product;
