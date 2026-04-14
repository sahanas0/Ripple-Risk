/* 
This program is the logic of the main page. It first gets the longitude and latitude of the inputted zip using Nominatim
and inputs those parameters to FEMA's official map server. FEMA returns the FLD Zone, and if it is high, the program outputs
so.
*/

document.getElementById("continue").addEventListener("click", lookupZip);

async function lookupZip() {
  const zip = document.getElementById("enterZip").value.trim();
  const result = document.getElementById("result");

  /* Checking if the zip is 5 characters long */
  if (zip.length !== 5 || isNaN(zip)) {
    result.textContent = "Please enter a valid 5-digit ZIP code.";
    return;
  }

  try {
    /* Using the zip code, I am using Nominatim's open street map to find the latitude and longitude */
    const nominatimURL = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=USA&format=json`;
    let message = "";

    const geoResponse = await fetch(nominatimURL);
    const geoData = await geoResponse.json();

    /* If no data is returned, it is not a real/valid zip code */
    if (geoData.length === 0) {
      result.textContent = "ZIP code not found.";
      return;
    }

    const lat = geoData[0].lat;
    const lng = geoData[0].lon;

    /* Error checking the coordinates w/ the console in browser */
    console.log("Coordinates:", lat, lng);

    /* Using FEMA map server data to get the zone based on the latitude and longitude of the zip code */
    const femaURL = `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE&returnGeometry=false&f=json`;

    const femaResponse = await fetch(femaURL);
    const femaData = await femaResponse.json();

    let zone = "X"; // default low risk
    if (femaData.features && femaData.features.length > 0) {
      zone = femaData.features[0].attributes.FLD_ZONE;
    }

    console.log("Flood Zone:", zone);
    
    /* The program outputs the corresponding message to the flood zone returned by FEMA */
    if (zone === "AE" || zone === "A" || zone === "AH" || zone === "AO" || zone === "AR" || zone === "A99" || zone === "V" || zone === "VE") {
      message = `High Risk of Flood ⚠️ Zone: ${zone} `;
    } 
    else if (zone === "D") {
      message = `Unknown Risk of Flood at This Time 🌦️ Zone: ${zone} `;
    } else {
      message = `Low Risk of Flood ☀️ Zone: ${zone}`;
    }

    result.textContent = message;

  } catch (error) {
    console.error(error);
    result.textContent = "Something went wrong. Please try again.";
  }
}

function goToNextPage(nextPage) {
  window.location.href = nextPage;
}