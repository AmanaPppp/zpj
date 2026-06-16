import { Suspense, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Html, OrbitControls, Sphere } from '@react-three/drei';
import { Download, Heart, X } from 'lucide-react';
import * as THREE from 'three';

type Card = {
  id: string;
  imageUrl: string;
  alt: string;
  title: string;
};

type CardContextType = {
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
  cards: Card[];
};

const CardContext = createContext<CardContextType | undefined>(undefined);

function useCard() {
  const context = useContext(CardContext);
  if (!context) throw new Error('useCard must be used within CardProvider');
  return context;
}

const cards: Card[] = [
  { id: '1', imageUrl: '/logo-gallery/logo1.png', alt: 'Logo design 1', title: 'Logo Design 01' },
  { id: '2', imageUrl: '/logo-gallery/logo2.png', alt: 'Logo design 2', title: 'Logo Design 02' },
  { id: '3', imageUrl: '/logo-gallery/logo11.png', alt: 'Logo design 3', title: 'Logo Design 03' },
  { id: '4', imageUrl: '/logo-gallery/logo5.png', alt: 'Logo design 4', title: 'Logo Design 04' },
  { id: '5', imageUrl: '/logo-gallery/logo7.png', alt: 'Logo design 5', title: 'Logo Design 05' },
  { id: '6', imageUrl: '/logo-gallery/logo3.png', alt: 'Logo design 6', title: 'Logo Design 06' },
  { id: '7', imageUrl: '/logo-gallery/logo6.png', alt: 'Logo design 7', title: 'Logo Design 07' },
  { id: '8', imageUrl: '/logo-gallery/logo4.png', alt: 'Logo design 8', title: 'Logo Design 08' },
  { id: '9', imageUrl: '/logo-gallery/logo8.png', alt: 'Logo design 9', title: 'Logo Design 09' },
  { id: '10', imageUrl: '/logo-gallery/logo10.png', alt: 'Logo design 10', title: 'Logo Design 10' },
  { id: '11', imageUrl: '/logo-gallery/logo9.png', alt: 'Logo design 11', title: 'Logo Design 11' },
  { id: '12', imageUrl: '/logo-gallery/logo12.png', alt: 'Logo design 12', title: 'Logo Design 12' },
];

function CardProvider({ children }: { children: React.ReactNode }) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const value = useMemo(() => ({ selectedCard, setSelectedCard, cards }), [selectedCard]);
  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

function StarfieldBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 10000;
    const positions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    camera.position.z = 10;

    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed inset-0 z-0 bg-black" />;
}

function FloatingCard({
  card,
  position,
}: {
  card: Card;
  position: { x: number; y: number; z: number };
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { setSelectedCard } = useCard();

  useFrame(({ camera }) => {
    groupRef.current?.lookAt(camera.position);
  });

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.15)' : 'scale(1)',
          pointerEvents: 'auto',
        }}
      >
        <div
          className="h-48 w-72 select-none overflow-hidden rounded-lg bg-white p-3 shadow-2xl"
          role="button"
          tabIndex={0}
          onClick={(event) => {
            event.stopPropagation();
            setSelectedCard(card);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            setSelectedCard(card);
          }}
          onPointerEnter={() => {
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerLeave={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          style={{
            boxShadow: hovered
              ? '0 25px 50px rgba(124, 58, 237, 0.42), 0 0 30px rgba(49, 184, 198, 0.24)'
              : '0 15px 30px rgba(0, 0, 0, 0.6)',
            border: hovered ? '2px solid rgba(124, 58, 237, 0.55)' : '1px solid rgba(255, 255, 255, 0.5)',
          }}
        >
          <img src={card.imageUrl} alt={card.alt} className="h-full w-full rounded-md object-contain" loading="lazy" draggable={false} />
        </div>
      </Html>
    </group>
  );
}

function CardModal() {
  const { selectedCard, setSelectedCard } = useCard();
  const [isFavorited, setIsFavorited] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!selectedCard) return null;

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (event) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = (y - rect.height / 2) / 15;
    const rotateY = (rect.width / 2 - x) / 15;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const resetTilt = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = 'transform 0.5s ease-out';
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
  };

  const handleClose = () => setSelectedCard(null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div className="relative mx-4 w-full max-w-md">
        <button onClick={handleClose} className="absolute -top-12 right-0 z-10 text-white transition-colors hover:text-gray-300" aria-label="Close card">
          <X className="h-8 w-8" />
        </button>

        <div style={{ perspective: '1000px' }} className="w-full">
          <div
            ref={cardRef}
            className="relative w-full cursor-pointer rounded-[16px] bg-[#1f2121] p-4 transition-all duration-500 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              boxShadow:
                'rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={resetTilt}
          >
            <div className="relative mb-4 w-full overflow-hidden rounded-[16px] bg-white" style={{ aspectRatio: '4 / 3' }}>
              <img loading="lazy" className="absolute inset-0 h-full w-full object-contain p-5" alt={selectedCard.alt} src={selectedCard.imageUrl} />
            </div>

            <h3 className="mb-4 text-center text-lg font-semibold text-white">{selectedCard.title}</h3>

            <div className="flex gap-2">
              <button type="button" className="inline-flex h-9 flex-1 items-center justify-center rounded-lg text-base font-medium text-black transition duration-300 ease-out hover:opacity-80 active:scale-[0.97]" style={{ backgroundColor: '#31b8c6' }}>
                <div className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" strokeWidth={1.8} />
                  <span>Download</span>
                </div>
              </button>
              <button type="button" onClick={() => setIsFavorited((value) => !value)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-black transition duration-300 ease-out hover:opacity-80 active:scale-[0.97]" style={{ backgroundColor: '#31b8c6' }}>
                <Heart className="h-4 w-4" strokeWidth={1.8} fill={isFavorited ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CardGalaxy() {
  const { cards: galleryCards } = useCard();
  const galaxyRef = useRef<THREE.Group>(null);

  const cardPositions = useMemo(() => {
    const positions: Array<{ x: number; y: number; z: number }> = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < galleryCards.length; i += 1) {
      const y = 1 - (i / (galleryCards.length - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / goldenRatio;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const layerRadius = 12 + (i % 3) * 4;
      positions.push({ x: x * layerRadius, y: y * layerRadius, z: z * layerRadius });
    }
    return positions;
  }, [galleryCards.length]);

  useFrame((state, delta) => {
    if (!galaxyRef.current) return;
    galaxyRef.current.rotation.y += delta * 0.035;
    galaxyRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.04;
  });

  return (
    <group ref={galaxyRef}>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.02} wireframe />
      </Sphere>

      {galleryCards.map((card, index) => (
        <FloatingCard key={card.id} card={card} position={cardPositions[index]} />
      ))}
    </group>
  );
}

export default function StellarCardGallerySingle() {
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto';
    };
  }, []);

  return (
    <CardProvider>
      <div className="relative h-screen w-full overflow-hidden bg-black">
        <StarfieldBackground />

        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          className="absolute inset-0 z-10"
          onCreated={({ gl }) => {
            gl.domElement.style.pointerEvents = 'auto';
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="night" />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.6} />
            <pointLight position={[-10, -10, -10]} intensity={0.3} />
            <CardGalaxy />
            <OrbitControls enablePan enableZoom enableRotate minDistance={5} maxDistance={40} rotateSpeed={0.5} zoomSpeed={1.2} panSpeed={0.8} target={[0, 0, 0]} />
          </Suspense>
        </Canvas>

        <CardModal />

        <div className="pointer-events-none absolute left-4 top-4 z-20 text-white">
          <h1 className="text-2xl font-bold">Logo Design</h1>
        </div>
      </div>
    </CardProvider>
  );
}
