import React, { useEffect, useRef } from 'react';
import { useCoordinateStore } from '../../store/coordinateStore';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { MapPinned, MousePointer2 } from 'lucide-react';

const GLOBE_R = 5;

function latLonToVec3(latDeg: number, lonDeg: number, r: number): THREE.Vector3 {
  const latRad = (latDeg * Math.PI) / 180;
  const lonRad = (lonDeg * Math.PI) / 180;
  return new THREE.Vector3(
    r * Math.cos(latRad) * Math.cos(lonRad),
    r * Math.sin(latRad),
    -r * Math.cos(latRad) * Math.sin(lonRad)
  );
}

export const Globe3DStage: React.FC = () => {
  const roundIndex = useCoordinateStore((s) => s.roundIndex);
  const targetB = useCoordinateStore((s) => s.targetB);
  const globeMarkers = useCoordinateStore((s) => s.globeMarkers);
  const toast = useCoordinateStore((s) => s.toast);
  const clickGlobeB = useCoordinateStore((s) => s.clickGlobeB);
  const revealedTarget = globeMarkers.find((marker) => marker.isTarget);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const labelRendererRef = useRef<CSS2DRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const reqAnimRef = useRef<number | null>(null);
  const labelsRef = useRef<Array<{ obj: CSS2DObject; dir: THREE.Vector3 }>>([]);

  useEffect(() => {
    const wrap = containerRef.current;
    if (!wrap) return;

    const w = wrap.clientWidth;
    const h = wrap.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 2, 13);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    wrap.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w, h);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.left = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    wrap.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.14;
    controls.rotateSpeed = 0.35;
    controls.enablePan = false;
    controls.minDistance = 7;
    controls.maxDistance = 18;
    controlsRef.current = controls;

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(8, 10, 6);
    scene.add(dirLight);

    // Sphere Globe
    const sphereGeo = new THREE.SphereGeometry(GLOBE_R, 64, 64);
    const sphereMat = new THREE.MeshPhongMaterial({ color: 0x1e3a8a, shininess: 8 });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);
    sphereMeshRef.current = sphereMesh;

    // Load Local Textures
    const texLoader = new THREE.TextureLoader();
    texLoader.load('/images/globe/earth-blue-marble.jpg', (tex) => {
      sphereMat.map = tex;
      sphereMat.color.set(0xffffff);
      sphereMat.needsUpdate = true;
    });
    texLoader.load('/images/globe/earth-topology.png', (bump) => {
      sphereMat.bumpMap = bump;
      sphereMat.bumpScale = 0.06;
      sphereMat.needsUpdate = true;
    });

    // Grid Parallels and Meridians
    const gridGroup = new THREE.Group();
    const SEG = 96;
    labelsRef.current = [];

    const addLabel = (text: string, latDeg: number, lonDeg: number, isAxis: boolean) => {
      const div = document.createElement('div');
      div.textContent = text;
      div.style.color = isAxis ? '#facc15' : '#ffffff';
      div.style.fontFamily = 'monospace';
      div.style.fontSize = '10.5px';
      div.style.fontWeight = isAxis ? '700' : '500';
      div.style.background = 'rgba(15, 23, 42, 0.75)';
      div.style.padding = '1px 6px';
      div.style.borderRadius = '4px';
      div.style.whiteSpace = 'nowrap';
      div.style.pointerEvents = 'none';

      const obj = new CSS2DObject(div);
      const pos = latLonToVec3(latDeg, lonDeg, GLOBE_R * 1.02);
      obj.position.copy(pos);
      scene.add(obj);
      labelsRef.current.push({ obj, dir: pos.clone().normalize() });
    };

    // Parallels (Latitudes)
    for (let lat = -60; lat <= 60; lat += 30) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= SEG; i++) {
        const lon = -180 + (360 * i) / SEG;
        pts.push(latLonToVec3(lat, lon, GLOBE_R * 1.002));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const isEq = lat === 0;
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: isEq ? 0xfacc15 : 0x93c5fd,
          transparent: true,
          opacity: isEq ? 0.95 : 0.4,
          linewidth: isEq ? 2 : 1,
        })
      );
      gridGroup.add(line);

      const latText = lat === 0 ? 'Equator 0°' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`;
      [-120, 0, 120].forEach((lonOff) => addLabel(latText, lat, lonOff, isEq));
    }

    // Meridians (Longitudes)
    for (let lon = -180; lon < 180; lon += 30) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= SEG; i++) {
        const lat = -90 + (180 * i) / SEG;
        pts.push(latLonToVec3(lat, lon, GLOBE_R * 1.002));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const isPrime = lon === 0;
      const line = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          color: isPrime ? 0xfacc15 : 0x93c5fd,
          transparent: true,
          opacity: isPrime ? 0.95 : 0.35,
          linewidth: isPrime ? 2 : 1,
        })
      );
      gridGroup.add(line);

      let lonText = `${Math.abs(lon)}°${lon > 0 ? 'E' : 'W'}`;
      if (lon === 0) lonText = 'Prime Meridian 0°';
      else if (lon === -180) lonText = '180°';
      addLabel(lonText, -12, lon, isPrime);
    }

    scene.add(gridGroup);

    // Marker Group
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    markerGroupRef.current = markerGroup;

    // Animation loop
    const animate = () => {
      reqAnimRef.current = requestAnimationFrame(animate);
      controls.update();

      if (renderer && scene && camera) {
        renderer.render(scene, camera);

        // Hide labels on back of globe
        if (labelRenderer && labelsRef.current.length) {
          labelsRef.current.forEach(({ obj, dir }) => {
            const toCam = camera.position.clone().sub(obj.position).normalize();
            const facing = dir.dot(toCam);
            obj.element.style.opacity = facing > 0.1 ? '1' : '0';
          });
          labelRenderer.render(scene, camera);
        }
      }
    };
    animate();

    // Double-click Raycaster: a single click only positions the globe; the answer is confirmed on double-click.
    const onCanvasDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(sphereMesh);
      if (hits.length === 0) return;

      const p = hits[0].point;
      const latGuess = (Math.asin(p.y / GLOBE_R) * 180) / Math.PI;
      const lonGuess = (Math.atan2(-p.z, p.x) * 180) / Math.PI;
      clickGlobeB(latGuess, lonGuess);
    };

    renderer.domElement.addEventListener('dblclick', onCanvasDoubleClick);

    const onResize = () => {
      if (!containerRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      if (newW === 0 || newH === 0) return;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      labelRenderer.setSize(newW, newH);
    };
    window.addEventListener('resize', onResize);

    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('dblclick', onCanvasDoubleClick);
      if (wrap.contains(renderer.domElement)) wrap.removeChild(renderer.domElement);
      if (wrap.contains(labelRenderer.domElement)) wrap.removeChild(labelRenderer.domElement);
    };
  }, [clickGlobeB]);

  // Sync markers
  useEffect(() => {
    const mg = markerGroupRef.current;
    if (!mg) return;
    mg.clear();

    globeMarkers.forEach((m) => {
      const pos = latLonToVec3(m.lat, m.lon, GLOBE_R * 1.03);
      const geo = new THREE.SphereGeometry(m.isTarget ? 0.3 : 0.18, 20, 20);
      const mat = new THREE.MeshBasicMaterial({ color: m.color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.renderOrder = m.isTarget ? 4 : 3;
      mg.add(mesh);

      if (m.isTarget) {
        const ringGeo = new THREE.TorusGeometry(0.48, 0.06, 12, 36);
        const ringMat = new THREE.MeshBasicMaterial({ color: '#f59e0b' });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(pos);
        ring.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), pos.clone().normalize());
        ring.renderOrder = 3;
        mg.add(ring);
      }
    });
  }, [globeMarkers]);

  // When time expires, bring the revealed answer to the front of the globe.
  useEffect(() => {
    if (!revealedTarget || !cameraRef.current || !controlsRef.current) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const targetDirection = latLonToVec3(revealedTarget.lat, revealedTarget.lon, 1).normalize();

    camera.position.copy(targetDirection.multiplyScalar(8.2));
    controls.target.set(0, 0, 0);
    controls.update();
  }, [revealedTarget]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Instruction Card */}
      <div
        style={{
          background: 'linear-gradient(180deg, #fdfaf0 0%, #f7f2e4 100%)',
          border: '1px solid #ddd0a6',
          borderLeft: '5px solid #c9972e',
          borderRadius: 12,
          padding: '16px 20px',
          maxWidth: 780,
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
          GLOBAL LOG
        </div>

        <div style={{ fontSize: 16, fontWeight: 700, color: '#0b2036', marginBottom: 4 }}>
          <MapPinned size={17} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {targetB ? `รอบที่ ${roundIndex}/5 — หาตำแหน่ง Lat ${targetB.latLabel}, Lon ${targetB.lonLabel}` : 'กำลังโหลด...'}
        </div>

        <div style={{ fontSize: 13, color: '#5b6b78', lineHeight: 1.5 }}>
          เส้นสีเหลืองคือ <b>เส้นศูนย์สูตร (Lat 0°)</b> และ <b>เส้นเมริเดียนแรก (Lon 0°)</b> ใช้เป็นจุดอ้างอิงนับไป — ลากเมาส์ช้า ๆ เพื่อหมุนลูกโลก แล้วดับเบิลคลิกตำแหน่งที่คาดว่าใช่เพื่อยืนยันคำตอบ
        </div>

        {toast && (
          <div
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

      {revealedTarget && (
        <div className="coordinate-globe-reveal" role="status" aria-live="polite">
          <strong>เฉลยตำแหน่งบนลูกโลก</strong>
          <span>{revealedTarget.label}</span>
          <small>ซูมไปยังจุดสีเหลืองแล้ว</small>
        </div>
      )}

      {/* 3D Globe Viewport */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          maxWidth: '92vw',
          height: 'min(62vh, 680px)',
          minHeight: 400,
          borderRadius: 12,
          overflow: 'hidden',
          border: '3px solid #0b2036',
          outline: '1px solid #c9972e',
          outlineOffset: -8,
          background: '#0b1220',
          position: 'relative',
          boxShadow: '0 14px 34px rgba(11,32,54,0.3)',
          cursor: 'grab',
        }}
      >
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            textAlign: 'center',
            fontSize: 12,
            color: '#93c5fd',
            pointerEvents: 'none',
            zIndex: 10,
            textShadow: '0 2px 4px rgba(0,0,0,0.8)',
          }}
        >
          <MousePointer2 size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} /> ลากเมาส์หรือทัชสกรีนช้า ๆ เพื่อหมุนลูกโลก 3 มิติ และดับเบิลคลิกเพื่อปักหมุดยืนยันตำแหน่ง
        </div>
      </div>
    </div>
  );
};
