import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-draw';
import { useVectorStore } from '../../store/vectorStore';
import { ALL_LOCATIONS } from '../../constants/vectorData';

interface VectorMapProps {
  onUserLayerChange: (layer: any) => void;
  onCheck: (layer?: any) => void;
  onClear: () => void;
  clearTrigger: number;
}

export const VectorMap: React.FC<VectorMapProps> = ({ onUserLayerChange, onCheck, onClear, clearTrigger }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const refLayerRef = useRef<L.FeatureGroup | null>(null);
  const activeDrawerRef = useRef<any>(null);
  const hoverTooltipRef = useRef<L.Tooltip | null>(null);
  const onCheckRef = useRef(onCheck);
  const onClearRef = useRef(onClear);

  onCheckRef.current = onCheck;
  onClearRef.current = onClear;

  const stage = useVectorStore((s) => s.stage);
  const timerRunning = useVectorStore((s) => s.timerRunning);
  const currentTarget = useVectorStore((s) => s.currentTarget);
  const currentLineTargets = useVectorStore((s) => s.currentLineTargets);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    });
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri World Imagery',
    });

    const map = L.map(mapContainerRef.current, {
      center: [16.473, 102.823],
      zoom: 16,
      layers: [street],
    });

    L.control.layers({ 'ถนน (Street)': street, 'ภาพดาวเทียม (Satellite)': sat }).addTo(map);

    const drawnItems = new L.FeatureGroup().addTo(map);
    const refLayer = new L.FeatureGroup().addTo(map);

    drawnItemsRef.current = drawnItems;
    refLayerRef.current = refLayer;
    mapInstanceRef.current = map;

    // Listen to Draw Created Event
    map.on(L.Draw.Event.CREATED, (e: any) => {
      drawnItems.clearLayers();
      const layer = e.layer;
      drawnItems.addLayer(layer);

      const currentStage = useVectorStore.getState().stage;
      if (currentStage === 2 || currentStage === 3) {
        const geometryName = currentStage === 2 ? 'เส้น (Line)' : 'พื้นที่ (Polygon)';
        const popupDiv = document.createElement('div');
        popupDiv.style.cssText = "font-family: 'Noto Sans Thai', sans-serif; width: 230px;";
        popupDiv.innerHTML = `
          <h4 class="vector-popup-title" style="margin:0 0 4px; color:#0f172a; font-size:13px;">ข้อมูล${geometryName}</h4>
          <p style="font-size:11px; color:#64748b; margin:0 0 9px;">ตรวจสอบคำตอบ หรือเริ่มวาดใหม่ได้จากปุ่มด้านล่าง</p>
          <div style="display:flex; gap:6px;">
            <button type="button" id="btnCheckVecGeometry" style="flex:1; background:#2563eb; color:#fff; border:none; padding:7px 5px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">ตรวจคำตอบ</button>
            <button type="button" id="btnClearVecGeometry" style="flex:1; background:#fff; color:#b42318; border:1px solid #e6aaa2; padding:7px 5px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">ลบ / วาดใหม่</button>
          </div>
        `;
        const btnCheck = popupDiv.querySelector('#btnCheckVecGeometry') as HTMLButtonElement;
        const btnClear = popupDiv.querySelector('#btnClearVecGeometry') as HTMLButtonElement;
        btnCheck.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          onCheckRef.current(layer);
        };
        btnClear.onclick = (event) => {
          event.preventDefault();
          event.stopPropagation();
          onClearRef.current();
        };
        layer.bindPopup(popupDiv, { minWidth: 230 }).openPopup();
      }
      onUserLayerChange(layer);
    });

    // Proximity Mouse Move
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const currentStage = useVectorStore.getState().stage;
      if (currentStage !== 2) {
        if (hoverTooltipRef.current) {
          map.removeLayer(hoverTooltipRef.current);
          hoverTooltipRef.current = null;
        }
        return;
      }

      let closest: typeof ALL_LOCATIONS[0] | null = null;
      let closestDist = Infinity;

      ALL_LOCATIONS.forEach((pt) => {
        const d = e.latlng.distanceTo(L.latLng(pt.lat, pt.lng));
        if (d < closestDist) {
          closestDist = d;
          closest = pt;
        }
      });

      if (closest && closestDist <= 65) {
        const content = `
          <div style="text-align:center; font-family:'Inter', 'Noto Sans Thai', sans-serif;">
            <b style="font-size:13px; color:#0f172a;">${(closest as any).name}</b><br/>
            <span style="font-size:10.5px; color:#64748b;">ห่างจากเมาส์ ~${closestDist.toFixed(0)} ม.</span><br/>
            <img src="${(closest as any).img}" style="width:130px; height:85px; object-fit:cover; border-radius:6px; margin-top:4px;" onerror="this.style.display='none'">
          </div>`;

        if (!hoverTooltipRef.current) {
          hoverTooltipRef.current = L.tooltip({ direction: 'top', opacity: 0.95, className: 'kku-hover-tip' })
            .setLatLng(e.latlng)
            .setContent(content)
            .addTo(map);
        } else {
          hoverTooltipRef.current.setLatLng(e.latlng).setContent(content);
        }
      } else {
        if (hoverTooltipRef.current) {
          map.removeLayer(hoverTooltipRef.current);
          hoverTooltipRef.current = null;
        }
      }
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [onUserLayerChange]);

  // Handle Stage Changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const drawnItems = drawnItemsRef.current;
    const refLayer = refLayerRef.current;
    if (!map || !drawnItems || !refLayer) return;

    // Reset current active drawer
    if (activeDrawerRef.current) {
      activeDrawerRef.current.disable();
      activeDrawerRef.current = null;
    }

    drawnItems.clearLayers();
    refLayer.clearLayers();
    onUserLayerChange(null);

    // Pin icons
    const refPinVisible = L.divIcon({
      className: 'ref-pin',
      html: `<div style="width:40px; height:40px; display:flex; align-items:center; justify-content:center;">
               <div style="background-color:#ef4444; width:13px; height:13px; border-radius:50%; border:2px solid #fff; box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>
             </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const refPinHidden = L.divIcon({
      className: 'ref-pin-hidden',
      html: `<div style="width:40px; height:40px;"></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (stage === 1) {
      // Stage 1: Point & Attribute
      ALL_LOCATIONS.forEach((pt) => {
        const marker = L.marker([pt.lat, pt.lng], { icon: refPinHidden, keyboard: false }).addTo(refLayer);
        marker.bindTooltip(
          `<div style="text-align:center; font-family:'Noto Sans Thai', sans-serif;">
             <b style="font-size:12.5px; color:#0f172a;">${pt.name}</b><br/>
             <img src="${pt.img}" style="width:120px; height:80px; object-fit:cover; border-radius:5px; margin-top:4px;" onerror="this.style.display='none'">
           </div>`,
          { direction: 'top', opacity: 0.95, sticky: true }
        );
      });

      if (currentTarget) {
        map.setView([currentTarget.lat, currentTarget.lng], 16);
      }

      map.off('click');
      map.on('click', (e: L.LeafletMouseEvent) => {
        const vectorState = useVectorStore.getState();
        if (vectorState.stage !== 1 || !vectorState.timerRunning) return;
        drawnItems.clearLayers();

        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        const userPin = L.divIcon({
          className: 'user-pin',
          html: `<div style="background-color:#2563eb; width:22px; height:22px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 3px 8px rgba(0,0,0,0.3);"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const newMarker: any = L.marker(e.latlng, { icon: userPin }).addTo(drawnItems);

        const targetName = useVectorStore.getState().currentTarget?.name || '';
        const popupDiv = document.createElement('div');
        popupDiv.style.cssText = "font-family: 'Noto Sans Thai', sans-serif; width: 220px;";
        popupDiv.innerHTML = `
          <h4 class="vector-popup-title" style="margin:0 0 4px; color:#0f172a; font-size:13px;">กรอกข้อมูล Attribute</h4>
          <p style="font-size:11px; color:#64748b; margin-bottom:6px;">Lat: ${lat}, Lng: ${lng}</p>
          <label style="font-size:11px; font-weight:600; color:#334155;">ชื่อสถานที่:</label>
          <input type="text" id="vecAttrName" value="${targetName}" style="width:100%; padding:5px; margin:2px 0 6px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px; box-sizing:border-box;">
          <label style="font-size:11px; font-weight:600; color:#334155;">ประเภทสถานที่:</label>
          <select id="vecAttrCat" style="width:100%; padding:5px; margin:2px 0 8px; border:1px solid #cbd5e1; border-radius:4px; font-size:12px; box-sizing:border-box;">
            <option value="คณะ/วิทยาลัย">คณะ / วิทยาลัย</option>
            <option value="อาคารบริการ">อาคารบริการ / ตลาด</option>
            <option value="แหล่งน้ำ/สวน">แหล่งน้ำ / สวนสาธารณะ</option>
            <option value="ศาสนสถาน">ศาสนสถาน</option>
            <option value="สถานศึกษา">สถานศึกษา</option>
            <option value="สถานพยาบาล">สถานพยาบาล</option>
          </select>
          <button type="button" id="btnSaveVecAttr" style="width:100%; background:#16a34a; color:#fff; border:none; padding:7px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:12px;">
            บันทึก Attribute Data
          </button>
        `;

        const btnSave = popupDiv.querySelector('#btnSaveVecAttr') as HTMLButtonElement;
        btnSave.onclick = (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          const nameInput = popupDiv.querySelector('#vecAttrName') as HTMLInputElement;
          const catSelect = popupDiv.querySelector('#vecAttrCat') as HTMLSelectElement;

          newMarker.attributeData = {
            name: nameInput ? nameInput.value : targetName,
            cat: catSelect ? catSelect.value : 'คณะ/วิทยาลัย',
            lat,
            lng,
          };

          popupDiv.innerHTML = `
            <div style="font-family:'Noto Sans Thai', sans-serif;">
              <h4 class="vector-popup-title" style="margin:0 0 4px; color:#2563eb; font-size:13px;">เวกเตอร์จุด (Point Feature)</h4>
              <p style="font-size:12px; margin:2px 0;"><b>สถานที่:</b> ${newMarker.attributeData.name}</p>
              <p style="font-size:12px; margin:2px 0;"><b>ประเภท:</b> ${newMarker.attributeData.cat}</p>
              <p style="font-size:11px; color:#64748b; margin:2px 0;">พิกัด: ${lat}, ${lng}</p>
              <span style="display:inline-block; margin-top:4px; font-size:11px; color:#16a34a; font-weight:bold;">✓ บันทึก Attribute แล้ว</span>
              <div style="display:flex; gap:6px; margin-top:9px;">
                <button type="button" id="btnCheckVecPoint" style="flex:1; background:#2563eb; color:#fff; border:none; padding:7px 5px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">ตรวจคำตอบ</button>
                <button type="button" id="btnClearVecPoint" style="flex:1; background:#fff; color:#b42318; border:1px solid #e6aaa2; padding:7px 5px; border-radius:6px; font-weight:bold; cursor:pointer; font-size:11px;">ลบ / วาดใหม่</button>
              </div>
            </div>
          `;
          const btnCheck = popupDiv.querySelector('#btnCheckVecPoint') as HTMLButtonElement;
          const btnClear = popupDiv.querySelector('#btnClearVecPoint') as HTMLButtonElement;
          btnCheck.onclick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            onCheckRef.current(newMarker);
          };
          btnClear.onclick = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            onClearRef.current();
          };
          newMarker.getPopup()?.update();
          onUserLayerChange(newMarker);
        };

        newMarker.bindPopup(popupDiv, { minWidth: 220 }).openPopup();
        onUserLayerChange(newMarker);
      });
    } else if (stage === 2) {
      // Stage 2: Line
      ALL_LOCATIONS.forEach((pt) => {
        L.marker([pt.lat, pt.lng], { icon: refPinVisible, keyboard: false }).addTo(refLayer);
      });

      const bounds = L.latLngBounds(ALL_LOCATIONS.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });

      map.off('click');
      if (timerRunning) {
        const drawer = new (L.Draw as any).Polyline(map, {
          shapeOptions: { color: '#2563eb', weight: 5 },
        });
        drawer.enable();
        activeDrawerRef.current = drawer;
      }
    } else if (stage === 3) {
      // Stage 3: Polygon
      map.setView([16.472906, 102.819468], 17);

      map.off('click');
      if (timerRunning) {
        const drawer = new (L.Draw as any).Polygon(map, {
          shapeOptions: { color: '#8b5cf6', weight: 3, fillOpacity: 0.4 },
        });
        drawer.enable();
        activeDrawerRef.current = drawer;
      }
    }
  }, [stage, timerRunning, currentTarget, currentLineTargets, onUserLayerChange]);

  // Clear / Redraw trigger
  useEffect(() => {
    if (clearTrigger === 0) return;
    const drawnItems = drawnItemsRef.current;
    if (drawnItems) {
      drawnItems.clearLayers();
    }
    onUserLayerChange(null);

    if (activeDrawerRef.current) {
      activeDrawerRef.current.disable();
      activeDrawerRef.current.enable();
    }
  }, [clearTrigger, onUserLayerChange]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: 'calc(100vh - 60px)' }}
    />
  );
};
