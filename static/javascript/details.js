let placeIdentification = window.placeId;
let latitude;
let longitude;
let map; // Declare map globally

const nameContainer = document.getElementById('restaurantName');
const addressContainer = document.getElementById('address');
const contactContainer = document.getElementById('contact');
const cuisineContainer = document.getElementById('cuisine');
const reviewContainer = document.getElementById('reviews');

// Initialize the map and then get place details
async function initMap() {
    const { Map } = await google.maps.importLibrary("maps");

    const initialPosition = { lat: 0, lng: 0 }; // Default starting point (you can change this)

    map = new Map(document.getElementById("map"), {
        center: initialPosition,
        zoom: 13,
        mapId: "DEMO_MAP_ID",
    });

    // Call getPlaceDetails after the map has been initialized
    getPlaceDetails(placeIdentification);
}

// Fetch the place details using PlacesService
function getPlaceDetails(placeId) {
    const service = new google.maps.places.PlacesService(map); // Use the initialized map

    const detailsRequest = {
        placeId: placeId,
        fields: ["website", "opening_hours", "formatted_phone_number", "formatted_address", "rating", "name", "photos", "geometry", "type", "reviews"], // Fields for Place Details
    };

    service.getDetails(detailsRequest, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("Place details:", place);
            latitude = place.geometry.location.lat();
            longitude = place.geometry.location.lng();

            updateMap(latitude, longitude, place);
        } else {
            console.log("Failed to get place details. Status:", status);
        }
    });
}

// Update the map and add a marker with the fetched details
async function updateMap(lat, long, place) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const restPosition = { lat: lat, lng: long };

    map.setCenter(restPosition); // Update map center

    const markerView = new AdvancedMarkerElement({
        map,
        position: restPosition,
        title: place.name,
    });

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

    nameContainer.innerHTML = place.displayName || place.name;
    addressContainer.innerHTML = place.formatted_address;
    contactContainer.innerHTML = place.formatted_phone_number;
    cuisineContainer.innerHTML = place.types[1] || "No cuisine provided";

    place.reviews.forEach(function(review, index) {
        const reviewDiv  = document.createElement("div");
            reviewDiv.className = "reviewDiv"; // Add a class for styling
            reviewDiv.innerHTML = `
                <p><strong>Author: </strong>${review['author_name']}</p>
                <p><strong>Review: </strong> ${review['text']}</p>
                <p><strong>Rating: </strong> ${review['rating']}</p>
            `;

            // Append the new place div to the parent container
            reviewContainer.appendChild(reviewDiv);

});
}

// Initialize the map on page load
initMap();