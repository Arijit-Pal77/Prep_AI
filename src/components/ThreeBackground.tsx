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

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundColor: "var(--bg-dark, #020205)" }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {bgType === "stars" && <NeuralSpace isDark={isDark} />}
        {bgType === "particles" && <ParticleCloud isDark={isDark} />}
        {bgType === "grid" && <AnimatedGrid isDark={isDark} />}
        {bgType === "shapes" && <FloatingShapes isDark={isDark} />}
        {bgType === "abstract" && <AbstractSphere isDark={isDark} />}
        
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
