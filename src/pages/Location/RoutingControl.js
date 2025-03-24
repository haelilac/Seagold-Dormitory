import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

function RoutingControl({ waypoints }) {
  const map = useMap();

  useEffect(() => {
    // Check if the map and waypoints with at least two points are available
    if (!map || waypoints.length < 2) return;

    let routingControl = L.Routing.control({
      waypoints: waypoints.map((wp) => L.latLng(wp)),
      lineOptions: {
        styles: [{ color: 'blue', weight: 4 }],
      },
      createMarker: () => null, // Prevents default markers
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    // Cleanup function
    return () => {
      if (routingControl) {
        try {
          routingControl.getPlan().setWaypoints([]); // Clear waypoints
          routingControl.remove(); // Safely remove control
        } catch (error) {
          console.warn("Routing control cleanup failed:", error);
        }
        routingControl = null;
      }
    };
  }, [map, waypoints]);

  return null;
}

export default RoutingControl;
