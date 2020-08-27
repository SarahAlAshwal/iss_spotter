/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');
const url = 'https://api.ipify.org?format=json';

const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request(url,(error,response,body) => {
    if (error) {
      callback(error, null);
  
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    callback(null,JSON.parse(body).ip);
  });
};

const fetchCoordsByIP = function(ip, callback) {
  const url = `https://ipvigilante.com/${ip}`;
  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    // const result = JSON.parse(body);
    // const latitude = result.data.latitude;
    // const longitude = result.data.longitude;

    const { latitude, longitude } = JSON.parse(body).data;
    callback(null, {latitude , longitude});
  });
};

const fetchISSFlyOverTimes = function(coord,callback) {
  const url = `http://api.open-notify.org/iss-pass.json?lat=${coord.latitude}&lon=${coord.longitude}`;
  request(url, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching ISS info. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = JSON.parse(body).response;
    callback(null, data);

  });
};

/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */ 
const nextISSTimesForMyLocation = function(callback) {
  fetchMyIP((error, ip) => {
    if (error) {
      console.log("It didn't work!" , error);
      return;
    }
    //console.log('It worked! Returned IP:' , ip);
    fetchCoordsByIP(ip, (error,coords) => {
      if (error) {
        console.log('Error in coordination API!', error);
        return;
      }
      //console.log('Coordination API worked: ', coords);
      fetchISSFlyOverTimes(coords, (error, data) => {
        if (error) {
          console.log("It didn't work!" , error);
          return;
        }
        callback(null, data);
      });
    });
  });
}

//module.exports = {fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes};
module.exports = {nextISSTimesForMyLocation};

