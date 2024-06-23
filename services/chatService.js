const { User } = require('../models');

const addUser = async ({ name, roomId, socketId }) => {
  const user = await User.create({ name, roomId, socketId });
  return user;
};

const removeUser = async (socketId) => {
  const user = await User.findOne({ where: { socketId } });
  if (user) {
    await user.destroy();
  }
  return user;
};

const findUserByRoomId = async (roomId) => {
  return await User.findAll({ where: { roomId } });
};

module.exports = {
  addUser,
  removeUser,
  findUserByRoomId,
};
