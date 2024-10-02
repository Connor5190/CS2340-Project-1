let map;
let center;
let latitude;
let longitude;
let searchValue = '';
let selectedRating = 3; // Default to 3 stars and up
let selectedRadius = 15000;
let markers = [];

const distanceFilter = document.getElementById('distanceFilter');
const searchBar = document.getElementById('searchBar');
const ratingFilter = document.getElementById('ratingFilter');
const placesContainer = document.getElementById('detailsPage');

// Function to update the selectedRating when the dropdown value changes
ratingFilter.addEventListener('change', function() {
    selectedRating = parseFloat(ratingFilter.value); // Convert the value to a number
    console.log("Selected rating:", selectedRating);

    // Optionally trigger a new search with the updated rating
    findPlaces();
});

distanceFilter.addEventListener('change', function() {
    selectedRadius = parseFloat(distanceFilter.value);
    console.log("Selected distance:", selectedRadius);

    findPlaces();
})

// Function to get the input value
function getSearchValue(event) {
    if (event.key === "Enter") { // Check if the pressed key is Enter
        searchValue = searchBar.value; // Get the current value of the input
        // searchBar.value = '';
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

  clearMarkers();

  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const request = {
    textQuery: searchValue,
    fields: ["displayName", "location", "businessStatus", "formattedAddress", 'priceLevel'],
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

    placesContainer.innerHTML = "";

    // Loop through and get all the results.
    places.forEach((place) => {
      const markerView = new AdvancedMarkerElement({
        map,
        position: place.location,
        title: place.displayName,
      });

      markers.push(markerView);

      getPlaceDetails(place.id, markerView);

      bounds.extend(place.location);
      console.log(place);
    });
    map.fitBounds(bounds);
  } else {
    console.log("No results");
  }
}

function getPlaceDetails(placeId, markerView) {
    const service = new google.maps.places.PlacesService(map); // Initialize PlacesService with the map

    const detailsRequest = {
        placeId: placeId,
        fields: ["website", "opening_hours", "formatted_phone_number", "formatted_address", "rating", "name", "photos"], // Fields for Place Details
    };

    service.getDetails(detailsRequest, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("Place details:", place);

            let infoWindow = new google.maps.InfoWindow;

            const contentString = `
            <div>
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 5px;">
                    <h1 style="margin: 0; text-align: center; flex-grow: 1;">${place.name}</h1>
                    <button style=" 
                                    background-color: #edd2db; /* Pink background */
                                    color: white; /* Heart color */
                                    border: 2px solid #cca7a7; /* Remove default border */
                                    border-radius: 50%; /* Make it circular */
                                    width: 40px; /* Button width */
                                    height: 40px; /* Button height */
                                    font-size: 16px; /* Heart icon size */
                                    cursor: pointer; /* Pointer cursor on hover */
                                    display: flex; /* Center the heart */
                                    justify-content: center; /* Center horizontally */
                                    align-items: center; /* Center vertically */
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
                                    transition: transform 0.2s;"
                                    >❤️</button>
                </div>
                <p><strong>Address:</strong> ${place.formatted_address || 'No address available'}</p>
                <p><strong>Rating:</strong> ${place.rating || 'No rating available'}</p>
                <p><strong>Phone:</strong> ${place.formatted_phone_number || 'No phone number available'}</p>
                <p><strong>Website:</strong> ${place.website ? `<a href="${place.website}" target="_blank">Visit website</a>` : 'No website available'}</p>
                ${place.photos && place.photos.length > 0 ? `<img src="${place.photos[0].getUrl()}" alt="Image of ${place.name}" style="width:100px;height:auto;"/>` : ''}
            </div>`;

            markerView.addListener('click', () => {
                infoWindow.setContent(contentString);
                infoWindow.open(map, markerView);
            });

            const placeDiv = document.createElement("div");
            placeDiv.className = "placeDiv"; // Add a class for styling
            placeDiv.innerHTML = `
                <h4>* ${place.name} - ${place.formatted_address}</h4>
            `;

            placeDiv.onclick = function (){
                window.location.href = `/details/${placeId}/`;
            }

            // Append the new place div to the parent container
            placesContainer.appendChild(placeDiv);
        } else {
            console.log("Failed to get place details. Status:", status);
        }
    });
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null); // Remove marker from map
    }
    markers = []; // Clear the array of markers
}


initMap();

