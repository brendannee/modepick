var map;
var directionsService;
var flightline;
var trafficLayer;
var markerArray = [];
var popup;
var trip = {};
var ccs = {};
var zipcar = {};
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
  
  if(type=='ccs'){
    ccs.closestMarker = {}
    var image = new google.maps.MarkerImage(
      'images/ccs.png',
      new google.maps.Size(24, 24),
      new google.maps.Point(0,0),
      new google.maps.Point(12, 12));
    for (pod in ccs_arr) {
      distanceAway = calculateDistance(ccs_arr[pod].lat,ccs_arr[pod].lon,lat,lon);
      //Check to see if this marker is the closest
      if(typeof ccs.closestMarker.distance == "undefined" || distanceAway<ccs.closestMarker.distance){
        ccs_arr[pod].distance = distanceAway;
        ccs.closestMarker = ccs_arr[pod];
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
    if(ccs.closestMarker.distance<.2){
      //Within 1000 feet, display feet
      ccs.closestMarker.distanceformatted = Math.round(ccs.closestMarker.distance*5280) + " ft";
    } else{
      //Use miles
      ccs.closestMarker.distanceformatted = Math.round(ccs.closestMarker.distance*10)/10 + " mi";
    }
    if(typeof ccs.closestMarker.name !== "undefined"){
      $('#ccsclosest').html("Nearest car: <strong>" + ccs.closestMarker.distanceformatted + "</strong> (" + ccs.closestMarker.name + " - <a href='"+ccs.closestMarker.url+"' target='_blank'>View Details</a>)");
    }

  } else if(type == 'zipcar'){
    zipcar.closestMarker = {};
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
  
  //Get basic trip stats
  trip = {};
  trip.departuredate=dates.convert(""+$('#departuredate').val()+" "+$('#departuretime').val());
  trip.returndate=dates.convert(""+$('#returndate').val()+" "+$('#returntime').val());
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
    if(trip.onewaydistance<75){
      calculateUber();
      $('#uberresult').show();
    } else {
      $('#uberresult').hide();
    }

  } else{
    //If not in SF, hide SF modes
    $('#ccsresult').hide();
    $('#uberresult').hide();
  }
  
  //Only show taxis if distance is less than 150 miles
  if(trip.onewaydistance<150){
    calculateTaxi();
    $('#taxiresult').show();
  } else{
    $('#taxiresult').hide();
  }
  
  //Only show flights if distance is greater than 150 miles
  if(trip.onewaydistance>150){
    calculateFlight(response);
  } else {
    $('#flightresult').hide();
  }
  
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
  if(trip.extramiles!=0){
     drivingdistance = trip.distance+trip.extramiles;
   } else {
     drivingdistance = trip.distance;
   }

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
  //Use YQL to scrape google maps for screenreader to get transit directions
  
  //Clear existing directions
  $("#transit .cost").html('');
  $("#transit .time").html('');
  
  //Get departure date and time
  var day;
  var month;
  var d=dates.convert(""+$('#departuredate').val()+" "+$('#departuretime').val());
  if (d.getDate()<10) {
    day="0"+d.getDate();
  } else {
    day=d.getDate();
  }
  if ((d.getMonth()+1)<10) {
    month="0"+(d.getMonth()+1);
  } else {
    month=(d.getMonth()+1);
  }
  var date = d.getFullYear() + '-' + month + '-' + day;
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
      $("#transit .summary").append("<li>"+data.query.results.p[0]+"</li>");
      
      //Loop through all transit possibilities
      for(i=1;i<(data.query.results.p.length-1);i++){
        startTime = data.query.results.p[i].a.content.replace(/\s-\s.*$/g,'');
        endTime = data.query.results.p[i].a.content.replace(/^.*\s-\s/,'');
      
        var d = new Date();
        if((parseTime(d.getHours()+":"+d.getMinutes()) - parseTime(startTime))>0){
          waitingTime = (parseTime(d.getHours()+":"+d.getMinutes()) - parseTime(startTime))/(1000*60);
        } else {
          waitingTime = (parseTime(startTime) - (parseTime(d.getHours()+":"+d.getMinutes())))/(1000*60);
        }
      
        transitTime = data.query.results.p[i].content.match(/\(([^}]+)\)/)[1];
        $("#transit .summary").append("<li class='divider'><strong>Option " + i + ":</strong></li>");
        $("#transit .summary").append("<li>Wait time: <strong>" + formatTimeDecimal(waitingTime) + "</strong></li>");
        $("#transit .summary").append("<li>Depart/Arrive: <strong>" + startTime + "/" + endTime + "</strong></li>");
        if(typeof data.query.results.p[i] == 'string' && data.query.results.p[i].substr(0,1)=='$'){
          //Fare info is provided
          $("#transit .summary").append("<li>Roundtrip fare per person: <strong>" + formatCurrency(parseFloat(data.query.results.p[i].replace(/\$/g,''))*2) + "</strong></li>");
          $("#transit .summary").append("<li>Roundtrip fare for "+trip.passengers+": <strong>" + formatCurrency(parseFloat(data.query.results.p[i].replace(/\$/g,''))*2*trip.passengers) + "</strong></li>");
          $("#transit .cost").html( formatCurrency(parseFloat(data.query.results.p[i].replace(/\$/g,''))*2*trip.passengers) );
        } else {
          $("#transit .cost").html("No Info");
          $("#transit .summary").append("<li>No fare info available</li>");
        }
      }
      $("#transit .time").html(transitTime);
      $("#transit .distance").html("N/A");
      $("#transit .modeLink").html("<a href='http://maps.google.com/maps" + data.query.results.p[1].a.href.substr(13) + "' title='See on Google Maps'><img src='images/link.png' alt='Link' class='smallicon'>Transit Directions on Google Transit</a>");
    } else{
      $("#transit .summary").append("<li>No transit information available</li>");
    }
  }
}

function calculateCCS(){
  ccs = {};
  ccs.plan = ccsplans[$('#ccsplan').val()];
  ccs.cost=0;
  ccs.latenighttime = 0;
  ccs.weekendtime = 0;
  ccs.weekendtime2 = 0;
  
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
        ccs.latenighttime += (trip.returndate-trip.departuredate)/(1000*60);
      }
      else {
        //Return after 8 AM
        ccs.latenighttime += (8*60)-((trip.departuredate-departuremidnight)/(1000*60));
      }
    } else {
      //Return is next day
      ccs.latenighttime += (8*60)-((trip.departuredate-departuremidnight)/(1000*60));
      ccs.latenighttime += (trip.returndate-returnmidnight)/(1000*60);
    }
  } else {
    //Departure is after 8 AM
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day, no late night
    } else {
      //Return is next day
      if(trip.returndate.getHours()<8){
        //depart and return before 8 AM
        ccs.latenighttime += (trip.returndate-returnmidnight)/(1000*60);
      }
      else {
        //Return after 8 AM
        ccs.latenighttime += (8*60);
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
          ccs.weekendtime += ((trip.returndate-returnmidnight)/(1000*60))-(17*60);
        }
      } else {
        //Depart after 5 PM
        ccs.weekendtime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<17){
        //depart before 5 PM
        ccs.weekendtime += (7*60);
      } else {
        //depart after 5 PM
        ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
      }
      if(trip.returndate.getHours()>=8){
        ccs.weekendtime += ((trip.returndate-returnmidnight)/(1000*60))-(8*60);
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
          ccs.weekendtime += ((trip.returndate-trip.departuredate)/(1000*60)) - ((8*60)-((trip.departuredate-departuremidnight)/(1000*60)));
        }
      } else {
        //Depart after 8 AM
        ccs.weekendtime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM, return must be before 8 AM
        ccs.weekendtime += (16*60);
      } else{
        //departure after 8 AM
        if(trip.returndate.getHours()<8){
          //return before 8 AM
          ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
        } else {
          //return after 8 AM
          ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
          ccs.weekendtime += ((trip.returndate-returnmidnight)/(1000*60))-(8*60);
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
          ccs.weekendtime += ((trip.returndate-trip.departuredate)/(1000*60)) - ((8*60)-((trip.departuredate-departuremidnight)/(1000*60)));
        }
      } else {
        //Depart after 8 AM
        ccs.weekendtime += (trip.returndate-trip.departuredate)/(1000*60);
      }
    } else {
      //Return is next day
      if(trip.departuredate.getHours()<8){
        //depart before 8 AM, return must be before 8 AM
        ccs.weekendtime += (16*60);
      } else{
        //departure after 8 AM
        ccs.weekendtime += (24*60)-((trip.departuredate-departuremidnight)/(1000*60));
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
        ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60) - ((17*60)-((trip.departuredate-departuremidnight)/(1000*60)));
      }
    } else {
      //depart after 5 PM
      ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
    }
  } else if(trip.departuredate.getDay()==6){
    //departure day is Saturday
    ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
  } else if(trip.departuredate.getDay()==0){
    //departure day is Sunday
    if(trip.returndate.getDate()==trip.departuredate.getDate()){
      //Return is same day
      ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
    } else {
      //Return is next day
      if(trip.returndate.getHours()<8){
        //return before 8 AM
        ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60);
      } else{
        //return after 8 AM
        ccs.weekendtime2 += (trip.returndate-trip.departuredate)/(1000*60) - ((trip.returndate-returnmidnight)/(1000*60)-(8*60));
      }
    }
  }

  if($('#ccsplan').val()=='sharealittle'){
    //Share a little doesn't havce late night hours so use CCS2 time
    ccs.cost+= ccs.plan.weekdayhourly*((trip.totaltime-ccs.weekendtime2)/60)+ccs.plan.weekendhourly*(ccs.weekendtime2/60);
    if((trip.totaltime-ccs.weekendtime2)>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(trip.totaltime-ccs.weekendtime2) + " x " + formatCurrency(ccs.plan.weekdayhourly) + "/hr wkday: <strong>" +  formatCurrency(ccs.plan.weekdayhourly*((trip.totaltime-ccs.weekendtime2)/60)) + "</strong></li>");
    }
    if(ccs.weekendtime2>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(ccs.weekendtime2) + " x " + formatCurrency(ccs.plan.weekendhourly) + "/hr wkend: <strong>" + formatCurrency(ccs.plan.weekendhourly*(ccs.weekendtime2/60)) + "</strong></li>");
    }
  } else {
    //Other plans have late night hours, so use CCS time
     ccs.cost+= ccs.plan.weekdayhourly*((trip.totaltime-ccs.weekendtime-ccs.latenighttime)/60)+ccs.plan.weekendhourly*(ccs.weekendtime/60)+ccs.plan.latenighthourly*(ccs.latenighttime/60);
    if((trip.totaltime-ccs.weekendtime-ccs.latenighttime)>0){
     $('#ccsresult .summary').append("<li>" + formatTimeDecimal(trip.totaltime-ccs.weekendtime-ccs.latenighttime) + " x " + formatCurrency(ccs.plan.weekdayhourly) + "/hr wkday: <strong>" + formatCurrency(ccs.plan.weekdayhourly*((trip.totaltime-ccs.weekendtime-ccs.latenighttime)/60)) + "</strong></li>");
    }
    if(ccs.weekendtime>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(ccs.weekendtime) + " x " + formatCurrency(ccs.plan.weekendhourly) + "/hr wkend: <strong>" + formatCurrency(ccs.plan.weekendhourly*(ccs.weekendtime/60)) + "</strong></li>");
    }
    if(ccs.latenighttime>0){
      $('#ccsresult .summary').append("<li>" + formatTimeDecimal(ccs.latenighttime) + " x " + formatCurrency(ccs.plan.latenighthourly) + "/hr latenight: <strong>" + formatCurrency(ccs.plan.latenighthourly*(ccs.latenighttime/60)) + "</strong></li>");
    }
  }
  //Add in Mileage
  if(trip.extramiles!=0){
    ccs.cost+= (trip.distance+trip.extramiles)*ccs.plan.mileagehourly;
    $('#ccsresult .summary').append("<li>" + (trip.distance+trip.extramiles) + " mi x " + formatCurrency(ccs.plan.mileagehourly) + " per mi: <strong>" + formatCurrency((trip.distance+trip.extramiles)*ccs.plan.mileagehourly) + "</strong></li>");
  } else {
    ccs.cost+= trip.distance*ccs.plan.mileagehourly;
    $('#ccsresult .summary').append("<li>" + trip.distance + " mi x " + formatCurrency(ccs.plan.mileagehourly) + " per mi: <strong>" + formatCurrency(trip.distance*ccs.plan.mileagehourly) + "</strong></li>");
  }
  
  $('#ccsresult .cost').html(formatCurrency(ccs.cost));
  $('#ccsresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#ccsresult .distance').html(formatDistance(trip.distance));
  $('#ccsresult .summary').append("<li class='total'>City Carshare Total: <strong>" + formatCurrency(ccs.cost) + "</strong></li>");
  
  //Check if estimated driving time exceeds trip time
  if(trip.totaltime<trip.drivingtime){
    $('#ccsresult .summary').prepend("<li class='warning'>Your estimated driving time exceeds your reservation time.</li>");
    $('#ccsresult').addClass('warning');
  } else {
    $('#ccsresult').removeClass('warning');
  }
}

function calculateZipcar(){
  zipcar = {}
  zipcar.plan = zipcarplans[$('#zipcarplan').val()];
  zipcar.cost = 0;
  zipcar.rates={};
  zipcar.rates.customHourly = $('#zipcarrate').val();
  zipcar.rates.customDaily = $('#zipcardailyrate').val();
  zipcar.time = trip.totaltime;
  
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
  estimateZipcarDayCost();
  
  if(zipcar.days>0){
    //Daily Rate
    $('#zipcarresult .summary').append("<li>" + zipcar.days + " day x " + formatCurrency(parseFloat(zipcar.rates.daily)) + "/day <strong>" + formatCurrency(parseFloat(zipcar.rates.daily)*(zipcar.days)) + "</strong></li>");
  }
  if(zipcar.hours.time>0){
    //Hourly Rate
    $('#zipcarresult .summary').append("<li>" + formatTimeDecimal(zipcar.hours.time) + " x " + formatCurrency(parseFloat(zipcar.hours.rate)) + "/hr <strong>" + formatCurrency(parseFloat(zipcar.hours.rate)*(zipcar.hours.time/60)) + "</strong></li>");
  }
  
  $('#zipcarresult .cost').html(formatCurrency(zipcar.cost));
  $('#zipcarresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#zipcarresult .distance').html(formatDistance(trip.distance));
  $('#zipcarresult .summary').append("<li class='total'>Zipcar Total <strong>" + formatCurrency(zipcar.cost) + "</strong></li>");
  
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
  
  if(isNaN(zipcar.rates.customHourly) || zipcar.rates.customHourly==''){
    //Use default zipcar hourly rates
    zipcarhour.rate = zipcar.plan.weekdayhourly;
  } else{
    //Use custom zipcar hourly rate entered by user
    zipcarhour.rate = zipcar.rates.customHourly;
  }
  
  zipcarhour.cost += zipcarhour.rate * ((zipcarhour.time - zipcar.weekendtime)/60) + zipcarhour.rate * (zipcar.weekendtime/60);
  
  return zipcarhour;
}

function estimateZipcarDayCost(){  
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
  zipcar.ceiling.days = Math.ceil(trip.totaltime / (24*60));
  zipcar.ceiling.hours = 0;
  zipcar.ceiling.cost = zipcar.ceiling.days * parseFloat(zipcar.rates.daily);
  
  //Now try a rate that is a number of days with a few trailing hours
  zipcar.floor = {}
  zipcar.floor.days = Math.floor(trip.totaltime / (24*60));
  zipcar.floor.hours = estimateZipcarHourCost();
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

function calculateTaxi(){ 
  taxicost = 0;
  
  //Taxi (assume 1.5 minute of waiting per mile)
  var taxitrafficpermile = 1.5;
  
  taxicost+= cabfares.firstfifth*2 + (cabfares.additionalfifth*((trip.distance-0.2)*5)) + cabfares.waitingminute*(trip.distance*taxitrafficpermile);
  //add tip
  var tipamount = taxicost*(cabfares.tippercent/100);
  taxicost = taxicost*(1+(cabfares.tippercent/100));

  $('#taxiresult .summary').append("<li>Flag Drop x 2: <strong>"+formatCurrency(cabfares.firstfifth*2)+"</strong></li>");
  $('#taxiresult .summary').append("<li>"+formatDistance(trip.distance)+" x $2.25 per mi: <strong>"+formatCurrency((cabfares.additionalfifth*((trip.distance-0.2)*5)))+"</strong></li>");
  $('#taxiresult .summary').append("<li>Waiting in Traffic (~"+(Math.round(trip.distance*taxitrafficpermile*10)/10)+" min): <strong>"+formatCurrency(cabfares.waitingminute*(trip.distance*taxitrafficpermile))+"</strong></li>");
  $('#taxiresult .summary').append("<li>10% Tip: <strong>"+formatCurrency(tipamount)+"</strong></li>");
  $('#taxiresult .summary').append("<li class='total'>Taxi Total: <strong>"+formatCurrency(taxicost)+"</strong></li>");
  
  $('#taxiresult .cost').html(formatCurrency(taxicost));
  $('#taxiresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#taxiresult .distance').html(formatDistance(trip.distance));
}  

function calculateUber(){ 
  ubercost = 0;
  
  //Uber (assume 1.5 minute of waiting per mile)
  var ubertrafficpermile = 1.5;
  
  ubercost+= uberfares.flag*2 + (uberfares.mileage*trip.distance) + uberfares.idleminute*(trip.distance*ubertrafficpermile);
  if(ubercost<30){
    //Minimum fare is $15 each way
    ubercost = 30;
    $('#uberresult .summary').append("<li>Minimum Fare $15 x 2: <strong>$30.00</strong></li>");
    $('#uberresult .summary').append("<li class='total'>Uber Total: <strong>$30.00</strong></li>");
  } else {
    $('#uberresult .summary').append("<li>Flag Drop x 2: <strong>"+formatCurrency(uberfares.flag*2)+"</strong></li>");
    $('#uberresult .summary').append("<li>"+formatDistance(trip.distance)+" x " + formatCurrency(uberfares.mileage) + " per mi: <strong>"+formatCurrency(uberfares.mileage*trip.distance)+"</strong></li>");
    $('#uberresult .summary').append("<li>Waiting in Traffic (~"+(Math.round(trip.distance*ubertrafficpermile*10)/10)+" min): <strong>"+formatCurrency(uberfares.idleminute*(trip.distance*ubertrafficpermile))+"</strong></li>");
    $('#uberresult .summary').append("<li class='total'>Uber Total: <strong>"+formatCurrency(ubercost)+"</strong></li>");
  }
  $('#uberresult .cost').html(formatCurrency(ubercost));
  $('#uberresult .time').html(formatTimeDecimal(trip.drivingtime));
  $('#uberresult .distance').html(formatDistance(trip.distance));
}

function calculateFlight(response){ 
  $('#flightresult .cost').html('');
  $('#flightresult .distance').html('');
  $('#flightresult .time').html('');
  flightline.setMap(null);
  var flightcost = 0;
  var originAirport ='';
  var destAirport = '';
  
  //YQL to travelmath.com for closest airports
  //https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20html%20where%20url%3D%22http%3A%2F%2Fwww.travelmath.com%2Fclosest-airport%2F37.766618%2C-122.41676%22%20and%20xpath%3D'%2F%2Fa%5B%40name%3D%22international-airports%22%5D%2F..%2Fp'&format=json&diagnostics=true&callback=cbfunc
  
  //Get URL ready
  var BASE_URI = 'http://query.yahooapis.com/v1/public/yql?q=';  
  var originAirport = BASE_URI + encodeURIComponent('select * from html where url="http://www.travelmath.com/closest-airport/'+response.routes[0].legs[0].start_location.lat()+','+response.routes[0].legs[0].start_location.lng()+'" and xpath=\'//a[@name="international-airports"]/../p\'') + '&format=json';
  var destAirport = BASE_URI + encodeURIComponent('select * from html where url="http://www.travelmath.com/closest-airport/'+response.routes[0].legs[0].end_location.lat()+','+response.routes[0].legs[0].end_location.lng()+'" and xpath=\'//a[@name="international-airports"]/../p\'') + '&format=json';
  
  var originAirports = [];
  var destAirports = [];
  
  flightdistance = calculateDistance(response.routes[0].legs[0].end_location.lat(), response.routes[0].legs[0].end_location.lng(),response.routes[0].legs[0].start_location.lat(), response.routes[0].legs[0].start_location.lng());
  
   // Request that YSQL string, and run a callback function.  
  $.getJSON(originAirport, cbfunc1);  
  function cbfunc1(data) {
    // If we have something to work with...  
    if(data.query.count > 0){
      results = data.query.results.p[1].a
      for(i in results){
        //Filter Results down to airport codes
        if(results[i].content.length<4 && results[i].content != undefined){
          //Seems like an airport code
          originAirports.push(results[i].content);
        }
      }
      
      $.getJSON(destAirport, cbfunc2);  
      function cbfunc2(data) {
        // If we have something to work with...  
        if(data.query.count > 0){
          results = data.query.results.p[1].a
          for(i in results){
            //Filter Results down to airport codes
            if(results[i].content.length<4 && results[i].content != undefined){
              //Seems like an airport code
              destAirports.push(results[i].content);
            }
          }
          var originAirportString = '';
          var destAirportString = '';
          //Prep airports for search syntax
          for(i in originAirports){
            originAirportString += originAirports[i] + '|';
          }

          for(i in destAirports){
            destAirportString += destAirports[i] + '|';
          }

          //Try hotwire API for Historical Flight Search
         //http://api.hotwire.com/v1/tripstarter/hotel?apikey='+hotwireAPIkey+'&price=*~75&sort=date&limit=1&format=json&jsoncallback=? 
          var startdate = new Date();
         startdate.setDate(trip.departuredate.getDate()-20)
         var startdateformatted = (startdate.getMonth()+1) + "/" + startdate.getDate() + "/" + startdate.getFullYear();
         $.getJSON('../php/hotwire.php?origin='+originAirportString.slice(0, -1)+'&dest='+destAirportString.slice(0, -1)+'&startdate='+startdateformatted,
           function(data) {
             if(data != null){
               if(data.Result != undefined){
                 if(data.Result.AirPricing != undefined){
                   flightcost = data.Result.AirPricing.AveragePrice;
                   originAirport = data.Result.AirPricing.OrigAirportCode;
                   destAirport = data.Result.AirPricing.DestinationAirportCode;

                   $('#flightresult .summary').append("<li>Based on Hotwire's historical average flight prices for week of " + startdateformatted + "</li>");
                   $('#flightresult .summary').append("<li>Origin Airport: <strong><span id='originAirport'>" + originAirport + "</span></strong></li>");
                   $('#flightresult .summary').append("<li>Destination Airport: <strong><span id='destAirport'>" + destAirport + "</span></strong></li>");
                   $('#flightresult .summary').append("<li>Direct Flight duration: <strong>" + formatTimeDecimal(flightdistance/(550/60)+45) + "</strong></li>");
                   $('#flightresult .summary').append("<li>Oneway Flight Cost per person: <strong>" + formatCurrency(flightcost) + "</strong></li>");
                   $('#flightresult .summary').append("<li class='total'>Roundtrip Flight Cost for " + trip.passengers + ": <strong>" + formatCurrency(flightcost*2*trip.passengers) + "</strong></li>");
                   $('#flightresult .cost').html(formatCurrency(flightcost*2*trip.passengers));
                   //Flight Time equation hours = .75 * dist/550

                   $('#flightresult .time').html(formatTimeDecimal(flightdistance/(550/60)+45));
                   $('#flightresult .distance').html(formatDistance(flightdistance*2));
                   $('#flightresult .modeLink a').attr('href',data.Result.AirPricing.Url);

                   //Get airport info from freebase
                                        $.getJSON('http://api.freebase.com/api/service/mqlread?queries={%22q0%22:{%22query%22:[{%22id%22:null,%22name%22:null,%22type%22:%22/aviation/airport%22,%22/aviation/airport/iata%22:%22'+originAirport+'%22,%22/common/topic/webpage%22:[{}]}]},%22q1%22:{%22query%22:[{%22id%22:null,%22name%22:null,%22type%22:%22/aviation/airport%22,%22/aviation/airport/iata%22:%22'+destAirport+'%22,%22/common/topic/webpage%22:[{}]}]}}&callback=?',   
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
  
  //Expand each mode
  $('#results .mode .expand').click(function(){
    if($('.additionalinfo',$(this).parent()).is(":visible")){
      $(this).html('&#9660;');
    } else {
      $(this).html('&#9650;');
    }
    
    $('.additionalinfo',$(this).parent()).toggle('fast', function(){});
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

