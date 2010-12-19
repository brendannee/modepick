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

var Url = {
  // public method for url encoding
  encode : function (string) {
    return escape(this._utf8_encode(string));
  },
 
  // public method for url decoding
  decode : function (string) {
    return this._utf8_decode(unescape(string));
  },
 
  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";
 
    for (var n = 0; n < string.length; n++) {
 
      var c = string.charCodeAt(n);
 
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  },
 
  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;
 
    while ( i < utftext.length ) {
 
      c = utftext.charCodeAt(i);
 
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
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

function formatTime(mins){
  if(mins>59){
    minshours = Math.floor(mins/60);
    minsmins = Math.floor(mins%60);
    if(minshours==1){
      if(minsmins>0){
        return "1 hour " + minsmins + " mins";
      } else{
        return "1 hour";
      }
    } else{
      if(minsmins>0){
        return minshours + " hours " + minsmins + " mins";
      } else {
        return minshours + " hours";
      }
    }
  } else {
    return Math.floor(mins) + " mins";
  }
}

function formatTimeDecimal(mins){
  if(mins>59){
    minshours = mins/60;
    if(minshours==1){
      return "1 hour";
    }else{
      return minshours+" hours";
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
  s = minus + s;
  return "$"+s;
}

function parseTime(str) {
  var t = str.split(':')
  return new Date(2007,0,1,  ((str.toLowerCase().indexOf('pm')!=-1)?(12+parseInt(t[0],10)):t[0]),parseInt(t[1],10),00).getTime();
}