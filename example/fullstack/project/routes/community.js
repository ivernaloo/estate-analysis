var express = require('express');
var router = express.Router();
var Mongo = require('./../mongo');

/* GET users listing. */
router.get('/', function(req, res, next) {
	Mongo.community.find({}, {
		lat: 1,
		lng: 1,
		price: 1,
		community_name: 1,
		_id: 0
	}, function(e, ds) {
		console.log(ds.length)
		res.json(ds);
	}).limit(1000);  // 加入了长度限制，加速数据加载
});

module.exports = router;