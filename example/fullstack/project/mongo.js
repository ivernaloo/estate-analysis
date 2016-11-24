var mongoose = require('mongoose');
mongoose.connect('mongodb://114.215.139.174:27017/hospital');

var Community = require('./models/community');

module.exports = {
  community: Community,
};