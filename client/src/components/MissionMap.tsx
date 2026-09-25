import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useGameStore } from '../store/gameStore';
import { GAME_CONFIG } from '../constants/catalog';

// Helper to create droplet icon
function createCustomPin(num: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="gis-marker-pin"><span>${num}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

export const MissionMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const points = useGameStore((s) => s.points);
  const setPendingLatLng = useGameStore((s) => s.setPendingLatLng);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView(GAME_CONFIG.INITIAL_COORDS, GAME_CONFIG.INITIAL_ZOOM);

    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    });
    const satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri World Imagery',
    });
    street.addTo(map);
    L.control.layers(
      {
        'OpenStreetMap': street,
        'Base map · ภาพดาวเทียม': satellite,
      },
      undefined,
      { position: 'topright', collapsed: false }
    ).addTo(map);

    L.control.zoom({ position: 'topleft' }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;

    // Handle Map Clicks
    map.on('click', (e: L.LeafletMouseEvent) => {
      const state = useGameStore.getState();
      if (!state.started || state.points.length >= GAME_CONFIG.MAX_POINTS || state.seconds <= 0) {
        return;
      }
      setPendingLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setPendingLatLng]);

  // Sync Markers with points
  useEffect(() => {
    const layerGroup = markersLayerRef.current;
    if (!layerGroup) return;

    layerGroup.clearLayers();

    points.forEach((p, index) => {
      const marker = L.marker([p.lat, p.lng], {
        icon: createCustomPin(index + 1),
      });

      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.5;">
          <b style="color: #0d9488;">จุดที่ ${index + 1}</b><br/>
          หมวด: <b>${p.category}</b><br/>
          ประเภท: ${p.type ? `<b>${p.type}</b>` : '<i style="color:#94a3b8;">ยังไม่ระบุ</i>'}<br/>
          พิกัด: ${p.coords}
        </div>
      `);

      layerGroup.addLayer(marker);
    });
  }, [points]);

  return (
    <div
      ref={mapContainerRef}
      className="map-viewport"
      id="map-container"
    />
  );
};
