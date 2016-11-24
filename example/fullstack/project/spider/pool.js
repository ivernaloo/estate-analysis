/*
  直接爬取并出现错误
*/
//用mongodb实现并行爬取
//
//

var request = require('request');
var fs = require('fs');
//

var Mongo = require('./../mongo');

var poolCount = 20;
var timeout = 100;


/*
* addresses
* source {Array} properties code array
* */
function Pool(source){
  this.source = source;
  this.reset();
  this.init();
}

//获取url的函数
function getURL(address) {
  return encodeURI('http://restapi.amap.com/v3/geocode/geo?key=46799a1920f8b8914ad7d0a2db0096d1&address=' + address);
}

Pool.prototype = {
  reset: function(){  // 数据重置
    this.spiderIndex = 0;
    this.queryingIndex = 0;
  },
  init: function(){ // 初始化
    this.querying = [];
  },
  /*
  * 处理抓取的数据
  * e 请求结果
  * res 请求的返回值
  * body 请求返回的body
  * object 
  * */
  process: function(e, res, body, obj){
    if (!e && res.statusCode == 200) {
      body = JSON.parse(body);
      data = body.geocodes; // 地理信息
      if(!data || !data[0]) return this.onProcessed(); // 处理地理信息
      d = data[0];
      var location = d.location;
      if(!d.location) return this.onProcessed(); 
      location = location.split(',');
      obj.lat = parseFloat(location[1], 10);
      obj.lng = parseFloat(location[0], 10);
      obj.price = obj.avr_price;
      //
      console.log(this.spiderIndex + '|' + this.queryingIndex);
      update(obj);
      return this.onProcessed();
    } else {
      console.log('错误');
      return this.onProcessed();
    }
  },
  onProcessed: function(){
    this.queryingIndex--; // 重复请求一次
    setTimeout(function(){ // 再请求一次?
      this.query(); // 查询逻辑
    }.bind(this), timeout); // 把pool的对象传入
  },
  query: function(){ // 查询逻辑
    if (this.queryingIndex > poolCount) return console.log('done'); // 请求全部成功了，没有需要重复的啦
    var obj = this.source[this.spiderIndex];
    console.log(obj)
    var url = getURL(obj.address);
    request.get(url, function(e, res, body){
      this.process(e, res, body, obj);
    }.bind(this));
    this.spiderIndex = this.spiderIndex + 1;
    this.queryingIndex = this.queryingIndex + 1;
    if(this.queryingIndex < poolCount) this.query();
  }
};


function update(obj) {
  Mongo.community.findOneAndUpdate({
    community_id: obj.community_id
  }, obj, {
    upsert: true
  }, function(e, d) {
    console.log('更新成功...');
  });
}


module.exports = Pool;