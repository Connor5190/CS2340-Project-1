let map;
let latitude;
let longitude;
let marker;

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
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  const { PlacesService } = await google.maps.importLibrary("places")

  // The map, centered at user
  map = new Map(document.getElementById("map"), {
      zoom: 10,
      center: position,
      mapId: "DEMO_MAP_ID",
      mapTypeControl: false,
    });

  // The marker, positioned at your location
  const pinTextGlyph = new PinElement({
  glyph: "H",
  glyphColor: "white",
  });

  if (!marker) {
      marker = new AdvancedMarkerElement({
          map: map,
          position: position,
          content: pinTextGlyph.element,
      });
  } else {
      marker.setPosition(position);
  }

  // Adding info windows with better information
  const infoWindow = new InfoWindow({
      content: "<p>Fill with details from Places API helper</p>",
  });

  marker.element.addEventListener("click", () => {
      infoWindow.open({
          anchor: marker,
          map,
          shouldFocus:false
      });
  });
}