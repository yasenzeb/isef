import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls, GLTFLoader, DRACOLoader } from 'three-stdlib';
import { RotateCcw, AlertTriangle, Waves, Compass, Eye, ShieldAlert } from 'lucide-react';

interface GeologyModelViewerProps {
  modelUrl: string;
  /** Shake intensity: 0 = stationary, 0.1 - 1.0 = increasing tremor */
  intensity?: number;
  /** Optional mode: earthquake or tsunami */
  disasterType?: 'earthquake' | 'tsunami';
}

export const GeologyModelViewer: React.FC<GeologyModelViewerProps> = ({
  modelUrl,
  intensity = 0,
  disasterType = 'earthquake',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewWireframe, setViewWireframe] = useState(false);

  // References for live updates inside animation loop
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const groundGridRef = useRef<THREE.GridHelper | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;
  const disasterTypeRef = useRef(disasterType);
  disasterTypeRef.current = disasterType;
  const controlsRef = useRef<OrbitControls | null>(null);
  const initialCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 6));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setLoadProgress(0);
    setLoadError(null);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a1a);
    scene.fog = new THREE.FogExp2(0x050a1a, 0.035);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.copy(initialCamPosRef.current);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // Clear previous children in container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Don't go below ground
    controls.minDistance = 1;
    controls.maxDistance = 60;
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    sunLight.position.set(20, 35, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    const d = 15;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x6366f1, 0.6);
    fillLight.position.set(-20, 15, -20);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x050a1a, 0.4);
    scene.add(hemiLight);

    // 6. Ground & Foundation Base
    const groundGrid = new THREE.GridHelper(40, 40, 0x6366f1, 0x1e293b);
    groundGrid.position.y = -0.01;
    scene.add(groundGrid);
    groundGridRef.current = groundGrid;

    // Foundation circular plate
    const padGeo = new THREE.CylinderGeometry(8, 8.5, 0.2, 48);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = -0.1;
    pad.receiveShadow = true;
    scene.add(pad);

    // Tsunami water plane (hidden or low when earthquake)
    const waterGeo = new THREE.PlaneGeometry(60, 60, 32, 32);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.8,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    waterMesh.position.y = -2; // below pad initially
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // 7. Group to hold model and handle transformations & vibration
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;

    // 8. GLTF Loader with DRACO
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    let isDisposed = false;

    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;

        // Clear existing model children
        while (modelGroup.children.length > 0) {
          modelGroup.remove(modelGroup.children[0]);
        }

        const root = gltf.scene;

        // Enable shadows and gather materials for wireframe toggle
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
          }
        });

        // Compute Bounding Box to auto-scale and center the model
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 6; // Normalized scale in scene units
        const scale = maxDim > 0 ? targetSize / maxDim : 1;

        root.scale.setScalar(scale);

        // Center on X and Z, and place base on Y=0
        root.position.x = -center.x * scale;
        root.position.z = -center.z * scale;
        root.position.y = -box.min.y * scale;

        modelGroup.add(root);

        // Position camera nicely based on target size
        const camDistance = targetSize * 1.5;
        camera.position.set(camDistance * 0.9, targetSize * 0.7, camDistance * 1.1);
        initialCamPosRef.current.copy(camera.position);
        controls.target.set(0, targetSize * 0.35, 0);
        controls.update();

        setLoading(false);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadProgress(pct);
        }
      },
      (error) => {
        if (isDisposed) return;
        console.error('Error loading 3D geology model:', error);
        setLoadError(error.message || 'Failed to load 3D model.');
        setLoading(false);
      }
    );

    // 9. Animation Loop with realistic seismic dynamics
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      controls.update();

      const currentIntensity = intensityRef.current;
      const currentDisaster = disasterTypeRef.current;

      if (modelGroupRef.current) {
        if (currentIntensity > 0) {
          // Dynamic earthquake frequencies (P-wave high freq + S-wave low freq shear)
          const pWave = Math.sin(elapsed * 24.0) * 0.05 * currentIntensity;
          const sWave = Math.sin(elapsed * 8.0) * 0.25 * currentIntensity;
          const lateralTwist = Math.cos(elapsed * 6.0) * 0.035 * currentIntensity;
          const verticalHeave = Math.sin(elapsed * 16.0) * 0.04 * currentIntensity;

          // Shake building group
          modelGroupRef.current.position.x = sWave * 0.4 + pWave * 0.2;
          modelGroupRef.current.position.z = lateralTwist * 0.4;
          modelGroupRef.current.position.y = Math.abs(verticalHeave);

          // Angular tilt / shear strain
          modelGroupRef.current.rotation.z = -sWave * 0.06;
          modelGroupRef.current.rotation.x = lateralTwist * 0.04;
          modelGroupRef.current.rotation.y = pWave * 0.02;

          // Shake ground grid in sync
          if (groundGridRef.current) {
            groundGridRef.current.position.x = sWave * 0.15;
            groundGridRef.current.position.z = lateralTwist * 0.15;
          }
        } else {
          // Smooth return to resting state
          modelGroupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.1);
          modelGroupRef.current.rotation.x = THREE.MathUtils.lerp(modelGroupRef.current.rotation.x, 0, 0.1);
          modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(modelGroupRef.current.rotation.y, 0, 0.1);
          modelGroupRef.current.rotation.z = THREE.MathUtils.lerp(modelGroupRef.current.rotation.z, 0, 0.1);

          if (groundGridRef.current) {
            groundGridRef.current.position.set(0, -0.01, 0);
          }
        }
      }

      // Water height behavior during tsunami simulation
      if (waterMeshRef.current) {
        if (currentDisaster === 'tsunami' && currentIntensity > 0) {
          // Surge water upwards based on intensity
          const targetWaterY = -0.5 + currentIntensity * 1.8 + Math.sin(elapsed * 3.0) * 0.15;
          waterMeshRef.current.position.y = THREE.MathUtils.lerp(waterMeshRef.current.position.y, targetWaterY, 0.05);
        } else {
          waterMeshRef.current.position.y = THREE.MathUtils.lerp(waterMeshRef.current.position.y, -3.0, 0.08);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      dracoLoader.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelUrl]);

  // Wireframe toggle effect
  useEffect(() => {
    if (!modelGroupRef.current) return;
    modelGroupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => {
            if (m && 'wireframe' in m) {
              (m as unknown as { wireframe: boolean }).wireframe = viewWireframe;
            }
          });
        } else if (mesh.material && 'wireframe' in mesh.material) {
          (mesh.material as unknown as { wireframe: boolean }).wireframe = viewWireframe;
        }
      }
    });
  }, [viewWireframe]);

  const handleResetCamera = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden select-none bg-[#050a1a]" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050a1a]/85 backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 glow-pulse" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <Compass className="w-7 h-7 text-white animate-spin" />
          </div>
          <span className="text-sm font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            جاري تحميل النموذج ثلاثي الأبعاد...
          </span>
          <span className="text-xs text-slate-400 mb-3">Loading 3D Photorealistic Mesh</span>
          <div className="w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${loadProgress > 0 ? loadProgress : 60}%`,
                background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              }}
            />
          </div>
          {loadProgress > 0 && <span className="text-[10px] text-slate-400 font-mono mt-1.5">{loadProgress}%</span>}
        </div>
      )}

      {/* Error Overlay */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050a1a]/90 backdrop-blur-md p-6 text-center">
          <AlertTriangle className="w-10 h-10 text-rose-500 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">تعذر تحميل النموذج ثلاثي الأبعاد</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">{loadError}</p>
        </div>
      )}

      {/* Top Overlay Badge & Active Force Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md" style={{ background: 'rgba(5,10,26,0.75)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {disasterType === 'earthquake' ? (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Waves className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span className="text-white">
            {disasterType === 'earthquake' ? 'محاكي الاهتزاز الزلزالي' : 'محاكي اجتياح التسونامي'}
          </span>
        </div>

        {intensity > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono backdrop-blur-md animate-pulse" style={{ background: intensity > 0.7 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', border: intensity > 0.7 ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(245,158,11,0.4)', color: intensity > 0.7 ? '#f87171' : '#fbbf24' }}>
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>شدة الاهتزاز: {(intensity * 10).toFixed(1)} / 10</span>
          </div>
        )}
      </div>

      {/* Floating Toolbar Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setViewWireframe(!viewWireframe)}
          title="تبديل الهيكل الشبكي (Wireframe)"
          className="p-2.5 rounded-xl backdrop-blur-md text-xs font-medium transition-all"
          style={{
            background: viewWireframe ? 'rgba(99,102,241,0.3)' : 'rgba(5,10,26,0.75)',
            border: viewWireframe ? '1px solid rgba(99,102,241,0.6)' : '1px solid rgba(255,255,255,0.1)',
            color: viewWireframe ? '#818cf8' : '#94a3b8',
          }}
        >
          <Eye className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetCamera}
          title="إعادة ضبط زاوية الرؤية"
          className="p-2.5 rounded-xl backdrop-blur-md text-xs font-medium transition-all hover:text-white"
          style={{
            background: 'rgba(5,10,26,0.75)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
          }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Hint Footer */}
      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-slate-500 backdrop-blur-md px-2.5 py-1 rounded-lg pointer-events-none" style={{ background: 'rgba(5,10,26,0.6)' }}>
        اسحب للتدوير • Scroll للتكبير • زر الماوس الأيمن للتحريك
      </div>
    </div>
  );
};
