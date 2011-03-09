var map;
var directionsService;
var flightline;
var trafficLayer;
var popup;
var trip = {};
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
var drivingcosts = {
  "small sedan":{
    "gas": 9.24,
    "maintenance": 4.21,
    "tires": 0.65,
    "operatingcosts": 14.1,
    "10000": 56.4,
    "15000": 43.3,
    "20000": 36.6
  },
  "medium sedan":{
    "gas": 11.97,
    "maintenance": 4.42,
    "tires": 0.91,
    "operatingcosts": 17.3,
    "10000": 72.9,
    "15000": 56.2,
    "20000": 47.6
  },
  "large sedan":{
    "gas": 12.88,
    "maintenance": 5.0,
    "tires": 0.94,
    "operatingcosts": 18.82,
    "10000": 92.6,
    "15000": 70.2,
    "20000": 58.6
  },
  "4wd sport utlity vehicle":{
    "gas": 16.38,
    "maintenance": 4.95,
    "tires": 0.98,
    "operatingcosts": 22.31,
    "10000": 96.9,
    "15000": 73.9,
    "20000": 62.1
  },
  "minivan":{
    "gas": 19.31,
    "maintenance": 4.86,
    "tires": 0.75,
    "operatingcosts": 19.31,
    "10000": 80.6,
    "15000": 62.0,
    "20000": 52.4
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
  if (trip.markerArray) {
    for (i in trip.markerArray) {
      trip.markerArray[i].setMap(null);
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
  
  if(type=='ccs'){
    trip.ccs.closestMarker = {};
    var image = new google.maps.MarkerImage(
      'images/ccs.png',
      new google.maps.Size(24, 24),
      new google.maps.Point(0,0),
      new google.maps.Point(12, 12));
    for (pod in ccs_arr) {
      distanceAway = calculateDistance(ccs_arr[pod].lat,ccs_arr[pod].lon,lat,lon);
      //Check to see if this marker is the closest
      if(typeof trip.ccs.closestMarker.distance == "undefined" || distanceAway<trip.ccs.closestMarker.distance){
        ccs_arr[pod].distance = distanceAway;
        trip.ccs.closestMarker = ccs_arr[pod];
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
          trip.markerArray.push(marker);

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
    trip.ccs.closestMarker.distanceformatted = (trip.ccs.closestMarker.distance<.2) ? Math.round(trip.ccs.closestMarker.distance*5280) + " ft" : Math.round(trip.ccs.closestMarker.distance*10)/10 + " mi";
    if(typeof trip.ccs.closestMarker.name !== "undefined"){
      $('#ccsclosest').html("Nearest car: <strong>" + trip.ccs.closestMarker.distanceformatted + "</strong> (" + trip.ccs.closestMarker.name + " - <a href='"+trip.ccs.closestMarker.url+"' target='_blank'>View Details</a>)");
    }

  } else if(type == 'zipcar'){
    trip.zipcar.closestMarker = {};
    var image = new google.maps.MarkerImage(
      'images/zipcar.png',
      new google.maps.Size(24, 24),
      new google.maps.Point(0,0),
      new google.maps.Point(12, 12));
  
    for (pod in zipcar_arr) {
      distanceAway = calculateDistance(zipcar_arr[pod][2],zipcar_arr[pod][3],lat,lon);
      //Check to see if this marker is the closest
      if(typeof trip.zipcar.closestMarker.distance == "undefined" || distanceAway<trip.zipcar.closestMarker.distance){
        trip.zipcar.closestMarker.name = zipcar_arr[pod][1];
        trip.zipcar.closestMarker.lat = zipcar_arr[pod][2];
        trip.zipcar.closestMarker.lng = zipcar_arr[pod][3];
        trip.zipcar.closestMarker.distance = distanceAway;
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
          trip.markerArray.push(marker);

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
    //List closest Zipcar location in results
    trip.zipcar.closestMarker.distanceformatted = (trip.zipcar.closestMarker.distance<.2) ? Math.round(trip.zipcar.closestMarker.distance*5280) + " ft" : Math.round(trip.zipcar.closestMarker.distance*10)/10 + " mi";
    if(typeof trip.zipcar.closestMarker.name !== "undefined"){
      $('#zipcarclosest').html("Nearest car: <strong>" + trip.zipcar.closestMarker.distanceformatted + "</strong> (" + decodeURIComponent(trip.zipcar.closestMarker.name.replace(/\+/g,' ')) + ")");
    }
  }
}

function calculateTrip(response) {
  //Clear old warnings and trips
  $('#warnings_panel').html('');
  $('.mode .summary').html('');
  
  //clear markers
  clearOverlays()
  
  //Create popup window
  popup = new google.maps.InfoWindow({maxWidth:200});

  var onewaydistance = 0;
  var onewaytime = 0;
  var leg_count = response.routes[0].legs.length;
  for (i = 0; i < leg_count; i++) {
    //Convert to miles
    onewaydistance += (response.routes[0].legs[i].distance.value/ 1609.);
    onewaytime += response.routes[0].legs[i].duration.value/60;
  }
  
  //Reset Trip
  trip = {};
  trip.markerArray = [];
  
  //Get basic trip stats
  trip.departuredate=dates.convert($('#departuredate').val()+" "+$('#departuretime').val());
  trip.departure = {};
  trip.departure.day = (trip.departuredate.getDate()<10) ? "0"+trip.departuredate.getDate() : trip.departuredate.getDate();
  trip.departure.month = ((trip.departuredate.getMonth()+1)<10) ? "0"+(trip.departuredate.getMonth()+1) : (trip.departuredate.getMonth()+1);
  trip.departure.dateFormattedDashed = trip.departuredate.getFullYear() + '-' + trip.departure.month + '-' + trip.departure.day;
  trip.departure.dateFormattedSlashed = trip.departure.month + '/' + trip.departure.day + '/' + trip.departuredate.getFullYear();
  trip.departure.timeFormatted = trip.departuredate.getHours() + ':' + trip.departuredate.getMinutes();
  trip.returndate=dates.convert($('#returndate').val()+" "+$('#returntime').val());
  trip.totaltime = (trip.returndate-trip.departuredate)/(1000*60); //Total trip time in minutes
  trip.distance = Math.round(onewaydistance*2*10)/10;
  trip.onewaydistance = Math.round(onewaydistance*10)/10;
  trip.extramiles = Number($('#extramiles').val());
  trip.passengers = Number($('#passengers').val());
  trip.drivingtime = onewaytime*2; //Traveling time by driving in minutes
  
  //Allow City Carshare and Uber if within 15 miles of San Francisco
  //San Francisco Area lat lon
  var sf = {
    lat:37.8,
    lng:-122.33
  };
  if(calculateDistance(sf.lat,sf.lng,response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng())<15){
    //Only show CCS for trips less than 700 miles
    if(trip.onewaydistance<350){
      //Add CCS as a mode, add locations
      calculateCCS();
      $('#ccsresult').show();
    
      addCarshareLocations(map, response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng(), 'ccs');
    } else {
      $('#ccsresult').hide();
    }
    
    //Only show uber for trips less than 75 miles (it gets expensive!)
    (trip.onewaydistance<75) ? calculateUber() : $('#uberresult').hide();

  } else{
    //If not in SF, hide SF modes
    $('#ccsresult').hide();
    $('#uberresult').hide();
  }
  
  //Only show taxis if distance is less than 150 miles
  (trip.onewaydistance<150) ? calculateTaxi() : $('#taxiresult').hide();
  
  //Only show flights if distance is greater than 150 miles
  (trip.onewaydistance>150) ? calculateFlight(response) : $('#flightresult').hide();
  
  //Only show greyhound if distance is greater than 40 miles
  (trip.onewaydistance>40) ? calculateGreyhound() : $('#greyhound').hide();
  
  //Only show Zipcar for trips less than 700 miles
  if(trip.onewaydistance<350){
    calculateZipcar();
    //Add zipcar locations
    addCarshareLocations(map, response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng(), 'zipcar');
     $('#zipcarresult').show();
  } else {
    $('#zipcarresult').hide();
  }
  
  //Estimate driving costs
  calculateDriving(response);
  
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
      calculateWalk(response);
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
      calculateBike(response);
    }
  });
    
  //Do Transit Directions 
  //Use lat lon coordinates to avoid issues with start/end names - need space between coordinates
  calculateTransitTrip(response.routes[0].legs[0].start_location.lat()+", "+response.routes[0].legs[0].start_location.lng(),
  response.routes[0].legs[leg_count-1].end_location.lat()+", "+response.routes[0].legs[leg_count-1].end_location.lng());
  
  //Rename "Transit" to "Amtrak" if more than 60 miles
  $('#transit h3').html((trip.onewaydistance>60) ? "Amtrak" : "Transit");

  //We've got everything we need, show results
  $("#results").show(); 
  
  //Create Permalink URL
	linkURL = "?saddr=" + $('#startlocation').val().replace(/&/g, "and").replace(/ /g, "+") + "&daddr=" + $('#destinationlocation').val().replace(/&/g, "and").replace(/ /g, "+") + "&stime=" + $("#departuretime").val() + "&sdate="  + $("#departuredate").val() + "&etime=" + $("#returntime").val() + "&edate="  + $("#returndate").val() + "&ccsplan=" + $("#ccsplan").val() + "&zipcarplan=" + $("#zipcarplan").val() + "&extramiles=" + $("#extramiles").val() + "&zipcarrate=" + $("#zipcarrate").val() + "&zipcardailyrate=" + $("#zipcardailyrate").val() + "&passengers=" + $("#passengers").val();
	
  //Add Permalink Control on top of map
	$("#permalink").html("<a href='" + linkURL + "' title='Direct Link to this trip'><img src='images/link.png'> Permalink to Route</a>");
	
	//Add Twitter Control on top of map
	$("#twitter a").attr("href","http://www.addtoany.com/add_to/twitter?linkurl=" + encodeURIComponent("http://modepick.com"+linkURL) + "&linkname=" + encodeURIComponent("The best way from " + $('#startlocation').val().replace(/\+/g, " ").replace(/&/g, "and") + " to " + $('#destinationlocation').val().replace(/\+/g, " ").replace(/&/g, "and")));
  
  //Resize window
  setTimeout(resizeWindow(),500);
}

function calculateDriving(response){
  drivingdistance = (trip.extramiles!=0) ? trip.distance+trip.extramiles : trip.distance;

   $("#driving .distance").html(formatDistance(drivingdistance));
   $("#driving .summary").append("<li>" + formatDistance(trip.onewaydistance) + " each way</li>");
   $("#driving .summary").append("<li>Gas Cost: <strong>" + formatCurrency(drivingdistance * drivingcosts["medium sedan"]["gas"]/100) + "</strong></li>");
   $("#driving .summary").append("<li>Maintenence Cost: <strong>" + formatCurrency(drivingdistance * drivingcosts["medium sedan"]["maintenance"]/100) + "</strong></li>");
   $("#driving .summary").append("<li>Tires: <strong>" + formatCurrency(drivingdistance * drivingcosts["medium sedan"]["tires"]/100) + "</strong></li>");
   $("#driving .summary").append("<li>Ownership Costs: <strong>" + formatCurrency(drivingdistance * (drivingcosts["medium sedan"]["15000"] - drivingcosts["medium sedan"]["operatingcosts"])/100) + "</strong></li>");
   $("#driving .summary").append("<li><strong>Total Cost for " + formatDistance(drivingdistance) + ": <strong>" + formatCurrency(drivingdistance * drivingcosts["medium sedan"]["15000"]/100) + "</strong></li>");
   $("#driving .summary").append("<li>Costs based on medium sedan driving 15,000 mi/year, gas at $2.60/gallon and <a href='http://www.fuelcostcalculator.aaa.com'>assumptions from AAA</a></li>");

   $("#driving .time").html(formatTimeDecimal(trip.drivingtime));
   $("#driving .cost").html(formatCurrency(drivingdistance * drivingcosts["medium sedan"]["15000"]/100))

   $("#driving .summary").append("<li><a id='traffic' href='' onClick='toggleTraffic();return false;' title='Show Current Traffic Conditions'>Show Current Traffic Conditions</a></li>");

   $("#driving .modeLink").html("<a href='http://maps.google.com/maps?saddr="+encodeURIComponent(response.routes[0].legs[0].start_address)+"&daddr="+encodeURIComponent(response.routes[0].legs[response.routes[0].legs.length-1].end_address)+"&dirflg=d' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'>Driving directions on Google Maps</a>");
}

function calculateWalk(response){
  //Clear existing directions
  $("#walking .summary").html('');
  
  //Assign walk directions response to display renderer
  directionsDisplayWalk.setDirections(response);
  
  var onewaydistance = 0;
  var onewaytime = 0;
  for (i = 0; i < response.routes[0].legs.length; i++) {
    //Convert to miles
    onewaydistance += (response.routes[0].legs[i].distance.value/ 1609.);
    onewaytime += response.routes[0].legs[i].duration.value;
  }
  //Convert to hours minutes
  timetext = formatTimeDecimal(onewaytime*2/60);
  
  tripdist = Math.round(onewaydistance*2*10)/10;
  
  if(trip.extramiles!=0){
    $("#walking .distance").html(formatDistance(tripdist+trip.extramiles));
    $("#walking .summary").append("<li><strong>" + formatDistance(onewaydistance) + "</strong> each way plus <strong>"+ trip.extramiles + "</string> additional</li>");
  } else {
    $("#walking .distance").html(formatDistance(tripdist));
    $("#walking .summary").append("<li><strong>" + formatDistance(onewaydistance) + "</strong> each way");
  }
  $("#walking .time").html(timetext);
  $("#walking .cost").html("$0.00");
  $("#walking .modeLink").html("<a href='http://maps.google.com/maps?saddr="+encodeURIComponent(response.routes[0].legs[0].start_address)+"&daddr="+encodeURIComponent(response.routes[0].legs[response.routes[0].legs.length-1].end_address)+"&dirflg=w' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'>Walking directions in Google Maps</a>");
  
  //Show Walk Directions when hovered over walking button
  $("#walking").hover(
    function(){
    directionsDisplay.setMap(null);
    directionsDisplayWalk.setMap(map);
    }, 
    function(){
      directionsDisplayWalk.setMap(null);
      directionsDisplay.setMap(map);
    });
}

function calculateBike(response){
  //Assign bike directions response to display renderer
  directionsDisplayBike.setDirections(response);

  var onewaydistance = 0;
  var onewaytime = 0;
  for (i = 0; i < response.routes[0].legs.length; i++) {
    //Convert to miles
    onewaydistance += (response.routes[0].legs[i].distance.value/ 1609.);
    onewaytime += response.routes[0].legs[i].duration.value;
  }
  //Convert to hours minutes
  timetext = formatTimeDecimal(onewaytime*2/60);
  
  tripdist = Math.round(onewaydistance*2*10)/10;
  
  if(trip.extramiles!=0){
    $("#biking .distance").html(formatDistance(tripdist+trip.extramiles));
    $("#biking .summary").append("<li><strong>" + formatDistance(onewaydistance) + "</strong> each way plus "+ trip.extramiles + " additional</li>");
  } else {
    $("#biking .distance").html(formatDistance(tripdist));
    $("#biking .summary").append("<li><strong>" + formatDistance(onewaydistance) + "</strong> each way</li>");
  }
  $("#biking .time").html(timetext);
  $("#biking .cost").html("$0.00");
  $("#biking .modeLink").html("<a href='http://maps.google.com/maps?saddr="+encodeURIComponent(response.routes[0].legs[0].start_address)+"&daddr="+encodeURIComponent(response.routes[0].legs[response.routes[0].legs.length-1].end_address)+"&dirflg=b' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'>Biking directions in Google Maps</a>");
  
  //Show Bike Directions when hovered over biking button
  $("#biking").hover(
    function(){
    directionsDisplay.setMap(null);
    directionsDisplayBike.setMap(map);
    }, 
    function(){
      directionsDisplayBike.setMap(null);
      directionsDisplay.setMap(map);
    });
}

function calculateTransitTrip(start,end){
  trip.transit = {};
  trip.transit.routes=[];
  //Use YQL to scrape google maps for screenreader to get transit directions
  
  //Clear existing directions
  $("#transit .cost").html('');
  $("#transit .time").html('');
  $("#transit .distance").html('');
  
  //Get URL ready
  var BASE_URI = 'http://query.yahooapis.com/v1/public/yql?q=';  
  var yql = BASE_URI + encodeURIComponent('select * from html where url="http://maps.google.com/m/directions?dirflg=r&saddr='+start.replace(/&/g,"%26").replace(/ /g,'+')+'&daddr='+end.replace(/&/g,"%26").replace(/ /g,'+')+'&date='+trip.departure.dateFormattedDashed+'&time='+trip.departure.timeFormatted+'" and xpath=\'//div[2]/div/p\'') + '&format=json';
  
   // Request that YSQL string, and run a callback function.  
  $.getJSON( yql, function(data) {
    // If we have something to work with...  
    if(data.query.count > 0){
      $("#transit").fadeIn();
      //Maybe we scraped a result
      trip.transit.summaryText = data.query.results.p[0];
      
      var option = 1;
      for(i=1;i<(data.query.results.p.length-1);i++){
        if(typeof(data.query.results.p[i].a)!='undefined'){
          trip.transit.routes[option] = {
            'startTime': data.query.results.p[i].a.content.replace(/\s-\s.*$/g,''),
            'endTime' : data.query.results.p[i].a.content.replace(/^.*\s-\s/,''),
            'fare' : (typeof data.query.results.p[i+1] == 'string' && data.query.results.p[i+1].substr(0,1)=='$') ? parseFloat(data.query.results.p[i+1].replace(/\$/g,''))*2 : "No Info"
          };
          //Convert Transit Time to minutes
          var d = data.query.results.p[i].content.match(/\(([^}]+)\)/)[1].split(' ');
          if(d[1].indexOf('hour') != -1){
            trip.transit.routes[option].transitTime = (60*parseInt(d[0]) + parseInt(d[2]))*2;
          } else if(d[1].indexOf('min') != -1){
            trip.transit.routes[option].transitTime = parseInt(d[0])*2;
          }
          
          var waitingTime = (Date.parse(dates.convert(trip.departure.dateFormattedSlashed+" "+time24(trip.transit.routes[option].startTime))) - Date.parse(trip.departuredate))/(60*1000);
          //If negative that means the trip departs the next day, so add a day
          waitingTime = (waitingTime<0) ? (waitingTime + 24*60) : waitingTime;
          trip.transit.routes[option].waitingTime = formatTimeDecimal(waitingTime);
        
          trip.transit.cost = (trip.transit.cost > trip.transit.routes[option].fare || typeof(trip.transit.cost) == 'undefined') ? trip.transit.routes[option].fare : trip.transit.cost;
        
          if(option==1){
            trip.transit.transitTime =  trip.transit.routes[option].transitTime;
          }
          
          //Follow link for page with more info
          yql = BASE_URI + encodeURIComponent('select * from html where url="http://maps.google.com'+data.query.results.p[i].a.href+'" and xpath=\'//div/div\'') + '&format=json&diagnostics=true';
 
          //Wrap in function so that each option gets its own call
          function getResult(option){
            $.getJSON(yql, function(data){
              var directions = '';
              $(data.query.results.div).each(function(i,element){
                htmlimg=(typeof(element.img) != 'undefined') ? '<img src="'+element.img.src+'" alt="'+element.img.alt+'">' : '';
                switch(typeof(element.p)){
                  case 'undefined':
                    htmlp = '';
                    break;
                  case 'string':
                    if(element.p == 'Alternative routes:'){
                      //end looping
                      return false;
                    }
                    htmlp = '<p>' + element.p + '</p>';
                    break;
                  case 'object':
                    function showhtmlp(element){
                      var s = '';
                      if(typeof(element.content != 'undefined')){
                        s += element.content;
                      }
                      if(typeof(element.a) != 'undefined'){
                        s += element.a.content;
                      }
                      if(typeof(element.br) != 'undefined'){
                        s+='<br>';
                      }
                      return s
                    }
                  
                    htmlp = '<p>';
                    if(typeof(element.p[0]) != 'undefined'){
                      $(element.p).each(function(i, data){
                        htmlp += showhtmlp(data);
                      });
                    } else {
                      htmlp += showhtmlp(element.p);
                    }
                    htmlp += '</p>';
                    break;
                }
                directions += '<div>'+htmlimg+htmlp+'</div>';
              });
              directions += '<div><a href="' + data.query.diagnostics.url.content + '" target="_blank" title="See on Google Maps"><img src="images/link.png" alt="Link" class="smallicon">View trip on Google Transit</a></div>';
              trip.transit.routes[option].directions = directions;
              $('#transitoption'+option).html(directions);
            });
          }
          getResult(option);
        
          //Increment option number
          option++;
        }
      }
      
      //Print results
      $("#transit .summary").append("<li>"+trip.transit.summaryText+"</li>");
      
      $(trip.transit.routes).each(function(i, data){
        if(typeof(data)!='undefined'){
          $("#transit .summary").append("<li class='transitoption'><strong>" + i + ":</strong> &nbsp; Wait time: <strong>" + data.waitingTime + "</strong><br> Depart/Arrive: <strong>" + data.startTime + "/" + data.endTime + "</strong><br> <div id='transitoption"+i+"' class='transitdetail'></div><a href='#' class='infolink'>More Info &#9660;</a></li>");
          if(data.fare != "No Info"){
            $("#transit .summary").append("<li>Roundtrip fare per person: <strong>" + formatCurrency(data.fare) + "</strong></li>");
            $("#transit .summary").append("<li>Roundtrip fare for "+trip.passengers+": <strong>" + formatCurrency(data.fare*trip.passengers) + "</strong></li>");
          }
        }
      });
      
      $("#transit .time").html(formatTimeDecimal(trip.transit.transitTime));
      $("#transit .cost").html((trip.transit.cost != "No Info") ? formatCurrency(parseFloat(trip.transit.cost*trip.passengers)) : "No Info");
      $("#transit .distance").html("N/A");
      $("#transit .modeLink").html("<a href='http://maps.google.com/maps" + data.query.results.p[1].a.href.substr(13) + "' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'>Transit Directions on Google Transit</a>");
    } else{
      //No transit info available
      $("#transit").fadeOut();
    }
  });
}

function calculateCCS(){
  trip.ccs = {};
  trip.ccs.plan = ccsplans[$('#ccsplan').val()];
  trip.ccs.cost=0;
  trip.ccs.latenighttime = 0;
  trip.ccs.weekendtime = 0;
  trip.ccs.weekendtime2 = 0;
  
  //Calculate number of minutes from midnight Monday
  //Shift getDay function by one day
  startday = (trip.departuredate.getDay()==0) ? 6 : trip.departuredate.getDay()-1;
  departurecode = startday*(24*60) + trip.departuredate.getHours()*60 + trip.departuredate.getMinutes();
  endday = (trip.returndate.getDay()==0) ? 6 : trip.returndate.getDay()-1;

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
        trip.ccs.latenighttime += (trip.returndate-trip.departuredate)/(1000*60);
      }
      else {
        //Return after 8 AM
        trip.ccs.latenighttime += (8*60)-((trip.departuredate-departuremidnight)/(1000*60));
      }
    } else {
      //Return is next day
      trip.ccs.latenighttime += (8*60)-((trip.departuredate-departuremidnight)/(1000*60));
      trip.ccs.latenighttime += (trip.returndate-returnmidnight)/(1000*60);
    }
  } else {
    //Departure is after 8 AM
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day, no late night
    } else {
      //Return is next day
      if(trip.returndate.getHours()<8){
        //depart and return before 8 AM
        trip.ccs.latenighttime += (trip.returndate-returnmidnight)/(1000*60);
      }
      else {
        //Return after 8 AM
        trip.ccs.latenighttime += (8*60);
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
          trip.ccs.weekendtime += ((trip.returndate-returnmidnight)/(1000*60))-(17*60);
        }
      } else {
        //Depart after 5 PM
        trip.ccs.weekendtime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<17){
        //depart before 5 PM
        trip.ccs.weekendtime += (7*60);
      } else {
        //depart after 5 PM
        trip.ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
      }
      if(trip.returndate.getHours()>=8){
        trip.ccs.weekendtime += ((trip.returndate-returnmidnight)/(1000*60))-(8*60);
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
          trip.ccs.weekendtime += ((trip.returndate-trip.departuredate)/(1000*60)) - ((8*60)-((trip.departuredate-departuremidnight)/(1000*60)));
        }
      } else {
        //Depart after 8 AM
        trip.ccs.weekendtime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM, return must be before 8 AM
        trip.ccs.weekendtime += (16*60);
      } else{
        //departure after 8 AM
        if(trip.returndate.getHours()<8){
          //return before 8 AM
          trip.ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
        } else {
          //return after 8 AM
          trip.ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
          trip.ccs.weekendtime += ((trip.returndate-returnmidnight)/(1000*60))-(8*60);
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
          trip.ccs.weekendtime += ((trip.returndate-trip.departuredate)/(1000*60)) - ((8*60)-((trip.departuredate-departuremidnight)/(1000*60)));
        }
      } else {
        //Depart after 8 AM
        trip.ccs.weekendtime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM, return must be before 8 AM
        trip.ccs.weekendtime += (16*60);
      } else{
        //departure after 8 AM
        trip.ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
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
        trip.ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60) - ((17*60)-((trip.departuredate-departuremidnight)/(1000*60)));
      }
    } else {
      //depart after 5 PM
      trip.ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
    }
  } else if(trip.departuredate.getDay()==6){
    //departure day is Saturday
    trip.ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
  } else if(trip.departuredate.getDay()==0){
    //departure day is Sunday
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day
      trip.ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
    } else {
      //Return is next day
      if(trip.returndate.getHours()<8){
        //return before 8 AM
        trip.ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
      } else{
        //return after 8 AM
        trip.ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60) - ((trip.returndate-returnmidnight)/(1000*60)-(8*60));
      }
    }
  }

  if($('#ccsplan').val()=='sharealittle'){
    //Share a little doesn't havce late night hours so use CCS2 time
    trip.ccs.cost+= trip.ccs.plan.weekdayhourly*((trip.totaltime-trip.ccs.weekendtime2)/60)+trip.ccs.plan.weekendhourly*(trip.ccs.weekendtime2/60);
    if((trip.totaltime-trip.ccs.weekendtime2)>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(trip.totaltime-trip.ccs.weekendtime2) + " x " + formatCurrency(trip.ccs.plan.weekdayhourly) + "/hr wkday: <strong>" +  formatCurrency(trip.ccs.plan.weekdayhourly*((trip.totaltime-trip.ccs.weekendtime2)/60)) + "</strong></li>");
    }
    if(trip.ccs.weekendtime2>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(trip.ccs.weekendtime2) + " x " + formatCurrency(trip.ccs.plan.weekendhourly) + "/hr wkend: <strong>" + formatCurrency(trip.ccs.plan.weekendhourly*(trip.ccs.weekendtime2/60)) + "</strong></li>");
    }
  } else {
    //Other plans have late night hours, so use CCS time
     trip.ccs.cost+= trip.ccs.plan.weekdayhourly*((trip.totaltime-trip.ccs.weekendtime-trip.ccs.latenighttime)/60)+trip.ccs.plan.weekendhourly*(trip.ccs.weekendtime/60)+trip.ccs.plan.latenighthourly*(trip.ccs.latenighttime/60);
    if((trip.totaltime-trip.ccs.weekendtime-trip.ccs.latenighttime)>0){
     $('#ccsresult .summary').append("<li>" + formatTimeDecimal(trip.totaltime-trip.ccs.weekendtime-trip.ccs.latenighttime) + " x " + formatCurrency(trip.ccs.plan.weekdayhourly) + "/hr wkday: <strong>" + formatCurrency(trip.ccs.plan.weekdayhourly*((trip.totaltime-trip.ccs.weekendtime-trip.ccs.latenighttime)/60)) + "</strong></li>");
    }
    if(trip.ccs.weekendtime>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(trip.ccs.weekendtime) + " x " + formatCurrency(trip.ccs.plan.weekendhourly) + "/hr wkend: <strong>" + formatCurrency(trip.ccs.plan.weekendhourly*(trip.ccs.weekendtime/60)) + "</strong></li>");
    }
    if(trip.ccs.latenighttime>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(trip.ccs.latenighttime) + " x " + formatCurrency(trip.ccs.plan.latenighthourly) + "/hr latenight: <strong>" + formatCurrency(trip.ccs.plan.latenighthourly*(trip.ccs.latenighttime/60)) + "</strong></li>");
    }
  }
  //Add in Mileage
  if(trip.extramiles!=0){
    trip.ccs.cost+= (trip.distance+trip.extramiles)*trip.ccs.plan.mileagehourly;
    $('#ccsresult .summary').append("<li>" + (trip.distance+trip.extramiles) + " mi x " + formatCurrency(trip.ccs.plan.mileagehourly) + " per mi: <strong>" + formatCurrency((trip.distance+trip.extramiles)*trip.ccs.plan.mileagehourly) + "</strong></li>");
  } else {
    trip.ccs.cost+= trip.distance*trip.ccs.plan.mileagehourly;
    $('#ccsresult .summary').append("<li>" + trip.distance + " mi x " + formatCurrency(trip.ccs.plan.mileagehourly) + " per mi: <strong>" + formatCurrency(trip.distance*trip.ccs.plan.mileagehourly) + "</strong></li>");
  }
  
  $('#ccsresult .cost').html(formatCurrency(trip.ccs.cost));
  $('#ccsresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#ccsresult .distance').html(formatDistance(trip.distance));
  $('#ccsresult .summary').append("<li class='total'>City Carshare Total: <strong>" + formatCurrency(trip.ccs.cost) + "</strong></li>");
  
  //Check if estimated driving time exceeds trip time
  if(trip.totaltime<trip.drivingtime){
    $('#ccsresult .summary').prepend("<li class='warning'>Your estimated driving time exceeds your reservation time.</li>");
    $('#ccsresult').addClass('warning');
  } else {
    $('#ccsresult').removeClass('warning');
  }
}

function calculateZipcar(){
  trip.zipcar = {}
  trip.zipcar.plan = zipcarplans[$('#zipcarplan').val()];
  trip.zipcar.cost = 0;
  trip.zipcar.rates={};
  trip.zipcar.rates.customHourly = $('#zipcarrate').val();
  trip.zipcar.rates.customDaily = $('#zipcardailyrate').val();
  trip.zipcar.time = trip.totaltime;
  
  //Calculate number of minutes from midnight Monday
  //Shift getDay function by one day
  startday = (trip.departuredate.getDay()==0) ? 6 : trip.departuredate.getDay()-1;
  departurecode = startday*(24*60) + trip.departuredate.getHours()*60 + trip.departuredate.getMinutes();
  endday = (trip.returndate.getDay()==0) ? 6 : trip.returndate.getDay()-1;

  returncode = endday*(24*60) + trip.returndate.getHours()*60 + trip.returndate.getMinutes();
  
  if(returncode<departurecode){
    //trip spans a weekend, add  7 days to returncode
    returncode += 7*24*60;
  }
  
  //Weekend calculation Zipcar
  //Assume no reservtions over 7 days length
  if(departurecode<=(5*24*60) && returncode<=(5*24*60)){
    //trip entirely weekday
    trip.zipcar.weekendtime = 0;
  } else if(departurecode<=(5*24*60) && returncode>=(7*24*60)){
    //trip spans entire weekend
    trip.zipcar.weekendtime = (2*24*60);
  } else if(departurecode<=(5*24*60) && returncode<=(7*24*60)){
    //trip starts on weekday, ends on weekend
    trip.zipcar.weekendtime = returncode - (5*24*60);
  } else if(departurecode>(5*24*60) && returncode<=(7*24*60)){
    //trip entirely weekend
    trip.zipcar.weekendtime = returncode - departurecode;
  } else if(departurecode>(5*24*60) && returncode>(7*24*60)){
    //trip starts on weekend, ends of weekday
    trip.zipcar.weekendtime = (7*24*60) - departurecode;
  }
  
  //Do cost estimations
  trip.zipcar.cost = 0;
  
  if(isNaN(trip.zipcar.rates.customDaily) || trip.zipcar.rates.customDaily==''){
    //Use default zipcar daily rates of $73/weekday and $78/weekend
    trip.zipcar.rates.daily = (trip.zipcar.weekendtime>0) ? trip.zipcar.plan.weekenddaily : trip.zipcar.plan.weekdaydaily;
  } else {
    //Use custom zipcar daily rate entered by user
    trip.zipcar.rates.daily = trip.zipcar.rates.customDaily;
  }
  
  //First try a rate that is a number of days that exceeds the reservation time
  trip.zipcar.ceiling = {}
  trip.zipcar.ceiling.days = Math.ceil(trip.totaltime / (24*60));
  trip.zipcar.ceiling.hours = 0;
  trip.zipcar.ceiling.cost = trip.zipcar.ceiling.days * parseFloat(trip.zipcar.rates.daily);
  
  //Now try a rate that is a number of days with a few trailing hours
  trip.zipcar.floor = {}
  trip.zipcar.floor.days = Math.floor(trip.totaltime / (24*60));
  trip.zipcar.floor.hours = estimateZipcarHourCost();
  trip.zipcar.floor.cost = trip.zipcar.floor.days * parseFloat(trip.zipcar.rates.daily) + trip.zipcar.floor.hours.cost;
  
  //See which day option is least expensive
  if(trip.zipcar.floor.cost<trip.zipcar.ceiling.cost){
    //Zipcar floor cost is cheapest
    trip.zipcar.cheapest = "floor";
    trip.zipcar.cost = trip.zipcar.floor.cost;
    trip.zipcar.days = trip.zipcar.floor.days;
    trip.zipcar.hours = trip.zipcar.floor.hours;
  } else {
    //Zipcar ceiling cost is cheapest or equal
    trip.zipcar.cheapest = "ceiling";
    trip.zipcar.cost = trip.zipcar.ceiling.cost;
    trip.zipcar.days = trip.zipcar.ceiling.days;
    trip.zipcar.hours = trip.zipcar.ceiling.hours;
  }
  
  //Add in mileage charge if over daily mileage limit
  trip.zipcar.extramiles = {}
  trip.zipcar.includedmiles = (trip.zipcar.days<1) ? trip.zipcar.plan.dailymileagecap : (trip.zipcar.plan.dailymileagecap*trip.zipcar.days + (((trip.zipcar.hours.time/60)*20<trip.zipcar.plan.dailymileagecap) ? (trip.zipcar.hours.time/60)*20 : trip.zipcar.plan.dailymileagecap));
  if(trip.distance+trip.extramiles > trip.zipcar.includedmiles){
    trip.zipcar.extramiles.mileage = Math.round((trip.distance+trip.extramiles) - (trip.zipcar.includedmiles));
    trip.zipcar.extramiles.cost = trip.zipcar.extramiles.mileage*trip.zipcar.plan.mileageoverage;
  } else {
    trip.zipcar.extramiles.mileage = 0;
    trip.zipcar.extramiles.cost = 0;
  }
  //Add extra mileage cost to total cost
  trip.zipcar.cost += trip.zipcar.extramiles.cost;
  
  //Print results to screen
  if(trip.zipcar.days>0){
    //Daily Rate
    $('#zipcarresult .summary').append("<li>" + trip.zipcar.days + " day x " + formatCurrency(parseFloat(trip.zipcar.rates.daily)) + "/day <strong>" + formatCurrency(parseFloat(trip.zipcar.rates.daily)*(trip.zipcar.days)) + "</strong></li>");
  }
  if(trip.zipcar.hours.time>0){
    //Hourly Rate
    $('#zipcarresult .summary').append("<li>" + formatTimeDecimal(trip.zipcar.hours.time) + " x " + formatCurrency(parseFloat(trip.zipcar.hours.rate)) + "/hr <strong>" + formatCurrency(parseFloat(trip.zipcar.hours.rate)*(trip.zipcar.hours.time/60)) + "</strong></li>");
  }
  
  if(trip.zipcar.extramiles.mileage>0){
    //Display extra milage charge
    $('#zipcarresult .summary').append("<li>" + trip.zipcar.extramiles.mileage + " mi extra x " + formatCurrency(parseFloat(trip.zipcar.plan.mileageoverage)) + "/mi <strong>" + formatCurrency(parseFloat(trip.zipcar.extramiles.cost)) + "</strong></li>");
  }
  
  $('#zipcarresult .cost').html(formatCurrency(trip.zipcar.cost));
  $('#zipcarresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#zipcarresult .distance').html(formatDistance(trip.distance));
  $('#zipcarresult .summary').append("<li class='total'>Zipcar Total <strong>" + formatCurrency(trip.zipcar.cost) + "</strong></li>");
  
  //Check if estimated driving time exceeds trip time
  if(trip.totaltime<trip.drivingtime){
    $('#zipcarresult .summary').prepend("<li class='warning'>Your estimated driving time exceeds your reservation time.</li>");
    $('#zipcarresult').addClass('warning');
  } else {
    $('#zipcarresult').removeClass('warning');
  }
}

function estimateZipcarHourCost(){  
  zipcarhour = {};
  zipcarhour.cost = 0;
  zipcarhour.time = trip.totaltime % (24*60);
  zipcarhour.rate = (isNaN(trip.zipcar.rates.customHourly) || trip.zipcar.rates.customHourly=='') ? trip.zipcar.plan.weekdayhourly : trip.zipcar.rates.customHourly;
  
  zipcarhour.cost += zipcarhour.rate * ((zipcarhour.time - trip.zipcar.weekendtime)/60) + zipcarhour.rate * (trip.zipcar.weekendtime/60);
  
  return zipcarhour;
}

function calculateTaxi(){ 
  trip.taxi = {};
  trip.taxi.totalcost = 0;
  
  //Taxi (assume 1.5 minute of waiting per mile)
  trip.taxi.trafficpermile = 1.5;
  
  trip.taxi.totalcost+= cabfares.firstfifth*2 + (cabfares.additionalfifth*((trip.distance-0.2)*5)) + cabfares.waitingminute*(trip.distance*trip.taxi.trafficpermile);
  //add tip
  trip.taxi.tipamount = trip.taxi.totalcost*(cabfares.tippercent/100);
  trip.taxi.totalcost = trip.taxi.totalcost*(1+(cabfares.tippercent/100));

  $('#taxiresult .summary').append("<li>Flag Drop x 2: <strong>"+formatCurrency(cabfares.firstfifth*2)+"</strong></li>");
  $('#taxiresult .summary').append("<li>"+formatDistance(trip.distance)+" x $2.25 per mi: <strong>"+formatCurrency((cabfares.additionalfifth*((trip.distance-0.2)*5)))+"</strong></li>");
  $('#taxiresult .summary').append("<li>Waiting in Traffic (~"+(Math.round(trip.distance*trip.taxi.trafficpermile*10)/10)+" min): <strong>"+formatCurrency(cabfares.waitingminute*(trip.distance*trip.taxi.trafficpermile))+"</strong></li>");
  $('#taxiresult .summary').append("<li>10% Tip: <strong>"+formatCurrency(trip.taxi.tipamount)+"</strong></li>");
  $('#taxiresult .summary').append("<li class='total'>Taxi Total: <strong>"+formatCurrency(trip.taxi.totalcost)+"</strong></li>");
  
  $('#taxiresult .cost').html(formatCurrency(trip.taxi.totalcost));
  $('#taxiresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#taxiresult .distance').html(formatDistance(trip.distance));
  
  //Show taxis
  $('#taxiresult').show();
}  

function calculateUber(){ 
  trip.uber = {};
  trip.uber.totalcost = 0;
  
  //Uber (assume 1.5 minute of waiting per mile)
  trip.uber.trafficpermile = 1.5;
  
  trip.uber.totalcost+= uberfares.flag*2 + (uberfares.mileage*trip.distance) + uberfares.idleminute*(trip.distance*trip.uber.trafficpermile);
  if(trip.uber.totalcost<30){
    //Minimum fare is $15 each way
    trip.uber.totalcost = 30;
    $('#uberresult .summary').append("<li>Minimum Fare $15 x 2: <strong>$30.00</strong></li>");
    $('#uberresult .summary').append("<li class='total'>Uber Total: <strong>$30.00</strong></li>");
  } else {
    $('#uberresult .summary').append("<li>Flag Drop x 2: <strong>"+formatCurrency(uberfares.flag*2)+"</strong></li>");
    $('#uberresult .summary').append("<li>"+formatDistance(trip.distance)+" x " + formatCurrency(uberfares.mileage) + " per mi: <strong>"+formatCurrency(uberfares.mileage*trip.distance)+"</strong></li>");
    $('#uberresult .summary').append("<li>Waiting in Traffic (~"+(Math.round(trip.distance*trip.uber.trafficpermile*10)/10)+" min): <strong>"+formatCurrency(uberfares.idleminute*(trip.distance*trip.uber.trafficpermile))+"</strong></li>");
    $('#uberresult .summary').append("<li class='total'>Uber Total: <strong>"+formatCurrency(trip.uber.totalcost)+"</strong></li>");
  }
  $('#uberresult .cost').html(formatCurrency(trip.uber.totalcost));
  $('#uberresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#uberresult .distance').html(formatDistance(trip.distance));
  
  $('#uberresult').show();
}

function calculateFlight(response){ 
  $('#flightresult .cost').html('');
  $('#flightresult .distance').html('');
  $('#flightresult .time').html('');
  flightline.setMap(null);
  trip.flight = {};
  
  //YQL to travelmath.com for closest airports
  //https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.travelmath.com%2Fclosest-airport%2F37.766618%2C-122.41676%22%20and%20xpath%3D'%2F%2Fa%5B%40name%3D%22international-airports%22%5D%2F..%2Fp'&format=json&diagnostics=true&callback=cbfunc
  
  //Get URL ready
  var BASE_URI = 'http://query.yahooapis.com/v1/public/yql?q=';  
  var originAirportURL = BASE_URI + encodeURIComponent('select * from html where url="http://www.travelmath.com/closest-airport/'+response.routes[0].legs[0].start_location.lat()+','+response.routes[0].legs[0].start_location.lng()+'" and xpath=\'//a[@name="international-airports"]/../p\'') + '&format=json';
  var destAirportURL = BASE_URI + encodeURIComponent('select * from html where url="http://www.travelmath.com/closest-airport/'+response.routes[0].legs[0].end_location.lat()+','+response.routes[0].legs[0].end_location.lng()+'" and xpath=\'//a[@name="international-airports"]/../p\'') + '&format=json';
  
  trip.flight.origin = {};
  trip.flight.dest = {};
  trip.flight.origin.airports = [];
  trip.flight.dest.airports = [];
  
  
  trip.flight.distance = calculateDistance(response.routes[0].legs[0].end_location.lat(), response.routes[0].legs[0].end_location.lng(),response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng());
  
   // Request that YSQL string, and run a callback function.  
  $.getJSON(originAirportURL, cbfunc1);  
  function cbfunc1(data) {
    // If we have something to work with...  
    if(data.query.count > 0){
      results = data.query.results.p[1].a
      for(i in results){
        //Filter Results down to airport codes
        if(results[i].content.length<4 && results[i].content != undefined){
          //Seems like an airport code
          trip.flight.origin.airports.push(results[i].content);
        }
      }
      
      $.getJSON(destAirportURL, cbfunc2);  
      function cbfunc2(data) {
        // If we have something to work with...  
        if(data.query.count > 0){
          results = data.query.results.p[1].a
          for(i in results){
            //Filter Results down to airport codes
            if(results[i].content.length<4 && results[i].content != undefined){
              //Seems like an airport code
              trip.flight.dest.airports.push(results[i].content);
            }
          }

          //Try hotwire API for Historical Flight Search
         //http://api.hotwire.com/v1/tripstarter/hotel?apikey='+hotwireAPIkey+'&price=*~75&sort=date&limit=1&format=json&jsoncallback=? 
         $.getJSON('../php/hotwire_historical_flight.php?origin='+trip.flight.origin.airports.join('|')+'&dest='+trip.flight.dest.airports.join('|')+'&startdate='+trip.departure.dateFomattedSlashed,
           function(data) {
             if(data != null){
               if(data.Result != undefined){
                 if(data.Result.AirPricing != undefined){
                   trip.flight.cost = data.Result.AirPricing.AveragePrice;
                   trip.flight.origin.airportCode = data.Result.AirPricing.OrigAirportCode;
                   trip.flight.dest.airportCode = data.Result.AirPricing.DestinationAirportCode;

                   $('#flightresult .summary').append("<li>Based on Hotwire's historical average flight prices for week of " + startdateformatted + "</li>");
                   $('#flightresult .summary').append("<li>Origin Airport: <strong><span id='originAirport'>" + trip.flight.origin.airportCode + "</span></strong></li>");
                   $('#flightresult .summary').append("<li>Destination Airport: <strong><span id='destAirport'>" + trip.flight.dest.airportCode + "</span></strong></li>");
                   $('#flightresult .summary').append("<li>Direct Flight duration: <strong>" + formatTimeDecimal(trip.flight.distance/(550/60)+45) + "</strong></li>");
                   $('#flightresult .summary').append("<li>Oneway Flight Cost per person: <strong>" + formatCurrency(trip.flight.cost) + "</strong></li>");
                   $('#flightresult .summary').append("<li class='total'>Roundtrip Flight Cost for " + trip.passengers + ": <strong>" + formatCurrency(trip.flight.cost*2*trip.passengers) + "</strong></li>");
                   $('#flightresult .cost').html(formatCurrency(trip.flight.cost*2*trip.passengers));
                   //Flight Time equation hours = .75 * dist/550

                   $('#flightresult .time').html(formatTimeDecimal(trip.flight.distance/(550/60)+45));
                   $('#flightresult .distance').html(formatDistance(trip.flight.distance*2));
                   $('#flightresult .modeLink a').attr('href',data.Result.AirPricing.Url);

                   //Get airport info from freebase
                                        $.getJSON('http://api.freebase.com/api/service/mqlread?queries={%22q0%22:{%22query%22:[{%22id%22:null,%22name%22:null,%22type%22:%22/aviation/airport%22,%22/aviation/airport/iata%22:%22'+trip.flight.origin.airportCode+'%22,%22/common/topic/webpage%22:[{}]}]},%22q1%22:{%22query%22:[{%22id%22:null,%22name%22:null,%22type%22:%22/aviation/airport%22,%22/aviation/airport/iata%22:%22'+trip.flight.dest.airportCode+'%22,%22/common/topic/webpage%22:[{}]}]}}&callback=?',   
                      function(data){
                        if(data.q0.code=='/api/status/ok'){
                          $('#originAirport').html('<a href="http://www.freebase.com/view' + data.q0.result[0].id + '">' + data.q0.result[0].name + '</a>');
                        }
                        if(data.q1.code=='/api/status/ok'){
                          $('#destAirport').html('<a href="http://www.freebase.com/view' + data.q1.result[0].id + '">' + data.q1.result[0].name + '</a>');
                        }
                      }
                    );

                    //Create flight polyline
                    flightline.setPath([
                        new google.maps.LatLng(response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng()),
                        new google.maps.LatLng(response.routes[0].legs[0].end_location.lat(), response.routes[0].legs[0].end_location.lng())
                    ]);

                    //Show Flight Line when hovered over flight button
                    $("#flightresult").hover(
                      function(){
                        directionsDisplay.setMap(null);
                        flightline.setMap(map)
                      }, 
                      function(){
                        flightline.setMap(null);
                        directionsDisplay.setMap(map);
                      }
                    );
                    
                    //Show flight results
                    $('#flightresult').show();
                  } else{
                    //No results
                    $('#flightresult').hide();
                  }
                } else{
                  //No results
                  $('#flightresult').hide();
                }
              } else{
                //No results
                $('#flightresult').hide();
              }
            }
          );
        }
      }
    }
  } 
}

function calculateGreyhound(){ 
  trip.greyhound = {};
  trip.greyhound.totalcost = 0;
  
  //Greyhound (costs range from $0.1/mile to $0.2/mile topping out around 2000 miles)
  trip.greyhound.costpermile = (trip.onewaydistance < 2000) ? (1 - trip.onewaydistance/2000)*0.1+0.1 : 0.1
  trip.greyhound.totalcost+= trip.greyhound.costpermile * trip.onewaydistance * 2;
  //Greyhound (speeds range from 25mph to 45mph topping out around 500 miles)
  trip.greyhound.speed = (trip.onewaydistance < 500) ? (trip.onewaydistance/500)*20+25 : 45; 
  trip.greyhound.totaltime = ((trip.onewaydistance*2)/trip.greyhound.speed)*60; 

  $('#greyhound .summary').append("<li>Estimated cost per mile: <strong>"+formatCurrency(trip.greyhound.costpermile)+"</strong></li>");
  $('#greyhound .summary').append("<li>"+formatDistance(trip.onewaydistance)+" x "+formatCurrency(trip.greyhound.costpermile)+" per mi: <strong>"+formatCurrency(trip.onewaydistance*trip.greyhound.costpermile)+"</strong></li>");
  $('#greyhound .summary').append("<li class='total'>Greyhound Total: <strong>"+formatCurrency(trip.greyhound.totalcost)+"</strong></li>");
    $('#greyhound .summary').append("<li>Note that this is only an estimate, consult the <a href='http://greyhound.com' target='_blank'>Greyhound website</a> for current fares.</li>");
  
  $('#greyhound .cost').html(formatCurrency(trip.greyhound.totalcost));
  $('#greyhound .time').html(formatTimeDecimal(trip.greyhound.totaltime));
  $('#greyhound .distance').html(formatDistance(trip.distance));
  
  $("#greyhound .modeLink").html("<a href='http://greyhound.com' title='Visit Greyhound Website' target='_blank'><img src='images/link.png' alt='Link' class='smallicon'>Greyhound Website</a>");
  
  //Show greyhound
  $('#greyhound').show();
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
  
  directionsOptions = {
    map: null,
    draggable: true,
    markerOptions: {
    zIndex: 100
    }
  };
  
  //Create flight polyline
  flightline = new google.maps.Polyline({
    strokeColor: "#5500CC",
    strokeOpacity: 0.5,
    strokeWeight: 5
  });

  // Create a renderer for directions and bind it to the map.
  directionsDisplay = new google.maps.DirectionsRenderer(directionsOptions);
  directionsDisplay.setMap(map);
  
  //Create Traffic Layer
  trafficLayer = new google.maps.TrafficLayer();
  
  // Create a renderer for bike directions
  directionsDisplayBike = new google.maps.DirectionsRenderer(directionsOptions);
  
  // Create a renderer for walk directions
  directionsDisplayWalk = new google.maps.DirectionsRenderer(directionsOptions);

  //Bind recalc function to 'directions_changed' event
  google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
    //Put new addresses in input box
    $('#startlocation').val(directionsDisplay.directions.routes[0].legs[0].start_address.replace(/, CA \d+, USA/g, "").replace(/, USA/g, ""));
    $('#destinationlocation').val(directionsDisplay.directions.routes[0].legs[0].end_address.replace(/, CA \d+, USA/g, "").replace(/, USA/g, ""));
    
    calculateTrip(directionsDisplay.directions);

    //Highlight results box on change
    $('#resultsWrapper').effect("highlight", {color:"#f1f1f1"}, 3000);
  });

  //Process trip
  recalc();
  
  resizeWindow();
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

function toggleTraffic(){
  if(trafficLayer.getMap()){
    trafficLayer.setMap(null);
    $("#traffic").html("Show Current Traffic Conditions");
  } else {
    trafficLayer.setMap(map);
    $("#traffic").html("Hide Traffic Conditions");
  }
}

function resizeWindow() {
  var newWindowHeight = $(window).height();
  var resultsWrapperHeight = newWindowHeight - parseInt($(".titlebar").height());
  $("#resultsWrapper").css("max-height", resultsWrapperHeight+"px");
  $("#resultsWrapper").css("height", resultsWrapperHeight+"px");
  $("#map_wrapper").css("height", newWindowHeight+"px");
  $("#map_canvas").css("height", newWindowHeight+"px");
}
    
google.setOnLoadCallback(function(){
  //If the User resizes the window, adjust the height
  $(window).bind("resize", resizeWindow);

  //Read the page's GET URL variables and process trip
  //Sample URL: ?saddr=101+15th+St,+San+Francisco&daddr=1010+Mission+St,+San+Francisco&stime=06:45&sdate=12/21/2010&etime=07:45&edate=12/21/2010
  urlVars = getUrlVars();
  if('saddr' in urlVars && 'daddr' in urlVars && 'stime' in urlVars && 'sdate' in urlVars && 'etime' in urlVars && 'edate' in urlVars){
    //We have all the variables needed to process a trip
    $("#startlocation").val(urlVars['saddr'].replace(/\+/g,' '));
    $("#departuretime").val(urlVars['stime']);
    $("#departuredate").val(urlVars['sdate']);
    $("#destinationlocation").val(urlVars['daddr'].replace(/\+/g,' '));
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
  $("#inputs").submit(function(){
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
  
  //Transit option click handler
  $('li.transitoption').live('click', function(){
    if($('.transitdetail',this).is(":hidden")){
      $('.infolink',this).html("Less Info &#9650;");
      $('div.transitdetail',this).show('medium');
    }
  });
  $('li.transitoption .infolink').live('click', function(){
    if($('.transitdetail', $(this).parent()).is(":visible")){
      $(this).html("More Info &#9660;");
      $('div.transitdetail',$(this).parent()).hide('medium');
    }
  });
  
  //Expand each mode
  $('#results .mode .expand').click(function(){
    $(this).html($('.additionalinfo',$(this).parent()).is(":visible") ? '&#9660;' : '&#9650;');
    $('.additionalinfo',$(this).parent()).toggle('fast', function(){});
  });
  
  //Initial form submit click handler
  $("#start_inputs").submit(function(){
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
    return false;
  });
 
});

