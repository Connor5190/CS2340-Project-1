let map;
let latitude;
let longitude;

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



async function initMap() {
  // The location of Uluru
  const position = { lat: latitude, lng: longitude};
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  // The map, centered at Uluru
  map = new Map(document.getElementById("map"), {
    zoom: 4,
    center: position,
    mapId: "DEMO_MAP_ID",
  });

  // The marker, positioned at Uluru
  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    title: "Uluru",
  });
}