import React, { useState, useRef,useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { renderPagination } from '@/admin/components/Pagination';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { SocketContext } from '@/context/SocketContext';
import ConfirmDeleteDialog from '@/components/ConfirmPopup';

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [handleDeleteDrawer, setHandleDeleteDrawer] = useState(false)
  const [deleteId, setDeleteId] = useState("")
  const fileInputRef = useRef(null);
  const itemsPerPage = 4;
  const socket = useContext(SocketContext)


 useEffect(() => {
    const fetchCategories = async () => {
            const response = await api.get('api/category/get-categories')
            
            setCategories(response.categories)
    }
    fetchCategories()
 }, [])

 useEffect(() => {
    const handleGetCategories =  (data) => {
        setCategories((prevCategories)=>[data,...prevCategories])
    }
    socket.on('categoryAdded',handleGetCategories)
    return () => {
        socket.off('categoryAdded',handleGetCategories)
    }

 }, [socket])
 
 



  // Initialize React Hook Form
  const form = useForm({
    defaultValues: {
      id: '',
      name: '',
      count: '',
      image: ''
    }
  });

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDrawer = (category = null) => {
    if (category) {
      // Set form values for editing
      form.reset({
        id: category._id,
        name: category.name,
        count: category.count,
        image: category.image
      });
      setIsEditMode(true);
      setSelectedImage(null);
    } else {
      // Reset form for new category
      form.reset({
        name: '',
        count: '',
        image: ''
      });
      setIsEditMode(false);
      setSelectedImage(null);
    }
    setIsOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsOpen(false);
    form.reset();
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage({
        file,
        preview: imageUrl
      });
      form.setValue('image', imageUrl, { shouldValidate: true });
    }
  };

  const onSubmit = async(data) => {
  
    
    if (isEditMode) {
      const updatedCategory = categories.find(cat => cat._id === data.id);
      if (updatedCategory) {
       console.log(data)
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('count', data.count);
        if(selectedImage){
          formData.append('categoryImage', selectedImage?.file);
        }
        formData.append('id', data.id);

        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/api/category/update-category`,{
          method:'PUT',
          headers:{
            'Authorization':`Bearer ${JSON.parse(localStorage.getItem('authToken')).token}`
          },
          body:formData
        })
        const res = await response.json()
        
          if(res.success){
            setCategories(categories.map(cat => 
              cat._id === data.id ? res.category : cat
            ));
            
            toast.success(res.message);
          }
     
      }
    } else {
      
     const formData = new FormData();
  
     
     formData.append('name', data.name);
     formData.append('count', data.count);
     formData.append('categoryImage', selectedImage?.file);

      const response  = await fetch(`${import.meta.env.VITE_BASE_URL}/api/category/add-category`,{
        method:'POST',
        headers:{
           'Authorization':`Bearer ${JSON.parse(localStorage.getItem('authToken')).token}`
        },
        body:formData
      })
      const res = await response.json()
      
      
       
      if(res.success){
        
        toast.success(res.message);
      }
     
      
     
    }
    
    handleCloseDrawer();
  };

  const handleDeleteCategory = async () => {
    const response = await api.delete(`api/category/delete-category/${deleteId}`)
    console.log(response)
     if(response.success){
      setCategories(categories.filter(cat => cat._id !== deleteId))
      setHandleDeleteDrawer(false)
      setDeleteId("")
      toast.success(response.message);
     }
  };

  const renderCategoryCard = (category) => {
    return (
      <Card key={category._id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="h-16 w-16 overflow-hidden rounded-md flex-shrink-0">
              <img src={category.image} alt={category.name} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} Products</p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                 
                  form.setValue('id', category._id);
                  handleOpenDrawer(category);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="text-destructive"
                onClick={()=>{
                  setHandleDeleteDrawer(true);
                  setDeleteId(category._id)

                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-2 space-y-2 sm:space-y-0">
          <CardTitle>Categories</CardTitle>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
            <Input 
              placeholder="Search categories..." 
              className="h-8 w-full sm:w-64" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={() => handleOpenDrawer()} className="h-8 w-full sm:w-auto mb-4">
              <Plus className="mr-1 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length > 0 ? (
            renderPagination({ 
              items: filteredCategories, 
              renderFunction: renderCategoryCard, 
              currentPage, 
              setCurrentPage, 
              itemsPerPage 
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetDescription/>
          <SheetHeader className="pb-4">
            <div className="flex justify-between items-center">
              <SheetTitle>{isEditMode ? 'Edit Category' : 'Add New Category'}</SheetTitle>
            </div>
          </SheetHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ 
                  required: "Category name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Category name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <div className="space-y-2">
                      <div className="border rounded-md p-2 w-full">
                        {selectedImage ? (
                          <div className="relative">
                            <img 
                              src={selectedImage.preview} 
                              alt="Preview" 
                              className="h-40 w-full object-contain"
                            />
                          </div>
                        ) : field.value ? (
                          <div className="relative">
                            <img 
                              src={field.value} 
                              alt="Category"
                              className="h-40 w-full object-contain" 
                            />
                          </div>
                        ) : (
                          <div className="h-40 w-full flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">No image selected</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isEditMode ? 'Change Image' : 'Upload Image'}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="count"
                rules={{ 
                  required: "Product count is required",
                  pattern: {
                    value: /^[0-9]+$/,
                    message: "Count must be a valid number"
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Count</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Number of products" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" type="button" onClick={handleCloseDrawer}>
                  Cancel
                </Button>
                <Button type="submit">
                  {isEditMode ? 'Update' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

       <ConfirmDeleteDialog
          isOpen={handleDeleteDrawer}
          onConfirm={handleDeleteCategory}
          setOpen={setHandleDeleteDrawer}
          title="Delete Category"
          description="Are you sure you want to delete this category?"
       />
    </>
  );
};

export default CategoryPage;