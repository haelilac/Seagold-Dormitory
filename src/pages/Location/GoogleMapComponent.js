import React, { useState, useEffect, useRef } from "react";
import "./Location.css";
import {
  GoogleMap,
  LoadScriptNext,
  Marker,
  DirectionsRenderer,
  Autocomplete,
  Polyline,
  TrafficLayer
} from "@react-google-maps/api";

const libraries = ["places"];
const containerStyle = { width: "100%", height: "600px" };

// 📍 Dormitory Location
const dormPosition = { lat: 14.6036, lng: 120.9889 };

// 🏫 Universities
const universities = [
  { id: 1, name: "TUP Manila", position: { lat: 14.5872, lng: 120.9842 } },
  { id: 2, name: "UST", position: { lat: 14.6096, lng: 120.9893 } },
  { id: 3, name: "FEU", position: { lat: 14.6036, lng: 120.9861 } },
];

const GoogleMapComponent = () => {
  const [userLocation, setUserLocation] = useState(dormPosition); // Default to dorm position if geolocation is not enabled
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [walkingPath, setWalkingPath] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [trafficLayerVisible, setTrafficLayerVisible] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("school");
  const mapRef = useRef(null);

  const  isGoogleMapsLoaded = () => {
    return typeof window.google !== "undefined" && window.google.maps;
  };

  // 📍 Get User Location
  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newUserLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserLocation(newUserLocation);

          if (mapRef.current) {
            mapRef.current.panTo(newUserLocation);
            mapRef.current.setZoom(15);
          }
        },
        () => alert("⚠️ Location access denied or unavailable.")
      );
    } else {
      alert("⚠️ Geolocation is not supported by this browser.");
    }
  };

  // 🏢 Fetch Nearby Locations
  const handleFindNearbyPlaces = (category) => {
    if (!isGoogleMapsLoaded() || !mapRef.current) return;

    const placesService = new window.google.maps.places.PlacesService(mapRef.current);
    const request = {
      location: dormPosition,
      radius: 1500, // 1.5km radius
      type: category,
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setNearbyPlaces(results);
      } else {
        setNearbyPlaces([]);
        alert("No places found in this category.");
      }
    });
  };

  const handleGetRoute = (destination) => {
    if (!userLocation || !destination) {  // Ensure both userLocation and destination are defined
        alert("Missing origin or destination.");
        return;
    }

    if (!isGoogleMapsLoaded()) {
        alert("Google Maps API is not loaded yet.");
        return;
    }

    const travelModes = {
        DRIVING: window.google.maps.TravelMode.DRIVING,
        WALKING: window.google.maps.TravelMode.WALKING,
        BICYCLING: window.google.maps.TravelMode.BICYCLING,
    };

    // Use the existing state `travelMode` instead of non-existent `mode`
    const selectedMode = travelModes[travelMode] || window.google.maps.TravelMode.DRIVING;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route({
        origin: dormPosition,
        destination: destination,
        travelMode: selectedMode,
    }, (result, status) => {
        if (status === "OK") {
            setSelectedRoute(result);
            setDistance(result.routes[0].legs[0].distance.text);
            setDuration(result.routes[0].legs[0].duration.text);
            if (travelMode === "WALKING") {
                const path = result.routes[0].overview_path;
                if (path) {
                    setWalkingPath(path.map(p => ({ lat: p.lat(), lng: p.lng() })));
                }
            } else {
                setWalkingPath(null);
            }
        } else {
            alert("Failed to retrieve directions.");
        }
    });
};

  // ✅ Move dormitory marker inside the onLoad function
  const onLoadMap = (map) => {
    mapRef.current = map;
  };

  return (
    <LoadScriptNext googleMapsApiKey="AIzaSyBzwv-dcl79XmHM4O-7_zGSI-Bp9LEen7s" libraries={libraries}>
      <div className="map-ui">
        <div className="map-sidebar">
          <h2>📍 Get Directions</h2>
          <Autocomplete onLoad={setAutocomplete} onPlaceChanged={() => {
            const place = autocomplete.getPlace();
            setUserLocation({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
          }}>
            <input type="text" className="search-box" placeholder="Enter destination..." />
          </Autocomplete>
          <button onClick={handleGetUserLocation} className="map-btn">📍 Get My Location</button>
          <button onClick={() => handleGetRoute()} className="map-btn">🛣️ Get Route</button>
          <select onChange={(e) => setTravelMode(e.target.value)} value={travelMode} className="travel-mode-selector">
            <option value="DRIVING">Driving</option>
            <option value="WALKING">Walking</option>
            <option value="BICYCLING">Biking</option>
          </select>
          <button onClick={() => handleGetRoute()} className="map-btn">🛣️ Get Route</button>
          <div className="route-info">
            {distance && <p>Distance: {distance}</p>}
            {duration && <p>Duration: {duration}</p>}
          </div>
          <h3>🔍 Find Nearby:</h3>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="school">🏫 Schools</option>
            <option value="laundry">🧺 Laundry Shops</option>
            <option value="restaurant">🍛 Carinderias</option>
            <option value="gas_station">⛽ Gas Stations</option>
          </select>
          <button onClick={() => handleFindNearbyPlaces(selectedCategory)} className="map-btn">🔍 Search</button>

          <ul className="nearby-list">
            {nearbyPlaces.map(place => (
              <li key={place.place_id} onClick={() => handleGetRoute({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              })}>
                {place.name}
              </li>
            ))}
          </ul>
          <div className="route-info">
            {distance && <p>Distance: {distance}</p>}
            {duration && <p>Duration: {duration}</p>}
          </div>
        </div>

        {/* Map Display */}
        <div className="map-container">
          <GoogleMap mapContainerStyle={containerStyle} center={dormPosition} zoom={15} onLoad={onLoadMap}>
            <Marker position={dormPosition} icon={{ url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png" }} title="Dormitory" />
            {universities.map((uni) => (
              <Marker key={uni.id} position={uni.position} />
            ))}
            {userLocation && (
              <Marker position={userLocation} icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }} title="Your Location" />
            )}
            {selectedRoute && <DirectionsRenderer directions={selectedRoute} />}
            {walkingPath && <Polyline path={walkingPath} options={{ strokeColor: "#34A853", strokeOpacity: 1, strokeWeight: 2 }} />}
            {trafficLayerVisible && <TrafficLayer />}
          </GoogleMap>
        </div>
      </div>
    </LoadScriptNext>
  );
};

export default GoogleMapComponent;
