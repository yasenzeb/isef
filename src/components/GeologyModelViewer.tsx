import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls, GLTFLoader, DRACOLoader } from 'three-stdlib';
import { RotateCcw, AlertTriangle, Waves, Compass, Eye, ShieldAlert, Hammer, RefreshCw } from 'lucide-react';

interface GeologyModelViewerProps {
  modelUrl: string;
  /** Shake/Disaster intensity: 0 = stationary, 0.1 - 1.0 = increasing tremor or tsunami surge */
  intensity?: number;
  /** Disaster mode: earthquake or tsunami */
  disasterType?: 'earthquake' | 'tsunami';
  /** Callback notifying parent of current structural integrity (0 to 100%) */
  onIntegrityChange?: (integrity: number, isCollapsed: boolean) => void;
}

// Building structural resistance threshold definitions
export const getBuildingThreshold = (url: string): { threshold: number; nameEn: string; nameAr: string; type: string } => {
  if (url.includes('abandoned')) {
    return { threshold: 0.35, nameEn: 'Abandoned Masonry', nameAr: 'مبنى قديم مهجور', type: 'unreinforced' };
  }
  if (url.includes('wooden') || url.includes('cottage')) {
    return { threshold: 0.48, nameEn: 'Timber Cottage', nameAr: 'كوخ خشبي', type: 'timber' };
  }
  if (url.includes('construction')) {
    return { threshold: 0.60, nameEn: 'Construction Site', nameAr: 'هيكل تحت الإنشاء', type: 'concrete_frame' };
  }
  if (url.includes('apartment')) {
    return { threshold: 0.75, nameEn: 'Modern Apartment', nameAr: 'مبنى سكني حديث', type: 'reinforced' };
  }
  if (url.includes('tall')) {
    return { threshold: 0.88, nameEn: 'Tall Highrise Tower', nameAr: 'برج شاهق مع عوازل', type: 'damped_highrise' };
  }
  return { threshold: 0.65, nameEn: 'Standard Structure', nameAr: 'مبنى قياسي', type: 'standard' };
};

export const GeologyModelViewer: React.FC<GeologyModelViewerProps> = ({
  modelUrl,
  intensity = 0,
  disasterType = 'earthquake',
  onIntegrityChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewWireframe, setViewWireframe] = useState(false);
  const [isCollapsedState, setIsCollapsedState] = useState(false);
  const [integrityState, setIntegrityState] = useState(100);

  // Structural threshold for currently loaded model
  const structureInfo = useMemo(() => getBuildingThreshold(modelUrl), [modelUrl]);

  // References for live Three.js animation updates
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const initialMeshTransforms = useRef<Map<THREE.Mesh, { pos: THREE.Vector3; rot: THREE.Euler }>>(new Map());
  const groundGridRef = useRef<THREE.GridHelper | null>(null);
  const waveMeshRef = useRef<THREE.Mesh | null>(null);
  const waterBasinRef = useRef<THREE.Mesh | null>(null);
  const debrisParticlesRef = useRef<THREE.Points | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const initialCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 4, 8));

  // Mutable animation state refs
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;
  const disasterTypeRef = useRef(disasterType);
  disasterTypeRef.current = disasterType;
  const collapseProgressRef = useRef(0); // 0 = perfectly intact, 1 = completely collapsed
  const waveZRef = useRef(-25); // Current wave surge position along Z

  // Reset/Rebuild building function
  const handleRebuild = () => {
    collapseProgressRef.current = 0;
    waveZRef.current = -25;
    setIsCollapsedState(false);
    setIntegrityState(100);

    if (onIntegrityChange) {
      onIntegrityChange(100, false);
    }

    if (modelGroupRef.current) {
      modelGroupRef.current.position.set(0, 0, 0);
      modelGroupRef.current.rotation.set(0, 0, 0);

      // Restore child meshes
      initialMeshTransforms.current.forEach((t, mesh) => {
        mesh.position.copy(t.pos);
        mesh.rotation.copy(t.rot);
      });
    }

    // Hide debris
    if (debrisParticlesRef.current) {
      debrisParticlesRef.current.visible = false;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setLoading(true);
    setLoadProgress(0);
    setLoadError(null);
    collapseProgressRef.current = 0;
    setIsCollapsedState(false);
    setIntegrityState(100);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050a1a);
    scene.fog = new THREE.FogExp2(0x050a1a, 0.028);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.copy(initialCamPosRef.current);

    // 3. Renderer with high performance and mobile touch handling
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls (Optimized for desktop mouse & mobile touch)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Restrict camera from dipping below ground
    controls.minDistance = 1.5;
    controls.maxDistance = 65;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e6, 2.2);
    sunLight.position.set(25, 40, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 180;
    const d = 16;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x6366f1, 0.7);
    rimLight.position.set(-25, 18, -25);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x050a1a, 0.45);
    scene.add(hemiLight);

    // 6. Ground Foundation Plate & Seismic Grid
    const groundGrid = new THREE.GridHelper(50, 50, 0x6366f1, 0x1e293b);
    groundGrid.position.y = -0.01;
    scene.add(groundGrid);
    groundGridRef.current = groundGrid;

    // Foundation concrete pad (seismic base plate)
    const padGeo = new THREE.CylinderGeometry(9, 9.6, 0.25, 48);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2,
    });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.position.y = -0.125;
    pad.receiveShadow = true;
    scene.add(pad);

    // 7. REAL 3D TSUNAMI WAVE SURGE MESH (A curved sweeping wave crest)
    const waveWidth = 26;
    const waveSegments = 40;
    const waveGeo = new THREE.PlaneGeometry(waveWidth, 10, waveSegments, 16);
    
    // Deform plane into a realistic rolling wave curve
    const posAttr = waveGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const y = posAttr.getY(i);
      // Curve vertices to form a crest curl
      const curve = Math.sin((y / 10 + 0.5) * Math.PI * 0.75);
      posAttr.setZ(i, curve * 2.5);
    }
    waveGeo.computeVertexNormals();

    const waveMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
      metalness: 0.75,
      side: THREE.DoubleSide,
    });
    const waveMesh = new THREE.Mesh(waveGeo, waveMat);
    waveMesh.rotation.y = Math.PI; // Face toward building
    waveMesh.position.set(0, -5, -25); // Start far back
    scene.add(waveMesh);
    waveMeshRef.current = waveMesh;

    // Flood water basin plane
    const waterBasinGeo = new THREE.PlaneGeometry(70, 70, 16, 16);
    const waterBasinMat = new THREE.MeshStandardMaterial({
      color: 0x0891b2,
      transparent: true,
      opacity: 0.6,
      roughness: 0.15,
      metalness: 0.8,
    });
    const waterBasin = new THREE.Mesh(waterBasinGeo, waterBasinMat);
    waterBasin.rotation.x = -Math.PI / 2;
    waterBasin.position.y = -3;
    scene.add(waterBasin);
    waterBasinRef.current = waterBasin;

    // 8. COLLAPSE DUST & DEBRIS PARTICLES
    const debrisCount = 180;
    const debrisGeo = new THREE.BufferGeometry();
    const debrisPositions = new Float32Array(debrisCount * 3);
    const debrisVelocities: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < debrisCount; i++) {
      debrisPositions[i * 3] = (Math.random() - 0.5) * 5;
      debrisPositions[i * 3 + 1] = Math.random() * 0.5;
      debrisPositions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      debrisVelocities.push({
        x: (Math.random() - 0.5) * 3,
        y: Math.random() * 4 + 1.5,
        z: (Math.random() - 0.5) * 3,
      });
    }
    debrisGeo.setAttribute('position', new THREE.BufferAttribute(debrisPositions, 3));
    const debrisMat = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.35,
      transparent: true,
      opacity: 0.75,
    });
    const debrisPoints = new THREE.Points(debrisGeo, debrisMat);
    debrisPoints.visible = false;
    scene.add(debrisPoints);
    debrisParticlesRef.current = debrisPoints;

    // 9. Model Group (Holds building meshes and handles collapse transforms)
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    initialMeshTransforms.current.clear();

    // 10. Load GLB Model with DRACO
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    let isDisposed = false;

    loader.load(
      modelUrl,
      (gltf) => {
        if (isDisposed) return;

        while (modelGroup.children.length > 0) {
          modelGroup.remove(modelGroup.children[0]);
        }

        const root = gltf.scene;

        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // Record original local transform for fracture & reset
            initialMeshTransforms.current.set(mesh, {
              pos: mesh.position.clone(),
              rot: mesh.rotation.clone(),
            });
          }
        });

        // Compute Bounding Box to auto-scale and center the building on the pad
        const box = new THREE.Box3().setFromObject(root);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const targetSize = 6.2;
        const scale = maxDim > 0 ? targetSize / maxDim : 1;

        root.scale.setScalar(scale);
        root.position.x = -center.x * scale;
        root.position.z = -center.z * scale;
        root.position.y = -box.min.y * scale;

        modelGroup.add(root);

        // Position camera
        const camDistance = targetSize * 1.6;
        camera.position.set(camDistance * 0.95, targetSize * 0.8, camDistance * 1.15);
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

    // 11. Physics Animation Loop with REAL Structural Collapse & Tsunami Waves
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      controls.update();

      const currentIntensity = intensityRef.current;
      const currentDisaster = disasterTypeRef.current;
      const threshold = structureInfo.threshold;

      // Check if threshold is breached -> Trigger REAL Structural Failure
      const isExceeded = currentIntensity > threshold;

      if (isExceeded) {
        // Accelerate collapse progress
        const collapseSpeed = (currentIntensity - threshold + 0.15) * 1.4;
        collapseProgressRef.current = Math.min(1.0, collapseProgressRef.current + delta * collapseSpeed);
      }

      const collapseProg = collapseProgressRef.current;
      const currentIntegrity = Math.max(0, Math.round((1 - collapseProg) * 100));

      // Update state for UI display
      if (Math.abs(currentIntegrity - integrityState) > 2 || (collapseProg >= 0.85 && !isCollapsedState)) {
        setIntegrityState(currentIntegrity);
        if (collapseProg >= 0.85 && !isCollapsedState) {
          setIsCollapsedState(true);
        }
        if (onIntegrityChange) {
          onIntegrityChange(currentIntegrity, collapseProg >= 0.85);
        }
      }

      // --- A. BUILDING SEISMIC BEHAVIOR & COLLAPSE ---
      if (modelGroupRef.current) {
        if (collapseProg > 0) {
          // REAL COLLAPSE: Building buckles at the foundation, tilts sharply, and sinks into rubble
          const tiltAngleZ = collapseProg * 1.35; // ~77 degrees tilt
          const tiltAngleX = collapseProg * 0.45;
          const sinkY = -collapseProg * 2.2; // Sinks down into the foundation plate

          // Tremor during collapse
          const crumbleTremor = (1 - collapseProg) * (Math.sin(elapsed * 35.0) * 0.15);

          modelGroupRef.current.position.y = sinkY + crumbleTremor;
          modelGroupRef.current.position.x = (collapseProg * 1.2) + crumbleTremor;
          modelGroupRef.current.rotation.z = -tiltAngleZ;
          modelGroupRef.current.rotation.x = tiltAngleX;

          // Mesh internal fracturing: displace individual child meshes slightly
          if (collapseProg > 0.3) {
            let meshIdx = 0;
            initialMeshTransforms.current.forEach((t, mesh) => {
              meshIdx++;
              const fractureFactor = (collapseProg - 0.3) * 0.8;
              const seed = (meshIdx % 5) - 2;
              mesh.position.x = t.pos.x + seed * fractureFactor * 0.2;
              mesh.position.y = t.pos.y - fractureFactor * 0.3;
              mesh.rotation.z = t.rot.z + seed * fractureFactor * 0.15;
            });
          }

          // Trigger dust and rubble particles
          if (debrisParticlesRef.current) {
            debrisParticlesRef.current.visible = true;
            const pos = debrisParticlesRef.current.geometry.attributes.position;
            for (let i = 0; i < debrisCount; i++) {
              let py = pos.getY(i) + debrisVelocities[i].y * delta;
              let px = pos.getX(i) + debrisVelocities[i].x * delta;
              let pz = pos.getZ(i) + debrisVelocities[i].z * delta;

              // Gravity on debris
              debrisVelocities[i].y -= 4.0 * delta;

              // Ground bounce/settle
              if (py < 0) {
                py = 0;
                debrisVelocities[i].y = -debrisVelocities[i].y * 0.3;
              }

              pos.setXYZ(i, px, py, pz);
            }
            pos.needsUpdate = true;
          }

        } else if (currentIntensity > 0) {
          // Standing Tremors (before collapse threshold)
          const pWave = Math.sin(elapsed * 26.0) * 0.05 * currentIntensity;
          const sWave = Math.sin(elapsed * 9.0) * 0.28 * currentIntensity;
          const lateralTwist = Math.cos(elapsed * 7.0) * 0.04 * currentIntensity;
          const verticalHeave = Math.sin(elapsed * 18.0) * 0.04 * currentIntensity;

          modelGroupRef.current.position.x = sWave * 0.45 + pWave * 0.2;
          modelGroupRef.current.position.z = lateralTwist * 0.4;
          modelGroupRef.current.position.y = Math.abs(verticalHeave);

          modelGroupRef.current.rotation.z = -sWave * 0.07;
          modelGroupRef.current.rotation.x = lateralTwist * 0.05;
          modelGroupRef.current.rotation.y = pWave * 0.02;

          if (groundGridRef.current) {
            groundGridRef.current.position.x = sWave * 0.18;
            groundGridRef.current.position.z = lateralTwist * 0.18;
          }

          if (debrisParticlesRef.current) {
            debrisParticlesRef.current.visible = false;
          }

        } else {
          // Smooth resting state
          modelGroupRef.current.position.lerp(new THREE.Vector3(0, 0, 0), 0.12);
          modelGroupRef.current.rotation.x = THREE.MathUtils.lerp(modelGroupRef.current.rotation.x, 0, 0.12);
          modelGroupRef.current.rotation.y = THREE.MathUtils.lerp(modelGroupRef.current.rotation.y, 0, 0.12);
          modelGroupRef.current.rotation.z = THREE.MathUtils.lerp(modelGroupRef.current.rotation.z, 0, 0.12);

          if (groundGridRef.current) {
            groundGridRef.current.position.set(0, -0.01, 0);
          }
        }
      }

      // --- B. TSUNAMI 3D WAVE SURGE DYNAMICS ---
      if (waveMeshRef.current && waterBasinRef.current) {
        if (currentDisaster === 'tsunami' && currentIntensity > 0) {
          // Wave height scales directly with tsunami intensity (1.5 to 7.5 units)
          const waveHeight = currentIntensity * 7.0;
          waveMeshRef.current.scale.set(1.0, waveHeight / 10, 1.0);

          // Wave advances across Z axis toward building (Z = -25 to Z = +20)
          const waveSpeed = 8.0 + currentIntensity * 12.0; // Units per second
          waveZRef.current += waveSpeed * delta;

          if (waveZRef.current > 20) {
            // Loop wave back to deep ocean
            waveZRef.current = -25;
          }

          waveMeshRef.current.position.z = waveZRef.current;
          waveMeshRef.current.position.y = waveHeight * 0.45;

          // Flood basin rises
          const targetWaterY = -0.5 + currentIntensity * 2.2 + Math.sin(elapsed * 3.5) * 0.15;
          waterBasinRef.current.position.y = THREE.MathUtils.lerp(waterBasinRef.current.position.y, targetWaterY, 0.08);

          // Wave impact trigger on building
          if (Math.abs(waveZRef.current) < 2.0 && currentIntensity > threshold) {
            // Wave directly strikes and knocks over the building
            collapseProgressRef.current = Math.min(1.0, collapseProgressRef.current + delta * 2.5);
          }

        } else {
          // Retreat wave and lower water basin
          waveMeshRef.current.position.set(0, -10, -25);
          waterBasinRef.current.position.y = THREE.MathUtils.lerp(waterBasinRef.current.position.y, -4.0, 0.1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize Handler
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
  }, [modelUrl, structureInfo]);

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
    <div 
      className="relative w-full h-[540px] rounded-2xl overflow-hidden select-none bg-[#050a1a]" 
      style={{ border: '1px solid rgba(255,255,255,0.07)', touchAction: 'none' }}
    >
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }} />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050a1a]/85 backdrop-blur-md">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 glow-pulse" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <Compass className="w-7 h-7 text-white animate-spin" />
          </div>
          <span className="text-sm font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            جاري تحميل نموذج المبنى ثلاثي الأبعاد...
          </span>
          <span className="text-xs text-slate-400 mb-3">Loading 3D Structural Mesh & Physics Anchors</span>
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

      {/* Top Overlay Badge & Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md" style={{ background: 'rgba(5,10,26,0.85)', border: '1px solid rgba(255,255,255,0.1)' }}>
            {disasterType === 'earthquake' ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Waves className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="text-white">
              {disasterType === 'earthquake' ? 'محاكاة الزلازل وانهيار المنشآت' : 'محاكاة موجة التسونامي والاجتياح'}
            </span>
          </div>

          {/* Model Collapse Threshold Badge */}
          <div className="px-2.5 py-1 rounded-xl text-[11px] font-mono backdrop-blur-md bg-slate-900/80 border border-white/10 text-slate-300">
            حد الانهيار: <span className="text-rose-400 font-bold">{(structureInfo.threshold * 10).toFixed(1)} / 10</span>
          </div>
        </div>

        {/* Live Structural Health Gauge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono backdrop-blur-md bg-[#050a1a]/85 border border-white/10 max-w-xs">
          <span className="text-slate-400 text-[10px]">سلامة المبنى:</span>
          <div className="w-24 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-150"
              style={{
                width: `${integrityState}%`,
                background: integrityState > 60 ? '#10b981' : integrityState > 25 ? '#f59e0b' : '#ef4444'
              }}
            />
          </div>
          <span className={`font-bold ${integrityState > 60 ? 'text-emerald-400' : integrityState > 25 ? 'text-amber-400' : 'text-rose-400'}`}>
            {integrityState}%
          </span>
        </div>
      </div>

      {/* CATASTROPHIC COLLAPSE BANNER */}
      {isCollapsedState && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-950/90 border-2 border-rose-500 text-rose-200 text-xs font-bold shadow-2xl backdrop-blur-md animate-bounce">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>انهيار هيكلي كامل للمبنى! (تجاوز حد المقاومة)</span>
          </div>

          <button
            onClick={handleRebuild}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-105 active:scale-95"
          >
            <Hammer className="w-4 h-4" />
            <span>إعادة بناء وترميم المبنى (Rebuild Structure)</span>
          </button>
        </div>
      )}

      {/* Floating Toolbar Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
        {/* Rebuild Button */}
        {integrityState < 100 && (
          <button
            onClick={handleRebuild}
            title="إعادة بناء المبنى فوراً"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl backdrop-blur-md text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/50 hover:bg-emerald-900/80 transition-all shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5 animate-spin-reverse" />
            <span>إعادة بناء</span>
          </button>
        )}

        <button
          onClick={() => setViewWireframe(!viewWireframe)}
          title="تبديل الهيكل الشبكي (Wireframe)"
          className="p-2.5 rounded-xl backdrop-blur-md text-xs font-medium transition-all"
          style={{
            background: viewWireframe ? 'rgba(99,102,241,0.3)' : 'rgba(5,10,26,0.85)',
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
            background: 'rgba(5,10,26,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8',
          }}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Hint Footer */}
      <div className="absolute bottom-4 left-4 z-10 text-[10px] text-slate-400 backdrop-blur-md px-3 py-1 rounded-lg pointer-events-none" style={{ background: 'rgba(5,10,26,0.7)' }}>
        اسحب للتدوير 3D • تكبير بإصبعين/Scroll • تحريك زاوية المشاهدة
      </div>
    </div>
  );
};
export default GeologyModelViewer;
