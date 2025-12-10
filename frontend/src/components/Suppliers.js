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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  ImageList,
  ImageListItem,
} from '@mui/material';
import { Edit, Delete, Close } from '@mui/icons-material';
import { suppliersAPI } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      alert('Error loading suppliers. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let supplierId;
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, formData);
        supplierId = editingSupplier.id;
      } else {
        const response = await suppliersAPI.create(formData);
        supplierId = response.data.id;
      }

      if (selectedImages.length > 0 && supplierId) {
        await handleImageUpload(supplierId);
      }

      fetchSuppliers();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving supplier');
    }
  };

  const handleImageUpload = async (supplierId) => {
    if (selectedImages.length === 0) return;

    setUploadingImages(true);
    try {
      const fd = new FormData();
      selectedImages.forEach((file) => {
        fd.append('images', file);
      });

      await suppliersAPI.uploadImages(supplierId, fd);
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

  const handleDeleteImage = async (supplierId, imageId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await suppliersAPI.deleteImage(supplierId, imageId);
        fetchSuppliers();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting image');
      }
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
    });
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await suppliersAPI.delete(id);
        fetchSuppliers();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting supplier');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
    setSelectedImages([]);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
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
          Suppliers
        </Typography>
        <Button variant="contained" onClick={() => setShowModal(true)}>
          + Add Supplier
        </Button>
      </Box>

      {suppliers.length === 0 ? (
        <Typography color="text.secondary">
          No suppliers found. Add your first supplier!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {suppliers.map((supplier) => (
            <Grid item xs={12} sm={6} md={4} key={supplier.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                }}
              >
                {supplier.images && supplier.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={getImageUrl(
                      supplier.images[0].thumbnail_path ||
                        supplier.images[0].image_path
                    )}
                    alt={supplier.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setShowImageGallery(supplier.id)}
                  />
                )}
                <CardContent sx={{ flex: 1 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {supplier.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(supplier.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Stack spacing={0.5}>
                    {supplier.email && (
                      <Typography variant="body2" color="text.secondary">
                        Email: {supplier.email}
                      </Typography>
                    )}
                    {supplier.phone && (
                      <Typography variant="body2" color="text.secondary">
                        Phone: {supplier.phone}
                      </Typography>
                    )}
                    {supplier.address && (
                      <Typography variant="body2" color="text.secondary">
                        Address: {supplier.address}
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
            {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
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
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
            <TextField
              label="Address"
              multiline
              minRows={3}
              value={formData.address}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, address: e.target.value }))
              }
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Supplier Images
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

              {editingSupplier &&
                editingSupplier.images &&
                editingSupplier.images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Existing Images
                    </Typography>
                    <ImageList cols={4} gap={8}>
                      {editingSupplier.images.map((img) => (
                        <ImageListItem key={img.id} sx={{ position: 'relative' }}>
                          <img
                            src={getImageUrl(
                              img.thumbnail_path || img.image_path
                            )}
                            alt="Supplier"
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
                              handleDeleteImage(editingSupplier.id, img.id, e)
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
            {editingSupplier ? 'Update' : 'Create'}
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
          <Typography sx={{ flexGrow: 1 }}>Supplier Images</Typography>
          <IconButton onClick={() => setShowImageGallery(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ImageList cols={3} gap={12}>
            {suppliers
              .find((s) => s.id === showImageGallery)
              ?.images?.map((img) => (
                <ImageListItem key={img.id}>
                  <img src={getImageUrl(img.image_path)} alt="Supplier" />
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

export default Suppliers;

