import React, { useState, useEffect, useRef } from 'react';
import { useCoordinateStore } from '../../store/coordinateStore';
import {
  GRID_X_MIN,
  GRID_X_MAX,
  GRID_Y_MIN,
  GRID_Y_MAX,
  dataToPx,
  pxToData,
  gridToUTM,
  fmtNum,
  GRID_LEFT_PX,
  GRID_RIGHT_PX,
  GRID_TOP_PX,
  GRID_BOTTOM_PX,
  REFERENCE_LAT,
  REFERENCE_LON,
  MAP_SIZE_PX,
  UTM_EASTING_REFERENCE_POINTS,
  UTM_NORTHING_REFERENCE_POINTS,
} from '../../constants/coordinateData';
import L from 'leaflet';
import { ClipboardEdit, MapPinned } from 'lucide-react';

export const UTMGridStage: React.FC = () => {
  const roundIndex = useCoordinateStore((s) => s.roundIndex);
  const roundTypeA = useCoordinateStore((s) => s.roundTypeA);
  const targetA = useCoordinateStore((s) => s.targetA);
  const markersA = useCoordinateStore((s) => s.markersA);
  const guideA = useCoordinateStore((s) => s.guideA);
  const toast = useCoordinateStore((s) => s.toast);
  const clickPlotA = useCoordinateStore((s) => s.clickPlotA);
  const submitReadA = useCoordinateStore((s) => s.submitReadA);

  const activeBaseLayer = useCoordinateStore((s) => s.activeBaseLayer);
  const setActiveBaseLayer = useCoordinateStore((s) => s.setActiveBaseLayer);

  const [inputE, setInputE] = useState('');
  const [inputN, setInputN] = useState('');
  const [eastingLinePx, setEastingLinePx] = useState<Record<number, number>>({});
  const [northingLinePx, setNorthingLinePx] = useState<Record<number, number>>({});

  // The basemap is rendered in Web Mercator, so the UTM lines are not evenly
  // spaced in screen pixels. Markers must use the same projected positions as
  // the lines; using dataToPx here makes them drift away from the grid.
  const gridPointToPx = (x: number, y: number) => ({
    px: eastingLinePx[x] ?? dataToPx(x, 0).px,
    py: northingLinePx[y] ?? dataToPx(0, y).py,
  });

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const streetLayerRef = useRef<L.TileLayer | null>(null);
  const satLayerRef = useRef<L.TileLayer | null>(null);

  // Initialize Leaflet map
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer || leafletMapRef.current) return;

    streetLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
    });
    satLayerRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '&copy; Esri' }
    );

    const map = L.map(mapContainer, {
      center: [REFERENCE_LAT, REFERENCE_LON],
      // Regional view: keep the exact reference coordinate centered while
      // showing Thailand, Laos, and Vietnam together.
      zoom: 7,
      layers: [streetLayerRef.current],
      dragging: false,
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: false,
      keyboard: false,
      minZoom: 4,
      maxZoom: 18,
    });
    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Switch tile layer
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || !streetLayerRef.current || !satLayerRef.current) return;

    if (activeBaseLayer === 'street') {
      map.removeLayer(satLayerRef.current);
      map.addLayer(streetLayerRef.current);
    } else {
      map.removeLayer(streetLayerRef.current);
      map.addLayer(satLayerRef.current);
    }
  }, [activeBaseLayer]);

  // Project the supplied UTM control points into the Leaflet viewport so the
  // SVG grid lines follow the actual WGS84 positions on the basemap.
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const syncEastingLines = () => {
      const mapWidth = map.getSize().x;
      if (!mapWidth) return;
      const next: Record<number, number> = {};
      UTM_EASTING_REFERENCE_POINTS.forEach((point) => {
        const projected = map.latLngToContainerPoint([point.lat, point.lon]);
        next[point.x] = projected.x * (MAP_SIZE_PX / mapWidth);
      });
      setEastingLinePx(next);

      const nextNorthing: Record<number, number> = {};
      UTM_NORTHING_REFERENCE_POINTS.forEach((point) => {
        const projected = map.latLngToContainerPoint([point.lat, point.lon]);
        nextNorthing[point.y] = projected.y * (MAP_SIZE_PX / map.getSize().y);
      });
      setNorthingLinePx(nextNorthing);
    };

    map.whenReady(syncEastingLines);
    const frame = window.requestAnimationFrame(syncEastingLines);
    map.on('zoomend', syncEastingLines);
    window.addEventListener('resize', syncEastingLines);
    return () => {
      window.cancelAnimationFrame(frame);
      map.off('zoomend', syncEastingLines);
      window.removeEventListener('resize', syncEastingLines);
    };
  }, []);

  // Reset inputs on round change
  useEffect(() => {
    setInputE('');
    setInputN('');
  }, [roundIndex]);

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (roundTypeA !== 'plot') return;

    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) * (640 / rect.width);
    const py = (event.clientY - rect.top) * (640 / rect.height);
    const guess = pxToData(px, py);
    const nearestX = UTM_EASTING_REFERENCE_POINTS.reduce((best, point) => {
      const bestDistance = Math.abs((eastingLinePx[best] ?? dataToPx(best, 0).px) - px);
      const pointDistance = Math.abs((eastingLinePx[point.x] ?? dataToPx(point.x, 0).px) - px);
      return pointDistance < bestDistance ? point.x : best;
    }, guess.x);
    const nearestY = UTM_NORTHING_REFERENCE_POINTS.reduce((best, point) => {
      const bestDistance = Math.abs((northingLinePx[best] ?? dataToPx(0, best).py) - py);
      const pointDistance = Math.abs((northingLinePx[point.y] ?? dataToPx(0, point.y).py) - py);
      return pointDistance < bestDistance ? point.y : best;
    }, guess.y);
    clickPlotA(nearestX, nearestY);
  };

  const handleSubmitRead = () => {
    const eVal = parseInt(inputE.trim(), 10);
    const nVal = parseInt(inputN.trim(), 10);
    if (!isNaN(eVal) && !isNaN(nVal)) {
      submitReadA(eVal, nVal);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Instructions Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #fdfaf0 0%, #f7f2e4 100%)',
          border: '1px solid #ddd0a6',
          borderLeft: '5px solid #c9972e',
          borderRadius: 12,
          padding: '16px 20px',
        maxWidth: 960,
          width: '100%',
          boxShadow: '0 8px 20px rgba(11,32,54,0.12)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -10,
            left: 20,
            background: '#0b2036',
            color: '#e0b657',
            fontFamily: 'monospace',
            fontSize: 10,
            letterSpacing: '0.14em',
            padding: '2px 10px',
            borderRadius: 20,
            border: '1px solid #c9972e',
          }}
        >
          SURVEY LOG
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: '#0b2036', marginBottom: 4 }}>
          <MapPinned size={17} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {roundTypeA === 'plot' && targetA
            ? `รอบที่ ${roundIndex}/5 — คลิกที่พิกัด UTM (E=${fmtNum(targetA.E)}, N=${fmtNum(targetA.N)})`
            : `รอบที่ ${roundIndex}/5 — จุดสีน้ำเงินอยู่ที่พิกัด UTM ใด?`}
        </div>

        <div style={{ fontSize: 13, color: '#5b6b78', lineHeight: 1.5 }}>
          {roundTypeA === 'plot'
            ? 'นับจากจุดอ้างอิง (Origin) ไปทางตะวันออก (Easting) ก่อน แล้วขึ้น/ลงทางเหนือ (Northing) แต่ละช่อง = 100,000 เมตร (100 กม.) แล้วคลิกจุดตัดบนกริด'
            : 'อ่านค่า Easting (E) และ Northing (N) เป็นเมตร แล้วกรอกตัวเลขทั้งสองช่องด้านขวา'}
        </div>

        {toast && (
          <div
            className="coordinate-utm-map-surface"
            style={{
              marginTop: 10,
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 700,
              display: 'inline-block',
              background: toast.ok ? '#dcf3df' : '#f8ded9',
              color: toast.ok ? '#2f5233' : '#a3372a',
              border: toast.ok ? '1px solid #97c9a0' : '1px solid #e0a99e',
            }}
          >
            {toast.text}
          </div>
        )}
      </div>

      {/* Main Map & Form Container */}
      <div className="coordinate-utm-layout" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, width: '100%', flexWrap: 'wrap' }}>
        {/* Map Frame */}
        <div className="coordinate-utm-map-frame" style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: '0 1 720px', width: '100%', maxWidth: 720 }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '1 / 1',
              position: 'relative',
              border: '3px solid #31536f',
              borderRadius: 16,
              overflow: 'hidden',
              background: '#dfe7ec',
              boxShadow: '0 14px 32px rgba(11,32,54,0.2)',
            }}
          >
            {/* Background Leaflet Map */}
            <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }} />

            {/* Keep zoom controls above the coordinate overlay. */}
            <div style={{ position: 'absolute', top: 52, right: 10, zIndex: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button
                type="button"
                aria-label="ซูมเข้าแผนที่"
                onClick={() => leafletMapRef.current?.zoomIn()}
                style={{ width: 32, height: 32, border: '1px solid #0b2036', borderRadius: 5, background: '#ffffff', color: '#0b2036', fontSize: 22, lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 6px rgba(11,32,54,0.25)' }}
              >
                +
              </button>
              <button
                type="button"
                aria-label="ซูมออกแผนที่"
                onClick={() => leafletMapRef.current?.zoomOut()}
                style={{ width: 32, height: 32, border: '1px solid #0b2036', borderRadius: 5, background: '#ffffff', color: '#0b2036', fontSize: 22, lineHeight: 1, cursor: 'pointer', boxShadow: '0 2px 6px rgba(11,32,54,0.25)' }}
              >
                −
              </button>
            </div>

            {/* SVG Grid Overlay */}
            <svg
              viewBox="0 0 640 640"
              onClick={handleSvgClick}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                background: 'transparent',
                cursor: roundTypeA === 'plot' ? 'crosshair' : 'default',
                zIndex: 2,
              }}
            >
              {/* Easting grid lines */}
              {Array.from({ length: GRID_X_MAX - GRID_X_MIN + 1 }).map((_, idx) => {
                const x = GRID_X_MIN + idx;
                const px = eastingLinePx[x] ?? dataToPx(x, 0).px;
                const isOrigin = x === 0;
                const showLabel = true;
                const eVal = fmtNum(gridToUTM(x, 0).E);

                return (
                  <g key={`x-${x}`}>
                    <line
                      x1={px}
                      y1={GRID_TOP_PX}
                      x2={px}
                      y2={GRID_BOTTOM_PX}
                      stroke="#0f172a"
                      strokeWidth={isOrigin ? 2.2 : 1.2}
                      strokeOpacity={isOrigin ? 0.45 : 0.22}
                    />
                    <line
                      x1={px}
                      y1={GRID_TOP_PX}
                      x2={px}
                      y2={GRID_BOTTOM_PX}
                      stroke="#ffffff"
                      strokeWidth={isOrigin ? 1.0 : 0.65}
                      strokeOpacity={isOrigin ? 0.75 : 0.42}
                    />
                    {showLabel && (
                      <>
                        <text
                          x={px}
                          y={14}
                          fontSize={isOrigin ? '10.5' : '9'}
                          textAnchor="middle"
                          fill={isOrigin ? '#facc15' : '#ffffff'}
                          fontWeight={isOrigin ? 700 : 400}
                          fontFamily="monospace"
                          style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: 3 }}
                        >
                          {eVal}
                        </text>
                        <text
                          x={px}
                          y={632}
                          fontSize={isOrigin ? '10.5' : '9'}
                          textAnchor="middle"
                          fill={isOrigin ? '#facc15' : '#ffffff'}
                          fontWeight={isOrigin ? 700 : 400}
                          fontFamily="monospace"
                          style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: 3 }}
                        >
                          {eVal}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Northing grid lines */}
              {Array.from({ length: GRID_Y_MAX - GRID_Y_MIN + 1 }).map((_, idx) => {
                const y = GRID_Y_MIN + idx;
                const py = northingLinePx[y] ?? dataToPx(0, y).py;
                const isOrigin = y === 0;
                const showLabel = true;
                const nVal = fmtNum(gridToUTM(0, y).N);

                return (
                  <g key={`y-${y}`}>
                    <line
                      x1={GRID_LEFT_PX}
                      y1={py}
                      x2={GRID_RIGHT_PX}
                      y2={py}
                      stroke="#0f172a"
                      strokeWidth={isOrigin ? 2.2 : 1.2}
                      strokeOpacity={isOrigin ? 0.45 : 0.22}
                    />
                    <line
                      x1={GRID_LEFT_PX}
                      y1={py}
                      x2={GRID_RIGHT_PX}
                      y2={py}
                      stroke="#ffffff"
                      strokeWidth={isOrigin ? 1.0 : 0.65}
                      strokeOpacity={isOrigin ? 0.75 : 0.42}
                    />
                    {showLabel && (
                      <>
                        <text
                          x={8}
                          y={py + 3}
                          fontSize={isOrigin ? '10.5' : '9'}
                          textAnchor="start"
                          fill={isOrigin ? '#facc15' : '#ffffff'}
                          fontWeight={isOrigin ? 700 : 400}
                          fontFamily="monospace"
                          style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: 3 }}
                        >
                          {nVal}
                        </text>
                        <text
                          x={632}
                          y={py + 3}
                          fontSize={isOrigin ? '10.5' : '9'}
                          textAnchor="end"
                          fill={isOrigin ? '#facc15' : '#ffffff'}
                          fontWeight={isOrigin ? 700 : 400}
                          fontFamily="monospace"
                          style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: 3 }}
                        >
                          {nVal}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

              {/* Axis captions */}
              <text
                x={610}
                y={34}
                fontSize={10}
                textAnchor="end"
                fill="#fde047"
                fontFamily="monospace"
                fontWeight={700}
                style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: 3 }}
              >
                Easting (E) →
              </text>
              <text
                x={30}
                y={42}
                fontSize={10}
                textAnchor="start"
                fill="#fde047"
                fontFamily="monospace"
                fontWeight={700}
                style={{ paintOrder: 'stroke', stroke: '#0f172a', strokeWidth: 3 }}
              >
                ↑ Northing (N)
              </text>

              {/* Dynamic clicked markers */}
              {markersA.map((m, i) => {
                const { px, py } = gridPointToPx(m.x, m.y);
                return (
                  <circle
                    key={i}
                    cx={px}
                    cy={py}
                    r={7}
                    fill={m.color}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                );
              })}

              {/* Dashed guide lines when finished */}
              {guideA && (
                <g>
                  {(() => {
                    const { px, py } = gridPointToPx(guideA.x, guideA.y);
                    const t = gridToUTM(guideA.x, guideA.y);
                    return (
                      <>
                        <circle cx={px} cy={py} r={18} fill="rgba(245,158,11,0.22)" stroke="#f59e0b" strokeWidth={2.4} />
                        <circle cx={px} cy={py} r={6} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
                        <rect x={px - 24} y={py - 35} width={48} height={17} rx={4} fill="#2563a8" />
                        <text x={px} y={py - 23} fontSize={10} textAnchor="middle" fill="#ffffff" fontWeight={700} fontFamily="monospace">
                          เฉลย
                        </text>
                        <line
                          x1={px}
                          y1={py}
                          x2={px}
                          y2={18}
                          stroke="#dc2626"
                          strokeWidth={1.6}
                          strokeDasharray="5,4"
                          strokeOpacity={0.85}
                        />
                        <rect x={px - 28} y={2} width={56} height={15} rx={3} fill="#dc2626" />
                        <text x={px} y={13} fontSize={10} textAnchor="middle" fill="#ffffff" fontWeight={700} fontFamily="monospace">
                          {fmtNum(t.E)}
                        </text>

                        <line
                          x1={px}
                          y1={py}
                          x2={622}
                          y2={py}
                          stroke="#dc2626"
                          strokeWidth={1.6}
                          strokeDasharray="5,4"
                          strokeOpacity={0.85}
                        />
                        <rect x={554} y={py - 8} width={68} height={15} rx={3} fill="#dc2626" />
                        <text x={588} y={py + 3} fontSize={10} textAnchor="middle" fill="#ffffff" fontWeight={700} fontFamily="monospace">
                          {fmtNum(t.N)}
                        </text>
                      </>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Compass Rose */}
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 5, width: 44, height: 44, pointerEvents: 'none' }}>
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="rgba(11,32,54,0.6)" stroke="#c9972e" strokeWidth={2.5} />
                <line x1="50" y1="12" x2="50" y2="88" stroke="#e0b657" strokeWidth={1.4} />
                <line x1="12" y1="50" x2="88" y2="50" stroke="#e0b657" strokeWidth={1.4} />
                <polygon points="50,10 58,50 50,42 42,50" fill="#a3372a" />
                <polygon points="50,90 58,50 50,58 42,50" fill="#f7f2e4" />
                <text x="50" y="24" textAnchor="middle" fontSize="15" fill="#f7f2e4" fontFamily="monospace" fontWeight={700}>
                  N
                </text>
              </svg>
            </div>

            {/* Layer Toggle */}
            <div style={{ position: 'absolute', top: 10, left: 64, zIndex: 5, display: 'flex', gap: 6 }}>
              <button
                onClick={() => setActiveBaseLayer('street')}
                style={{
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: 11.5,
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: '1px solid #c9972e',
                  background: activeBaseLayer === 'street' ? '#c9972e' : 'rgba(11,32,54,0.75)',
                  color: activeBaseLayer === 'street' ? '#0b2036' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                ถนน
              </button>
              <button
                onClick={() => setActiveBaseLayer('satellite')}
                style={{
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  fontSize: 11.5,
                  padding: '5px 12px',
                  borderRadius: 20,
                  border: '1px solid #c9972e',
                  background: activeBaseLayer === 'satellite' ? '#c9972e' : 'rgba(11,32,54,0.75)',
                  color: activeBaseLayer === 'satellite' ? '#0b2036' : '#ffffff',
                  cursor: 'pointer',
                }}
              >
                ดาวเทียม
              </button>
            </div>
          </div>

          {/* Map Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, fontSize: 11.5, color: '#5b6b78', marginTop: 4 }}>
            <span style={{ fontFamily: 'monospace', background: 'rgba(11,32,54,0.06)', padding: '3px 10px', borderRadius: 20, color: '#0b2036' }}>
              UTM ZONE 48 · DATUM WGS84
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'monospace', fontSize: 10.5, color: '#0b2036', background: '#fff', border: '1px solid #ddd0a6', borderRadius: 20, padding: '3px 10px' }}>
              <span>0</span>
              <div style={{ width: 36, height: 6, background: '#0b2036', borderRadius: 2 }} />
              <span>100</span>
              <div style={{ width: 36, height: 6, background: '#ddd0a6', borderRadius: 2 }} />
              <span>200 กม.</span>
            </div>
          </div>
        </div>

        {/* Read Input Form (Round 2, 4) */}
        {roundTypeA === 'read' && (
          <div
            className="coordinate-utm-form"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              background: 'linear-gradient(180deg, #fdfaf0 0%, #f7f2e4 100%)',
              border: '1px solid #ddd0a6',
              borderRadius: 14,
              padding: '22px 20px',
              width: '100%',
              flex: '0 0 240px',
              maxWidth: 280,
              boxShadow: '0 14px 30px rgba(11,32,54,0.15)',
              position: 'relative',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: '#8a6a1f',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
                paddingBottom: 10,
                borderBottom: '1px dashed #ddd0a6',
              }}
            >
              <ClipboardEdit size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> กรอกพิกัดที่อ่านได้
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label htmlFor="utm-easting-input" style={{ fontSize: 13, color: '#0b2036', fontWeight: 700 }}>Easting (E)</label>
              <input
                id="utm-easting-input"
                type="number"
                value={inputE}
                onChange={(e) => setInputE(e.target.value)}
                placeholder="เช่น 500000"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #234868',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 15,
                  textAlign: 'center',
                  background: '#fff',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 11, color: '#5b6b78', alignSelf: 'flex-end' }}>เมตร</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label htmlFor="utm-northing-input" style={{ fontSize: 13, color: '#0b2036', fontWeight: 700 }}>Northing (N)</label>
              <input
                id="utm-northing-input"
                type="number"
                value={inputN}
                onChange={(e) => setInputN(e.target.value)}
                placeholder="เช่น 1600000"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #234868',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  fontSize: 15,
                  textAlign: 'center',
                  background: '#fff',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: 11, color: '#5b6b78', alignSelf: 'flex-end' }}>เมตร</span>
            </div>

            <button
              onClick={handleSubmitRead}
              disabled={!inputE || !inputN}
              style={{
                marginTop: 6,
                padding: '10px',
                background: 'linear-gradient(180deg, #e0b657, #c9972e)',
                border: '1px solid #8a6a1f',
                borderRadius: 8,
                color: '#0b2036',
                fontWeight: 700,
                fontSize: 14,
                cursor: !inputE || !inputN ? 'not-allowed' : 'pointer',
                opacity: !inputE || !inputN ? 0.6 : 1,
              }}
            >
              ตรวจคำตอบ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
