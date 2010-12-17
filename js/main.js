var map;
var directionDisplay;
var directionsService;
var markerArray = [];
var popup;
var closestCCSMarker;
var closestZipCarMarker;
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

function enableTooltips(){
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

function parseTime(str) {
  var t = str.split(':')
  return new Date(2007,0,1,  ((str.toLowerCase().indexOf('pm')!=-1)?(12+parseInt(t[0],10)):t[0]),parseInt(t[1],10),00).getTime();
}

function clearOverlays() {
  if (markerArray) {
    for (i in markerArray) {
      markerArray[i].setMap(null);
    }
  }
}

function addCarshareLocations(map, lat, lon, type){
  //Add carshare locations to map
  
  //Create 1 mile bounding box
  var NBound = lat+0.02;
  var SBound = lat-0.02; 
  var EBound = lon+0.02;
  var WBound = lon-0.02;
  
  closestCCSMarker = 1000;
  
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
        distanceAway = calculateDistance(ccs_arr[pod].lat,ccs_arr[pod].lon,lat,lon);
        if(distanceAway<=1){
          if(distanceAway<closestCCSMarker){
            closestCCSMarker = distanceAway;
          }
          
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(ccs_arr[pod].lat,ccs_arr[pod].lon),
            title: ccs_arr[pod].name.replace(/&amp;/g,'&'),
            map:map,
            icon: image,
            zIndex:1,
            distance: distanceAway
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
        if(calculateDistance(zipcar_arr[pod][2],zipcar_arr[pod][3],lat,lon)<=1){
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

function calculateTrip(response) {
  //clear markers
  clearOverlays()
  
  //Create popup window
  popup = new google.maps.InfoWindow({maxWidth:200});
  
  //Add CCS and zipcar locations
  
  addCarshareLocations(map, response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng(), 'ccs');
  addCarshareLocations(map, response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng(), 'zipcar');

  $('#warnings_panel').html('');
  var onewaydistance = 0;
  var onewaytime = 0;
  var leg_count = response.routes[0].legs.length;
  for (i = 0; i < leg_count; i++) {
    //Convert to miles
    onewaydistance += (response.routes[0].legs[i].distance.value/ 1609.);
    onewaytime += response.routes[0].legs[i].duration.value;
  }
  //Convert to hours minutes
  timetext = formatTime(onewaytime*2/60);
  
  tripdist = Math.round(onewaydistance*2);
  
  //Estimate costs
  estimateCosts();
  
  if($('#extramiles').val()!=''){
    $("#drivingdistance").html("Distance: <strong>" +  (tripdist+parseFloat($('#extramiles').val())) + " miles</strong> (" + Math.round(onewaydistance) + " mi each way plus "+ parseFloat($('#extramiles').val()) + " additional)");
  } else {
    $("#drivingdistance").html("Distance: <strong>" +  tripdist + " miles</strong> (" + Math.round(onewaydistance) + " mi each way)");
  }
  $("#drivingtime").html("Est. time: <strong>" + timetext + "</strong>");
  $("#drivinglink").html("<a href='http://maps.google.com/maps?saddr="+encodeURIComponent(response.routes[0].legs[0].start_address)+"&daddr="+encodeURIComponent(response.routes[0].legs[response.routes[0].legs.length-1].end_address)+"&dirflg=d' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'></a>");
  
  //Check if estimated driving time exceeds trip time
  if(triptime<(onewaytime*2/60)){
    $('#warnings_panel').append("<li>Your estimated driving time exceeds your reservation time.</li>");
  }
  
  //Do Walking Directions
  // Instantiate a directions service for walking.
  DirectionsService = new google.maps.DirectionsService();
  
  var request = {
      origin: response.routes[0].legs[0].start_address,
      destination: response.routes[0].legs[leg_count-1].end_address,
      travelMode: google.maps.DirectionsTravelMode.WALKING
  };
  DirectionsService.route(request, function(response, status) {
     if (status == google.maps.DirectionsStatus.OK) {
       if(response.routes[0].warnings!=''){
         $('#warnings_panel').append("<li>" + response.routes[0].warnings + "</li>");
       }
       //directionsDisplay.setDirections(response);
       calculateWalkTrip(response);
     }
   });
   
   //Do Biking Directions
   var request = {
       origin: response.routes[0].legs[0].start_address,
       destination: response.routes[0].legs[leg_count-1].end_address,
       travelMode: google.maps.DirectionsTravelMode.BICYCLING
   };
   DirectionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        if(response.routes[0].warnings!=''){
          $('#warnings_panel').append("<li>" + response.routes[0].warnings + "</li>");
        }
        //directionsDisplay.setDirections(response);
        calculateBikeTrip(response);
      }
    });
    
    //Do Transit Directions 
    //Use lat lon coordinates to avoid issues with start/end names - need space between coordinates
    calculateTransitTrip(response.routes[0].legs[0].start_location.lat()+", "+response.routes[0].legs[0].start_location.lng(),
      response.routes[0].legs[leg_count-1].end_location.lat()+", "+response.routes[0].legs[leg_count-1].end_location.lng());
  
  $("#results").show(); 
  
  //Resize window
  setTimeout(resizeWindow(),500);
}

function calculateWalkTrip(response){
  var onewaydistance = 0;
  var onewaytime = 0;
  for (i = 0; i < response.routes[0].legs.length; i++) {
    //Convert to miles
    onewaydistance += (response.routes[0].legs[i].distance.value/ 1609.);
    onewaytime += response.routes[0].legs[i].duration.value;
  }
  //Convert to hours minutes
  timetext = formatTime(onewaytime*2/60);
  
  tripdist = Math.round(onewaydistance*2);
  
  if($('#extramiles').val()!=''){
    $("#walkingdistance").html("Distance: <strong>" +  (tripdist+parseFloat($('#extramiles').val())) + " miles</strong> (" + Math.round(onewaydistance) + " mi each way plus "+ parseFloat($('#extramiles').val()) + " additional)");
  } else {
    $("#walkingdistance").html("Distance: <strong>" +  tripdist + " miles</strong> (" + Math.round(onewaydistance) + " mi each way)");
  }
  $("#walkingtime").html("Est. time: <strong>" + timetext + "</strong>");
  $("#walkinglink").html("<a href='http://maps.google.com/maps?saddr="+encodeURIComponent(response.routes[0].legs[0].start_address)+"&daddr="+encodeURIComponent(response.routes[0].legs[response.routes[0].legs.length-1].end_address)+"&dirflg=w' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'></a>");
}

function calculateBikeTrip(response){
  var onewaydistance = 0;
  var onewaytime = 0;
  for (i = 0; i < response.routes[0].legs.length; i++) {
    //Convert to miles
    onewaydistance += (response.routes[0].legs[i].distance.value/ 1609.);
    onewaytime += response.routes[0].legs[i].duration.value;
  }
  //Convert to hours minutes
  timetext = formatTime(onewaytime*2/60);
  
  tripdist = Math.round(onewaydistance*2);
  
  if($('#extramiles').val()!=''){
    $("#bikingdistance").html("Distance: <strong>" +  (tripdist+parseFloat($('#extramiles').val())) + " miles</strong> (" + Math.round(onewaydistance) + " mi each way plus "+ parseFloat($('#extramiles').val()) + " additional)");
  } else {
    $("#bikingdistance").html("Distance: <strong>" +  tripdist + " miles</strong> (" + Math.round(onewaydistance) + " mi each way)");
  }
  $("#bikingtime").html("Est. time: <strong>" + timetext + "</strong>");
  $("#bikinglink").html("<a href='http://maps.google.com/maps?saddr="+encodeURIComponent(response.routes[0].legs[0].start_address)+"&daddr="+encodeURIComponent(response.routes[0].legs[response.routes[0].legs.length-1].end_address)+"&dirflg=b' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'></a>");
}


function calculateTransitTrip(start,end){
  //Use YQL to scrape google maps for screenreader to get transit directions
  
  //Clear existing directions
  $("#transit div").html('');
  
  //Get departure date and time
  var day;
  var d=dates.convert(""+$('#departuredate').val()+" "+$('#departuretime').val());
  if (d.getDate()<10) {
    day="0"+d.getDate();
  } else {
    day=d.getDate()
  }
  var date = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + day;
  var time = d.getHours() + ':' + d.getMinutes();
  
  //Get URL ready
  var BASE_URI = 'http://query.yahooapis.com/v1/public/yql?q=';  
  var yql = BASE_URI + encodeURIComponent('select * from html where url="http://maps.google.com/m/directions?dirflg=r&saddr='+start.replace(/&/g,"%26").replace(/ /g,'+')+'&daddr='+end.replace(/&/g,"%26").replace(/ /g,'+')+'&date='+date+'&time='+time+'" and xpath=\'//div[2]/div/p\'') + '&format=json';  

   // Request that YSQL string, and run a callback function.  
  $.getJSON( yql, cbfunc );  
  function cbfunc(data) {
    // If we have something to work with...  
    if(data.query.count > 0){
      //Maybe we scraped a result
      $("#transitroutes").html(data.query.results.p[0]);
      
      startTime = data.query.results.p[1].a.content.replace(/\s-\s.*$/g,'');
      endTime = data.query.results.p[1].a.content.replace(/^.*\s-\s/,'');
      
      var d = new Date();
      if((parseTime(d.getHours()+":"+d.getMinutes()) - parseTime(startTime))>0){
        waitingTime = (parseTime(d.getHours()+":"+d.getMinutes()) - parseTime(startTime))/(1000*60);
      } else {
        waitingTime = (parseTime(startTime) - (parseTime(d.getHours()+":"+d.getMinutes())))/(1000*60);
      }
      
      if((parseTime(endTime) - parseTime(startTime))>0){
        transitTime = (parseTime(endTime) - parseTime(startTime))/(1000*60)*2;
      } else {
        transitTime = 24*60 - (parseTime(startTime) - parseTime(endTime))/(1000*60)*2;
      }
      
      $("#transitwaittime").html("Waiting time: <strong>" + formatTime(waitingTime) + "</strong>");
      $("#transitdeparture").html("Departure Time: <strong>" + startTime + "</strong>");
      $("#transitarrival").html("Arrival Time: <strong>" + endTime + "</strong>");
      $("#transittime").html("Est. time: <strong>" + formatTime(transitTime) + "</strong>");
      if(typeof data.query.results.p[2] == 'string' && data.query.results.p[2].substr(0,1)=='$'){
        //Fare info is provided
        $("#transitfare").html("Roundtrip fare per person: <strong>" + formatCurrency(parseFloat(data.query.results.p[2].replace(/\$/g,''))*2) + "</strong>");
      }
      $("#transitlink").html("<a href='http://maps.google.com/maps" + data.query.results.p[1].a.href.substr(13) + "' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'></a>");
    } else{
      $("#transitroutes").html("No transit information available");
    }
  }
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
}

function initialSubmit(){
  //Move all variables to sidebar form
  $("#ccsplan").val($("#start_ccsplan").val());
  $("#zipcarplan").val($("#start_zipcarplan").val());
  $("#startlocation").val($("#start_startlocation").val());
  $("#departuretime").val($("#start_departuretime").val());
  $("#departuredate").val($("#start_departuredate").val());
  $("#destinationlocation").val($("#start_destinationlocation").val());
  $("#returntime").val($("#start_returntime").val());
  $("#returndate").val($("#start_returndate").val());
  $("#extramiles").val($("#start_extramiles").val());
  $("#zipcarrate").val($("#start_zipcarrate").val());
  $("#passengers").val($("#start_passengers").val());
  
  $("#start_form").fadeOut();
  $("#wrapper").fadeIn();
  
  // Launch Map
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

  //Bind recalc function to 'directions_changed' event
  google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
    calculateTrip(directionsDisplay.directions);

    //Highlight results box on change
    $('#resultsWrapper').effect("highlight", {color:"#d1d1d1"}, 3000);

    //Put new addresses in input box
    $('#startlocation').val(directionsDisplay.directions.routes[0].legs[0].start_address.replace(/, CA \d+, USA/g, "").replace(/, USA/g, ""));
    $('#destinationlocation').val(directionsDisplay.directions.routes[0].legs[0].end_address.replace(/, CA \d+, USA/g, "").replace(/, USA/g, ""));
  });
  
   // Retrieve the start and end locations and create
   // a DirectionsRequest using DRIVING directions.
   var start = $('#start_startlocation').val();
   var end = $('#start_destinationlocation').val();
   var request = {
       origin: start,
       destination: end,
       travelMode: google.maps.DirectionsTravelMode.DRIVING
   };
   
   //Clear old warnings and trip
   $('#warnings_panel').html('');
   $('#results').hide();
   
   if(computeTotalTime()){
   
     directionsService.route(request, function(response, status) {
       if (status == google.maps.DirectionsStatus.OK) {
         if(response.routes[0].warnings!=''){
           $('#warnings_panel').append("<li>" + response.routes[0].warnings + "</li>");
         }
         directionsDisplay.setDirections(response);
       }
     });
   }
   //Resize window after geolocation section loads
   resizeWindow();
   
   $("#resultsWrapper").fadeIn();
}

function getStartGeoLocator(position) {
  var geocoder = new google.maps.Geocoder();
  if (geocoder) {
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    geocoder.geocode({ 'latLng': latlng }, function (response, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (response[0]) {
          $('#startlocation').val(response[0].formatted_address);
          $('#startlocation').effect("highlight", {color:"red"}, 3000);
          $('#start_startlocation').val(response[0].formatted_address);
          $('#start_startlocation').effect("highlight", {color:"red"}, 3000);
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
  var resultsWrapperHeight = 2 +parseInt($("#resultsWrapper").height()) +parseInt($("#resultsWrapper").css("margin-top")) +parseInt($("#resultsWrapper").css("margin-bottom") +parseInt($("#resultsWrapper").css("padding-top")) +parseInt($("#resultsWrapper").css("padding-bottom")) +parseInt($("#resultsWrapper").css("border-top-width")) +parseInt($("#resultsWrapper").css("border-bottom-width")));
  $("#map_canvas").css("min-height", (parseInt($("#sidebar").css("height"))+50));
  $("#map_canvas").css("height", (parseInt($("#sidebar").css("height"))+50));
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
  
  $("#start_departuredate").datepicker({
    onSelect: function(dateText, inst){
      //Make return date at least departure date
      if(dates.compare($("#start_returndate").val(),dateText)<0){
        $("#start_returndate").val(dateText);
      }
    }
  });
  $("#start_returndate").datepicker();

  //Set Todays Date and Time
  var currentTime = new Date()
  var minutes = currentTime.getMinutes();
  var hours = currentTime.getHours();
  var month = currentTime.getMonth() + 1;
  var day = currentTime.getDate();
  var year = currentTime.getFullYear();
  
  $("#start_departuredate").val(month + "/" + day + "/" + year);
  $("#start_returndate").val(month + "/" + day + "/" + year);
  
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
    $('#start_departuretime').val("0" + hours + ":" + minutes);
  } else {
    $('#start_departuretime').val(hours + ":" + minutes);
  }

  if(hours+1>23){
    //use tomorrow
    $('#start_returntime').val("0" + (hours+1-24) + ":" + minutes);
    $("#start_returndate").val(month + "/" + (day+1) + "/" + year);
  } else{
    if (hours+1 < 10){
      $('#start_returntime').val("0" + (hours+1) + ":" + minutes);
    }else{
      $('#start_returntime').val((hours+1) + ":" + minutes);
    }
  }
  
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
     
       directionsService.route(request, function(response, status) {
         if (status == google.maps.DirectionsStatus.OK) {
           if(response.routes[0].warnings!=''){
             $('#warnings_panel').append("<li>" + response.routes[0].warnings + "</li>");
           }
           directionsDisplay.setDirections(response);
         }
       });
     }
     
     $("#resultsWrapper").fadeIn();    
     return false;
  });
  
  $("#start_submit").click(function(){
    //Initial form submit
    if($("#start_startlocation").val() == ''){
      $("#start_startlocation").css('border','2px solid red');
    }
    if($("#start_destinationlocation").val() == ''){
      $("#start_destinationlocation").css('border','2px solid red');
    }
    if($("#start_startlocation").val()!='' && $("#start_destinationlocation").val()!=''){
      initialSubmit();
    }
  });

  //Enable Tooltips
  enableTooltips();

  //Show geolocation if browser supports it
  if (navigator.geolocation) {  
   $("#slocation").show();
   $("#start_slocation").show();
  }
 
});

