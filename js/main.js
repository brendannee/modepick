var map;
var markerArray = [];
var popup;
var triptime = 0;
var tripweekendzipcartime = 0;
var tripweekendccstime = 0;
var tripweekendccs2time = 0;
var triplatenighttime = 0;
var tripdist = 0;
var ccsplans = {
  "sharealittle": {
    "title":"Share-a-Little",
    "weekdayhourly":6.5,
    "weekendhourly":7.5,
    "mileagehourly":0.4,
    "latenighthourly":6.5,
    "weekdaydaily":54,
    "weekenddaily":58,
    "mileagedaily":0.1,
    "dailymileagecap":200,
    "mileageoverage":0.4
  },
  "sharelocal": {
    "title":"ShareLocal",
    "weekdayhourly":5.5,
    "weekendhourly":6,
    "mileagehourly":0.35,
    "latenighthourly":1.5,
    "weekdaydaily":48,
    "weekenddaily":52,
    "mileagedaily":0.1,
    "dailymileagecap":200,
    "mileageoverage":0.35
  },
  "shareplus": {
    "title":"SharePlus",
    "weekdayhourly":5.5,
    "weekendhourly":6,
    "mileagehourly":0.35,
    "latenighthourly":0,
    "weekdaydaily":48,
    "weekenddaily":52,
    "mileagedaily":0.1,
    "dailymileagecap":200,
    "mileageoverage":0.35
  }
}

var zipcarplans = {
  "occasional": {
    "title":"Occasional",
    "weekdayhourly":7,
    "weekendhourly":7,
    "mileagehourly":0,
    "latenighthourly":7,
    "weekdaydaily":73,
    "weekenddaily":78,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":0
  },
  "evp50": {
    "title":"EVP $50",
    "weekdayhourly":6.3,
    "weekendhourly":6.3,
    "mileagehourly":0,
    "latenighthourly":6.3,
    "weekdaydaily":65.70,
    "weekenddaily":70.20,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":10
  },
  "evp75": {
    "title":"EVP $75",
    "weekdayhourly":6.3,
    "weekendhourly":6.3,
    "mileagehourly":0,
    "latenighthourly":6.3,
    "weekdaydaily":65.70,
    "weekenddaily":70.20,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":10
  },
  "evp125": {
    "title":"EVP $125",
    "weekdayhourly":6.3,
    "weekendhourly":6.3,
    "mileagehourly":0,
    "latenighthourly":6.3,
    "weekdaydaily":65.70,
    "weekenddaily":70.20,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":10
  },
  "evp250": {
    "title":"EVP $250",
    "weekdayhourly":5.95,
    "weekendhourly":5.95,
    "mileagehourly":0,
    "latenighthourly":5.95,
    "weekdaydaily":62.05,
    "weekenddaily":66.30,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":15
  }
}
var cabfares = {
  firstfifth:3.1,
  additionalfifth:0.45,
  waitingminute:.45,
  tippercent:10
}
var uberfares = {
  flag:8,
  mileage:4.9,
  idleminute:1.25
}

function calculate_distance(lat1, lon1, lat2, lon2) {
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

function tooltips(){
    // select all desired input fields and attach tooltips to them 
    $("#startlocation,#destinationlocation,#zipcarrate,#extramiles").tooltip({ 
        // place tooltip on the right edge 
        position: "center right", 

        // a little tweaking of the position 
        offset: [0, 10], 

        // use the built-in fadeIn/fadeOut effect 
        effect: "fade", 

        // custom opacity setting 
        opacity: 0.8, 

        // use this single tooltip element 
        tip: '.tooltip' 
    });
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

function clearOverlays() {
  if (markerArray) {
    for (i in markerArray) {
      markerArray[i].setMap(null);
    }
  }
}

function add_carshare_locations(map, lat, lon, type){
  //Add carshare locations to map
  
  //Create 1 mile bounding box
  var NBound = lat+0.01;
  var SBound = lat-0.01; 
  var EBound = lon+0.01;
  var WBound = lon-0.01;
  
  if(type=='ccs'){
    var image = new google.maps.MarkerImage(
      'images/ccs.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(24, 24),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(12, 12));
  
    for (pod in ccs_arr) {
      //check to see if within bounding box
      if(ccs_arr[pod].lat>SBound && ccs_arr[pod].lat<NBound && ccs_arr[pod].lon>WBound && ccs_arr[pod].lon<EBound){
        //Check to see if within 1 mile radius
        if(calculate_distance(ccs_arr[pod].lat,ccs_arr[pod].lon,lat,lon)<=1){
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(ccs_arr[pod].lat,ccs_arr[pod].lon),
            title: ccs_arr[pod].name.replace(/&amp;/g,'&'),
            map:map,
            icon: image,
            zIndex:1
          });
      
          //Add to marker array
          markerArray.push(marker);

          google.maps.event.addListener(marker,'click', (function(marker,pod) {
            return function() {
              popup.setContent(
                "<ul class=\"pod\">" +
                "<li id=\"podName\"><a href=\"" + ccs_arr[pod].url + "\" target=\"_new\" title='Click to view CityCarShare Pod info'>" + ccs_arr[pod].name + "</a></li>" + 
                "<li id=\"podAddy\">" + ccs_arr[pod].addr + "</li>" + 
                "<li id=\"podCars\">" + "Cars:&nbsp;" + ccs_arr[pod].vstring + "</li>" + "</ul>"
              );
              popup.open(map,marker);
            }
          }) (marker,pod));
        }
      }
    }
  } else if(type == 'zipcar'){
    var image = new google.maps.MarkerImage(
      'images/zipcar.png',
      // This marker is 20 pixels wide by 32 pixels tall.
      new google.maps.Size(24, 24),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(12, 12));
  
    for (pod in zipcar_arr) {
      //check to see if within bounding box
      if(zipcar_arr[pod][2]>SBound && zipcar_arr[pod][2]<NBound && zipcar_arr[pod][3]>WBound && zipcar_arr[pod][3]<EBound){
        //Check to see if within 1 mile radius
        if(calculate_distance(zipcar_arr[pod][2],zipcar_arr[pod][3],lat,lon)<=1){
          
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(zipcar_arr[pod][2],zipcar_arr[pod][3]),
            title: Url.decode(zipcar_arr[pod][1]).replace(/\+/g,' '),
            map:map,
            icon: image,
            zIndex:1
          });
      
          //Add to marker array
          markerArray.push(marker);

          google.maps.event.addListener(marker,'click', (function(marker,pod) {
            return function() {
              popup.setContent(
                "<ul class=\"pod\">" + "<li id=\"podName\">" + Url.decode(zipcar_arr[pod][1]).replace(/\+/g,' ') + "</li>" + "</ul>"
              );
              popup.open(map,marker);
            }
          }) (marker,pod));
        }
      }
    }
  }
}

function computeTotalDistance(result) {
  //clear markers
  clearOverlays()
  
  //Create popup window
  popup = new google.maps.InfoWindow({maxWidth:200});
  
  //Add CCS and zipcar locations
  add_carshare_locations(map, result.routes[0].legs[0].start_location.va, result.routes[0].legs[0].start_location.wa, 'ccs');
  add_carshare_locations(map, result.routes[0].legs[0].start_location.va, result.routes[0].legs[0].start_location.wa, 'zipcar');

  $('#warnings_panel').html('');
  var onewaydistance = 0;
  var onewaytime = 0;
  for (i = 0; i < result.routes[0].legs.length; i++) {
    //Convert to miles
    onewaydistance += (result.routes[0].legs[i].distance.value/ 1609.);
    onewaytime += result.routes[0].legs[i].duration.value;
  }
  //Convert to hours minutes
  timetext = formatTime(onewaytime*2/60);
  
  tripdist = Math.round(onewaydistance*2);
  
  //Estimate costs
  estimateCosts();
  
  if($('#extramiles').val()!=''){
    $("#totaldistance").html("Distance: <strong>" +  (tripdist+parseFloat($('#extramiles').val())) + " miles</strong> (" + Math.round(onewaydistance) + " mi each way plus "+ parseFloat($('#extramiles').val()) + " additional)");
  } else {
    $("#totaldistance").html("Distance: <strong>" +  tripdist + " miles</strong> (" + Math.round(onewaydistance) + " mi each way)");
  }
  $("#onewaytime").html("Est. driving time: <strong>" + timetext + "</strong>");
  
  //Check if estimated driving time exceeds trip time
  if(triptime<(onewaytime*2/60)){
    $('#warnings_panel').append("<li>Your estimated driving time exceeds your reservation time.</li>");
  }
  $("#results").show(); 
}

function computeTotalTime(){
  triplatenighttime = 0;
  tripweekendccstime = 0;
  tripweekendccs2time = 0;
  tripweekendzipcartime = 0;
  var departuredate=dates.convert(""+$('#departuredate').val()+" "+$('#departuretime').val());
  var returndate=dates.convert(""+$('#returndate').val()+" "+$('#returntime').val());
  
  //Check if after todays date
  today = new Date();
  if(dates.compare(departuredate,(today.getMonth()+1)+"/"+today.getDate()+"/"+today.getFullYear())<0){
    $('#warnings_panel').append("<li>Your departure date has already passed.</li>");
    return false;
  } 
  
  //Check if return date is after todays date
  if(dates.compare(returndate,departuredate)<0){
    $('#warnings_panel').append("<li>Your departure date is before your return date.</li>");
    return false;
  }
  
  triptime = (returndate-departuredate)/(1000*60)
  
  //determine how many days the trip time is
  var days = Math.floor((triptime/60)/24);
  
  //Calculate latenight time
  departuremidnight = new Date(departuredate.getFullYear(),departuredate.getMonth(),departuredate.getDate());
  returnmidnight = new Date(returndate.getFullYear(),returndate.getMonth(),returndate.getDate());
  if(days<1){
    if(departuredate.getHours()<8){
      //departure time before 8 AM
      if(returndate.getDate()==departuredate.getDate()){
        //Return is same day
        if(returndate.getHours()<8){
          //depart and return before 8 AM
          triplatenighttime += (returndate-departuredate)/(1000*60);
        }
        else {
          //Return after 8 AM
          triplatenighttime += (8*60)-((departuredate-departuremidnight)/(1000*60));
        }
      } else {
        //Return is next day
        triplatenighttime += (8*60)-((departuredate-departuremidnight)/(1000*60));
        triplatenighttime += (returndate-returnmidnight)/(1000*60);
      }
    } else {
      //Departure is after 8 AM
      if(returndate.getDate()==departuredate.getDate()){
        //Return is same day, no late night
      } else {
        //Return is next day
        if(returndate.getHours()<8){
          //depart and return before 8 AM
          triplatenighttime += (returndate-returnmidnight)/(1000*60);
        }
        else {
          //Return after 8 AM
          triplatenighttime += (8*60);
        }
      }
    }
    
    //Weekend calculation for CCS with weeknights
    if(departuredate.getDay()==5){
      //departure day is friday
      if(returndate.getDate()==departuredate.getDate()){
        //Return is same day
        if(departuredate.getHours()<17){
          //depart before 5 PM
          if(returndate.getHours()>=17){
            //return after 5 PM
            tripweekendccstime += ((returndate-returnmidnight)/(1000*60))-(17*60);
          }
        } else {
          //Depart after 5 PM
          tripweekendccstime += (returndate-departuredate)/(1000*60);
        }
      } else {
        //Return is next day
        if(departuredate.getHours()<17){
          //depart before 5 PM
          tripweekendccstime += (7*60);
        } else {
          //depart after 5 PM
          tripweekendccstime += (24*60)-((departuredate-departuremidnight)/(1000*60));
        }
        if(returndate.getHours()>=8){
          tripweekendccstime += ((returndate-returnmidnight)/(1000*60))-(8*60);
        }
      }
    } else if(departuredate.getDay()==6){
      //departure day is Saturday
      if(returndate.getDate()==departuredate.getDate()){
        //Return is same day
        if(departuredate.getHours()<8){
          //depart before 8 AM
          if(returndate.getHours()>=8){
            //return after 8 AM
            tripweekendccstime += ((returndate-departuredate)/(1000*60)) - ((8*60)-((departuredate-departuremidnight)/(1000*60)));
          }
        } else {
          //Depart after 8 AM
          tripweekendccstime += (returndate-departuredate)/(1000*60);
        }
      } else {
        //Return is next day
        if(departuredate.getHours()<8){
          //depart before 8 AM, return must be before 8 AM
          tripweekendccstime += (16*60);
        } else{
          //departure after 8 AM
          if(returndate.getHours()<8){
            //return before 8 AM
            tripweekendccstime += (24*60)-((departuredate-departuremidnight)/(1000*60));
          } else {
            //return after 8 AM
            tripweekendccstime += (24*60)-((departuredate-departuremidnight)/(1000*60));
            tripweekendccstime += ((returndate-returnmidnight)/(1000*60))-(8*60);
          }
        }
      }
    } else if(departuredate.getDay()==0){
      //departure day is Sunday
      if(returndate.getDate()==departuredate.getDate()){
        //Return is same day
        if(departuredate.getHours()<8){
          //depart before 8 AM
          if(returndate.getHours()>=8){
            //return after 8 AM
            tripweekendccstime += ((returndate-departuredate)/(1000*60)) - ((8*60)-((departuredate-departuremidnight)/(1000*60)));
          }
        } else {
          //Depart after 8 AM
          tripweekendccstime += (returndate-departuredate)/(1000*60);
        }
      } else {
        //Return is next day
        if(departuredate.getHours()<8){
          //depart before 8 AM, return must be before 8 AM
          tripweekendccstime += (16*60);
        } else{
          //departure after 8 AM
          tripweekendccstime += (24*60)-((departuredate-departuremidnight)/(1000*60));
        }
      }
    }
    
    //Weekend calculation CCS with no weeknights
    if(departuredate.getDay()==5){
      //departure day is friday
     if(departuredate.getHours()<17){
        //depart before 5 PM
        if(returndate.getHours()>=17 || returndate.getDate()!=departuredate.getDate()){
          //return after 5 PM
          tripweekendccs2time += (returndate-departuredate)/(1000*60) - ((17*60)-((departuredate-departuremidnight)/(1000*60)));
        }
      } else {
        //depart after 5 PM
        tripweekendccs2time += (returndate-departuredate)/(1000*60);
      }
    } else if(departuredate.getDay()==6){
      //departure day is Saturday
      tripweekendccs2time += (returndate-departuredate)/(1000*60);
    } else if(departuredate.getDay()==0){
      //departure day is Sunday
      if(returndate.getDate()==departuredate.getDate()){
        //Return is same day
        tripweekendccs2time += (returndate-departuredate)/(1000*60);
      } else {
        //Return is next day
        if(returndate.getHours()<8){
          //return before 8 AM
          tripweekendccs2time += (returndate-departuredate)/(1000*60);
        } else{
          //return after 8 AM
          tripweekendccs2time += (returndate-departuredate)/(1000*60) - ((returndate-returnmidnight)/(1000*60)-(8*60));
        }
      }
    }
    
    //Weekend calculation Zipcar
    if(departuredate.getDay()==4){
      //departure day is thursday
      if(returndate.getDate()!=departuredate.getDate()){
        //return is next day
        tripweekendzipcartime += (returndate-returnmidnight)/(1000*60);
      }
    } else if(departuredate.getDay()>=5){
      //departure day is Friday or Saturday
      tripweekendzipcartime += (returndate-departuredate)/(1000*60);
    } else if(departuredate.getDay()==0){
      //departure day is Sunday
      if(returndate.getDate()==departuredate.getDate()){
        //Return is same day
        tripweekendzipcartime += (returndate-departuredate)/(1000*60);
      } else {
        //Return is next day
        tripweekendzipcartime += (24*60) - (departuredate-departuremidnight)/(1000*60);
      }
    }
  } else{
    //more than 24 hours
     $('#warnings_panel').append("<li>This calculator doesn't work for trips over 24 hours yet.</li>");
    return false;
  }
  
  $('#reservationtime').html("Reservation Time: <strong>" + formatTime(triptime) + "</strong>");
  return true;
  
}

function estimateCosts(){
  
  var ccscost = 0;
  var zipcarcost = 0;
  var taxicost = 0;
  var ubercost = 0;
  
  var ccsplan = ccsplans[$('#ccsplan').val()];
  var zipcarplan = zipcarplans[$('#zipcarplan').val()];
  
  //CCS
  $('#ccssummary').html("");
  if($('#ccsplan').val()=='sharealittle'){
    //Share a little doesn't havce late night hours so use CCS2 time
    ccscost+= ccsplan.weekdayhourly*((triptime-tripweekendccs2time)/60)+ccsplan.weekendhourly*(tripweekendccs2time/60);
    if((triptime-tripweekendccs2time)>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(triptime-tripweekendccs2time) + " x " + formatCurrency(ccsplan.weekdayhourly) + "/hr wkday<div>" +  formatCurrency(ccsplan.weekdayhourly*((triptime-tripweekendccs2time)/60)) + "</div></li>");
    }
    if(tripweekendccs2time>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(tripweekendccs2time) + " x " + formatCurrency(ccsplan.weekendhourly) + "/hr wkend<div>" + formatCurrency(ccsplan.weekendhourly*(tripweekendccs2time/60)) + "</div></li>");
    }
  } else {
    //Other plans have late night hours, so use CCS time
     ccscost+= ccsplan.weekdayhourly*((triptime-tripweekendccstime-triplatenighttime)/60)+ccsplan.weekendhourly*(tripweekendccstime/60)+ccsplan.latenighthourly*(triplatenighttime/60);
    if((triptime-tripweekendccstime-triplatenighttime)>0){
     $('#ccssummary').append("<li>" + formatTimeDecimal(triptime-tripweekendccstime-triplatenighttime) + " x " + formatCurrency(ccsplan.weekdayhourly) + "/hr wkday<div>" + formatCurrency(ccsplan.weekdayhourly*((triptime-tripweekendccstime-triplatenighttime)/60)) + "</div></li>");
    }
    if(tripweekendccstime>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(tripweekendccstime) + " x " + formatCurrency(ccsplan.weekendhourly) + "/hr wkend<div>" + formatCurrency(ccsplan.weekendhourly*(tripweekendccstime/60)) + "</div></li>");
    }
    if(triplatenighttime>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(triplatenighttime) + " x " + formatCurrency(ccsplan.latenighthourly) + "/hr latenight<div>" + formatCurrency(ccsplan.latenighthourly*(triplatenighttime/60)) + "</div></li>");
    }
  }
  //Add in Mileage
  if($('#extramiles').val()!=''){
    ccscost+= (tripdist+parseFloat($('#extramiles').val()))*ccsplan.mileagehourly;
    $('#ccssummary').append("<li>" + (tripdist+parseFloat($('#extramiles').val())) + " mi x " + formatCurrency(ccsplan.mileagehourly) + " per mi<div>" + formatCurrency((tripdist+parseFloat($('#extramiles').val()))*ccsplan.mileagehourly) + "</div></li>");
  } else {
    ccscost+= tripdist*ccsplan.mileagehourly;
    $('#ccssummary').append("<li>" + tripdist + " mi x " + formatCurrency(ccsplan.mileagehourly) + " per mi<div>" + formatCurrency(tripdist*ccsplan.mileagehourly) + "</div></li>");
  }
  
  $('#ccstotal').html(formatCurrency(ccscost));
  $('#ccssummary').append("<li class='total'>City Carshare Total<div>" + formatCurrency(ccscost) + "</div></li>");
  
  //Zipcar
  $('#zipcarsummary').html("");
  if(isNaN($('#zipcarrate').val()) || $('#zipcarrate').val()==''){
    zipcarcost+= zipcarplan.weekdayhourly*((triptime - tripweekendzipcartime)/60)+zipcarplan.weekendhourly*(tripweekendzipcartime/60);
    $('#zipcarsummary').append("<li>" + formatTimeDecimal(triptime) + " x " + formatCurrency(zipcarplan.weekendhourly) + "/hr<div>" + formatCurrency(zipcarplan.weekendhourly*(triptime/60)) + "</div></li>");
  } else{
    //Use custom zipcar rate entered by user
    zipcarcost+= parseFloat($('#zipcarrate').val())*(triptime/60)*(100-zipcarplan.percentdiscount)/100;
    $('#zipcarsummary').append("<li>" + formatTimeDecimal(triptime) + " x " + formatCurrency(parseFloat($('#zipcarrate').val())) + "/hr<div>" + formatCurrency(parseFloat($('#zipcarrate').val())*(triptime/60)) + "</div></li>");
    if(zipcarplan.percentdiscount>0){
      $('#zipcarsummary').append("<li>" + zipcarplan.percentdiscount + "% Discount<div>" + formatCurrency(-parseFloat($('#zipcarrate').val())*(triptime/60)*(zipcarplan.percentdiscount/100)) + "</div></li>");
    }
  }
  
  $('#zipcarsummary').append("<li class='total'>Zipcar Total<div>" + formatCurrency(zipcarcost) + "</div></li>");
  $('#zipcartotal').html(formatCurrency(zipcarcost));
  
  //Taxi (assume 1.5 minute of waiting per mile)
  var taxitrafficpermile = 1.5;
  
  $('#taxisummary').html("");
  taxicost+= cabfares.firstfifth*2 + (cabfares.additionalfifth*((tripdist-0.2)*5)) + cabfares.waitingminute*(tripdist*taxitrafficpermile);
  //add tip
  var tipamount = taxicost*(cabfares.tippercent/100);
  taxicost = taxicost*(1+(cabfares.tippercent/100));

  $('#taxitotal').html(formatCurrency(taxicost));
  $('#taxisummary').append("<li>Flag Drop x 2<div>"+formatCurrency(cabfares.firstfifth*2)+"</div></li>");
  $('#taxisummary').append("<li>"+tripdist+" mi x $2.25 per mi<div>"+formatCurrency((cabfares.additionalfifth*((tripdist-0.2)*5)))+"</div></li>");
  $('#taxisummary').append("<li>Waiting in Traffic (~"+(tripdist*taxitrafficpermile)+" min)<div>"+formatCurrency(cabfares.waitingminute*(tripdist*taxitrafficpermile))+"</div></li>");
  $('#taxisummary').append("<li>10% Tip<div>"+formatCurrency(tipamount)+"</div></li>");
  $('#taxisummary').append("<li class='total'>Taxi Total<div>"+formatCurrency(taxicost)+"</div></li>");
  
  //Uber (assume 1.5 minute of waiting per mile)
  $('#ubersummary').html("");
  ubercost+= uberfares.flag*2 + (uberfares.mileage*tripdist) + uberfares.idleminute*(tripdist*taxitrafficpermile);
  if(ubercost<30){
    //Minimum fare is $15 each way
    ubercost = 30;
    $('#ubersummary').append("<li>Minimum Fare $15 x 2<div>$30.00</div></li>");
    $('#ubersummary').append("<li class='total'>Uber Total<div>$30.00</div></li>");
  } else {
    $('#ubersummary').append("<li>Flag Drop x 2<div>"+formatCurrency(uberfares.flag*2)+"</div></li>");
    $('#ubersummary').append("<li>"+tripdist+" mi x " + formatCurrency(uberfares.mileage) + " per mi<div>"+formatCurrency(uberfares.mileage*tripdist)+"</div></li>");
    $('#ubersummary').append("<li>Waiting in Traffic (~"+(tripdist*taxitrafficpermile)+" min)<div>"+formatCurrency(uberfares.idleminute*(tripdist*taxitrafficpermile))+"</div></li>");
    $('#ubersummary').append("<li class='total'>Uber Total<div>"+formatCurrency(ubercost)+"</div></li>");
  }
  $('#ubertotal').html(formatCurrency(ubercost));
  
  //Resize window
  resizeWindow();
}

function getStartGeoLocator(position) {
  var geocoder = new google.maps.Geocoder();
  if (geocoder) {
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          $('#startlocation').val(results[0].formatted_address);
          $('#startlocation').effect("highlight", {color:"red"}, 3000);
        }
      } else {
        console.log('No results found: ' + status);
        $('#warnings_panel').append("<li>No results found: " + status + ".</li>");
      }
    });
  }
}

function showGeoLocatorError(error){
  if(error.code==1){
     $('#warnings_panel').append("<li>To determine your current location you must click \"Share Location\" in the top bar in your browser.</li>");
    alert();
  } else if (error.code==2 || error.code==3 || error.code==0){
     $('#warnings_panel').append("<li>Your current location couldn't be determined.  Please enter the start and end locations manually.</li>");
  }
}

function resizeWindow( e ) {
  var newWindowHeight = $(window).height();
  var resultsBoxHeight = 2 +parseInt($("#resultsBox").height()) +parseInt($("#resultsBox").css("margin-top")) +parseInt($("#resultsBox").css("margin-bottom") +parseInt($("#resultsBox").css("padding-top")) +parseInt($("#resultsBox").css("padding-bottom")) +parseInt($("#resultsBox").css("border-top-width")) +parseInt($("#resultsBox").css("border-bottom-width")));
  $("#map_canvas").css("min-height", (newWindowHeight-(resultsBoxHeight + parseInt($("#map_wrapper").css("border-bottom-width")))));
  $("#map_canvas").css("height", (newWindowHeight - (resultsBoxHeight +parseInt($("#map_wrapper").css("border-bottom-width")))));
  $("#loading_image").css("top", ((newWindowHeight)/3) );
}
    
google.setOnLoadCallback(function(){
  //If the User resizes the window, adjust the #container height
  $(window).bind("resize", resizeWindow);

  $("#departuredate").datepicker({
    onSelect: function(dateText, inst){
      //Make return date at least departure date
      if(dates.compare($("#returndate").val(),dateText)<0){
        $("#returndate").val(dateText);
      }
    }
  });
  $("#returndate").datepicker();

  //Set Todays Date and Time
  var currentTime = new Date()
  var minutes = currentTime.getMinutes();
  var hours = currentTime.getHours();
  var month = currentTime.getMonth() + 1;
  var day = currentTime.getDate();
  var year = currentTime.getFullYear();
  
  $("#departuredate").val(month + "/" + day + "/" + year);
  $("#returndate").val(month + "/" + day + "/" + year);
  
  minutes = Math.round((minutes/15+1))*15;
  if(minutes>59){
    hours=hours+1;
    minutes=minutes-60;
  }
  if (minutes < 10){
    minutes = "0" + minutes;
  }
  if(hours>23){
    hours = hours-24;
  }

  if (hours < 10){
    $('#departuretime').val("0" + hours + ":" + minutes);
  } else {
    $('#departuretime').val(hours + ":" + minutes);
  }

  if(hours+1>23){
    //use tomorrow
    $('#returntime').val("0" + (hours+1-24) + ":" + minutes);
    $("#returndate").val(month + "/" + (day+1) + "/" + year);
  } else{
    if (hours+1 < 10){
      $('#returntime').val("0" + (hours+1) + ":" + minutes);
    }else{
      $('#returntime').val((hours+1) + ":" + minutes);
    }
  }

  //clear welcome screen
  $('#inputs input').focus(function(){
    $('#welcome_screen').fadeOut();
  })

  // Launch Map
  var directionDisplay;
  var directionsService;
  map = new google.maps.Map(document.getElementById("map_canvas"), {
    zoom: 12,
    center: new google.maps.LatLng(37.7601, -122.4478),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  // Instantiate a directions service.
  directionsService = new google.maps.DirectionsService();
  
  // Create a renderer for directions and bind it to the map.
  directionsDisplay = new google.maps.DirectionsRenderer({
    map: map,
    draggable: true,
    markerOptions: {
      zIndex: 100
    }
  })
  
  google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
    computeTotalDistance(directionsDisplay.directions);
    
    //Highlight results box on change
    $('#resultsBox').effect("highlight", {color:"#d1d1d1"}, 3000);
    
    //Put new addresses in input box
    $('#startlocation').val(directionsDisplay.directions.routes[0].legs[0].start_address.replace(/, CA \d+, USA/g, "").replace(/, USA/g, ""));
    $('#destinationlocation').val(directionsDisplay.directions.routes[0].legs[0].end_address.replace(/, CA \d+, USA/g, "").replace(/, USA/g, ""));
  });

  $('#welcome_screen').fadeIn();
  
  $("#inputs").submit(function(){

     // Retrieve the start and end locations and create
     // a DirectionsRequest using DRIVING directions.
     var start = $('#startlocation').val();
     var end = $('#destinationlocation').val();
     var request = {
         origin: start,
         destination: end,
         travelMode: google.maps.DirectionsTravelMode.DRIVING
     };
     
     //Clear old warnings and trip
     $('#warnings_panel').html('');
     $('#results').hide();
     
     if(computeTotalTime()){
     
       // Route the directions and pass the response to a
       // function to create markers for each step.
       directionsService.route(request, function(response, status) {
         if (status == google.maps.DirectionsStatus.OK) {
           if(response.routes[0].warnings!=''){
             $('#warnings_panel').append("<li>" + response.routes[0].warnings + "</li>");
           }
           directionsDisplay.setDirections(response);
           computeTotalDistance(response);
         }
       });
       
     }
     $("#resultsBox").fadeIn();  
     $('#welcome_screen').fadeOut();   
     return false;
  });

  //Enable Tooltips
  tooltips();

  //Show geolocation if browser supports it
  if (navigator.geolocation) {  
   $("#slocation").show();
  }
 
  //Resize window after geolocation section loads
  resizeWindow();
});

