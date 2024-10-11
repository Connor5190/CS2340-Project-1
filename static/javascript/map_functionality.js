let map;
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
const csrftoken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

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
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
          (position) => {
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;

              const userPosition = { lat: latitude, lng: longitude };

              map = new Map(document.getElementById("map"), {
                center: userPosition,
                zoom: 15,
                mapId: "DEMO_MAP_ID",
              });

                // Create a new instance of the PlacesService using the map instance
                const service = new google.maps.places.PlacesService(map);

                const request = {
                  location: userPosition,
                  type: "restaurant",
                  rankBy: google.maps.places.RankBy.DISTANCE,
                };

                service.nearbySearch(request, function (results, status) {
                  if (status === google.maps.places.PlacesServiceStatus.OK) {
                    for (let i = 0; i < results.length && i < 20; i++) {
                      const place = results[i];
                      const placeId = place.place_id;

                      // Proceed with the marker creation and place details
                      const placeMarker = new AdvancedMarkerElement({
                        position: place.geometry.location,
                        map: map,
                        title: place.name,
                      });

                      markers.push(placeMarker);

                          const service = new google.maps.places.PlacesService(map); // Initialize PlacesService with the map

                            const detailsRequest = {
                                placeId: placeId,
                                fields: ["website", "opening_hours", "formatted_phone_number", "formatted_address", "rating", "name", "photos", "geometry", "type"], // Fields for Place Details
                            };



                            service.getDetails(detailsRequest, (place, status) => {
                                if (status === google.maps.places.PlacesServiceStatus.OK) {
                                    console.log("Place details:", place);

                                    let infoWindow = new google.maps.InfoWindow;

                                    const contentString = `
                                    <div>
                                        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 5px;">
                                            <h1 style="margin: 0; text-align: center; flex-grow: 1;">${place.name}</h1>
                                            <button class="favorite-button" 
                                            data-place-id="${placeId}" 
                                            data-name="${place.name}"
                                            data-address="${place.formatted_address}"
                                            data-rating="${place.rating}"
                                            data-open-hours="${place.opening_hours}"
                                            data-latitude="${place.geometry.location.lat()}"
                                            data-longitude="${place.geometry.location.lng()}"
                                            data-website="${place.website}"
                        
                                            style=" 
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

                                    placeMarker.addListener('click', () => {
                                        infoWindow.setContent(contentString);
                                        infoWindow.open(map, placeMarker);
                                    });

                                    const placeDiv = document.createElement("div");
                                    placeDiv.className = "placeDiv"; // Add a class for styling
                                    placeDiv.innerHTML = `
                                        <h4><strong>${place.name}</strong></h4>
                                        <h5>${place.formatted_address}</h5>
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

                            //end of added function
                    }
                  } else {
                    console.error("Nearby search failed due to:", status);
                  }
                });


                //end of new code
          }, (error) => {
              console.error("Error retrieving location", error);
          }
      );
  } else {
      alert("Geolocation is not supported by this browser.");
  }
}

async function findPlaces() {
  clearMarkers(); // Clear existing markers

  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  console.log(selectedRadius);

  // Ensure selectedRating is defined and has a value
  if (typeof selectedRating !== 'number' || selectedRating < 0 || selectedRating > 5) {
    console.error("Invalid selectedRating. It should be a number between 0 and 5.");
    return; // Exit the function if the rating is invalid
  }

  // Define the search request for nearby places
  const request = {
    location: { lat: latitude, lng: longitude }, // Use the current user location
    radius: selectedRadius, // Use the selected radius from the distance filter
    type: "restaurant", // We're looking for restaurants
    openNow: true, // Only include places that are currently open
    minPriceLevel: 0, // Optional: Filter based on price (0 = free, 4 = very expensive)
    maxPriceLevel: 4,
  };

  // Use the PlacesService to perform a nearby search
  const service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      console.log("Radius used for search:", request.radius); // Check the radius
      console.log("Number of results before filtering:", results.length);
      console.log("Results before filtering by rating:", results);

      const { LatLngBounds } = google.maps;
      const bounds = new LatLngBounds();
      placesContainer.innerHTML = ""; // Clear previous results

      // Filter results by rating
      const filteredResults = results.filter(place => place.rating >= selectedRating);
      console.log("Number of results after filtering by rating:", filteredResults.length);

      // Only proceed if there are results after filtering
      if (filteredResults.length > 0) {
        filteredResults.forEach((place) => {
          console.log("Creating marker for:", place.name); // Log the place name

          const markerView = new AdvancedMarkerElement({
            map,
            position: place.geometry.location,
            title: place.name,
          });

          markers.push(markerView);

          getPlaceDetails(place.place_id, markerView); // Fetch details for each place

          bounds.extend(place.geometry.location); // Adjust the map bounds
        });

        map.fitBounds(bounds); // Adjust map view to include all markers
      } else {
        console.log("No results found after filtering by rating.");
        clearMarkers(); // Ensure markers are cleared if no results
      }
    } else {
      // Clear previous results, but don't change the bounds
      console.log("No results found or search failed.");
      placesContainer.innerHTML = ""; // Clear previous results
      clearMarkers(); // Ensure all markers are cleared
    }
  });
}




function getPlaceDetails(placeId, markerView) {
    const service = new google.maps.places.PlacesService(map); // Initialize PlacesService with the map

    const detailsRequest = {
        placeId: placeId,
        fields: ["website", "opening_hours", "formatted_phone_number", "formatted_address", "rating", "name", "photos", "geometry", "type"], // Fields for Place Details
    };



    service.getDetails(detailsRequest, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("Place details:", place);

            let infoWindow = new google.maps.InfoWindow;

            const contentString = `
            <div>
                <div style="display: flex; justify-content: center; gap: 20px; margin-top: 5px;">
                    <h1 style="margin: 0; text-align: center; flex-grow: 1;">${place.name}</h1>
                    <button class="favorite-button" 
                    data-place-id="${placeId}" 
                    data-name="${place.name}"
                    data-address="${place.formatted_address}"
                    data-rating="${place.rating}"
                    data-open-hours="${place.opening_hours}"
                    data-latitude="${place.geometry.location.lat()}"
                    data-longitude="${place.geometry.location.lng()}"
                    data-website="${place.website}"

                    style=" 
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
                <h4><strong>${place.name}</strong></h4>
                <h5>${place.formatted_address}</h5>
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

const mapContainer = document.getElementById('map');
mapContainer.addEventListener('click', (event) => {
    if (event.target.matches('.favorite-button')) {
        console.log("Makes it into here");
        const placeId = event.target.dataset.placeId; // Correctly extracting placeId
        const placeName = event.target.dataset.name;   // Correctly extracting name
        const placeAddress = event.target.dataset.address; // Correctly extracting address
        const placeRating = String(event.target.dataset.rating); // Correctly extracting placeId
        const placeOpenHours = event.target.dataset.openHours;   // Correctly extracting name
        const placeLatitude = parseFloat(event.target.dataset.latitude); // Correctly extracting address
        const placeLongitude = parseFloat(event.target.dataset.longitude); // Correctly extracting address
        const placeWebsite = event.target.dataset.website; // Correctly extracting address



        console.log("Place ID:", placeId);
        console.log("Place Name:", placeName);
        console.log("Place Address:", placeAddress);
        console.log("Place Rating:", placeRating);

        console.log("Maybe the addFavorite function call.");
        addFavorite(placeId, placeName, placeAddress, placeRating, placeOpenHours, placeLatitude, placeLongitude, placeWebsite);
    }
});

function addFavorite(placeId, name, address, rating, openHours, latitude, longitude, website) {
    console.log("Fails past or in addFavorite");
    console.log("Name:", name);
    console.log('CSRF Token:', csrftoken);
    fetch('/favorite-restaurant/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken  // Get CSRF token for security
        },
        body: JSON.stringify({
            place_id: placeId,
            name: name,
            address: address,
            rating: rating,
            openHours: openHours,
            latitude: latitude,
            longitude: longitude,
            website: website
        })
    })
    .then(response => {
        if (response.ok) {
            alert('Restaurant added to favorites!');
        } else {
            alert('Failed to add restaurant to favorites.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Helper function to get CSRF token (required for Django POST requests)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null); // Remove marker from map
    }
    markers = []; // Clear the array of markers
}


initMap();

