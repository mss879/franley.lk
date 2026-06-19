"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface PreloadResult {
  videoUrl: string;
  logoUrl: string;
  isVideoMobile: boolean;
}

interface PreloaderProps {
  onComplete: (assets: PreloadResult) => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);
  const downloadPctRef = useRef(0);

  // UI Refs for high-performance direct DOM manipulation (bypasses 60fps React re-renders)
  const percentTextRef = useRef<HTMLSpanElement>(null);

  const preloadedUrls = useRef<PreloadResult>({
    videoUrl: "/Luxury_men's_ties_and_cufflinks_202606181413.mp4",
    logoUrl: "/franley_logo_no_text_transparent.png",
    isVideoMobile: false,
  });

  // --- 1. Background Asset Preloading ---
  useEffect(() => {
    let active = true;

    let logoBytesReceived = 0;
    let logoBytesTotal = 54842; // Fallback estimate
    let videoBytesReceived = 0;
    let videoBytesTotal = 3800000; // Fallback estimate (approx 3.8 MB)

    const updateProgress = () => {
      const totalReceived = logoBytesReceived + videoBytesReceived;
      const totalSize = logoBytesTotal + videoBytesTotal;
      downloadPctRef.current = Math.min(totalReceived / totalSize, 0.99);
    };

    const downloadAsset = async (
      url: string,
      mimeType: string,
      onProgress: (received: number, total: number) => void
    ): Promise<string> => {
      const response = await fetch(url);
      if (!response.body) {
        throw new Error(`Failed to fetch ${url}: no response body`);
      }

      const contentLength = response.headers.get("content-length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;

      while (active) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          received += value.length;
          onProgress(received, total || received);
        }
      }

      if (!active) {
        throw new Error(`Download of ${url} aborted`);
      }

      const blob = new Blob(chunks as BlobPart[], { type: mimeType });
      return URL.createObjectURL(blob);
    };

    const preload = async () => {
      try {
        // Preload logo
        const logoBlobUrl = await downloadAsset(
          "/franley_logo_no_text_transparent.png",
          "image/webp",
          (received, total) => {
            logoBytesReceived = received;
            logoBytesTotal = total;
            updateProgress();
          }
        );

        // Preload the primary video played on homepage
        const videoBlobUrl = await downloadAsset(
          "/Luxury_men's_ties_and_cufflinks_202606181413.mp4",
          "video/mp4",
          (received, total) => {
            videoBytesReceived = received;
            videoBytesTotal = total;
            updateProgress();
          }
        );

        if (active) {
          downloadPctRef.current = 1.0;
          preloadedUrls.current = {
            videoUrl: videoBlobUrl,
            logoUrl: logoBlobUrl,
            isVideoMobile: false,
          };
        }
      } catch (err) {
        console.warn("Preload failed, continuing with fallback paths:", err);
        if (active) {
          downloadPctRef.current = 1.0;
        }
      }
    };

    preload();

    return () => {
      active = false;
    };
  }, []);

  // Diagnostic intervals removed for clean minimal luxury interface

  // --- 4. Three.js WebGL Scene & Animation Loop ---
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    // --- Scene Setup (Elegant dark luxury space) ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505); // deep absolute luxury black
    scene.fog = new THREE.FogExp2(0x050505, 0.12);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      precision: "mediump"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Dynamic red lights for luxury red silk tie texture highlights
    const redLight = new THREE.DirectionalLight(0x7b0323, 4.5);
    redLight.position.set(-3, 3, 4);
    scene.add(redLight);

    const warmLight = new THREE.DirectionalLight(0xfff5e6, 3.0);
    warmLight.position.set(3, -1, 4);
    scene.add(warmLight);

    // --- Glow Dot Texture Generator ---
    const createGlowDotTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, "rgba(255, 255, 255, 1)");
        grad.addColorStop(0.25, "rgba(220, 100, 120, 0.85)"); // soft rose/burgundy core
        grad.addColorStop(0.5, "rgba(123, 3, 35, 0.25)"); // burgundy glow edge
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // --- Particles Tie System Setup ---
    // Increase density and reduce size for a highly realistic woven fabric representation
    const particleCount = isMobile ? 6000 : 15000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const startPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    // Track delay and swirling phase values to make movements organic and random
    const delays = new Float32Array(particleCount);
    const phaseOffsets = new Float32Array(particleCount);

    const colorObj = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
      // 1. Start Positions: completely random organic distribution (floating molecules)
      // Scattered all around the 3D space, completely non-symmetrical
      const startX = (Math.random() - 0.5) * 11.0;
      const startY = (Math.random() - 0.5) * 9.0;
      const startZ = (Math.random() - 0.5) * 7.0 - 1.5; // scattered depthwise

      startPositions[i * 3] = startX;
      startPositions[i * 3 + 1] = startY;
      startPositions[i * 3 + 2] = startZ;

      // Assign organic delay and phase offsets
      delays[i] = Math.random() * 0.35; // delay up to 35% progress
      phaseOffsets[i] = Math.random() * Math.PI * 2;

      // 2. Target Positions: Curved Organic Necktie shape
      const y = Math.random() * 2.4 - 1.4;
      let halfWidth = 0.0;

      if (y >= 0.6) {
        // Knot: tapers down from 0.095 to 0.06
        const pct = (y - 0.6) / 0.4;
        halfWidth = 0.06 + pct * 0.035;
      } else if (y >= -1.1) {
        // Body: curved pinch at the neck, flaring out towards bottom (0.06 to 0.18)
        const pct = (0.6 - y) / 1.7;
        const curvedPct = Math.pow(pct, 1.35); // elegant curve profile
        halfWidth = 0.06 + curvedPct * 0.12;
      } else {
        // Tip: tapers from 0.18 at y=-1.1 to 0 at y=-1.4
        const pct = (y - (-1.4)) / 0.3;
        halfWidth = pct * 0.18;
      }

      // X coordinate inside half-width
      const x = (Math.random() - 0.5) * 2 * halfWidth;

      // Z coordinate curved like silk fabric drape to make it look 3D and padded
      const normX = halfWidth > 0 ? Math.abs(x / halfWidth) : 0;
      const zCurve = Math.cos(normX * Math.PI / 2); // 1 in center, 0 at edges
      const z = zCurve * 0.08 + (Math.random() - 0.5) * 0.01;

      targetPositions[i * 3] = x;
      targetPositions[i * 3 + 1] = y;
      targetPositions[i * 3 + 2] = z;

      // Initialize current positions to start positions
      positions[i * 3] = startPositions[i * 3];
      positions[i * 3 + 1] = startPositions[i * 3 + 1];
      positions[i * 3 + 2] = startPositions[i * 3 + 2];

      // 3. Colors: Woven Burgundy Silk Weave Texture
      const twillVal = (x * 15.0 + y * 15.0) * Math.PI;
      const twillPattern = Math.sin(twillVal);

      // Alternating luxury stripes (Deep Wine vs Crimson-Burgundy)
      const stripeVal = (x * 2.2 + y) * 3.5;
      const stripePattern = Math.sin(stripeVal);

      let baseColor = new THREE.Color();
      if (stripePattern > 0.25) {
        // Satin Burgundy Highlight
        baseColor.setHex(0xa81b3d);
      } else if (stripePattern < -0.25) {
        // Dark Shadow Burgundy
        baseColor.setHex(0x4a0011);
      } else {
        // Canonical Burgundy Base (#7b0323)
        baseColor.setHex(0x7b0323);
      }

      // Apply thread highlights/shadows for a weave relief effect
      if (twillPattern > 0.0) {
        baseColor.multiplyScalar(1.22); // highlight
      } else {
        baseColor.multiplyScalar(0.78); // shadow
      }

      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;

      // 4. Velocities for dispersion/warp transition
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.6;
      velocities[i * 3] = Math.cos(angle) * speed;
      velocities[i * 3 + 1] = Math.sin(angle) * speed;
      velocities[i * 3 + 2] = 6.0 + Math.random() * 10.0; // fly forward
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: isMobile ? 0.05 : 0.065, // smaller size for refined weaving feel
      map: createGlowDotTexture(),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Solid Tie Model Setup (Knot + Body Groups for 3D depth) ---
    // 1. The Tie Blade (Body) Mesh
    const bodyGeometry = new THREE.PlaneGeometry(1.6, 2.1, 30, 60);
    const posAttrBody = bodyGeometry.attributes.position;
    for (let i = 0; i < posAttrBody.count; i++) {
      let x = posAttrBody.getX(i);
      let y = posAttrBody.getY(i);
      const targetY = y - 0.35; // hangs from y = 0.7 down to -1.4

      let halfWidth = 0.0;
      if (targetY >= -1.1) {
        const pct = (0.7 - targetY) / 1.8;
        const curvedPct = Math.pow(pct, 1.35);
        halfWidth = 0.05 + curvedPct * 0.125;
      } else {
        const pct = (targetY - (-1.4)) / 0.3;
        halfWidth = pct * 0.175;
      }

      const targetX = x * halfWidth;
      const zCurve = Math.cos(x * Math.PI / 2);
      const targetZ = zCurve * 0.055;

      posAttrBody.setX(i, targetX);
      posAttrBody.setY(i, targetY);
      posAttrBody.setZ(i, targetZ);
    }
    bodyGeometry.computeVertexNormals();

    // 2. The wrapped Tie Knot Mesh
    const knotGeometry = new THREE.PlaneGeometry(1.5, 1.5, 20, 20);
    const posAttrKnot = knotGeometry.attributes.position;
    for (let i = 0; i < posAttrKnot.count; i++) {
      let x = posAttrKnot.getX(i);
      let y = posAttrKnot.getY(i);
      const targetY = 0.725 + (y / 0.75) * 0.175; // knot ranges from y = 0.55 to 0.9

      const pctY = (targetY - 0.55) / 0.35;
      const halfWidth = 0.052 + pctY * 0.035;

      const targetX = x * halfWidth;
      const zCurve = Math.cos(x * Math.PI / 2);
      // Pushed forward in Z-space and wrapped around the body blade
      const targetZ = zCurve * 0.095 + 0.03;

      posAttrKnot.setX(i, targetX);
      posAttrKnot.setY(i, targetY);
      posAttrKnot.setZ(i, targetZ);
    }
    knotGeometry.computeVertexNormals();

    // High resolution procedural silk twill/jacquard canvas texture
    const createSilkTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#7b0323"; // Canonical Burgundy Base (#7b0323)
        ctx.fillRect(0, 0, 512, 512);

        // Draw fine diagonal twill weave lines
        ctx.strokeStyle = "#a81b3d"; // Bright burgundy highlight twill
        ctx.lineWidth = 1.5;
        for (let i = -512; i < 512; i += 4) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 512, 512);
          ctx.stroke();
        }

        // Draw wide luxury diagonal satin bands
        ctx.fillStyle = "rgba(74, 0, 17, 0.35)"; // Dark shadow stripes
        for (let i = -512; i < 512; i += 64) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 128, 0);
          ctx.lineTo(i + 128 + 512, 512);
          ctx.lineTo(i + 512, 512);
          ctx.closePath();
          ctx.fill();
        }

        // Draw counter-diagonal cross-weave threads
        ctx.strokeStyle = "rgba(0, 0, 0, 0.12)";
        ctx.lineWidth = 1.0;
        for (let i = -512; i < 512; i += 8) {
          ctx.beginPath();
          ctx.moveTo(i + 512, 0);
          ctx.lineTo(i, 512);
          ctx.stroke();
        }

        // Draw organic micro noise specs for realistic linen/cloth weave fibers
        ctx.fillStyle = "rgba(255, 255, 255, 0.045)";
        for (let k = 0; k < 4000; k++) {
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
        }
        ctx.fillStyle = "rgba(0, 0, 0, 0.045)";
        for (let k = 0; k < 4000; k++) {
          ctx.fillRect(Math.random() * 512, Math.random() * 512, 1, 1);
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      return texture;
    };

    // Bump map representing weave peaks and valleys for realistic anisotropic reflection
    const createSilkBumpTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#808080";
        ctx.fillRect(0, 0, 256, 256);

        // Warp diagonal ridges
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        for (let i = -256; i < 256; i += 3) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + 256, 256);
          ctx.stroke();
        }

        // Weft counter-diagonal valleys
        ctx.strokeStyle = "rgba(0, 0, 0, 0.4)";
        ctx.lineWidth = 1.5;
        for (let i = -256; i < 256; i += 3) {
          ctx.beginPath();
          ctx.moveTo(i + 256, 0);
          ctx.lineTo(i, 256);
          ctx.stroke();
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(12, 12);
      return texture;
    };

    // MeshPhysicalMaterial with Sheen and clearcoat variables to defeat plastic look
    const meshMaterial = new THREE.MeshPhysicalMaterial({
      map: createSilkTexture(),
      bumpMap: createSilkBumpTexture(),
      bumpScale: 0.003,
      roughness: 0.65, // slightly rougher base to allow sheen highlights to stand out
      metalness: 0.0,
      sheen: 1.25, // organic fabric retroreflective backscatter
      sheenColor: new THREE.Color(0xa81b3d), // deep burgundy sheen
      sheenRoughness: 0.35,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
    });

    const solidTieGroup = new THREE.Group();
    const solidTieBody = new THREE.Mesh(bodyGeometry, meshMaterial);
    const solidTieKnot = new THREE.Mesh(knotGeometry, meshMaterial);

    // cast shadow from knot onto body
    solidTieKnot.castShadow = true;
    solidTieBody.receiveShadow = true;

    solidTieGroup.add(solidTieBody);
    solidTieGroup.add(solidTieKnot);
    scene.add(solidTieGroup);

    // --- Interactive Mouse Response ---
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // --- GSAP Animation State Control ---
    const animState = {
      progress: 0,
      disperse: 0,
      rotationY: 0,
      cameraZ: 5.0
    };

    const progressObj = { value: 0 };
    let lastTargetProgress = 0;

    // --- Animation Ticker ---
    let animFrameId: number;
    let startTime = Date.now();
    let minDuration = 2200; // take 2.2 seconds for a slow, premium weaving animation
    let completedTransitionStarted = false;
    let lastTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      const elapsed = now - startTime;
      const timeProgress = Math.min(elapsed / minDuration, 1.0);
      const targetProgress = Math.min(timeProgress, downloadPctRef.current);

      // Smooth progress increments utilizing GSAP interpolation
      if (targetProgress !== lastTargetProgress) {
        lastTargetProgress = targetProgress;
        gsap.to(progressObj, {
          value: lastTargetProgress,
          duration: 0.8,
          ease: "power1.out",
          overwrite: "auto"
        });
      }

      const currentProgress = progressObj.value;
      const pctVal = Math.floor(currentProgress * 100);

      // Direct DOM updates to bypass React re-render cycles
      if (percentTextRef.current) {
        percentTextRef.current.textContent = pctVal.toString();
      }

      // --- Morphing Logic ---
      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
      const t = currentProgress;

      for (let i = 0; i < particleCount; i++) {
        const targetY = targetPositions[i * 3 + 1];

        // Calculate individual progress based on delay
        const delay = delays[i];
        let pt = 0;
        if (t > delay) {
          pt = (t - delay) / (1.0 - delay);
        }

        // Smooth easing per particle
        const easeT = pt * pt * (3 - 2 * pt);

        const startX = startPositions[i * 3];
        const startY = startPositions[i * 3 + 1];
        const startZ = startPositions[i * 3 + 2];

        const targetX = targetPositions[i * 3];
        const targetZ = targetPositions[i * 3 + 2];

        // Swirling organic wave noise that decreases as they reach their targets
        const noiseAmplitude = (1.0 - easeT) * 0.28;
        const phase = phaseOffsets[i];
        const waveX = Math.sin(now * 0.0015 + phase) * noiseAmplitude;
        const waveY = Math.cos(now * 0.0012 + phase) * noiseAmplitude;
        const waveZ = Math.sin(now * 0.0010 + phase) * noiseAmplitude;

        // Apply positions
        let posX = THREE.MathUtils.lerp(startX, targetX, easeT) + waveX;
        let posY = THREE.MathUtils.lerp(startY, targetY, easeT) + waveY;
        let posZ = THREE.MathUtils.lerp(startZ, targetZ, easeT) + waveZ;

        // If completion warp transition is active, disperse particles forward
        if (animState.disperse > 0) {
          const disp = animState.disperse;
          const easeDisp = disp * disp * disp; // Accel curve
          posX += velocities[i * 3] * easeDisp;
          posY += velocities[i * 3 + 1] * easeDisp;
          posZ += velocities[i * 3 + 2] * easeDisp;
        }

        posAttr.setX(i, posX);
        posAttr.setY(i, posY);
        posAttr.setZ(i, posZ);
      }
      posAttr.needsUpdate = true;

      // Solid tie opacity blending (0.8 -> 1.0)
      let solidOpacity = 0.0;
      let particlesOpacity = 1.0;
      if (currentProgress > 0.8) {
        const fadePct = (currentProgress - 0.8) / 0.2; // ranges [0, 1]
        solidOpacity = fadePct;
        particlesOpacity = 1.0 - fadePct;
      }

      // Sync and fade materials during warp/dispersion sequence
      if (animState.disperse > 0) {
        meshMaterial.opacity = solidOpacity * (1.0 - animState.disperse);
        material.opacity = animState.disperse;
      } else {
        meshMaterial.opacity = solidOpacity;
        material.opacity = particlesOpacity;
      }

      // Gently rotate the tie based on mouse position and completion states
      if (animState.disperse === 0) {
        const rotY = THREE.MathUtils.lerp(particles.rotation.y, mouseX * 0.25 + animState.rotationY, 0.1);
        const rotX = THREE.MathUtils.lerp(particles.rotation.x, mouseY * 0.15, 0.1);
        particles.rotation.y = rotY;
        particles.rotation.x = rotX;
        solidTieGroup.rotation.y = rotY;
        solidTieGroup.rotation.x = rotX;
      } else {
        // Stay facing forward during warp flight dispersion
      }

      // Camera Z zoom out/in transition controlled by GSAP
      camera.position.z = animState.cameraZ;
      renderer.render(scene, camera);

      // --- Success transition triggers ---
      if (currentProgress >= 0.999 && !completedTransitionStarted) {
        completedTransitionStarted = true;

        // Snappy GSAP Timeline to quickly spin, disperse, and fade into the homepage
        const transitionTimeline = gsap.timeline({
          onComplete: () => {
            gsap.to(preloaderRef.current, {
              opacity: 0,
              duration: 0.35,
              ease: "power2.out",
              onComplete: () => {
                onComplete(preloadedUrls.current);
              }
            });
          }
        });

        // Fast warp acceleration through particles (0.45s) straight forward
        transitionTimeline.to(animState, {
          disperse: 1.0,
          cameraZ: 0.8,
          duration: 0.45,
          ease: "power2.in"
        });
      }

      animFrameId = requestAnimationFrame(animate);
    };

    animFrameId = requestAnimationFrame(animate);

    // --- Resize handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      bodyGeometry.dispose();
      knotGeometry.dispose();
      meshMaterial.map?.dispose();
      meshMaterial.bumpMap?.dispose();
      meshMaterial.dispose();
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div
      ref={preloaderRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#050505] select-none text-zinc-100 font-sans transition-opacity duration-[550ms] ease-in-out"
    >
      {/* 3D WebGL Canvas background */}
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full" />

      {/* Clean, Premium, Minimalist Right Bottom Percentage Overlay */}
      <div className="absolute right-12 sm:right-20 bottom-16 flex flex-col items-end z-10 gap-1.5 pointer-events-none">
        <div className="flex items-baseline gap-0.5">
          <span ref={percentTextRef} className="text-5xl font-light tracking-tight text-white font-outfit" style={{ filter: 'drop-shadow(0 0 12px rgba(123, 3, 35, 0.35))' }}>
            0
          </span>
          <span className="text-[14px] font-bold tracking-wide font-outfit" style={{ color: '#7b0323' }}>%</span>
        </div>
        <span className="text-[8px] font-semibold tracking-[0.45em] text-zinc-400 uppercase font-outfit text-right">
          weaving silk threads
        </span>
      </div>
    </div>
  );
}
