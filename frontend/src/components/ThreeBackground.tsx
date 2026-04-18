import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial, Float, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

// 1. Particle Cloud Theme
function ParticleCloud({ isDark }: { isDark: boolean }) {
  const ref = useRef<THREE.Points>(null!);
  const [sphere] = useState(() => {
    const positions = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  });

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={isDark ? "#8b5cf6" : "#4f46e5"}
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// 2. Animated Grid Theme (Neural Matrix)
function AnimatedGrid({ isDark }: { isDark: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    meshRef.current.position.z = (t * 2) % 2; 
  });

  return (
    <group position={[0, -1, -10]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshBasicMaterial color={isDark ? "#8b5cf6" : "#4f46e5"} wireframe opacity={isDark ? 0.15 : 0.3} transparent />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
         <planeGeometry args={[100, 100]} />
         <meshBasicMaterial color="var(--bg-dark)" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// 3. Floating Geometric Shapes
function FloatingShapes({ isDark }: { isDark: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const c1 = isDark ? "#8b5cf6" : "#4f46e5";
  const c2 = isDark ? "#06b6d4" : "#0ea5e9";

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.1;
    group.current.rotation.z = t * 0.05;
  });

  return (
    <group ref={group}>
      {[...Array(30)].map((_, i) => (
        <Float key={i} speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
          <mesh position={[(Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15]}>
            <octahedronGeometry args={[Math.random() * 0.4 + 0.1, 0]} />
            <meshStandardMaterial 
                color={i % 2 === 0 ? c1 : c2} 
                wireframe 
                emissive={i % 2 === 0 ? c1 : c2}
                emissiveIntensity={isDark ? 0.5 : 0.2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

// 4. Distorted Sphere (Abstract)
function AbstractSphere({ isDark }: { isDark: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.2;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -5]}>
      <sphereGeometry args={[2, 64, 64]} />
      <MeshDistortMaterial
        color={isDark ? "#4c1d95" : "#c7d2fe"}
        speed={1.5}
        distort={0.45}
        radius={1}
      />
    </mesh>
  );
}

// 5. Neural Space (Updated Stars & Light Mode Support)
function NeuralSpace({ isDark }: { isDark: boolean }) {
    const group = useRef<THREE.Group>(null!);
    const starCount = isDark ? 7000 : 3000;
    
    // Create custom star positions for light mode since 'Stars' doesn't support color shifting well
    const positions = useMemo(() => {
        const coords = new Float32Array(starCount * 3);
        for (let i = 0; i < starCount; i++) {
            coords[i * 3] = (Math.random() - 0.5) * 150;
            coords[i * 3 + 1] = (Math.random() - 0.5) * 150;
            coords[i * 3 + 2] = (Math.random() - 0.5) * 150;
        }
        return coords;
    }, [starCount]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = t * (isDark ? 0.01 : 0.02);
        group.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    });

    if (isDark) {
        return (
            <group ref={group}>
                <Stars 
                    radius={100} 
                    depth={50} 
                    count={starCount} 
                    factor={4} 
                    saturation={0} 
                    fade 
                    speed={2} 
                />
            </group>
        );
    }

    return (
        <group ref={group}>
            <Points positions={positions} stride={3}>
                <PointMaterial
                    transparent
                    color="#4f46e5"
                    size={0.15}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.4}
                />
            </Points>
        </group>
    );
}

// 6. Nebula Fusion (Colorful Swirling Clouds)
function NebulaFusion({ isDark }: { isDark: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const count = 40;
  const c1 = isDark ? "#4c1d95" : "#8b5cf6"; // Purple
  const c2 = isDark ? "#1e40af" : "#3b82f6"; // Blue
  const c3 = isDark ? "#701a75" : "#d946ef"; // Pink/Fuchsia

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.05;
    group.current.rotation.x = Math.sin(t * 0.1) * 0.1;
  });

  return (
    <group ref={group}>
      {[...Array(count)].map((_, i) => (
        <Float key={i} speed={1 + Math.random()} rotationIntensity={2} floatIntensity={2}>
          <mesh 
            position={[
              (Math.random() - 0.5) * 20, 
              (Math.random() - 0.5) * 20, 
              (Math.random() - 0.5) * 20
            ]}
          >
            <octahedronGeometry args={[Math.random() * 2 + 0.5, 2]} />
            <MeshDistortMaterial
              color={i % 3 === 0 ? c1 : i % 3 === 1 ? c2 : c3}
              speed={2}
              distort={0.6}
              radius={1}
              transparent
              opacity={isDark ? 0.3 : 0.5}
            />
          </mesh>
        </Float>
      ))}
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

// 7. Miniaturized Smooth Solar System
function SolarSystem({ isDark }: { isDark: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const sunRef = useRef<THREE.Mesh>(null!);
  
  // Rescaled for "Small" miniature look
  const planets = useMemo(() => [
    { name: "Mercury", dist: 1.8, size: 0.05, speed: 0.9, color: "#8c8c8c", tilt: 0.03, hasMoon: false },
    { name: "Venus", dist: 2.5, size: 0.12, speed: 0.7, color: "#e3bb76", tilt: 0.05, hasMoon: false },
    { name: "Earth", dist: 3.5, size: 0.13, speed: 0.5, color: "#2271b3", tilt: 0.41, hasMoon: true },
    { name: "Mars", dist: 4.5, size: 0.08, speed: 0.4, color: "#e27b58", tilt: 0.44, hasMoon: false },
    { name: "Jupiter", dist: 6.5, size: 0.3, speed: 0.2, color: "#d39c7e", tilt: 0.05, hasMoon: false },
    { name: "Saturn", dist: 8.5, size: 0.25, speed: 0.12, color: "#c5ab6e", tilt: 0.47, hasMoon: false, hasRings: true },
    { name: "Uranus", dist: 10.5, size: 0.18, speed: 0.08, color: "#b5e3e3", tilt: 1.7, hasMoon: false },
    { name: "Neptune", dist: 12.5, size: 0.17, speed: 0.05, color: "#4b70dd", tilt: 0.5, hasMoon: false }
  ], []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.02; 
    if (sunRef.current) {
        sunRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* The Sun - Miniaturized & Ultra Smooth */}
      <group>
        <mesh ref={sunRef}>
            <sphereGeometry args={[0.7, 128, 128]} />
            <meshStandardMaterial 
                color="#ffcc33" 
                emissive="#ff9900" 
                emissiveIntensity={isDark ? 4 : 2}
            />
            <pointLight intensity={isDark ? 5 : 3} distance={25} decay={2} color="#ffaa00" />
        </mesh>
        
        {/* Sun Glow/Corona - Ultra Precise */}
        <mesh scale={[1.1, 1.1, 1.1]}>
            <sphereGeometry args={[0.7, 128, 128]} />
            <meshBasicMaterial color="#ff9900" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Orbit Lines - Thinner & Crisper */}
      {planets.map((p) => (
        <mesh key={`orbit-${p.name}`} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[p.dist, 0.008, 2, 128]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.08} />
        </mesh>
      ))}

      {/* Asteroid Belt - Miniature Scale */}
      <AsteroidBelt count={300} innerRadius={5.2} outerRadius={5.8} isDark={isDark} />

      {/* The Planets */}
      {planets.map((p) => (
        <OrbitingPlanet key={p.name} planet={p} isDark={isDark} />
      ))}
      
      <Stars radius={150} depth={50} count={5000} factor={6} saturation={0} fade speed={1.5} />
    </group>
  );
}

function AsteroidBelt({ count, innerRadius, outerRadius, isDark }: { count: number, innerRadius: number, outerRadius: number, isDark: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const asteroids = useMemo(() => {
    return [...Array(count)].map(() => ({
      dist: innerRadius + Math.random() * (outerRadius - innerRadius),
      angle: Math.random() * Math.PI * 2,
      size: 0.01 + Math.random() * 0.02,
      speed: 0.15 + Math.random() * 0.1,
      yOffset: (Math.random() - 0.5) * 0.2
    }));
  }, [count, innerRadius, outerRadius]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.children.forEach((child, i) => {
      const a = asteroids[i];
      const currentAngle = a.angle + t * a.speed;
      child.position.set(
        Math.cos(currentAngle) * a.dist,
        a.yOffset,
        Math.sin(currentAngle) * a.dist
      );
    });
  });

  return (
    <group ref={ref}>
      {asteroids.map((_, i) => (
        <mesh key={i}>
          <dodecahedronGeometry args={[asteroids[i].size, 0]} />
          <meshStandardMaterial color={isDark ? "#444" : "#666"} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function OrbitingPlanet({ planet, isDark }: { planet: any, isDark: boolean }) {
  const ref = useRef<THREE.Group>(null!);
  const planetMesh = useRef<THREE.Mesh>(null!);
  const moonRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const x = Math.cos(t * planet.speed) * planet.dist;
    const z = Math.sin(t * planet.speed) * planet.dist;
    ref.current.position.set(x, 0, z);
    planetMesh.current.rotation.y += 0.02;
    
    if (moonRef.current) {
        const mx = Math.cos(t * 2) * 0.25;
        const mz = Math.sin(t * 2) * 0.25;
        moonRef.current.position.set(mx, 0.05, mz);
    }
  });

  return (
    <group ref={ref}>
      {/* Axial Tilt Group */}
      <group rotation={[planet.tilt || 0, 0, 0]}>
        <mesh ref={planetMesh}>
          <sphereGeometry args={[planet.size, 128, 128]} />
          <meshStandardMaterial 
            color={planet.color} 
            roughness={0.7}
            metalness={0.1}
          />
          
          {/* Earth-Specific Atmosphere Glow - Ultra Smooth */}
          {planet.name === "Earth" && (
            <mesh scale={[1.2, 1.2, 1.2]}>
              <sphereGeometry args={[planet.size, 64, 64]} />
              <meshBasicMaterial color="#4da6ff" transparent opacity={0.15} />
            </mesh>
          )}
        </mesh>

        {/* Saturn's Advanced Rings - High Resolution */}
        {planet.hasRings && (
          <group rotation={[Math.PI / 2.2, 0, 0]}>
            <mesh>
              <torusGeometry args={[planet.size * 1.8, 0.03, 2, 128]} />
              <meshStandardMaterial color={planet.color} transparent opacity={0.5} metalness={0.3} />
            </mesh>
          </group>
        )}

        {/* Planet Moon - Ultra Smooth */}
        {planet.hasMoon && (
            <mesh ref={moonRef}>
                <sphereGeometry args={[planet.size * 0.25, 32, 32]} />
                <meshStandardMaterial color="#cccccc" />
            </mesh>
        )}
      </group>
    </group>
  );
}

// 8. Glassmorphism + 3D Orbs (Enhanced Beauty)
function GlassOrbs({ isDark }: { isDark: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const spotlight = useRef<THREE.PointLight>(null!);

  const orbs = useMemo(() => [
    { size: 1.4, color: "#8b5cf6", pos: [2.5, 1.5, -3], speed: 0.5 },
    { size: 0.9, color: "#06b6d4", pos: [-2.5, -1.2, -2], speed: 0.7 },
    { size: 1.7, color: "#ec4899", pos: [0.5, 2.5, -4], speed: 0.4 },
    { size: 1.1, color: "#f59e0b", pos: [-3.5, 2.2, -2.5], speed: 0.6 },
    { size: 0.8, color: "#10b981", pos: [3.5, -2.5, -3], speed: 0.8 },
    { size: 1.0, color: "#6366f1", pos: [-1, -3, -5], speed: 0.3 },
  ], []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.05;
    
    // Move a spotlight for dynamic glints
    if (spotlight.current) {
        spotlight.current.position.x = Math.sin(t * 0.5) * 10;
        spotlight.current.position.y = Math.cos(t * 0.5) * 10;
    }
  });

  return (
    <group ref={group}>
      <pointLight ref={spotlight} distance={20} intensity={2} color="#ffffff" />
      
      {orbs.map((orb, i) => (
        <Float key={i} speed={orb.speed * 4} rotationIntensity={1} floatIntensity={2}>
          <group position={orb.pos as [number, number, number]}>
            {/* Inner Glowing Core */}
            <mesh>
              <sphereGeometry args={[orb.size * 0.4, 64, 64]} />
              <meshStandardMaterial 
                color={orb.color} 
                emissive={orb.color} 
                emissiveIntensity={isDark ? 3 : 1.5} 
              />
            </mesh>
            
            {/* Outer Refractive Shell - High Smoothness */}
            <mesh>
              <sphereGeometry args={[orb.size, 128, 128]} />
              <meshPhysicalMaterial
                color={orb.color}
                transmission={1}
                thickness={2}
                roughness={0}
                metalness={0}
                ior={1.45}
                clearcoat={1}
                clearcoatRoughness={0}
                transparent
                opacity={isDark ? 0.35 : 0.55}
                attenuationColor={orb.color}
                attenuationDistance={1}
              />
            </mesh>

            {/* Subtle Edge Glow / Rim Light - Smooth non-wireframe glow */}
            <mesh scale={[1.08, 1.08, 1.08]}>
                <sphereGeometry args={[orb.size, 64, 64]} />
                <meshBasicMaterial color={orb.color} transparent opacity={0.06} />
            </mesh>
          </group>
        </Float>
      ))}

      {/* Bokeh / Particle Field */}
      <Points count={100} positions={new Float32Array([...Array(300)].map(() => (Math.random() - 0.5) * 20))}>
        <PointMaterial
          transparent
          color="#ffffff"
          size={0.08}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.4}
        />
      </Points>

      {/* Background Refraction Grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -10]}>
        <planeGeometry args={[120, 120, 30, 30]} />
        <meshBasicMaterial 
            color={isDark ? "#8b5cf6" : "#4f46e5"} 
            wireframe 
            opacity={0.08} 
            transparent 
        />
      </mesh>
    </group>
  );
}

export const ThreeBackground = () => {
  const [bgType, setBgType] = useState(() => localStorage.getItem("app-bg-theme") || "stars");
  const [isDark, setIsDark] = useState(true);

  const updateThemeState = () => {
    setBgType(localStorage.getItem("app-bg-theme") || "stars");
    const themeStr = localStorage.getItem("app-theme");
    if (themeStr) {
      try {
        const theme = JSON.parse(themeStr);
        const bg = theme["bg-dark"] || "#07070b";
        // Check brightness
        const color = bg.replace('#', '');
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        setIsDark(brightness < 128);
      } catch (e) {
        setIsDark(true);
      }
    }
  };

  useEffect(() => {
    updateThemeState();
    window.addEventListener("storage", updateThemeState);
    window.addEventListener("app-bg-update", updateThemeState);
    return () => {
      window.removeEventListener("storage", updateThemeState);
      window.removeEventListener("app-bg-update", updateThemeState);
    };
  }, []);

  const cameraConfig = useMemo(() => {
    if (bgType === "solar") return { position: [0, 15, 30] as [number, number, number], fov: 50 };
    if (bgType === "grid") return { position: [0, 2, 10] as [number, number, number], fov: 60 };
    return { position: [0, 0, 5] as [number, number, number], fov: 60 };
  }, [bgType]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: "var(--bg-dark, #020205)" }}>
      <Canvas camera={cameraConfig}>
        {bgType === "stars" && <NeuralSpace isDark={isDark} />}
        {bgType === "particles" && <ParticleCloud isDark={isDark} />}
        {bgType === "grid" && <AnimatedGrid isDark={isDark} />}
        {bgType === "shapes" && <FloatingShapes isDark={isDark} />}
        {bgType === "abstract" && <AbstractSphere isDark={isDark} />}
        {bgType === "nebula" && <NebulaFusion isDark={isDark} />}
        {bgType === "solar" && <SolarSystem isDark={isDark} />}
        {bgType === "glass" && <GlassOrbs isDark={isDark} />}
        
        <ambientLight intensity={isDark ? 0.4 : 1.2} />
        <pointLight position={[10, 10, 10]} intensity={isDark ? 1 : 2} />
      </Canvas>
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: isDark 
            ? "linear-gradient(to bottom, var(--bg-dark) 0%, transparent 40%, transparent 60%, var(--bg-dark) 100%)" 
            : "linear-gradient(to bottom, var(--bg-dark) 0%, transparent 30%, transparent 70%, var(--bg-dark) 100%)",
          opacity: 0.7
        }} 
      />
    </div>
  );
};
