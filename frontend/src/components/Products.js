import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  CircularProgress,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { Edit, Delete, Close } from '@mui/icons-material';
import { productsAPI, categoriesAPI, suppliersAPI } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    sku: '',
    category_id: '',
    supplier_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        suppliersAPI.getAll(),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setSuppliers(suppliersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Error loading data. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        category_id: formData.category_id || null,
        supplier_id: formData.supplier_id || null,
      };

      let productId;
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, submitData);
        productId = editingProduct.id;
      } else {
        const response = await productsAPI.create(submitData);
        productId = response.data.id;
      }

      if (selectedImages.length > 0 && productId) {
        await handleImageUpload(productId);
      }

      fetchData();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving product');
    }
  };

  const handleImageUpload = async (productId) => {
    if (selectedImages.length === 0) return;

    setUploadingImages(true);
    try {
      const fd = new FormData();
      selectedImages.forEach((file) => {
        fd.append('images', file);
      });

      await productsAPI.uploadImages(productId, fd);
      setSelectedImages([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert(error.response?.data?.error || 'Error uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);
  };

  const removeSelectedImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (productId, imageId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await productsAPI.deleteImage(productId, imageId);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting image');
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      quantity: product.quantity || '',
      sku: product.sku || '',
      category_id: product.category_id || '',
      supplier_id: product.supplier_id || '',
    });
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting product');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSelectedImages([]);
    setFormData({
      name: '',
      description: '',
      price: '',
      quantity: '',
      sku: '',
      category_id: '',
      supplier_id: '',
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Products
        </Typography>
        <Button variant="contained" onClick={() => setShowModal(true)}>
          + Add Product
        </Button>
      </Box>

      {products.length === 0 ? (
        <Typography color="text.secondary">
          No products found. Add your first product!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                }}
              >
                {product.images && product.images.length > 0 && (
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={getImageUrl(
                        product.images[0].thumbnail_path ||
                          product.images[0].image_path
                      )}
                      alt={product.name}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => setShowImageGallery(product.id)}
                    />
                    {product.images.length > 1 && (
                      <Chip
                        label={`${product.images.length} images`}
                        size="small"
                        color="default"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                  </Box>
                )}
                <CardContent sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {product.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  {product.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {product.description}
                    </Typography>
                  )}
                  <Stack spacing={0.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Price
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">
                        Quantity
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={product.quantity <= 10 ? 'error.main' : 'text.primary'}
                      >
                        {product.quantity}
                      </Typography>
                    </Stack>
                    {product.sku && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">
                          SKU
                        </Typography>
                        <Typography variant="body2">{product.sku}</Typography>
                      </Stack>
                    )}
                    {product.category_name && (
                      <Typography variant="body2" color="text.secondary">
                        Category: {product.category_name}
                      </Typography>
                    )}
                    {product.supplier_name && (
                      <Typography variant="body2" color="text.secondary">
                        Supplier: {product.supplier_name}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ flexGrow: 1 }}>
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </Typography>
          <IconButton onClick={handleCloseModal}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="Name"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Price"
                type="number"
                required
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, price: e.target.value }))
                }
              />
              <TextField
                label="Quantity"
                type="number"
                required
                fullWidth
                inputProps={{ min: 0 }}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantity: e.target.value }))
                }
              />
            </Stack>
            <TextField
              label="SKU"
              value={formData.sku}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, sku: e.target.value }))
              }
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Category"
                value={formData.category_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
              >
                <MenuItem value="">None</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Supplier"
                value={formData.supplier_id}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    supplier_id: e.target.value,
                  }))
                }
              >
                <MenuItem value="">None</MenuItem>
                {suppliers.map((sup) => (
                  <MenuItem key={sup.id} value={sup.id}>
                    {sup.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Product Images
              </Typography>
              <Button variant="outlined" component="label">
                Select Images
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageSelect}
                />
              </Button>
              {selectedImages.length > 0 && (
                <ImageList cols={4} gap={8} sx={{ mt: 1 }}>
                  {selectedImages.map((file, index) => (
                    <ImageListItem key={index} sx={{ position: 'relative' }}>
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index}`} />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                        }}
                        onClick={() => removeSelectedImage(index)}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </ImageListItem>
                  ))}
                </ImageList>
              )}

              {editingProduct &&
                editingProduct.images &&
                editingProduct.images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Existing Images
                    </Typography>
                    <ImageList cols={4} gap={8}>
                      {editingProduct.images.map((img) => (
                        <ImageListItem key={img.id} sx={{ position: 'relative' }}>
                          <img
                            src={getImageUrl(
                              img.thumbnail_path || img.image_path
                            )}
                            alt="Product"
                          />
                          <IconButton
                            size="small"
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              bgcolor: 'rgba(0,0,0,0.6)',
                              color: 'white',
                            }}
                            onClick={(e) =>
                              handleDeleteImage(editingProduct.id, img.id, e)
                            }
                          >
                            <Close fontSize="small" />
                          </IconButton>
                        </ImageListItem>
                      ))}
                    </ImageList>
                  </Box>
                )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(showImageGallery)}
        onClose={() => setShowImageGallery(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ flexGrow: 1 }}>Product Images</Typography>
          <IconButton onClick={() => setShowImageGallery(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ImageList cols={3} gap={12}>
            {products
              .find((p) => p.id === showImageGallery)
              ?.images?.map((img) => (
                <ImageListItem key={img.id}>
                  <img src={getImageUrl(img.image_path)} alt="Product" />
                  <Button
                    size="small"
                    color="error"
                    sx={{ mt: 1 }}
                    onClick={(e) => {
                      handleDeleteImage(showImageGallery, img.id, e);
                    }}
                  >
                    Delete
                  </Button>
                </ImageListItem>
              ))}
          </ImageList>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Products;

