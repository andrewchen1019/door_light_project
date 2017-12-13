var XMLHTTPRequest = require("xmlhttprequest").XMLHttpRequest;
var logIn = new XMLHTTPRequest();
var deviceID = new XMLHTTPRequest();
var lightOn = new XMLHTTPRequest();
var SRSSTimes = new XMLHTTPRequest();
var url = "https://api.gethook.io/v1";
var lat = XXXXX;
var long = XXXXX;
var currentTime = new Date();
var sixAMTime = new Date();
var midnightTime = new Date();
sixAMTime.setHours(6,0,0,0);
midnightTime.setHours(0,0,0,0);


//Set object for storing sunrise and sunset times
function sunriseSunset(sunrise, sunset){
  this.sunrise = null;
  this.sunset = null;
}

//Set object for storing tokens from Hook
function deviceAction(userToken, deviceToken){
  this.userToken = null;
  this.deviceToken = null;
}

//Parses Hook API response
function parseResponse(response){
  //console.log(response);
  if(response.data.name == 'user'){
    return response.data.token;
  }
  for(i = 0; response.data[i] != undefined; i++){
    if(response.data[i].device_name == 'Main Room Light'){
      return response.data[i].device_id;
    }
  }
}

var lampOn = new deviceAction(null, null);
var todaySRSS = new sunriseSunset(null, null);

//Calls Sunset-Sunrise API from https://api.sunrise-sunset.org/
//Also sets the milliseconds of time from Unix Epoch for sunset and sunrise
SRSSTimes.open("GET", "https://api.sunrise-sunset.org/json?lat=" + lat + "&lng=" + long + "&date=2017-04-27&formatted=0", false);
SRSSTimes.send();
var todaySRSSParse = JSON.parse(SRSSTimes.responseText);
sunriseSunset.sunrise = Date.parse(todaySRSSParse.results.sunrise);
sunriseSunset.sunset = Date.parse(todaySRSSParse.results.sunset);

//Calls Hook API for user token
logIn.open("POST", url + "/user/login", false);
logIn.send('{"username":"user", "password":"pass"}');
lampOn.userToken = parseResponse(JSON.parse(logIn.responseText));

//Calls Hook API for device token, in this case the room light
deviceID.open("GET", url + "/device/listing?token=" + lampOn.userToken, false);
deviceID.send();
lampOn.deviceToken = parseResponse(JSON.parse(deviceID.responseText));


lightOn.open("GET", url + "/device/trigger/" + lampOn.deviceToken + "/on?token=" + lampOn.userToken, false);
lightOn.send();

//The if loop determines when to turn light on based on the following parameters:
//1) If the time is 30 mins (180000 ms) before sunset
//2) if the time is between 12:00AM and 6:00AM
if(currentTime.getTime() > sunriseSunset.sunset - 1800000 || currentTime.getTime() > Date.parse(midnightTime) && currentTime.getTime() < Date.parse(sixAMTime)){
  console.log("It is after 30 mins before sunset.  Allow light to turn on");
  lightOn.open("GET", url + "/device/trigger/" + lampOn.deviceToken + "/on?token=" + lampOn.userToken, false);
  lightOn.send();
  var lightOnParse = JSON.parse(lightOn.responseText);
  if(lightOnParse.return_value == 1){
    console.log("Action has been executed");
  }
}
//The else if loop determines when to turn light off based on the following parameters:
//1) It is after 6:00AM
//2) It is before 30 mins before sunset.
else if(currentTime.getTime() > Date.parse(sixAMTime) && currentTime.getTime() < sunriseSunset.sunset - 1800000){
  console.log("It is after 6:00 PM.  Turn light off when leaving");
  lightOn.open("GET", url + "/device/trigger/" + lampOn.deviceToken + "/off?token=" + lampOn.userToken, false);
  lightOn.send();
  var lightOnParse = JSON.parse(lightOn.responseText);
  if(lightOnParse.return_value == 1){
    console.log("Action has been executed");
  }
}
