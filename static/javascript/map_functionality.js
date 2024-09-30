let map;
let center;
let latitude;
let longitude;

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

              findPlaces();
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
  const { Place } = await google.maps.importLibrary("places");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  const request = {
    textQuery: "Chipotle",
    fields: ["displayName", "location", "businessStatus"],
    includedType: "restaurant",
    locationBias: { lat: latitude, lng: longitude },
    isOpenNow: true,
    language: "en-US",
    maxResultCount: 20,
    minRating: 3.2,
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

