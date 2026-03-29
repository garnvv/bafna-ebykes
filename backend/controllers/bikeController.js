const { Bike } = require('../models');

// @desc    Get all bikes
// @route   GET /api/bikes
// @access  Public
const getBikes = async (req, res) => {
  try {
    const bikes = await Bike.findAll();
    res.json(bikes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bike
// @route   GET /api/bikes/:id
// @access  Public
const getBikeById = async (req, res) => {
  try {
    const bike = await Bike.findByPk(req.params.id);
    if (bike) {
      res.json(bike);
    } else {
      res.status(404).json({ message: 'Bike not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a bike
// @route   POST /api/bikes
// @access  Private/Admin
const createBike = async (req, res) => {
  try {
    let images = [];
    if (req.body.existingImages) {
      images = JSON.parse(req.body.existingImages);
    }
    if (req.files && req.files.length > 0) {
      const generalFiles = req.files.filter(f => f.fieldname === 'images');
      const uploadedUrls = generalFiles.map(file => `/uploads/${file.filename}`);
      images = [...images, ...uploadedUrls];

      // Handle dedicated mainImage (if provided, it becomes index 0)
      const mainFile = req.files.find(f => f.fieldname === 'mainImage');
      if (mainFile) {
        const mainUrl = `/uploads/${mainFile.filename}`;
        images = [mainUrl, ...images.filter(url => url !== mainUrl)];
        req.body.mainImage = mainUrl;
      }
    }
    
    // Convert stringified array fields from FormData back to real arrays/booleans if needed
    const payload = { ...req.body };
    if (images.length > 0) payload.images = images;
    if (payload.color && typeof payload.color === 'string' && payload.color.startsWith('[')) {
      payload.color = JSON.parse(payload.color); 
    }
    if (payload.customFeatures && typeof payload.customFeatures === 'string') {
      payload.customFeatures = JSON.parse(payload.customFeatures);
    }
    if (payload.colorVariants && typeof payload.colorVariants === 'string') {
      let parsedVariants = JSON.parse(payload.colorVariants);
      parsedVariants = parsedVariants.map((variant, index) => {
        const variantImages = variant.existingImages ? [...variant.existingImages] : [];
        if (req.files) {
          const colorFiles = req.files.filter(f => f.fieldname === `colorFiles_${index}`);
          const colorUrls = colorFiles.map(file => `/uploads/${file.filename}`);
          variantImages.push(...colorUrls);
        }
        return { name: variant.name, images: variantImages };
      });
      payload.colorVariants = parsedVariants;
    }

    const bike = await Bike.create(payload);
    res.status(201).json(bike);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a bike
// @route   PUT /api/bikes/:id
// @access  Private/Admin
const updateBike = async (req, res) => {
  try {
    const bike = await Bike.findByPk(req.params.id);
    if (!bike) {
      return res.status(404).json({ message: 'Bike not found' });
    }

    let images = [];
    if (req.body.existingImages) {
      images = JSON.parse(req.body.existingImages);
    }
    if (req.files && req.files.length > 0) {
      const generalFiles = req.files.filter(f => f.fieldname === 'images');
      const uploadedUrls = generalFiles.map(file => `/uploads/${file.filename}`);
      images = [...images, ...uploadedUrls];

      // Handle dedicated mainImage (if provided, it becomes index 0)
      const mainFile = req.files.find(f => f.fieldname === 'mainImage');
      if (mainFile) {
        const mainUrl = `/uploads/${mainFile.filename}`;
        images = [mainUrl, ...images.filter(url => url !== mainUrl)];
        req.body.mainImage = mainUrl;
      }
    }

    const payload = { ...req.body };
    if (images.length > 0 || req.body.existingImages) {
      payload.images = images;
    }
    if (payload.customFeatures && typeof payload.customFeatures === 'string') {
      payload.customFeatures = JSON.parse(payload.customFeatures);
    }
    if (payload.colorVariants && typeof payload.colorVariants === 'string') {
      let parsedVariants = JSON.parse(payload.colorVariants);
      parsedVariants = parsedVariants.map((variant, index) => {
        const variantImages = variant.existingImages ? [...variant.existingImages] : [];
        if (req.files) {
          const colorFiles = req.files.filter(f => f.fieldname === `colorFiles_${index}`);
          const colorUrls = colorFiles.map(file => `/uploads/${file.filename}`);
          variantImages.push(...colorUrls);
        }
        return { name: variant.name, images: variantImages };
      });
      payload.colorVariants = parsedVariants;
    }

    await bike.update(payload);
    res.json(bike);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a bike
// @route   DELETE /api/bikes/:id
// @access  Private/Admin
const deleteBike = async (req, res) => {
  try {
    const bike = await Bike.findByPk(req.params.id);
    if (bike) {
      await bike.destroy();
      res.json({ message: 'Bike removed' });
    } else {
      res.status(404).json({ message: 'Bike not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBikes,
  getBikeById,
  createBike,
  updateBike,
  deleteBike
};
