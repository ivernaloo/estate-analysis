"use strict";
var mongoose = require("mongoose"),
  Schema = mongoose.Schema,
  Model = new Schema({ // 模型：类似sql里面建表
    lat: Number,
    lng: Number,
    price: Number,
    community_name: String,
    community_id: {
      type: 'String',
      index: { unique: true }
    }
  });

Model.index({
  community_name: 1
});

module.exports = mongoose.model("community", Model);