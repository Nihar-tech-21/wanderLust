
maptilersdk.config.apiKey = mapToken;
const map = new maptilersdk.Map({
  container: 'map', // container's id or the HTML element to render the map
  style: maptilersdk.MapStyle.STREETS,
  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 9.0, // starting zoom
});

console.log(listing.geometry.coordinates);

const popup = new maptilersdk.Popup({ offset: 25 }).setText(
  `Exact Location will be provided after booking!`
);

const geojson = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'properties': {
                'message': 'Exact Location will be provided after booking!',
                'iconSize': [40, 40]
            },
            'geometry': {
                'type': 'Point',
                'coordinates': listing.geometry.coordinates,
            }
        },
    ],
};

geojson.features.forEach(function (marker) {
    const el = document.createElement('div');
    el.style.fontSize = '20px';       // size of the icon
    el.style.color = 'red';           // icon color
    el.style.textAlign = 'center';
    el.style.lineHeight = '10px';     // vertically center the icon
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';

    // icon
    el.innerHTML = '<i class="fa-solid fa-house"></i>'; 
    
    // marker to map
    new maptilersdk.Marker({element: el})
        .setLngLat(marker.geometry.coordinates)
        .setPopup(popup)
        .addTo(map);
});


