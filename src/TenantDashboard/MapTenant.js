import React, { useState, useEffect, useRef } from "react";
import './TenantMap.css';
import {
  GoogleMap,
  LoadScriptNext,
  Marker,
  DirectionsRenderer,
  Autocomplete,
  Polyline,
  TrafficLayer,
} from "@react-google-maps/api";
import userPinGif from "../assets/pin-your-location.gif";
import seagoldPinGif from "../assets/seagoldpinicon.gif";
import amenityPinGif from "../assets/amenities.gif";

const libraries = ["places"];
const containerStyle = { width: "100%", height: "100vh" };
const dormPosition = { lat: 14.6036, lng: 120.9889 };

const GoogleMapComponent = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [walkingPath, setWalkingPath] = useState(null);
  const [travelMode, setTravelMode] = useState("DRIVING");
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("school");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showTraffic, setShowTraffic] = useState(false);
  const [isStreetView, setIsStreetView] = useState(false);
  const [userMarkerIcon, setUserMarkerIcon] = useState(null);
  const [dormMarkerIcon, setDormMarkerIcon] = useState(null);
  const [amenityMarkerIcon, setAmenityMarkerIcon] = useState(null);
  const [hasClickedLocation, setHasClickedLocation] = useState(false);
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleGetUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setHasClickedLocation(true);
          if (mapRef.current) {
            mapRef.current.panTo(location);
            mapRef.current.setZoom(15);
          }
          handleGetRoute(location);
        },
        () => alert("⚠️ Location access denied.")
      );
    } else {
      alert("⚠️ Geolocation not supported.");
    }
  };

  const handleFindNearbyPlaces = (category) => {
    if (!mapRef.current) return;
    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.nearbySearch(
      {
        location: dormPosition,
        radius: 1500,
        type: category,
      },
      (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setNearbyPlaces(results);
        } else {
          setNearbyPlaces([]);
          alert("No nearby places found.");
        }
      }
    );
  };

  const handleGetRoute = (destination) => {
    if (!destination) return;
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: dormPosition,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode],
      },
      (result, status) => {
        if (status === "OK") {
          setSelectedRoute(result);
          setDistance(result.routes[0].legs[0].distance.text);
          setDuration(result.routes[0].legs[0].duration.text);
          if (travelMode === "WALKING") {
            setWalkingPath(result.routes[0].overview_path.map((p) => ({ lat: p.lat(), lng: p.lng() })));
          } else {
            setWalkingPath(null);
          }
        } else {
          alert("Route request failed.");
        }
      }
    );
  };

  const onLoadMap = (map) => {
    mapRef.current = map;
    setUserMarkerIcon({ url: userPinGif, scaledSize: new window.google.maps.Size(130, 70) });
    setDormMarkerIcon({ url: seagoldPinGif, scaledSize: new window.google.maps.Size(120, 70) });
    setAmenityMarkerIcon({ url: amenityPinGif, scaledSize: new window.google.maps.Size(150, 70) });
    const streetView = map.getStreetView();
    streetView.addListener("visible_changed", () => {
      setIsStreetView(streetView.getVisible());
    });
  };

  return (
    <LoadScriptNext googleMapsApiKey="AIzaSyBzwv-dcl79XmHM4O-7_zGSI-Bp9LEen7s" libraries={libraries}>
      <div className="tenant-location-page">
        <div className="tenant-map-ui">

          {isStreetView && (
            <button className="tenant-exit-streetview" onClick={() => mapRef.current.getStreetView().setVisible(false)}>
              🔙 Back to Map
            </button>
          )}

          <button
            className={`tenant-toggle-sidebar ${!isSidebarOpen ? "collapsed" : ""}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "<" : ">"}
          </button>

          <div className={`tenant-map-sidebar ${!isSidebarOpen ? "collapsed" : ""}`}>
            <h2>📍 Get Directions</h2>
            <button onClick={handleGetUserLocation} className="tenant-map-btn">
              {hasClickedLocation ? "🧭 Get Route" : "📌 Get My Location"}
            </button>

            <select value={travelMode} onChange={(e) => setTravelMode(e.target.value)} className="tenant-travel-mode">
              <option value="DRIVING">🚗 Driving</option>
              <option value="WALKING">🚶 Walking</option>
              <option value="BICYCLING">🚴 Biking</option>
            </select>

            <button onClick={() => setShowTraffic(!showTraffic)} className="tenant-map-btn">
              🚧 {showTraffic ? "Hide Traffic" : "Show Traffic"}
            </button>

            <div className="tenant-route-info">
              <div className="tenant-route-inner">
                {distance && <p>📏 {distance}</p>}
                {duration && <p>⏱️ {duration}</p>}
              </div>
            </div>

            <h3>🔍 Find Nearby:</h3>
            <div className="tenant-route-select">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="school">🏫 Schools</option>
                <option value="laundry">🧺 Laundry</option>
                <option value="restaurant">🍛 Carinderias</option>
                <option value="gas_station">⛽ Gas Stations</option>
              </select>
              <button onClick={() => handleFindNearbyPlaces(selectedCategory)} className="tenant-map-btn">
                🔎 Search
              </button>
            </div>

            <ul className="tenant-nearby-list">
              {nearbyPlaces.map((place) => (
                <li
                  key={place.place_id}
                  onClick={() => {
                    const destination = {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    };
                    setSelectedNearbyPlace(destination);
                    handleGetRoute(destination);
                  }}
                >
                  {place.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="tenant-map-container">
            <div className="tenant-search-bar">
              <Autocomplete onLoad={(auto) => setAutocomplete(auto)}>
                <input className="tenant-search-box" placeholder="Search destination..." />
              </Autocomplete>
              <button
                className="tenant-search-btn"
                onClick={() => {
                  if (!autocomplete) return alert("Enter a location");
                  const place = autocomplete.getPlace();
                  if (place?.geometry) {
                    const loc = {
                      lat: place.geometry.location.lat(),
                      lng: place.geometry.location.lng(),
                    };
                    setUserLocation(loc);
                    mapRef.current?.panTo(loc);
                    mapRef.current?.setZoom(15);
                  } else {
                    alert("No place found.");
                  }
                }}
              >
                Search
              </button>
            </div>

            <GoogleMap mapContainerStyle={containerStyle} center={dormPosition} zoom={15} onLoad={onLoadMap}>
              {dormMarkerIcon && <Marker position={dormPosition} icon={dormMarkerIcon} />}
              {userLocation && userMarkerIcon && <Marker position={userLocation} icon={userMarkerIcon} />}
              {selectedNearbyPlace && amenityMarkerIcon && <Marker position={selectedNearbyPlace} icon={amenityMarkerIcon} />}
              {selectedRoute && (
                <>
                  <DirectionsRenderer directions={selectedRoute} options={{ suppressMarkers: true }} />
                  <Marker
                    position={selectedRoute.routes[0].legs[0].start_location}
                    icon={{ url: "/assets/startingpoint.svg", scaledSize: new window.google.maps.Size(60, 60) }}
                  />
                  <Marker
                    position={selectedRoute.routes[0].legs[0].end_location}
                    icon={{ url: "/assets/endpoint.svg", scaledSize: new window.google.maps.Size(40, 40) }}
                  />
                </>
              )}
              {walkingPath && (
                <Polyline path={walkingPath} options={{ strokeColor: "#34A853", strokeWeight: 2 }} />
              )}
              {showTraffic && <TrafficLayer />}
            </GoogleMap>
          </div>
        </div>
      </div>
    </LoadScriptNext>
  );
};

export default GoogleMapComponent;