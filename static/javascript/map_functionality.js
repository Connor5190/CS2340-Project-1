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

  // The location of the user
  const position = { lat: latitude, lng: longitude};
  // Request needed libraries.
  //@ts-ignore
  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

  // The map, centered at user
  map = new Map(document.getElementById("map"), {
      zoom: 13,
      center: position,
      mapId: "86c19ff08dd83b77",
      mapTypeControl: false,
    });

  // The marker, positioned at your location
  const pinTextGlyph = new PinElement({
  glyph: "H",
  glyphColor: "white",
  });

  const marker = new AdvancedMarkerElement({
    map: map,
    position: position,
    content: pinTextGlyph.element,
  });
}