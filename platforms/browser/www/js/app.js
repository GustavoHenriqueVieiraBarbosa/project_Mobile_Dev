// Dom7
var $$ = Dom7;

// Framework7 App main instance
var app  = new Framework7({
  root: '#app', // App root element
  id: 'io.framework7.testapp', // App bundle ID
  name: 'Framework7', // App name
  theme: 'auto', // Automatic theme detection
  // App root data
 
  // App root methods
  methods: {
    helloWorld: function () {
      app.dialog.alert('Hello World!');
    },
  },
  // App routes
  routes: routes,
});


//starts here the code

$$(document).on('deviceready', function() {
getLocation();
loadRead();
});

//Starting the main function
function getLocation() {
  navigator.geolocation.getCurrentPosition(geoCallback, onError);
}
function geoCallback(position) {
  var lat = position.coords.latitude;
  var long = position.coords.longitude;
  document.getElementById("latitude").innerHTML = "Lat =>" + lat;
  document.getElementById("longitude").innerHTML = "Long =>" + long;
  openCage(lat, long);
  openWeatherApi(lat,long);
  initMap(lat, long);

}
function onError(error) {
  alert("code: " + error.code + "\n" + "message: " + error.message + "\n");
}


//Here Starts the OpenCage API where it should show where the person is as the app is opened
function openCage(lat, long) {
  var http = new XMLHttpRequest();
  const url = 'https://api.opencagedata.com/geocode/v1/json?q=' + lat + '+' + long + '&key=1a7237d93cb84489b2d9b4728c1a7423';
  http.open("GET", url);
  http.setRequestHeader("Content-Type", "text/xml");
  http.send();
  http.onreadystatechange = (e) => {
   if (http.readyState == 4) {
     if (http.status == 200) {
      var response = http.responseText;
      var responseJSON = JSON.parse(response);
      var country = responseJSON.results[0].components.country;
      var city = responseJSON.results[0].components.city;
      var currentCurrency = responseJSON.results[0].annotations.currency.iso_code;
      document.getElementById("city").innerHTML = 'City => ' + city;
      document.getElementById("country").innerHTML = 'Country => ' + country;
      document.getElementById("position").value = currentCurrency;
      document.getElementById("localcurrency").innerHTML = "Local $ => " + currentCurrency;
      document.getElementById("iso_code").value = currentCurrency;
     }
   }
  }
}

//Here Starts the APILayer to convert from USD to the localCurrency amount
function currencyUsd() {
  var localCurrency = document.getElementById('iso_code').value;
  var http = new XMLHttpRequest();
  const url = 'http://www.apilayer.net/api/live?access_key=96eae04229a4ef5399865cafcd676b84';
  http.open("GET", url);
  http.setRequestHeader("Content-Type", "text/xml");
  http.send();
  http.onreadystatechange = (e) => {
   if (http.readyState == 4) {
     if (http.status == 200) {
      var response = http.responseText;
      var responseJSON = JSON.parse(response);
      var currency = responseJSON.quotes["USD" + localCurrency];
      var convert = document.getElementById("usd").value * currency;
      convert = convert.toFixed(2);
      document.getElementById("1").innerHTML = convert + ' €';
   
      }
    }
  }
}

//Here Starts the APILayer to convert from the localCurrency amount to USD 


function currencytoUSD(){

  var localCurrency = document.getElementById('iso_code').value;
  var http = new XMLHttpRequest();
  const url = 'http://www.apilayer.net/api/live?access_key=96eae04229a4ef5399865cafcd676b84';
  http.open("GET", url);
  http.setRequestHeader("Content-Type", "text/xml");
  http.send();
  http.onreadystatechange = (e) => {
   if (http.readyState == 4) {
     if (http.status == 200) {
      var response = http.responseText;
      var responseJSON = JSON.parse(response);
      var currency = responseJSON.quotes["USD" + localCurrency];
      
     document.getElementById("2").innerHTML =  (document.getElementById("currencyEur").value / currency).toFixed(2) + "$";
     }
    }
  }
}


//Here Starts the OpenWeather API where it will give the local weather at the time that the app is opened

function openWeatherApi(lat, long){
  var http = new XMLHttpRequest();
  const url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + long + '&APPID=7371d0729174f7e3a3a5d9e9002fbfeb&units=metric';
  http.open("GET", url);
  http.setRequestHeader("Content-Type", "text/xml");
  http.send();
  http.onreadystatechange = (e) => {
   if (http.readyState == 4) {
     if (http.status == 200) {
      let response = http.responseText;
      let responseJSON = JSON.parse(response);
      let temperature = responseJSON.main.temp;
      let weather = responseJSON.weather[0].main;
      document.getElementById('weather').innerHTML = "Temperature: " + temperature + " °C" + "</br>" +  "Weather: " + weather;

      }
    }
  }
};

//here starts the file system
function tryingFile(){

  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallback, onError);
 
}

function fileSystemCallback(fs){

  // Name of the file I want to create
  var fileToCreate = "newPersistentFile.txt";

  // Opening/creating the file
  fs.root.getFile(fileToCreate, fileSystemOptionals, getFileCallback, onError);
}

var fileSystemOptionals = { create: true, exclusive: false };

function getFileCallback(fileEntry){
 
  var text = "Dublin$$Ireland##Liverpool$$England";
      
   //document.getElementById('content').innerHTML + ',' +  document.getElementById('city').innerHTML;
  
  var dataObj = new Blob([text], { type: 'text/plain' });
  // Now decide what to do
  // Write to the file
  writeFile(fileEntry, dataObj);

  // Or read the file
  readFile(fileEntry);
}

// Let's write some files
function writeFile(fileEntry, dataObj) {

  // Create a FileWriter object for our FileEntry (log.txt).
  fileEntry.createWriter(function (fileWriter) {
      //fileWriter.truncate(0);
      fileWriter.write(dataObj);

      fileWriter.onwriteend = function() {
          console.log("Successful file write...");
      };

      fileWriter.onerror = function (e) {
          console.log("Failed file write: " + e.toString());
      };

  });
}

// Let's read some files
function readFile(fileEntry) {

  // Get the file from the file entry
  fileEntry.file(function (file) {
      
      // Create the reader
      var reader = new FileReader();
      reader.readAsText(file);

      reader.onloadend = function() {

          console.log("Successful file read: " + this.result);
          console.log("file path: " + fileEntry.fullPath);


          formatText(this.result);

      };

  }, onError);
}

function onError(msg){
  console.log(msg);
}


// the Map starts here 
function initMap(lat, long) {
  var cct = {lat: lat, lng: long};
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 13, center: cct});
  var marker = new google.maps.Marker({position: cct,map: map});   
  google.maps.event.addListener(map, 'dblclick', function(event) {
  updateMap(event.latLng, event.latLng.lat(), event.latLng.lng());
  }); 


}

//Updating the map when it is double clicked
function updateMap(latLong, latitude, longitude) {
  var location = latLong;
  var map = new google.maps.Map(document.getElementById('map'), { zoom: 13, center: location});
  var marker = new google.maps.Marker({position: location, map: map});   
  google.maps.event.addListener(map, 'dblclick', function(event) {
    updateMap(event.latLng, event.latLng.lat(), event.latLng.lng());
    }); 
    openCage(latitude, longitude);
}

//Creating the places that was visited when clicked on the map
function formatText(text) {
document.getElementById('content').innerHTML = "";
var place = text.split("##");
var html = "";
console.log(place);

//For loop for display the city and country
for(var i=0; i < place.length; i++)
{
  var city = place[i].split("$$");
  console.log(city);

 //creating a HTML list to a display the city and country 
 html +='<li class="item-content">';
 html +='<div class="item-inner">';
 html +='<div class="item-title-row">';
 html +='<div class="item-title">'+ city[0]+'</div>';
 html +='</div>';
 html +='<div class="item-subtitle">'+ city[1]+'</div>';
 html +='</div>';
 html +='</li>';


}
document.getElementById('content').innerHTML  = html;

}


//Reading the pre made cities

function loadRead(){

  window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, fileSystemCallback, onError);

  function fileSystemCallback(fs){

    // Name of the file I want to create
    var fileToCreate = "newPersistentFile.txt";
  
    // Opening/creating the file
    fs.root.getFile(fileToCreate, fileSystemOptionals, getFileCallback, onError);
  }
  
  function getFileCallback(fileEntry){
    readFile(fileEntry);
  }
  
  // Let's write some files
  
  
  // Let's read some files
  function readFile(fileEntry) {
  
    // Get the file from the file entry
    fileEntry.file(function (file) {
        
        // Create the reader
        var reader = new FileReader();
        reader.readAsText(file);
  
        reader.onloadend = function() {
  
            console.log("Successful file read: " + this.result);
            console.log("file path: " + fileEntry.fullPath);
            
  
            formatText(this.result);
  
        };
  
    }, onError);
  }
  
  function onError(msg){
    console.log(msg);
  }
  
  

}