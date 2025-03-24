import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RoutingControl from './RoutingControl.js';
import customMarkerIcon from '../assets/seagoldlogo.jpg'; // Dorm icon
import './MapTenant.css';

// Dormitory Icon
const dormIcon = new L.Icon({
  iconUrl: customMarkerIcon,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Dormitory location
const dormPosition = [14.6036, 120.9889];

const LocationPage = () => {
  const { sidebarOpen } = useOutletContext();
  const [places, setPlaces] = useState([]); // All places from the API
  const [filteredPlaces, setFilteredPlaces] = useState([]); // Filtered places based on category
  const [categories, setCategories] = useState(['All']); // Categories for filter dropdown
  const [selectedCategory, setSelectedCategory] = useState('All'); // Selected category for filtering
  const [routingWaypoints, setRoutingWaypoints] = useState([]); // Waypoints for routing
  const [userPosition, setUserPosition] = useState(null); // User's geolocation
  const [panCoords, setPanCoords] = useState(dormPosition); // Coordinates for map panning

  // Fetch places from the API
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/places') // Adjust the API endpoint if necessary
      .then((response) => response.json())
      .then((data) => {
        setPlaces(data);
        setFilteredPlaces(data);

        // Extract unique categories for the filter
        const uniqueCategories = ['All', ...new Set(data.map((place) => place.category))];
        setCategories(uniqueCategories);
      })
      .catch((error) => {
        console.error('Error fetching places:', error);
      });
  }, []);

  // Filter places when the selected category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredPlaces(places);
    } else {
      setFilteredPlaces(places.filter((place) => place.category === selectedCategory));
    }
  }, [selectedCategory, places]);

  // Locate user's current position
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserPosition(coords);
          setRoutingWaypoints([coords, dormPosition]);
          setPanCoords(coords);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to retrieve location. Please check your location settings.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  // Clear the current route
  const handleClearRoute = () => {
    setRoutingWaypoints([]);
    setUserPosition(null);
    setPanCoords(dormPosition);
  };

  return (
    <div className={`location-page ${sidebarOpen ? 'shifted' : ''}`}>
      <h1 className="location-header">Map View</h1>
      <p className="location-description">Explore the property map and nearby locations.</p>

      <div className="map-and-list-container">
        <div className="map-container-wrapper">
          <MapContainer center={panCoords} zoom={14} className="map-container">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Dormitory Marker */}
            <Marker position={dormPosition} icon={dormIcon}>
              <Popup>Fern Building (Dormitory)</Popup>
            </Marker>

            {/* Place Markers */}
            {filteredPlaces.map((place) => (
              <Marker key={place.id} position={[place.latitude, place.longitude]} icon={dormIcon}>
                <Popup>
                  <strong>{place.name}</strong>
                  <p>{place.description}</p>
                </Popup>
              </Marker>
            ))}

            {/* User's Current Position */}
            {userPosition && (
              <Marker
                position={userPosition}
                icon={new L.Icon({
                  iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-red.png',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                })}
              >
                <Popup>Your Current Location</Popup>
              </Marker>
            )}

            {/* Routing */}
            {routingWaypoints.length > 0 && <RoutingControl waypoints={routingWaypoints} />}
          </MapContainer>
        </div>

        {/* Places List and Filter */}
        <div className="places-list">
          <h3>Nearby Places</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <ul>
            {filteredPlaces.map((place) => (
              <li key={place.id} className="place-item">
                <strong>{place.name}</strong>
                <p>{place.description}</p>
                <button
                  onClick={() => setRoutingWaypoints([userPosition || dormPosition, [place.latitude, place.longitude]])}
                  className="view-route-btn"
                >
                  View Route
                </button>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button onClick={handleLocateMe} className="location-btn-primary">
              Locate Me
            </button>
            <button onClick={handleClearRoute} className="location-btn-secondary">
              Clear Route
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;
