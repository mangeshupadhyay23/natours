const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoibWFuZ2VzaDIzIiwiYSI6ImNrYnJ0cnExajA4OHIydm81ZmRoYm8xaGgifQ.ZI3PmtRTIZNTiHC6tlwweg';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mangesh23/ckbru0vac21nf1iof3m284anh',
  //   center: [-118.246575, 34.039091],
  //   zoom: 10,
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  //Create Marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 20,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day} : ${loc.description}</p>`)
    .addTo(map);
  //Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: { top: 200, bottom: 150, left: 100, right: 100 },
});
