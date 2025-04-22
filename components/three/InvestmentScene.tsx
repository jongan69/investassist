'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import { useTheme } from 'next-themes';
import logo from '../../public/logo.svg';

// Check if WebGL is available
const isWebGLAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// Currency Symbols Component
const CurrencySymbols: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const symbols = [
    { symbol: '₿', name: 'Bitcoin' },
    { symbol: 'Ξ', name: 'Ethereum' },
    { symbol: '₮', name: 'Tether' },
    { symbol: '₳', name: 'Cardano' },
    { symbol: '✕', name: 'XRP' },
    { symbol: '◎', name: 'Solana' },
    { symbol: '●', name: 'Polkadot' },
    { symbol: 'Ð', name: 'Dogecoin' },
    { symbol: '◈', name: 'Dai' },
    { symbol: 'Ł', name: 'Litecoin' },
    { symbol: 'Ⱥ', name: 'Algorand' },
    { symbol: 'Ƀ', name: 'Bitcoin Cash' },
    { symbol: '🐸︎', name: 'Pepe' },
    { symbol: 'Ο', name: 'ECOMI' },
    { symbol: '∞', name: 'Internet Computer' },
    { symbol: 'ξ', name: 'Ethereum Classic' },
    { symbol: 'ɱ', name: 'Monero' },
    { symbol: '⨎', name: 'Filecoin' },
    { symbol: 'ꜩ', name: 'Tezos' },
    { symbol: 'ɨ', name: 'Iota' },
    { symbol: 'ε', name: 'EOS' },
    { symbol: 'Ɓ', name: 'Bitcoin SV' },
    { symbol: 'Μ', name: 'Maker' },
    { symbol: 'ⓩ', name: 'Zcash' },
    { symbol: 'Đ', name: 'Dash' },
    { symbol: 'Ӿ', name: 'Nano' },
    { symbol: 'Ɍ', name: 'Augur' },
    { symbol: 'ȿ', name: 'Steem' }
  ];

  // Create two concentric circles for symbol placement
  const innerRadius = 4;
  const outerRadius = 6;
  const positions = symbols.map((_, i) => {
    const angle = (i / symbols.length) * Math.PI * 2;
    const radius = i % 2 === 0 ? innerRadius : outerRadius;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ];
  });

  return (
    <group>
      {symbols.map((item, i) => (
        <Float key={i} speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
          <Text
            position={positions[i] as [number, number, number]}
            fontSize={0.4}
            color={resolvedTheme === 'dark' ? '#60a5fa' : '#000000'}
            anchorX="center"
            anchorY="middle"
            maxWidth={0.5}
          >
            {item.symbol}
          </Text>
        </Float>
      ))}
    </group>
  );
};

// Stock Chart Component
const StockChart: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const pointsRef = useRef<THREE.Points>(null);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  
  useEffect(() => {
    // Generate a more realistic stock chart pattern
    const newPoints: THREE.Vector3[] = [];
    let y = 0;
    for (let i = 0; i < 50; i++) {
      y += (Math.random() - 0.45) * 0.5; // Bias towards upward trend
      newPoints.push(
        new THREE.Vector3(
          i * 0.2 - 5,
          y,
          0
        )
      );
    }
    setPoints(newPoints);
  }, []);
  
  const positions = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
  const chartColor = resolvedTheme === 'dark' ? '#60a5fa' : '#4f46e5';
  
  return (
    <group position={[0, -2, 0]}>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={chartColor} linewidth={2} />
      </line>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={points.length}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial size={0.1} color={chartColor} />
      </points>
    </group>
  );
};

// Investment Icons Component
const InvestmentIcons: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  
  // Create different geometries for different investment types with more financial themes
  const geometries = [
    new THREE.BoxGeometry(1, 1, 1), // Stocks
    new THREE.SphereGeometry(0.5, 32, 32), // Crypto
    new THREE.ConeGeometry(0.5, 1, 32), // Real Estate
    new THREE.TorusGeometry(0.5, 0.2, 16, 32), // DeFi
    new THREE.OctahedronGeometry(0.5), // Meme Coins
  ];
  
  const baseColor = resolvedTheme === 'dark' ? 0x60a5fa : 0x4f46e5;
  const accentColor = resolvedTheme === 'dark' ? 0x34d399 : 0x10b981;
  
  const materials = geometries.map((_, i) => 
    new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(i % 2 === 0 ? baseColor : accentColor),
      metalness: 0.7,
      roughness: 0.2,
      emissive: new THREE.Color(baseColor),
      emissiveIntensity: resolvedTheme === 'dark' ? 0.3 : 0.2,
      transparent: true,
      opacity: 0.7
    })
  );
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
      
      // Animate each icon with a more dynamic motion
      groupRef.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime + i) * 0.2;
        child.rotation.x += 0.01;
        child.rotation.z += 0.01;
        
        // Add a pulsing effect on hover
        if (hovered === i) {
          child.scale.x = 1.2 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
          child.scale.y = 1.2 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
          child.scale.z = 1.2 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        }
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {geometries.map((geometry, i) => (
        <mesh
          key={i}
          geometry={geometry}
          material={materials[i]}
          position={[
            Math.cos(i * (Math.PI * 2) / geometries.length) * 3,
            0,
            Math.sin(i * (Math.PI * 2) / geometries.length) * 3,
          ]}
          onPointerOver={() => setHovered(i)}
          onPointerOut={() => setHovered(null)}
          scale={hovered === i ? 1.2 : 1}
        />
      ))}
    </group>
  );
};

// Animated Chart Component
const AnimatedChart: React.FC = () => {
  const pointsRef = useRef<THREE.Points>(null);
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  
  useEffect(() => {
    // Generate random data points for the chart
    const newPoints: THREE.Vector3[] = [];
    for (let i = 0; i < 20; i++) {
      newPoints.push(
        new THREE.Vector3(
          i * 0.5 - 5,
          Math.random() * 2 - 1,
          0
        )
      );
    }
    setPoints(newPoints);
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      // Animate the points
      pointsRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
          args={[new Float32Array(points.flatMap(p => [p.x, p.y, p.z])), 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color={0x4f46e5} />
    </points>
  );
};

// Floating Text Component
const FloatingText: React.FC<{ text: string; position: [number, number, number] }> = ({ text, position }) => {
  const { resolvedTheme } = useTheme();
  const textRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={0.5}
      color={resolvedTheme === 'dark' ? '#60a5fa' : '#4f46e5'}
      anchorX="center"
      anchorY="middle"
    >
      {text}
    </Text>
  );
};

// Interactive Logo Component
const InteractiveLogo: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const logoRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(logo.src, (loadedTexture) => {
      loadedTexture.minFilter = THREE.LinearFilter;
      loadedTexture.magFilter = THREE.LinearFilter;
      loadedTexture.flipY = true;
      setTexture(loadedTexture);
    });
  }, []);
  
  useFrame((state) => {
    if (logoRef.current) {
      // Gentle floating animation
      logoRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2;
      
      // Continuous rotation
      logoRef.current.rotation.y += 0.005;
      
      // Scale animation on hover
      const targetScale = hovered ? 5 : 4.5;
      logoRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });
  
  const baseColor = resolvedTheme === 'dark' ? '#ffffff' : '#000000';
  const hoverColor = resolvedTheme === 'dark' ? '#60a5fa' : '#4f46e5';
  const glowColor = resolvedTheme === 'dark' ? '#60a5fa' : '#4f46e5';
  
  return (
    <group
      ref={logoRef}
      position={[0, 0, -1]}
      scale={4.5}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glow layers */}
      <sprite scale={[1.3, 1.3, 1.3]}>
        <spriteMaterial
          map={texture}
          transparent
          opacity={0.4}
          color={glowColor}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite scale={[1.2, 1.2, 1.2]}>
        <spriteMaterial
          map={texture}
          transparent
          opacity={0.3}
          color={glowColor}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      <sprite scale={[1.1, 1.1, 1.1]}>
        <spriteMaterial
          map={texture}
          transparent
          opacity={0.2}
          color={glowColor}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
      
      {/* Main logo */}
      <sprite>
        <spriteMaterial
          map={texture}
          transparent
          opacity={1}
          color={hovered ? hoverColor : baseColor}
          depthWrite={false}
          blending={resolvedTheme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending}
          alphaTest={0.5}
        />
      </sprite>
      
      {/* Sparkles around the logo */}
      <Sparkles
        count={3}
        scale={[4, 4, 4]}
        size={2}
        speed={0.2}
        color={glowColor}
        opacity={0.6}
      />
    </group>
  );
};

// Grid Component for background
const Grid: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const gridColor = resolvedTheme === 'dark' ? '#60a5fa' : '#4f46e5';
  
  return (
    <gridHelper
      args={[20, 20, gridColor, gridColor]}
      position={[0, -4, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

// Main Scene Component
const InvestmentScene: React.FC = () => {
  const [webGLAvailable, setWebGLAvailable] = useState<boolean>(false);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setWebGLAvailable(isWebGLAvailable());
    setMounted(true);
  }, []);
  
  if (!webGLAvailable || !mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">WebGL is not available in your browser.</p>
      </div>
    );
  }
  
  const backgroundColor = resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc';
  const fogColor = resolvedTheme === 'dark' ? '#0f172a' : '#f8fafc';
  
  return (
    <div className="w-full h-[500px]">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <color attach="background" args={[backgroundColor]} />
        <fog attach="fog" args={[fogColor, 5, 15]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={0.5} />
        <Grid />
        <InteractiveLogo />
        <InvestmentIcons />
        <StockChart />
        <CurrencySymbols />
        <FloatingText text="Invest Smart" position={[0, 3, 0]} />
        <FloatingText text="Grow Wealth" position={[0, -3, 0]} />
        <Sparkles count={20} scale={10} size={6} speed={0.4} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
};

export default InvestmentScene; 