document.getElementById("continue").addEventListener("click", lookupZip);

async function lookupZip() {
  const zip = document.getElementById("enterZip").value.trim();
  const result = document.getElementById("result");

  // Validate ZIP
  if (zip.length !== 5 || isNaN(zip)) {
    result.textContent = "Please enter a valid 5-digit ZIP code.";
    return;
  }

  try {
    // --- STEP 1: ZIP → LAT/LNG using Nominatim ---
    const nominatimURL = `https://nominatim.openstreetmap.org/search?postalcode=${zip}&country=USA&format=json`;

    const geoResponse = await fetch(nominatimURL);
    const geoData = await geoResponse.json();

    if (geoData.length === 0) {
      result.textContent = "ZIP code not found.";
      return;
    }

    const lat = geoData[0].lat;
    const lng = geoData[0].lon;

    console.log("Coordinates:", lat, lng);

    // --- STEP 2: FEMA Flood Zone ---
    const femaURL = `https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=FLD_ZONE&returnGeometry=false&f=json`;

    const femaResponse = await fetch(femaURL);
    const femaData = await femaResponse.json();

    let zone = "X"; // default low risk
    if (femaData.features && femaData.features.length > 0) {
      zone = femaData.features[0].attributes.FLD_ZONE;
    }

    console.log("Flood Zone:", zone);

    // --- Display result nicely ---
    let message = "";

    if (zone === "AE" || zone === "A") {
      message = `High Risk of Flood ⚠️ Zone: ${zone} `;
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