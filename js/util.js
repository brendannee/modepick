
function calculateDistance(lat1, lon1, lat2, lon2) {
    var radius = 3959.0; //Earth Radius in mi
    var radianLat1 = ToRadians(lat1);
    var radianLon1 = ToRadians(lon1);
    var radianLat2 = ToRadians(lat2);
    var radianLon2 = ToRadians(lon2);
    var radianDistanceLat = radianLat1 - radianLat2;
    var radianDistanceLon = radianLon1 - radianLon2;
    var sinLat = Math.sin(radianDistanceLat / 2.0);
    var sinLon = Math.sin(radianDistanceLon / 2.0);
    var a = Math.pow(sinLat, 2.0) + Math.cos(radianLat1) * Math.cos(radianLat2) * Math.pow(sinLon, 2.0);
    var d = radius * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
    return d;
}

function ToRadians(degree) {
  return (degree * (Math.PI / 180));
}

var dates = {
  convert:function(d) {
    return (
      d.constructor === Date ? d :
      d.constructor === Array ? new Date(d[0],d[1],d[2]) :
      d.constructor === Number ? new Date(d) :
      d.constructor === String ? new Date(d) :
      typeof d === "object" ? new Date(d.year,d.month,d.date) :
      NaN
    );
  },
  compare:function(a,b) {
    return (
      isFinite(a=this.convert(a).valueOf()) &&
      isFinite(b=this.convert(b).valueOf()) ?
      (a>b)-(a<b) :
      NaN
    );
  },
  inRange:function(d,start,end) {
    return (
      isFinite(d=this.convert(d).valueOf()) &&
      isFinite(start=this.convert(start).valueOf()) &&
      isFinite(end=this.convert(end).valueOf()) ?
      start <= d && d <= end :
      NaN
    );
  }
}

formatTime = function(mins){
  if(mins>59){
    minshours = Math.round(mins/60*10)/10;
    if(minshours==1){
      return "1 hr";
    }else{
      return (minshours<50) ? minshours+" hrs" : Math.round(minshours)+" hrs"
    }
  } else {
    return Math.floor(mins) + " mins";
  }
}

function formatCurrency(amount) {
  var i = parseFloat(amount);
  if(isNaN(i)) { i = 0.00; }
  var minus = '';
  if(i < 0) { minus = '-'; }
  i = Math.abs(i);
  i = parseInt((i + .005) * 100);
  i = i / 100;
  s = new String(i);
  if(s.indexOf('.') < 0) { s += '.00'; }
  if(s.indexOf('.') == (s.length - 2)) { s += '0'; }
  if(i>100) { s = Math.round(s); }
  s = minus + s;
  return "$"+s;
}

formatDistance = function(length) {
  var i = parseFloat(length);
  if(isNaN(i)) { i = 0; }
  var minus = '';
  if(i < 0) { minus = '-'; }
  i = Math.abs(i);
  i = parseInt((i + .05) * 10);
  i = i / 10;
  s = new String(i);
  if(s.indexOf('.') < 0) { s += '.0'; }
  if(s.indexOf('.') == (s.length - 1)) { s += '0'; }
  if(i>100) { s = Math.round(s); }
  s = minus + s;
  s = (i<1) ? Math.round(i*5280) + " ft" : s + " mi";
  return s;
}

function time24(str) {
  var hour = str.substring(0, str.indexOf(':'));
  var minute = str.substr(str.indexOf(':') + 1, 2);
  if(str.indexOf('pm') > 0){
    hour = parseInt(hour) + 12;
  }
  if(str.indexOf('am') > 0 && parseInt(hour) == 12){
    hour = 0;
  }
  return ((hour < 12) ? "0" : "") + hour + ":" + minute;
}

function getUrlVars() {
	var map = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		map[key] = value;
	});
	return map;
}

if(typeof(exports) != 'undefined'){
  exports.formatDistance = formatDistance;
  exports.formatTime = formatTime;
  exports.ccsplans = ccsplans;
  exports.zipcarplans = zipcarplans;
  exports.drivingcosts = drivingcosts;
  exports.cabfares = cabfares;
  exports.uberfares = uberfares;
}
