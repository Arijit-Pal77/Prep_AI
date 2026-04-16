import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial, Float, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import * as THREE from "three";

// 1. Particle Cloud Theme
function ParticleCloud() {
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
          color="#8b5cf6"
          size={0.03}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

// 2. Animated Grid Theme (Neural Matrix)
function AnimatedGrid() {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Move the texture coordinate offset to simulate forward motion
    meshRef.current.position.z = (t * 2) % 2; 
  });

  return (
    <group position={[0, -1, -10]}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshBasicMaterial color="#8b5cf6" wireframe opacity={0.15} transparent />
      </mesh>
      {/* Visual fog effect for the distance */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
         <planeGeometry args={[100, 100]} />
         <meshBasicMaterial color="#000" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// 3. Floating Geometric Shapes
function FloatingShapes() {
  const group = useRef<THREE.Group>(null!);

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
                color={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"} 
                wireframe 
                emissive={i % 2 === 0 ? "#8b5cf6" : "#06b6d4"}
                emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
    </group>
  );
}

// 4. Distorted Sphere (Abstract)
function AbstractSphere() {
  const mesh = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.2;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -5]}>
      <sphereGeometry args={[2, 64, 64]} />
      <MeshDistortMaterial
        color="#4c1d95"
        speed={1.5}
        distort={0.45}
        radius={1}
      />
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={2} />
    </mesh>
  );
}

// 5. Neural Space (Updated Stars)
function NeuralSpace() {
    const group = useRef<THREE.Group>(null!);
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        group.current.rotation.y = t * 0.01;
        group.current.rotation.x = Math.sin(t * 0.05) * 0.05;
    });

    return (
        <group ref={group}>
            <Stars 
                radius={100} 
                depth={50} 
                count={7000} 
                factor={4} 
                saturation={0} 
                fade 
                speed={2} 
            />
        </group>
    );
}

export const ThreeBackground = () => {
  const [bgType, setBgType] = useState(() => localStorage.getItem("app-bg-theme") || "stars");

  useEffect(() => {
    const handleStorage = () => {
      setBgType(localStorage.getItem("app-bg-theme") || "stars");
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("app-bg-update", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("app-bg-update", handleStorage);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-[#020205]">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }}>
        {bgType === "stars" && <NeuralSpace />}
        {bgType === "particles" && <ParticleCloud />}
        {bgType === "grid" && <AnimatedGrid />}
        {bgType === "shapes" && <FloatingShapes />}
        {bgType === "abstract" && <AbstractSphere />}
        
        <ambientLight intensity={0.4} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-[#020205]/60 via-transparent to-[#020205]/80" />
    </div>
  );
};
