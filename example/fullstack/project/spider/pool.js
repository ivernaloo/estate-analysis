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
// 伪造了请求数据
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
      d = data[0]; // 拿到地理坐标
      var location = d.location; //坐标地址?
      if(!d.location) return this.onProcessed(); // 没拿坐标的时候再加载一次
      location = location.split(',');
      obj.lat = parseFloat(location[1], 10); // 坐标，纬度
      obj.lng = parseFloat(location[0], 10); // 坐标 经度
      obj.price = obj.avr_price; // 平均价格
      //
      // console.log(this.spiderIndex + '|' + this.queryingIndex); // 爬虫索引
      console.log("进度 ：", this.spiderIndex, " / ", poolCount , " / ", this.source.length );
      update(obj); // 更新数据库
      return this.onProcessed(); // 重新加载
    } else {
      console.log('错误');
      return this.onProcessed(); // 重新加载
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
    var obj = this.source[this.spiderIndex]; // 游标遍历小区信息
    // console.log(obj); // 打印小区信息
    var url = getURL(obj.address); // "address": "威宁路339弄"，以地址检索
    request.get(url, function(e, res, body){    // 从amap拿数据
      this.process(e, res, body, obj);
    }.bind(this));
    this.spiderIndex = this.spiderIndex + 1; // 游标后移
    this.queryingIndex = this.queryingIndex + 1;
    if(this.queryingIndex < poolCount) this.query(); // pool数据没有跑完就继续跑
  }
};


/*
* 更新数据库
* */
function update(obj) {
  Mongo.community.findOneAndUpdate({
    community_id: obj.community_id
  }, obj, {
    upsert: true
  }, function(e, d) {
    // console.log('更新成功...');
  });
}


module.exports = Pool;