let map;
let latitude;
let longitude;
let marker;
let service;
let infowindow;
let markers = []; // Array to hold markers
let googleMapsLibs; // Global object to hold the libraries
let isSearching = false; // Flag to prevent multiple searches

window.onload = function() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
                initMap(latitude, longitude); // Update the map with the new coordinates
            },
            (error) => {
                console.error('Error retrieving location', error);
            }
        );
    } else {
        alert('Geolocation is not supported by this browser.');
    }
};

// Function to load Google Maps libraries
async function loadGoogleMapsLibraries() {
    googleMapsLibs = {
        Map: (await google.maps.importLibrary("maps")).Map,
        InfoWindow: (await google.maps.importLibrary("maps")).InfoWindow,
        Marker: (await google.maps.importLibrary("marker")).Marker,
        PlacesService: (await google.maps.importLibrary("places")).PlacesService,
    };
}

async function initMap(latitude, longitude) {
    await loadGoogleMapsLibraries();

    const position = { lat: latitude, lng: longitude };

    map = new googleMapsLibs.Map(document.getElementById("map"), {
        zoom: 10,
        center: position,
        mapId: "DEMO_MAP_ID",
        mapTypeControl: false,
    });

    marker = new googleMapsLibs.Marker({
        position: position,
        map: map,
        title: 'User Location',
    });

    service = new googleMapsLibs.PlacesService(map);
    infowindow = new googleMapsLibs.InfoWindow();

    const input = document.querySelector('.restaurant_search');
    const searchButton = document.querySelector('.search_button');

    searchButton.addEventListener('click', debounce(() => {
        const query = input.value.trim(); // Get the user input for the search and trim whitespace
        if (query) {
            isSearching = true; // Set flag to indicate a search is in progress
            performTextSearch(position, query); // Perform the search if the input is not empty
            input.value = ''; // Clear the input after search
            isSearching = false; // Reset the flag
        } else if (!isSearching) {
            alert("Please enter a search query."); // Alert if input is empty and not already searching
        }
    }, 300)); // 300ms delay to prevent rapid clicks
}

function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

function performTextSearch(position, query) {
    const request = {
        location: position,
        radius: '500',
        query: query
    };

    service.textSearch(request, callback);
}

function callback(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        clearMarkers();

        for (let i = 0; i < results.length; i++) {
            const place = results[i];
            console.log(place);
            createMarker(place);
        }
    }
}

function createMarker(place) {
    const newMarker = new googleMapsLibs.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name,
    });

    markers.push(newMarker); // Add the new marker to the array

    const contentString = `
        <div>
            <h2>${place.name}</h2>
            <p><strong>Address:</strong> ${place.formatted_address || 'No address available'}</p>
            <p><strong>Rating:</strong> ${place.rating || 'No rating available'}</p>
            <p><strong>Phone:</strong> ${place.formatted_phone_number || 'No phone number available'}</p>
            <p><strong>Website:</strong> ${place.website ? `<a href="${place.website}" target="_blank">Visit website</a>` : 'No website available'}</p>
            ${place.photos && place.photos.length > 0 ? `<img src="${place.photos[0].getUrl()}" alt="Image of ${place.name}" style="width:100px;height:auto;"/>` : ''}
        </div>
    `;

    newMarker.addListener('click', () => {
        infowindow.setContent(contentString);
        infowindow.open(map, newMarker);
    });
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = []; // Clear the array after removing the markers
}
