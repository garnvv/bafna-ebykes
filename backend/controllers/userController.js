const { Vehicle, Bike } = require('../models');

const getMyVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.findAll({
      where: { userId: req.user.id },
      include: [Bike]
    });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyVehicles
};
