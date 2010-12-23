var map;
var directionDisplay;
var directionsService;
var markerArray = [];
var popup;
var closestCCSMarker = {};
var trip = {};
var zipcar = {};
var tripweekendccstime = 0;
var tripweekendccs2time = 0;
var triplatenighttime = 0;
var ccscost = 0;
var ccsplan;
var taxicost = 0;
var ubercost = 0;
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
    "weekdayhourly":10,
    "weekendhourly":10,
    "mileagehourly":0,
    "latenighthourly":10,
    "weekdaydaily":81,
    "weekenddaily":86,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":0
  },
  "evp50": {
    "title":"EVP $50",
    "weekdayhourly":9,
    "weekendhourly":9,
    "mileagehourly":0,
    "latenighthourly":9,
    "weekdaydaily":72,
    "weekenddaily":76,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":10
  },
  "evp75": {
    "title":"EVP $75",
    "weekdayhourly":9,
    "weekendhourly":9,
    "mileagehourly":0,
    "latenighthourly":9,
    "weekdaydaily":72,
    "weekenddaily":76,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":10
  },
  "evp125": {
    "title":"EVP $125",
    "weekdayhourly":9,
    "weekendhourly":9,
    "mileagehourly":0,
    "latenighthourly":9,
    "weekdaydaily":72,
    "weekenddaily":76,
    "mileagedaily":0,
    "dailymileagecap":180,
    "mileageoverage":0.45,
    "percentdiscount":10
  },
  "evp250": {
    "title":"EVP $250",
    "weekdayhourly":8.5,
    "weekendhourly":8.5,
    "mileagehourly":0,
    "latenighthourly":5.95,
    "weekdaydaily":68,
    "weekenddaily":73,
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

function clearOverlays() {
  if (markerArray) {
    for (i in markerArray) {
      markerArray[i].setMap(null);
    }
  }
}

function addCarshareLocations(map, lat, lon, type){
  //Add carshare locations to map
  
  //Radius to show carshare locations (in miles)
  var radius = 1;
  
  //Create 1 mile bounding box
  var NBound = lat+0.02;
  var SBound = lat-0.02; 
  var EBound = lon+0.02;
  var WBound = lon-0.02;
  
  //Set closestCCSMarker
  closestCCSMarker.distance = 0;
  zipcar.closestMarker = {};
  
  if(type=='ccs'){
    var image = new google.maps.MarkerImage(
      'images/ccs.png',
      new google.maps.Size(24, 24),
      new google.maps.Point(0,0),
      new google.maps.Point(12, 12));
    for (pod in ccs_arr) {
      distanceAway = calculateDistance(ccs_arr[pod].lat,ccs_arr[pod].lon,lat,lon);
      //Check to see if this marker is the closest
      if(closestCCSMarker.distance==0 || distanceAway<closestCCSMarker.distance){
        ccs_arr[pod].distance = distanceAway;
        closestCCSMarker = ccs_arr[pod];
      }
      //check to see if within bounding box
      if(ccs_arr[pod].lat>SBound && ccs_arr[pod].lat<NBound && ccs_arr[pod].lon>WBound && ccs_arr[pod].lon<EBound){
        //Check to see if within radius to choose which to display
        if(distanceAway<=radius){
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
    //List closest CCS location in results
    if(closestCCSMarker.distance<.2){
      //Within 1000 feet, display feet
      closestCCSMarker.distanceformatted = Math.round(closestCCSMarker.distance*5280) + " ft";
    } else{
      //Use miles
      closestCCSMarker.distanceformatted = Math.round(closestCCSMarker.distance*10)/10 + " mi";
    }
    $('#ccsclosest').html("Nearest car: <strong>" + closestCCSMarker.distanceformatted + "</strong> (" + closestCCSMarker.name + ")");

  } else if(type == 'zipcar'){
    var image = new google.maps.MarkerImage(
      'images/zipcar.png',
      new google.maps.Size(24, 24),
      new google.maps.Point(0,0),
      new google.maps.Point(12, 12));
  
    for (pod in zipcar_arr) {
      distanceAway = calculateDistance(zipcar_arr[pod][2],zipcar_arr[pod][3],lat,lon);
      //Check to see if this marker is the closest
      if(typeof zipcar.closestMarker.distance == "undefined" || distanceAway<zipcar.closestMarker.distance){
        zipcar.closestMarker.name = zipcar_arr[pod][1];
        zipcar.closestMarker.lat = zipcar_arr[pod][2];
        zipcar.closestMarker.lng = zipcar_arr[pod][3];
        zipcar.closestMarker.distance = distanceAway;
      }
      //check to see if within bounding box
      if(zipcar_arr[pod][2]>SBound && zipcar_arr[pod][2]<NBound && zipcar_arr[pod][3]>WBound && zipcar_arr[pod][3]<EBound){
        //Check to see if within radius to choose which to display
        if(distanceAway<=radius){
            var marker = new google.maps.Marker({
            position: new google.maps.LatLng(zipcar_arr[pod][2],zipcar_arr[pod][3]),
            title: decodeURIComponent(zipcar_arr[pod][1]).replace(/\+/g,' '),
            map:map,
            icon: image,
            zIndex:1
          });
      
          //Add to marker array
          markerArray.push(marker);

          google.maps.event.addListener(marker,'click', (function(marker,pod) {
            return function() {
              popup.setContent(
                "<ul class=\"pod\">" + "<li id=\"podName\">" + decodeURIComponent(zipcar_arr[pod][1]).replace(/\+/g,' ') + "</li>" + "</ul>"
              );
              popup.open(map,marker);
            }
          }) (marker,pod));
        }
      }
    }
  }
  //List closest Zipcar location in results
  if(zipcar.closestMarker.distance<.2){
    //Within 1000 feet, display feet
    zipcar.closestMarker.distanceformatted = Math.round(zipcar.closestMarker.distance*5280) + " ft";
  } else{
    //Use miles
    zipcar.closestMarker.distanceformatted = Math.round(zipcar.closestMarker.distance*10)/10 + " mi";
  }
  if(typeof zipcar.closestMarker.name !== "undefined"){
    $('#zipcarclosest').html("Nearest car: <strong>" + zipcar.closestMarker.distanceformatted + "</strong> (" + decodeURIComponent(zipcar.closestMarker.name.replace(/\+/g,' ')) + ")");
  }
}

function calculateTrip(response) {
  //clear markers
  clearOverlays()
  
  //Get settings
  ccsplan = ccsplans[$('#ccsplan').val()];
  
  
  //Create popup window
  popup = new google.maps.InfoWindow({maxWidth:200});

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
  
  //Get basic trip stats
  trip = {};
  trip.departuredate=dates.convert(""+$('#departuredate').val()+" "+$('#departuretime').val());
  trip.returndate=dates.convert(""+$('#returndate').val()+" "+$('#returntime').val());
  trip.time = (trip.returndate-trip.departuredate)/(1000*60)
  trip.distance = Math.round(onewaydistance*2);
  trip.onewaydistance = Math.round(onewaydistance);
  trip.extramiles = $('#extramiles').val();
  trip.passengers = $('#passengers').val();
  
  //Allow City Carshare and Uber if within 15 miles of San Francisco
  //San Francisco Area lat lon
  var sf = {
    lat:37.8,
    lng:-122.33
  };
  if(calculateDistance(sf.lat,sf.lng,response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng())<15){
    //Add CCS as a mode, add locations
    estimateCCSHourCost();
    
    addCarshareLocations(map, response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng(), 'ccs');
    
    //Add Uber as a mode
    estimateUberCost();
    
    //Show these modes results
    $('#ccsresult').show();
    $('#uberresult').show();
  } else{
    //If not in SF, hide SF modes
    $('#ccsresult').hide();
    $('#uberresult').hide();
  }
  
  //Estimate costs
  estimateZipcarCost();
  estimateTaxiCost();
  
  //Add zipcar locations
  addCarshareLocations(map, response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng(), 'zipcar');
  
  if(trip.extramiles!=''){
    $("#drivingdistance").html("Distance: <strong>" +  (trip.distance+parseFloat(trip.extramiles)) + " miles</strong> (" + Math.round(onewaydistance) + " mi each way plus "+ parseFloat(trip.extramiles) + " additional)");
  } else {
    $("#drivingdistance").html("Distance: <strong>" +  trip.distance + " miles</strong> (" + trip.onewaydistance + " mi each way)");
  }
  $("#drivingtime").html("Est. time: <strong>" + timetext + "</strong>");
  $("#drivinglink").html("<a href='http://maps.google.com/maps?saddr="+encodeURIComponent(response.routes[0].legs[0].start_address)+"&daddr="+encodeURIComponent(response.routes[0].legs[response.routes[0].legs.length-1].end_address)+"&dirflg=d' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'></a>");
  
  //Check if estimated driving time exceeds trip time
  if(trip.time<(onewaytime*2/60)){
    $('#warnings_panel').append("<li>Your estimated driving time exceeds your reservation time.</li>");
  }
  
  //Calculate Waypoints to add to walking, biking routes.
  var waypoints = new Array;
  for(var i=0;i<response.routes[0].legs[0].via_waypoint.length;i++){
    waypoints[i] = {"location":  response.routes[0].legs[0].via_waypoint[i].location, "stopover":false}
  }
  
  //Do Walking Directions
  // Instantiate a directions service for walking.
  DirectionsService = new google.maps.DirectionsService();
  
  var request = {
    origin: response.routes[0].legs[0].start_address,
    destination: response.routes[0].legs[leg_count-1].end_address,
    waypoints: waypoints,
    travelMode: google.maps.DirectionsTravelMode.WALKING
  };
  DirectionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      calculateWalkTrip(response);
    }
  });
   
  //Do Biking Directions
  var request = {
    origin: response.routes[0].legs[0].start_address,
    destination: response.routes[0].legs[leg_count-1].end_address,
    waypoints: waypoints,
    travelMode: google.maps.DirectionsTravelMode.BICYCLING
  };
  DirectionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      calculateBikeTrip(response);
    }
  });
    
  //Do Transit Directions 
  //Use lat lon coordinates to avoid issues with start/end names - need space between coordinates
  calculateTransitTrip(response.routes[0].legs[0].start_location.lat()+", "+response.routes[0].legs[0].start_location.lng(),
  response.routes[0].legs[leg_count-1].end_location.lat()+", "+response.routes[0].legs[leg_count-1].end_location.lng());

  //We've got everything we need, show results
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
  
  if(trip.extramiles!=''){
    $("#walkingdistance").html("Distance: <strong>" +  (tripdist+parseFloat(trip.extramiles)) + " miles</strong> (" + Math.round(onewaydistance) + " mi each way plus "+ parseFloat(trip.extramiles) + " additional)");
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
  
  if(trip.extramiles!=''){
    $("#bikingdistance").html("Distance: <strong>" +  (tripdist+parseFloat(trip.extramiles)) + " miles</strong> (" + Math.round(onewaydistance) + " mi each way plus "+ parseFloat(trip.extramiles) + " additional)");
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
        $("#transitsinglefare").html("Roundtrip fare per person: <strong>" + formatCurrency(parseFloat(data.query.results.p[2].replace(/\$/g,''))*2) + "</strong>");
        $("#transitfare").html("Roundtrip fare for "+passengers+": <strong>" + formatCurrency(parseFloat(data.query.results.p[2].replace(/\$/g,''))*2*passengers) + "</strong>");
      }
      $("#transitlink").html("<a href='http://maps.google.com/maps" + data.query.results.p[1].a.href.substr(13) + "' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'></a>");
    } else{
      $("#transitroutes").html("No transit information available");
    }
  }
}

function estimateCCSHourCost(){
  ccscost = 0;
  
  
  
  triplatenighttime = 0;
  tripweekendccstime = 0;
  tripweekendccs2time = 0;
  
  //Calculate number of minutes from midnight Monday
  //Shift getDay function by one day
  if(trip.departuredate.getDay()==0){
    startday = 6;
  } else {
    startday = trip.departuredate.getDay()-1;
  }
  departurecode = startday*(24*60) + trip.departuredate.getHours()*60 + trip.departuredate.getMinutes();
  
  if(trip.returndate.getDay()==0){
    endday = 6;
  } else {
    endday = trip.returndate.getDay()-1;
  }
  returncode = endday*(24*60) + trip.returndate.getHours()*60 + trip.returndate.getMinutes();
  
  if(returncode<departurecode){
    //trip spans a weekend, add  7 days to returncode
    returncode += 7*24*60;
  }
  
  //Calculate CCS Times
  //Assume no reservtions over 7 days length
  
  //Calculate latenight time
  departuremidnight = new Date(trip.departuredate.getFullYear(),trip.departuredate.getMonth(),trip.departuredate.getDate());
  returnmidnight = new Date(trip.returndate.getFullYear(),trip.returndate.getMonth(),trip.returndate.getDate());
    if(trip.departuredate.getHours()<8){
    //departure time before 8 AM
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day
      if(trip.returndate.getHours()<8){
        //depart and return before 8 AM
        triplatenighttime += (trip.returndate-trip.departuredate)/(1000*60);
      }
      else {
        //Return after 8 AM
        triplatenighttime += (8*60)-((trip.departuredate-departuremidnight)/(1000*60));
      }
    } else {
      //Return is next day
      triplatenighttime += (8*60)-((trip.departuredate-departuremidnight)/(1000*60));
      triplatenighttime += (trip.returndate-returnmidnight)/(1000*60);
    }
  } else {
    //Departure is after 8 AM
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day, no late night
    } else {
      //Return is next day
      if(trip.returndate.getHours()<8){
        //depart and return before 8 AM
        triplatenighttime += (trip.returndate-returnmidnight)/(1000*60);
      }
      else {
        //Return after 8 AM
        triplatenighttime += (8*60);
      }
    }
  }
  
  //Weekend calculation for CCS with weeknights
  if(trip.departuredate.getDay()==5){
    //departure day is friday
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day
      if(trip.departuredate.getHours()<17){
        //depart before 5 PM
        if(trip.returndate.getHours()>=17){
          //return after 5 PM
          tripweekendccstime += ((trip.returndate-returnmidnight)/(1000*60))-(17*60);
        }
      } else {
        //Depart after 5 PM
        tripweekendccstime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<17){
        //depart before 5 PM
        tripweekendccstime += (7*60);
      } else {
        //depart after 5 PM
        tripweekendccstime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
      }
      if(trip.returndate.getHours()>=8){
        tripweekendccstime += ((trip.returndate-returnmidnight)/(1000*60))-(8*60);
      }
    }
  } else if(trip.departuredate.getDay()==6){
    //departure day is Saturday
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM
        if(trip.returndate.getHours()>=8){
          //return after 8 AM
          tripweekendccstime += ((trip.returndate-trip.departuredate)/(1000*60)) - ((8*60)-((trip.departuredate-departuremidnight)/(1000*60)));
        }
      } else {
        //Depart after 8 AM
        tripweekendccstime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM, return must be before 8 AM
        tripweekendccstime += (16*60);
      } else{
        //departure after 8 AM
        if(trip.returndate.getHours()<8){
          //return before 8 AM
          tripweekendccstime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
        } else {
          //return after 8 AM
          tripweekendccstime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
          tripweekendccstime += ((trip.returndate-returnmidnight)/(1000*60))-(8*60);
        }
      }
    }
  } else if(trip.departuredate.getDay()==0){
    //departure day is Sunday
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM
        if(trip.returndate.getHours()>=8){
          //return after 8 AM
          tripweekendccstime += ((trip.returndate-trip.departuredate)/(1000*60)) - ((8*60)-((trip.departuredate-departuremidnight)/(1000*60)));
        }
      } else {
        //Depart after 8 AM
        tripweekendccstime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM, return must be before 8 AM
        tripweekendccstime += (16*60);
      } else{
        //departure after 8 AM
        tripweekendccstime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
      }
    }
  }
  
  //Weekend calculation CCS with no weeknights
  if(trip.departuredate.getDay()==5){
    //departure day is friday
   if(trip.departuredate.getHours()<17){
      //depart before 5 PM
      if(trip.returndate.getHours()>=17 || trip.returndate.getDate()!=trip.departuredate.getDate()){
        //return after 5 PM
        tripweekendccs2time += (trip.returndate-trip.departuredate)/(1000*60) - ((17*60)-((trip.departuredate-departuremidnight)/(1000*60)));
      }
    } else {
      //depart after 5 PM
      tripweekendccs2time += (trip.returndate-trip.departuredate)/(1000*60);
    }
  } else if(trip.departuredate.getDay()==6){
    //departure day is Saturday
    tripweekendccs2time += (trip.returndate-trip.departuredate)/(1000*60);
  } else if(trip.departuredate.getDay()==0){
    //departure day is Sunday
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day
      tripweekendccs2time += (trip.returndate-trip.departuredate)/(1000*60);
    } else {
      //Return is next day
      if(trip.returndate.getHours()<8){
        //return before 8 AM
        tripweekendccs2time += (trip.returndate-trip.departuredate)/(1000*60);
      } else{
        //return after 8 AM
        tripweekendccs2time += (trip.returndate-trip.departuredate)/(1000*60) - ((trip.returndate-returnmidnight)/(1000*60)-(8*60));
      }
    }
  }
  
  
  

  $('#ccssummary').html("");
  if($('#ccsplan').val()=='sharealittle'){
    //Share a little doesn't havce late night hours so use CCS2 time
    ccscost+= ccsplan.weekdayhourly*((trip.time-tripweekendccs2time)/60)+ccsplan.weekendhourly*(tripweekendccs2time/60);
    if((trip.time-tripweekendccs2time)>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(trip.time-tripweekendccs2time) + " x " + formatCurrency(ccsplan.weekdayhourly) + "/hr wkday<div>" +  formatCurrency(ccsplan.weekdayhourly*((trip.time-tripweekendccs2time)/60)) + "</div></li>");
    }
    if(tripweekendccs2time>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(tripweekendccs2time) + " x " + formatCurrency(ccsplan.weekendhourly) + "/hr wkend<div>" + formatCurrency(ccsplan.weekendhourly*(tripweekendccs2time/60)) + "</div></li>");
    }
  } else {
    //Other plans have late night hours, so use CCS time
     ccscost+= ccsplan.weekdayhourly*((trip.time-tripweekendccstime-triplatenighttime)/60)+ccsplan.weekendhourly*(tripweekendccstime/60)+ccsplan.latenighthourly*(triplatenighttime/60);
    if((trip.time-tripweekendccstime-triplatenighttime)>0){
     $('#ccssummary').append("<li>" + formatTimeDecimal(trip.time-tripweekendccstime-triplatenighttime) + " x " + formatCurrency(ccsplan.weekdayhourly) + "/hr wkday<div>" + formatCurrency(ccsplan.weekdayhourly*((trip.time-tripweekendccstime-triplatenighttime)/60)) + "</div></li>");
    }
    if(tripweekendccstime>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(tripweekendccstime) + " x " + formatCurrency(ccsplan.weekendhourly) + "/hr wkend<div>" + formatCurrency(ccsplan.weekendhourly*(tripweekendccstime/60)) + "</div></li>");
    }
    if(triplatenighttime>0){
      $('#ccssummary').append("<li>" + formatTimeDecimal(triplatenighttime) + " x " + formatCurrency(ccsplan.latenighthourly) + "/hr latenight<div>" + formatCurrency(ccsplan.latenighthourly*(triplatenighttime/60)) + "</div></li>");
    }
  }
  //Add in Mileage
  if(trip.extramiles!=''){
    ccscost+= (trip.distance+parseFloat(trip.extramiles))*ccsplan.mileagehourly;
    $('#ccssummary').append("<li>" + (trip.distance+parseFloat(trip.extramiles)) + " mi x " + formatCurrency(ccsplan.mileagehourly) + " per mi<div>" + formatCurrency((trip.distance+parseFloat(trip.extramiles))*ccsplan.mileagehourly) + "</div></li>");
  } else {
    ccscost+= trip.distance*ccsplan.mileagehourly;
    $('#ccssummary').append("<li>" + trip.distance + " mi x " + formatCurrency(ccsplan.mileagehourly) + " per mi<div>" + formatCurrency(trip.distance*ccsplan.mileagehourly) + "</div></li>");
  }
  
  $('#ccstotal').html(formatCurrency(ccscost));
  $('#ccssummary').append("<li class='total'>City Carshare Total<div>" + formatCurrency(ccscost) + "</div></li>");
}

function estimateZipcarCost(){
  zipcar = {}
  zipcar.plan = zipcarplans[$('#zipcarplan').val()];
  zipcar.rates={};
  zipcar.rates.customHourly = $('#zipcarrate').val();
  zipcar.rates.customDaily = $('#zipcardailyrate').val();
  zipcar.time = trip.time;
  
  //Calculate number of minutes from midnight Monday
  //Shift getDay function by one day
  if(trip.departuredate.getDay()==0){
    startday = 6;
  } else {
    startday = trip.departuredate.getDay()-1;
  }
  departurecode = startday*(24*60) + trip.departuredate.getHours()*60 + trip.departuredate.getMinutes();
  
  if(trip.returndate.getDay()==0){
    endday = 6;
  } else {
    endday = trip.returndate.getDay()-1;
  }
  returncode = endday*(24*60) + trip.returndate.getHours()*60 + trip.returndate.getMinutes();
  
  if(returncode<departurecode){
    //trip spans a weekend, add  7 days to returncode
    returncode += 7*24*60;
  }
  
  //Weekend calculation Zipcar
  //Assume no reservtions over 7 days length
  
  if(departurecode<=(5*24*60) && returncode<=(5*24*60)){
    //trip entirely weekday
    zipcar.weekendtime = 0;
  } else if(departurecode<=(5*24*60) && returncode>=(7*24*60)){
    //trip spans entire weekend
    zipcar.weekendtime = (2*24*60);
  } else if(departurecode<=(5*24*60) && returncode<=(7*24*60)){
    //trip starts on weekday, ends on weekend
    zipcar.weekendtime = returncode - (5*24*60);
  } else if(departurecode>(5*24*60) && returncode<=(7*24*60)){
    //trip entirely weekend
    zipcar.weekendtime = returncode - departurecode;
  } else if(departurecode>(5*24*60) && returncode>(7*24*60)){
    //trip starts on weekend, ends of weekday
    zipcar.weekendtime = (7*24*60) - departurecode;
  }
  
  //Do cost estimations
  estimateZipcarDayCost(trip.time);
  
  $('#zipcarsummary').html("");
  if(zipcar.days>0){
    //Daily Rate
    $('#zipcarsummary').append("<li>" + zipcar.days + " day x " + formatCurrency(parseFloat(zipcar.rates.daily)) + "/day<div>" + formatCurrency(parseFloat(zipcar.rates.daily)*(zipcar.days)) + "</div></li>");
  }
  if(zipcar.hours.time>0){
    //Hourly Rate
    $('#zipcarsummary').append("<li>" + formatTimeDecimal(zipcar.hours.time) + " x " + formatCurrency(parseFloat(zipcar.hours.rate)) + "/hr<div>" + formatCurrency(parseFloat(zipcar.hours.rate)*(zipcar.hours.time/60)) + "</div></li>");
  }

  $('#zipcarsummary').append("<li class='total'>Zipcar Total<div>" + formatCurrency(zipcar.cost) + "</div></li>");
  $('#zipcartotal').html(formatCurrency(zipcar.cost));
}

function estimateZipcarHourCost(triptime){  
  zipcarhour = {};
  zipcarhour.cost = 0;
  zipcarhour.time = triptime;
  
  if(isNaN(zipcar.rates.customHourly) || zipcar.rates.customHourly==''){
    //Use default zipcar hourly rates
    zipcarhour.rate = zipcar.plan.weekdayhourly;
  } else{
    //Use custom zipcar hourly rate entered by user
    zipcarhour.rate = zipcar.rates.customHourly;
  }
  
  zipcarhour.cost += zipcarhour.rate * ((triptime - zipcar.weekendtime)/60) + zipcarhour.rate * (zipcar.weekendtime/60);
  
  return zipcarhour;
}

function estimateZipcarDayCost(triptime){  
  zipcar.cost = 0;
  
  if(isNaN(zipcar.rates.customDaily) || zipcar.rates.customDaily==''){
    //Use default zipcar daily rates of $73/weekday and $78/weekend
    if(zipcar.weekendtime>0){
      //Trip touches a weekend, so use daily avg rates for weekend
      zipcar.rates.daily = zipcar.plan.weekenddaily;
    } else {
      //Use daily avg rates for weekday
      zipcar.rates.daily = zipcar.plan.weekdaydaily;
    }
  } else {
    //Use custom zipcar daily rate entered by user
    zipcar.rates.daily = zipcar.rates.customDaily;
  }
  
  //First try a rate that is a number of days that exceeds the reservation time
  zipcar.ceiling = {}
  zipcar.ceiling.days = Math.ceil(triptime / (24*60));
  zipcar.ceiling.hours = 0;
  zipcar.ceiling.cost = zipcar.ceiling.days * parseFloat(zipcar.rates.daily);
  
  //Now try a rate that is a number of days with a few trailing hours
  zipcar.floor = {}
  zipcar.floor.days = Math.floor(triptime / (24*60));
  zipcar.floor.hours = estimateZipcarHourCost(triptime % (24*60));
  zipcar.floor.cost = zipcar.floor.days * parseFloat(zipcar.rates.daily) + zipcar.floor.hours.cost;
  
  //See which day option is least expensive
  if(zipcar.floor.cost<zipcar.ceiling.cost){
    //Zipcar floor cost is cheapest
    zipcar.cheapest = "floor";
    zipcar.cost = zipcar.floor.cost;
    zipcar.days = zipcar.floor.days;
    zipcar.hours = zipcar.floor.hours;
  } else {
    //Zipcar ceiling cost is cheapest or equal
    zipcar.cheapest = "ceiling";
    zipcar.cost = zipcar.ceiling.cost;
    zipcar.days = zipcar.ceiling.days;
    zipcar.hours = 0;
  }
  
  return zipcar;
}

function estimateTaxiCost(){ 
  taxicost = 0;
  
  //Taxi (assume 1.5 minute of waiting per mile)
  var taxitrafficpermile = 1.5;
  
  $('#taxisummary').html("");
  taxicost+= cabfares.firstfifth*2 + (cabfares.additionalfifth*((trip.distance-0.2)*5)) + cabfares.waitingminute*(trip.distance*taxitrafficpermile);
  //add tip
  var tipamount = taxicost*(cabfares.tippercent/100);
  taxicost = taxicost*(1+(cabfares.tippercent/100));

  $('#taxitotal').html(formatCurrency(taxicost));
  $('#taxisummary').append("<li>Flag Drop x 2<div>"+formatCurrency(cabfares.firstfifth*2)+"</div></li>");
  $('#taxisummary').append("<li>"+trip.distance+" mi x $2.25 per mi<div>"+formatCurrency((cabfares.additionalfifth*((trip.distance-0.2)*5)))+"</div></li>");
  $('#taxisummary').append("<li>Waiting in Traffic (~"+(trip.distance*taxitrafficpermile)+" min)<div>"+formatCurrency(cabfares.waitingminute*(trip.distance*taxitrafficpermile))+"</div></li>");
  $('#taxisummary').append("<li>10% Tip<div>"+formatCurrency(tipamount)+"</div></li>");
  $('#taxisummary').append("<li class='total'>Taxi Total<div>"+formatCurrency(taxicost)+"</div></li>");
}  

function estimateUberCost(){ 
  ubercost = 0;
  
  //Uber (assume 1.5 minute of waiting per mile)
  var ubertrafficpermile = 1.5;
  $('#ubersummary').html("");
  ubercost+= uberfares.flag*2 + (uberfares.mileage*trip.distance) + uberfares.idleminute*(trip.distance*ubertrafficpermile);
  if(ubercost<30){
    //Minimum fare is $15 each way
    ubercost = 30;
    $('#ubersummary').append("<li>Minimum Fare $15 x 2<div>$30.00</div></li>");
    $('#ubersummary').append("<li class='total'>Uber Total<div>$30.00</div></li>");
  } else {
    $('#ubersummary').append("<li>Flag Drop x 2<div>"+formatCurrency(uberfares.flag*2)+"</div></li>");
    $('#ubersummary').append("<li>"+trip.distance+" mi x " + formatCurrency(uberfares.mileage) + " per mi<div>"+formatCurrency(uberfares.mileage*trip.distance)+"</div></li>");
    $('#ubersummary').append("<li>Waiting in Traffic (~"+(trip.distance*ubertrafficpermile)+" min)<div>"+formatCurrency(uberfares.idleminute*(trip.distance*ubertrafficpermile))+"</div></li>");
    $('#ubersummary').append("<li class='total'>Uber Total<div>"+formatCurrency(ubercost)+"</div></li>");
  }
  $('#ubertotal').html(formatCurrency(ubercost));
}

function recalc(){
  //Called after mapSetup to recalculate trip
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
  
  var departuredate=dates.convert(""+$('#departuredate').val()+" "+$('#departuretime').val());
  var returndate=dates.convert(""+$('#returndate').val()+" "+$('#returntime').val());
  
  //Check if return date is after todays date
  if(dates.compare(returndate,departuredate)<0){
    $('#warnings_panel').append("<li>Your departure date is before your return date.</li>");
    return false;
  } else {
  
    //Check if after todays date
    today = new Date();
    if(dates.compare(departuredate,(today.getMonth()+1)+"/"+today.getDate()+"/"+today.getFullYear())<0){
      $('#warnings_panel').append("<li>Your departure date has already passed.</li>");
      //Keep going as this is a valid trip, its just in the past
    }
  
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        if(response.routes[0].warnings!=''){
          $('#warnings_panel').append("<li>" + response.routes[0].warnings + "</li>");
        }
        directionsDisplay.setDirections(response);
      }
    });
  }
  
  //Create Permalink URL
	linkURL = "?saddr=" + $('#startlocation').val().replace(/&/g, "and").replace(/ /g, "+") + "&daddr=" + $('#destinationlocation').val().replace(/&/g, "and").replace(/ /g, "+") + "&stime=" + $("#departuretime").val() + "&sdate="  + $("#departuredate").val() + "&etime=" + $("#returntime").val() + "&edate="  + $("#returndate").val() + "&ccsplan=" + $("#ccsplan").val() + "&zipcarplan=" + $("#zipcarplan").val() + "&extramiles=" + $("#extramiles").val() + "&zipcarrate=" + $("#zipcarrate").val() + "&zipcardailyrate=" + $("#zipcardailyrate").val() + "&passengers=" + $("#passengers").val();
	
  //Add Permalink Control on top of map
	$("#permalink").html("<a href='" + linkURL + "' title='Direct Link to this trip'><img src='images/link.png'> Permalink to Route</a>");
	
	//Add Twitter Control on top of map
	$("#twitter a").attr("href","http://www.addtoany.com/add_to/twitter?linkurl=" + encodeURIComponent("http://modepick.com"+linkURL) + "&linkname=" + encodeURIComponent("The best way from " + $('#startlocation').val().replace(/\+/g, " ").replace(/&/g, "and") + " to " + $('#destinationlocation').val().replace(/\+/g, " ").replace(/&/g, "and")));
  
  //Show Results
  $("#resultsWrapper").fadeIn();
}

function mapSetup(){
  //Fade out start form and fade in results
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

  //Process trip
  recalc();
}

function getStartGeoLocator(position) {
  var geocoder = new google.maps.Geocoder();
  if (geocoder) {
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    geocoder.geocode({ 'latLng': latlng }, function (response, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (response[0]) {
          //Hide waiting image
          $("#geolocationwaiting").hide();
          $('#startlocation').val(response[0].formatted_address);
          $('#startlocation').effect("highlight", {color:"#bb5555"}, 3000);
          $('#start_startlocation').val(response[0].formatted_address);
          $('#start_startlocation').effect("highlight", {color:"#bb5555"}, 3000);
        }
      } else {
        console.log('No results found: ' + status);
        $('#warnings_panel').append("<li>No results found: " + status + ".</li>");
      }
    });
  }
}

function showGeoLocatorError(error){
  //Hide waiting image
  $("#geolocationwaiting").hide();
  if(error.code==1){
     $('#warnings_panel').append("<li>To determine your current location you must click \"Share Location\" in the top bar in your browser.</li>");
    alert();
  } else if (error.code==2 || error.code==3 || error.code==0){
     $('#warnings_panel').append("<li>Your current location couldn't be determined.  Please enter the start and end locations manually.</li>");
  }
}

function resizeWindow(e) {
  var newWindowHeight = $(window).height();
  var resultsWrapperHeight = 2 +parseInt($("#resultsWrapper").height()) +parseInt($("#resultsWrapper").css("margin-top")) +parseInt($("#resultsWrapper").css("margin-bottom") +parseInt($("#resultsWrapper").css("padding-top")) +parseInt($("#resultsWrapper").css("padding-bottom")) +parseInt($("#resultsWrapper").css("border-top-width")) +parseInt($("#resultsWrapper").css("border-bottom-width")));
  $("#map_canvas").css("min-height", (parseInt($("#sidebar").css("height"))+50));
  $("#map_canvas").css("height", (parseInt($("#sidebar").css("height"))+50));
}
    
google.setOnLoadCallback(function(){
  //If the User resizes the window, adjust the height
  $(window).bind("resize", resizeWindow);

  //Read the page's GET URL variables and process trip
  //Sample URL: ?saddr=101+15th+St,+San+Francisco&daddr=1010+Mission+St,+San+Francisco&stime=06:45&sdate=12/21/2010&etime=07:45&edate=12/21/2010
  urlVars = getUrlVars();
  if('saddr' in urlVars && 'daddr' in urlVars && 'stime' in urlVars && 'sdate' in urlVars && 'etime' in urlVars && 'edate' in urlVars){
    //We have all the variables needed to process a trip
    $("#startlocation").val(urlVars['saddr']);
    $("#departuretime").val(urlVars['stime']);
    $("#departuredate").val(urlVars['sdate']);
    $("#destinationlocation").val(urlVars['daddr']);
    $("#returntime").val(urlVars['etime']);
    $("#returndate").val(urlVars['edate']);
    //Get non-required variables if present
    'ccsplan' in urlVars ? $("#ccsplan").val(urlVars['ccsplan']) : $("#ccsplan").val($("#start_ccsplan").val());
    'zipcarplan' in urlVars ? $("#zipcarplan").val(urlVars['zipcarplan']) : $("#zipcarplan").val($("#start_zipcarplan").val());
    'extramiles' in urlVars ? $("#extramiles").val(urlVars['extramiles']) : $("#extramiles").val($("#start_extramiles").val());
    'zipcarrate' in urlVars ? $("#zipcarrate").val(urlVars['zipcarrate']) : $("#zipcarrate").val($("#start_zipcarrate").val());
    'zipcardailyrate' in urlVars ? $("#zipcardailyrate").val(urlVars['zipcardailyrate']) : $("#zipcardailyrate").val($("#start_zipcardailyrate").val());
    'passengers' in urlVars ? $("#passengers").val(urlVars['passengers']) : $("#passengers").val($("#start_passengers").val());
    
    //Do initial map setup
    mapSetup();
  }

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
  
  //Adjust default zipcar rates based on zipcar plan type
  $("#zipcarplan").change(function(){
    zipcarplan = $("#"+$(this).attr('id')+" option:selected").val();
    $("#zipcarrate").attr("placeholder",zipcarplans[zipcarplan].weekendhourly);
    $("#zipcardailyrate").attr("placeholder",zipcarplans[zipcarplan].weekenddaily);
  });
  
  $("#start_zipcarplan").change(function(){
    zipcarplan = $("#"+$(this).attr('id')+" option:selected").val();
    $("#start_zipcarrate").attr("placeholder",zipcarplans[zipcarplan].weekendhourly);
    $("#start_zipcardailyrate").attr("placeholder",zipcarplans[zipcarplan].weekenddaily);
  });

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
  
  //Set return time to at least departure time on change
  $('#start_departuretime').change(function(){
    var departuredate=dates.convert(""+$('#start_departuredate').val()+" "+$('#start_departuretime').val());
    var returndate=dates.convert(""+$('#start_returndate').val()+" "+$('#start_returntime').val());
    if(returndate-departuredate<0){
      $('#start_returntime').val($('#start_departuretime').val());
    }
  });
  $('#departuretime').change(function(){
    var departuredate=dates.convert(""+$('#departuredate').val()+" "+$('#departuretime').val());
    var returndate=dates.convert(""+$('#returndate').val()+" "+$('#returntime').val());
    if(returndate-departuredate<0){
      $('#returntime').val($('#departuretime').val());
    }
  });
  
  //Secondary form submit click handler
  $("#trip_submit").click(function(){
    recalc();
    return false;
  });

  //Enable Tooltips
  $("#startlocation,#destinationlocation,#zipcarrate,#zipcardailyrate,#extramiles").tooltip({ 
      position: "center right",
      offset: [0, 10],
      effect: "fade",
      opacity: 0.8,
      tip: '.tooltip'
  });

  //Show geolocation if browser supports it
  if (navigator.geolocation) {  
   $("#slocation").show();
   $("#start_slocation").show();
  }
  
  //Show/Hide Options Panel
  $('#show_options').click(function(){
    $('#options_panel').fadeIn();
    return false;
  });
  
  $('#options_panel_close').click(function(){
    $('#options_panel').fadeOut();
  });
  
  $('#options_panel_submit').click(function(){
    $('#options_panel').fadeOut();
    recalc();
  });
 
  //Initial form submit click handler
  $("#start_submit").click(function(){
    if($("#start_startlocation").val() == ''){
      $("#start_startlocation").css('border','2px solid red');
    }
    if($("#start_destinationlocation").val() == ''){
      $("#start_destinationlocation").css('border','2px solid red');
    }
    if($("#start_startlocation").val()!='' && $("#start_destinationlocation").val()!=''){
      //Move all variables to sidebar form
      $("#startlocation").val($("#start_startlocation").val());
      $("#departuretime").val($("#start_departuretime").val());
      $("#departuredate").val($("#start_departuredate").val());
      $("#destinationlocation").val($("#start_destinationlocation").val());
      $("#returntime").val($("#start_returntime").val());
      $("#returndate").val($("#start_returndate").val());
      $("#ccsplan").val($("#start_ccsplan").val());
      $("#zipcarplan").val($("#start_zipcarplan").val());
      $("#extramiles").val($("#start_extramiles").val());
      $("#zipcarrate").val($("#start_zipcarrate").val());
      $("#zipcardailyrate").val($("#start_zipcardailyrate").val());
      $("#passengers").val($("#start_passengers").val());
      
      //Do initial map setup
      mapSetup();
    }
  });
 
});

