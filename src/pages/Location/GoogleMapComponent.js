import React, { useState, useEffect, useRef, useMemo } from "react";
import "./Location.css";
import {
  GoogleMap,
  LoadScriptNext,
  Marker,
  DirectionsRenderer,
  Autocomplete,
  Polyline,
  TrafficLayer,
} from "@react-google-maps/api";
import userPinGif from "../../assets/pin-your-location.gif";
import seagoldPinGif from "../../assets/seagoldpinicon.gif";
import amenityPinGif from "../../assets/get-directions.gif";

const libraries = ["places"];
const containerStyle = { width: "100%", height: "100vh" };
const dormPosition = { lat: 14.6036, lng: 120.9889 };

const universities = [
  { id: 1, name: "TUP Manila", position: { lat: 14.5872, lng: 120.9842 } },
  { id: 2, name: "UST", position: { lat: 14.6096, lng: 120.9893 } },
  { id: 3, name: "FEU", position: { lat: 14.6036, lng: 120.9861 } },
];

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
  const mapRef = useRef(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [isStreetView, setIsStreetView] = useState(false);
  const [userMarkerIcon, setUserMarkerIcon] = useState(null);
  const [dormMarkerIcon, setDormMarkerIcon] = useState(null);
  const [amenityMarkerIcon, setAmenityMarkerIcon] = useState(null);
  const [hasClickedLocation, setHasClickedLocation] = useState(false);
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState(null);
  const [isRouteShown, setIsRouteShown] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleGetUserLocation = () => {
    if (isRouteShown) {
      setSelectedRoute(null);
      setWalkingPath(null);
      setDistance("");
      setDuration("");
      setIsRouteShown(false);
      return;
    }
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setHasClickedLocation(true);
          setIsRouteShown(true);
  
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
    setSelectedNearbyPlace(null); // clear old selection
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
          // Zoom and center to dorm after placing markers
          mapRef.current.panTo(dormPosition);
          mapRef.current.setZoom(15);
        } else {
          setNearbyPlaces([]);
          alert("No nearby places found.");
        }
      }
    );
  };
  

  const handleGetRoute = (destination) => {
    if (!destination) return;
  
    const travelModes = {
      DRIVING: window.google.maps.TravelMode.DRIVING,
      WALKING: window.google.maps.TravelMode.WALKING,
      BICYCLING: window.google.maps.TravelMode.BICYCLING,
    };
  
    const service = new window.google.maps.DirectionsService();
    service.route(
      {
        origin: dormPosition, // 🔥 always start from the dorm
        destination,
        travelMode: travelModes[travelMode],
      },
      (result, status) => {
        if (status === "OK") {
          setSelectedRoute(result);
          setDistance(result.routes[0].legs[0].distance.text);
          setDuration(result.routes[0].legs[0].duration.text);
          if (travelMode === "WALKING") {
            setWalkingPath(
              result.routes[0].overview_path.map((p) => ({
                lat: p.lat(),
                lng: p.lng(),
              }))
            );
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
  
    setUserMarkerIcon({
      url: userPinGif,
      scaledSize: new window.google.maps.Size(130, 70),
    });
  
    setDormMarkerIcon({
      url: seagoldPinGif,
      scaledSize: new window.google.maps.Size(120, 70),
    });
  
    setAmenityMarkerIcon({
      url: amenityPinGif,
      scaledSize: new window.google.maps.Size(120, 70),
    });
  
    const streetView = map.getStreetView();
    streetView.addListener("visible_changed", () => {
      setIsStreetView(streetView.getVisible());
    });
  };

  return (
    <LoadScriptNext googleMapsApiKey="AIzaSyBzwv-dcl79XmHM4O-7_zGSI-Bp9LEen7s" libraries={libraries}>
      <div className="location-page">
        <div className="map-ui">

        {isStreetView && (
            <button className="exit-street-view-btn" onClick={() => mapRef.current.getStreetView().setVisible(false)}>
              🔙 Back to Map
            </button>
          )}

        <button
          className={`toggle-sidebar ${!isSidebarOpen ? "collapsed" : ""}`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "<" : ">"}
        </button>

          <div className={`map-sidebar ${!isSidebarOpen ? "collapsed" : ""}`}>
            <h2>📍 Get Directions</h2>

            <select value={travelMode} onChange={(e) => setTravelMode(e.target.value)} className="travel-mode-selector">
              <option value="DRIVING">🚗 Driving</option>
              <option value="WALKING">🚶 Walking</option>
              <option value="BICYCLING">🚴 Biking</option>
            </select>

            <div className="route-info">
              <div className="route-info-inner">
                {distance && <p>📏 {distance}</p>}
                {duration && <p>⏱️ {duration}</p>}
              </div>
            </div>

            <button onClick={handleGetUserLocation} className="map-btn">
              {isRouteShown ? "❌ Exit Route" : hasClickedLocation ? "🧭 Get Route" : "📌 Get My Location"}
            </button>

            <button onClick={() => setShowTraffic(!showTraffic)} className="traffic-btn">
             {showTraffic ? "🚦" : "🚦"}
            </button>

            <h3>🔍 Find Nearby:</h3>
            <div className="route-select">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="school">🏫 Schools</option>
                <option value="laundry">🧺 Laundry</option>
                <option value="restaurant">🍛 Carinderias</option>
                <option value="gas_station">⛽ Gas Stations</option>
              </select>
            </div>
            <button onClick={() => handleFindNearbyPlaces(selectedCategory)} className="nearby-btn">
                🔎
              </button>
          </div>

          <div className="map-container">
            <div className="search-bar-container">
              <Autocomplete onLoad={(auto) => setAutocomplete(auto)}>
                <input className="search-box" placeholder="Search destination..." />
              </Autocomplete>
              <button
                className="search-btn"
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
        {dormMarkerIcon && (
          <Marker position={dormPosition} icon={dormMarkerIcon} />
        )}

        {userLocation && userMarkerIcon && (
          <Marker position={userLocation} icon={userMarkerIcon} />
        )}

        {amenityMarkerIcon &&
          nearbyPlaces.map((place) => (
            <Marker
              key={place.place_id}
              position={{
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              }}
              icon={amenityMarkerIcon}
            />
        ))}

        {selectedRoute && (
          <>
            <DirectionsRenderer directions={selectedRoute} options={{ suppressMarkers: true }} />
            <Marker
              position={selectedRoute.routes[0].legs[0].start_location}
              icon={{
                url: "/assets/startingpoint.svg",
                scaledSize: new window.google.maps.Size(60, 60),
              }}
            />
            <Marker
              position={selectedRoute.routes[0].legs[0].end_location}
              icon={{
                url: "/assets/endpoint.svg",
                scaledSize: new window.google.maps.Size(40, 40),
              }}
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
