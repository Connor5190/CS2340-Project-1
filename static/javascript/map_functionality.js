let map;
let center;
let latitude;
let longitude;
let searchValue = '';
let selectedRating = 3; // Default to 3 stars and up

const searchBar = document.getElementById('searchBar');
const ratingFilter = document.getElementById('ratingFilter');

// Function to update the selectedRating when the dropdown value changes
ratingFilter.addEventListener('change', function() {
    selectedRating = parseFloat(this.value); // Convert the value to a number
    console.log("Selected rating:", selectedRating);

    // Optionally trigger a new search with the updated rating
    findPlaces();
});

// Function to get the input value
function getSearchValue(event) {
    if (event.key === "Enter") { // Check if the pressed key is Enter
        searchValue = searchBar.value; // Get the current value of the input
        searchBar.value = '';
        findPlaces();// Output the value (or use it as needed)
    }
}

// Add a keydown event listener to trigger the function on hitting Enter
searchBar.addEventListener('keydown', getSearchValue);

async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;

              const userPosition = { lat: latitude, lng: longitude };

              map = new Map(document.getElementById("map"), {
                center: userPosition,
                zoom: 11,
                mapId: "DEMO_MAP_ID",
              });
          },
          (error) => {
              console.error("Error retrieving location", error);
          }
      );
  } else {
      alert("Geolocation is not supported by this browser.");
  }
}

async function findPlaces() {
  if (!searchValue) {
        console.log("No search value provided.");
        return;
    }

  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const request = {
    textQuery: searchValue,
    fields: ["displayName", "location", "businessStatus"],
    includedType: "restaurant",
    locationBias: { lat: latitude, lng: longitude },
    isOpenNow: true,
    language: "en-US",
    maxResultCount: 20,
    minRating: selectedRating,
    region: "us",
    useStrictTypeFiltering: false,
  };
  //@ts-ignore
  const { places } = await Place.searchByText(request);

  if (places.length) {
    console.log(places);

    const { LatLngBounds } = await google.maps.importLibrary("core");
    const bounds = new LatLngBounds();

    // Loop through and get all the results.
    places.forEach((place) => {
      const markerView = new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
      });

      bounds.extend(place.location);
      console.log(place);
    });
    map.fitBounds(bounds);
  } else {
    console.log("No results");
  }
}

initMap();

