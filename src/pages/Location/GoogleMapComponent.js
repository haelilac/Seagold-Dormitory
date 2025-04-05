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
const containerStyle = { width: "100%", height: "720px" };

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
  const [isLocating, setIsLocating] = useState(false);

  const options = [
    { value: "school", label: "Schools", icon: "/assets/school.svg" },
    { value: "laundry", label: "Laundry Shops", icon: "/assets/laundry.svg" },
    { value: "restaurant", label: "Carinderias", icon: "/assets/carinderia.svg" },
    { value: "gas_station", label: "Gas Stations", icon: "/assets/gasstation.svg" },
  ];

  const  isGoogleMapsLoaded = () => {
    return typeof window.google !== "undefined" && window.google.maps;
  };

  // 📍 Get User Location
  const handleGetUserLocation = () => {
    setIsLocating(true); // Start loading
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newUserLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(newUserLocation);
  
          if (mapRef.current) {
            mapRef.current.panTo(newUserLocation);
            mapRef.current.setZoom(15);
  
            new window.google.maps.Marker({
              position: newUserLocation,
              map: mapRef.current,
              icon: {
                url: "/assets/startingpoint.svg",
                scaledSize: new window.google.maps.Size(50, 50),
              },
              title: "Your Current Location",
            });
          }
  
          setIsLocating(false); // Done
        },
        () => {
          alert("⚠️ Location access denied or unavailable.");
          setIsLocating(false); // Stop loading on error
        }
      );
    } else {
      alert("⚠️ Geolocation is not supported by this browser.");
      setIsLocating(false); // Stop loading on fallback
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
      <div className="map-destination">
      <div className="search-bar-container">
  <Autocomplete 
    onLoad={(auto) => setAutocomplete(auto)}
  >
    <input type="text" className="search-box" placeholder="Enter destination..." />
  </Autocomplete>
  <button className="search-btn" onClick={() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      
      if (place && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        
        setUserLocation(location);  // Save the searched location as userLocation

        if (mapRef.current) {
          mapRef.current.panTo(location);
          mapRef.current.setZoom(15);
        }

        // Render Marker for the searched location
        mapRef.current && new window.google.maps.Marker({
          position: location,
          map: mapRef.current,
          icon: {
            url: "/assets/endpoint.svg",
            scaledSize: new window.google.maps.Size(50, 50)
          },
          title: "Searched Location"
        });

      } else {
        alert("No details available for the searched location.");
      }
    } else {
      alert("Please enter a valid location.");
    }
  }}>Search</button>

</div>

</div>
      <div className="map-ui">
        <div className="map-sidebar">
          <h2> <img src="/assets/getdirection.svg" alt="Search" width="20" style={{ marginRight: "5px" }} />  Get Directions</h2>
          <button onClick={() => {
     handleGetUserLocation();

        if (userLocation && mapRef.current) {
      // Render Marker for the user location
      new window.google.maps.Marker({
        position: userLocation,
        map: mapRef.current,
        icon: { url: "/assets/startingpoint.svg", scaledSize: new window.google.maps.Size(50, 50)
        },
        title: "Your Current Location"
      });
    }
  }} className="map-btn"> 
  <img src="/assets/getmylocation.svg" alt="Search" width="20" style={{ marginRight: "5px" }} /> 
  Get My Location
</button>

          <select onChange={(e) => setTravelMode(e.target.value)} value={travelMode} className="travel-mode-selector">
            <option value="DRIVING">Driving</option>
            <option value="WALKING">Walking</option>
            <option value="BICYCLING">Biking</option>
          </select>
          <button onClick={() => handleGetRoute()} className="map-btn"><img src="/assets/getroute.svg" alt="Search" width="20" style={{ marginRight: "5px" }} />Get Route</button>
          <div className="route-info">
            {distance && <p>Distance: {distance}</p>}
            {duration && <p>Duration: {duration}</p>}
          </div>

          <h3> Find Nearby:</h3>
          <div className="route-select">
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="school">🏫 Schools</option>
            <option value="laundry">🧺 Laundry Shops</option>
            <option value="restaurant">🍛 Carinderias</option>
            <option value="gas_station">⛽ Gas Stations</option>
          </select>
          <button onClick={() => handleFindNearbyPlaces(selectedCategory)} className="map-btn">
          <img src="/assets/search.svg" alt="Search" width="20" style={{ marginRight: "5px" }} />
             Search
          </button>
          </div>
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
            {/* Directions */}
            {selectedRoute && (
  <>
    <DirectionsRenderer
      directions={selectedRoute}
      options={{ suppressMarkers: true }}
    />

    {/* Custom Start Point (A) */}
    <Marker
      position={selectedRoute.routes[0].legs[0].start_location}
      icon={{
        url: "/assets/startingpoint.svg",  // Access the file from the public folder
        scaledSize: new window.google.maps.Size(60, 60)
      }}
      title="Start Point (A)"
    />

    {/* Custom End Point (B) */}
    <Marker
      position={selectedRoute.routes[0].legs[0].end_location}
      icon={{
        url: "/assets/endpoint.svg",
        scaledSize: new window.google.maps.Size(40, 40)
      }}
      title="End Point (B)"
    />
  </>
)}

            {walkingPath && <Polyline path={walkingPath} options={{ strokeColor: "#34A853", strokeOpacity: 1, strokeWeight: 2 }} />}
            {trafficLayerVisible && <TrafficLayer />}
          </GoogleMap>
        </div>
      </div>
    </LoadScriptNext>
  );
};

export default GoogleMapComponent;
