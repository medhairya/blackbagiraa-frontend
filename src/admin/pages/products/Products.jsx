import { renderPagination } from '@/admin/components/Pagination'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
    SheetDescription
} from '@/components/ui/sheet'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import {
    Pencil,
    Trash2,
    Plus,
    Search,
    Upload,
    X
} from 'lucide-react'
import React, { useState, useEffect, useRef, useContext } from 'react'
import ConfirmDeleteDialog from '@/components/ConfirmPopup'
import { useForm, Controller } from 'react-hook-form'
import { api } from '@/utils/api'
import { SocketContext } from '@/context/SocketContext'
import toast from 'react-hot-toast'

const Products = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteProductId, setDeleteProductId] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    const itemsPerPage = 5;
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const socket = useContext(SocketContext)


    useEffect(() => {

        const handleAddProduct = (newProduct) => {
            setProducts((prevProduct) => [...prevProduct, newProduct])
        }
        const handleUpdateProduct = (product) => {
            setProducts((prevProduct) => prevProduct.map(pro => pro._id === product._id ? product : pro));
        }
        const handleDeleteProduct = (productId) => {
            setProducts((prevProduct) => prevProduct.filter(pro => pro._id !== productId));
        }


        socket.on('productAdded', handleAddProduct)
        socket.on('productUpdated', handleUpdateProduct)
        socket.on('productDeleted', handleDeleteProduct)
        return () => {
            socket.off('productAdded', handleAddProduct)
            socket.off('productUpdated', handleUpdateProduct)
            socket.off('productDeleted', handleDeleteProduct)
        }
    }, [socket])


    // React Hook Form
    const {
        control,
        register,
        handleSubmit,
        reset,
        setValue,
        boxQuantity,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: '',
            image: '',
            MRP: '',
            retailPrice: '',
            scheme: '',
            category: '',
            boxQuantity: '',
        }
    });

    useEffect(() => {
        const fetchCategories = async () => {
            const response = await api.get('api/category/get-categories')
            setCategories(response.categories)

        }
        const fetchProducts = async () => {
            const response = await api.get('api/products/fetchProducts');
            console.log(response);
            setProducts(response.products);

        }
        fetchCategories()
        fetchProducts();
    }, [])


    const onSubmit = async (data) => {

        if (!currentProduct) {
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('MRP', data.MRP);
            formData.append('retailPrice', data.retailPrice);
            formData.append('scheme', data.scheme);
            formData.append('category', data.category);
            formData.append('boxQuantity', data.boxQuantity);


            formData.append('productImg', fileInputRef.current.files[0]);
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/admin/add-product`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${JSON.parse(localStorage.getItem('authToken')).token}`
                },
                body: formData
            })
            const res = await response.json();
            if (res.success) {
                toast.success(res.message);
            }



        }
        else {
            const formData = new FormData();
            formData.append('productId', currentProduct._id);
            formData.append('name', data.name);
            formData.append('MRP', data.MRP);
            formData.append('retailPrice', data.retailPrice);
            formData.append('scheme', data.scheme);
            formData.append('category', data.category);
            formData.append('boxQuantity', data.boxQuantity);

            if (fileInputRef.current.files[0]) {
                formData.append('productImg', fileInputRef.current.files[0]);
            }
            const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/products/admin/update-product`, {
                method: "PUT",
                headers: {
                    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('authToken')).token}`
                },
                body: formData
            })
            const res = await response.json();
            console.log(res);
            if (res.success) {
                toast.success(res.message);
            }

        }

        handleCloseSheet();
    };

    const handleDeleteProduct = async (id) => {
        console.log(id);
        const response = await api.delete(`api/products/admin/delete-product/${id}`)
        if (response.success) {
            toast.success(response.message);
            setIsDeleteDialogOpen(false);
            setDeleteProductId('');
        }

    };

    const handleOpenSheet = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            // Reset form with current product values
            reset({
                name: product.name,
                image: product.image,
                MRP: product.MRP,
                retailPrice: product.retailPrice,
                scheme: product.scheme || '',
                category: product.category,
                boxQuantity: product.boxQuantity || '',
            });
            setImagePreview(product.image);
        } else {
            setCurrentProduct(null);
            // Reset form to default values
            reset({
                name: '',
                image: '',
                MRP: '',
                retailPrice: '',
                scheme: '',
                category: '',
                boxQuantity: '',
            });
            setImagePreview('');
        }
        setIsSheetOpen(true);
    };

    const handleCloseSheet = () => {
        setIsSheetOpen(false);
        setCurrentProduct(null);
        setImagePreview(null);
        reset();
    };

    const handleImageClick = () => {
        fileInputRef.current.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real application, you would upload this file to your server
            // For now, we'll just create a local object URL for preview
            const imageUrl = URL.createObjectURL(file);
            setImagePreview(imageUrl);

            // Set the image value in the form
            setValue('image', imageUrl);
        }
    };

    const handleRemoveImage = (e) => {
        e.stopPropagation();
        setImagePreview('');
        setValue('image', '');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Filter products based on search term
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderProductCard = (product) => {
        // Calculate discount percentage
        const discountPercent = Math.round(((product.MRP - product.retailPrice) / product.MRP) * 100);
        const formattedDate = new Date(product.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });


        return (
            <Card key={product._id} className="mb-4">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-3">
                        <div className="flex flex-col md:flex-row items-start md:items-center w-full md:w-auto mb-4 md:mb-0">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full md:w-16 h-auto md:h-16 rounded md:mr-4 object-cover mb-2 md:mb-0"
                            />
                            <div>
                                <h3 className="font-medium">{product.name}</h3>
                                <Badge variant="outline" className="mt-1">{product.category}</Badge>
                            </div>
                        </div>
                        <div className="text-left md:text-right w-full md:w-auto">
                            <div className="flex items-center">
                                <span className="text-muted-foreground line-through mr-2">₹{product.MRP}</span>
                                <span className="font-semibold text-success">₹{product.retailPrice}</span>
                                {discountPercent > 0 && (
                                    <Badge variant="secondary" className="ml-2">-{discountPercent}%</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">Box Qty: {product.boxQuantity}</p>

                        </div>


                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            {product.scheme && (
                                <>
                                    <p className="text-muted-foreground">Scheme</p>
                                    <p className="font-medium">{product.scheme ? product.scheme : 'NOT scheme now'}</p>
                                </>
                            )}
                        </div>
                        <div>
                            <p className="text-muted-foreground">Added on</p>
                            <p className="font-medium">{formattedDate}</p>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenSheet(product)}
                        >
                            <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                                setIsDeleteDialogOpen(true);
                                setDeleteProductId(product._id);
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2">
                    <CardTitle className="mb-4 md:mb-0">Product Catalog</CardTitle>
                    <div className="w-full md:w-auto flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                className="h-8 pl-8 pr-4"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button onClick={() => handleOpenSheet()} className="w-full md:w-auto">
                            <Plus className="h-4 w-4 mr-1" /> Add Product
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredProducts.length > 0 ? (
                        renderPagination({
                            items: filteredProducts,
                            renderFunction: renderProductCard,
                            currentPage,
                            setCurrentPage,
                            itemsPerPage
                        })
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">No products found</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Product Form Sheet */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="overflow-y-auto sm:max-w-md">
                    <SheetDescription />
                    <SheetHeader>
                        <SheetTitle>{currentProduct ? 'Edit Product' : 'Add New Product'}</SheetTitle>
                    </SheetHeader>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                            {/* Image Upload Field */}
                            <div>
                                <Label htmlFor="image">Product Image</Label>
                                <div
                                    className="mt-1 border-2 border-dashed rounded-md border-gray-300 p-6 cursor-pointer relative"
                                    onClick={handleImageClick}
                                >
                                    <input
                                        type="file"
                                        id="image"
                                        ref={fileInputRef}
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <input
                                        type="hidden"
                                        {...register('image')}
                                    />

                                    <div className="text-center">
                                        {imagePreview ? (
                                            <div className="relative inline-block">
                                                <img
                                                    src={imagePreview ? imagePreview : ''}
                                                    alt="Product preview"
                                                    className="max-h-48 mx-auto mb-2 rounded"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                    onClick={handleRemoveImage}
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                                        )}

                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                {imagePreview
                                                    ? "Click to change image"
                                                    : "Click to upload or drag and drop"}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                PNG, JPG, GIF up to 5MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    className="mt-1"
                                    placeholder="Enter product name"
                                    {...register('name', { required: 'Product name is required' })}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Controller
                                    control={control}
                                    name="category"
                                    rules={{ required: 'Category is required' }}
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(category => (
                                                    <SelectItem key={category._id} value={category._id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.category && (
                                    <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="MRP">MRP (₹)</Label>
                                    <Input
                                        id="MRP"
                                        type="number"
                                        step="0.01"
                                        className="mt-1"
                                        placeholder="0.00"
                                        {...register('MRP', {
                                            required: 'MRP is required',
                                            valueAsNumber: true,
                                            min: { value: 0, message: 'Must be positive' }
                                        })}
                                    />
                                    {errors.MRP && (
                                        <p className="text-sm text-red-500 mt-1">{errors.MRP.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="retailPrice">Retail Price (₹)</Label>
                                    <Input
                                        id="retailPrice"
                                        type="number"
                                        step="0.01"
                                        className="mt-1"
                                        placeholder="0.00"
                                        {...register('retailPrice', {
                                            required: 'Retail price is required',
                                            valueAsNumber: true,
                                            min: { value: 0, message: 'Must be positive' }
                                        })}
                                    />
                                    {errors.retailPrice && (
                                        <p className="text-sm text-red-500 mt-1">{errors.retailPrice.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="boxQuantity">Box Quantity</Label>
                                    <Input
                                        id="boxQuantity"
                                        type="number"
                                        className="mt-1"
                                        placeholder="Enter number of items per box"
                                        {...register('boxQuantity', {
                                            required: 'Box quantity is required',
                                            valueAsNumber: true,
                                            min: { value: 1, message: 'Must be at least 1' }
                                        })}
                                    />
                                    {errors.boxQuantity && (
                                        <p className="text-sm text-red-500 mt-1">{errors.boxQuantity.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="scheme">Scheme/Offer (Optional)</Label>
                                <Input
                                    id="scheme"
                                    className="mt-1"
                                    placeholder="Enter scheme or offer"
                                    {...register('scheme')}
                                />
                            </div>
                        </div>
                        <SheetFooter className="pt-2">
                            <Button type="submit">
                                {currentProduct ? 'Update Product' : 'Add Product'}
                            </Button>
                            <SheetClose asChild>
                                <Button type="button" variant="outline">Cancel</Button>
                            </SheetClose>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>

            <ConfirmDeleteDialog
                isOpen={isDeleteDialogOpen}
                setOpen={setIsDeleteDialogOpen}
                onConfirm={() => handleDeleteProduct(deleteProductId)}
                itemId={deleteProductId}
            />
        </>
    );
};

export default Products;