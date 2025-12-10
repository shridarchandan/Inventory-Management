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
import { categoriesAPI } from '../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      alert('Error loading categories. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let categoryId;
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.id, formData);
        categoryId = editingCategory.id;
      } else {
        const response = await categoriesAPI.create(formData);
        categoryId = response.data.id;
      }

      if (selectedImages.length > 0 && categoryId) {
        await handleImageUpload(categoryId);
      }

      fetchCategories();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.error || 'Error saving category');
    }
  };

  const handleImageUpload = async (categoryId) => {
    if (selectedImages.length === 0) return;

    setUploadingImages(true);
    try {
      const fd = new FormData();
      selectedImages.forEach((file) => {
        fd.append('images', file);
      });

      await categoriesAPI.uploadImages(categoryId, fd);
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

  const handleDeleteImage = async (categoryId, imageId, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await categoriesAPI.deleteImage(categoryId, imageId);
        fetchCategories();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting image');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      description: category.description || '',
    });
    setSelectedImages([]);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await categoriesAPI.delete(id);
        fetchCategories();
      } catch (error) {
        alert(error.response?.data?.error || 'Error deleting category');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setSelectedImages([]);
    setFormData({
      name: '',
      description: '',
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
          Categories
        </Typography>
        <Button variant="contained" onClick={() => setShowModal(true)}>
          + Add Category
        </Button>
      </Box>

      {categories.length === 0 ? (
        <Typography color="text.secondary">
          No categories found. Add your first category!
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                }}
              >
                {category.images && category.images.length > 0 && (
                  <CardMedia
                    component="img"
                    height="180"
                    image={getImageUrl(
                      category.images[0].thumbnail_path ||
                        category.images[0].image_path
                    )}
                    alt={category.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setShowImageGallery(category.id)}
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
                      {category.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  {category.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 1 }}
                    >
                      {category.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={showModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography sx={{ flexGrow: 1 }}>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Category Images
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

              {editingCategory &&
                editingCategory.images &&
                editingCategory.images.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Existing Images
                    </Typography>
                    <ImageList cols={4} gap={8}>
                      {editingCategory.images.map((img) => (
                        <ImageListItem key={img.id} sx={{ position: 'relative' }}>
                          <img
                            src={getImageUrl(
                              img.thumbnail_path || img.image_path
                            )}
                            alt="Category"
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
                              handleDeleteImage(editingCategory.id, img.id, e)
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
            {editingCategory ? 'Update' : 'Create'}
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
          <Typography sx={{ flexGrow: 1 }}>Category Images</Typography>
          <IconButton onClick={() => setShowImageGallery(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <ImageList cols={3} gap={12}>
            {categories
              .find((c) => c.id === showImageGallery)
              ?.images?.map((img) => (
                <ImageListItem key={img.id}>
                  <img src={getImageUrl(img.image_path)} alt="Category" />
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

export default Categories;

