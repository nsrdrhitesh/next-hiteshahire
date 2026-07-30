"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

export default function HeroThreeScene() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const container = containerRef.current;

        // ---------- Scene setup ----------
        const scene = new THREE.Scene();
        scene.background = null;
        scene.fog = new THREE.FogExp2(0x0a0a2a, 0.008);

        const camera = new THREE.PerspectiveCamera(
            45,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        camera.position.set(0, 0.5, 3.2);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        renderer.toneMapping = THREE.ReinhardToneMapping;
        renderer.toneMappingExposure = 1.2;
        container.appendChild(renderer.domElement);

        // Post-processing
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(container.clientWidth, container.clientHeight),
            0.8,
            0.3,
            0.2
        );
        bloomPass.threshold = 0.1;
        bloomPass.strength = 0.45;
        bloomPass.radius = 0.5;
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        // ---------- Lights ----------
        scene.add(new THREE.AmbientLight(0x111122));
        const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
        keyLight.position.set(1, 2, 1.5);
        scene.add(keyLight);
        scene.add(new THREE.PointLight(0x4466cc, 0.6)).position.set(-1, 1, 1.2);
        scene.add(new THREE.PointLight(0x33aaff, 0.5)).position.set(0, 0.5, -2);
        scene.add(new THREE.PointLight(0xffaa66, 0.4)).position.set(1.2, -0.5, 1);
        scene.add(new THREE.PointLight(0x2266aa, 0.35)).position.set(0, -1.2, 0);

        // ---------- Core object ----------
        const coreGeo = new THREE.IcosahedronGeometry(0.85, 0);
        const coreMat = new THREE.MeshStandardMaterial({
            color: 0x2c6ef8,
            emissive: 0x0a3366,
            emissiveIntensity: 0.35,
            metalness: 0.9,
            roughness: 0.25,
        });
        const core = new THREE.Mesh(coreGeo, coreMat);
        scene.add(core);

        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x88bbff,
            wireframe: true,
            transparent: true,
            opacity: 0.4,
        });
        const wireframeCore = new THREE.Mesh(coreGeo, wireframeMat);
        wireframeCore.scale.setScalar(1.02);
        scene.add(wireframeCore);

        const innerGlowMat = new THREE.MeshStandardMaterial({
            color: 0x3b82f6,
            emissive: 0x1e3a8a,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.25,
            side: THREE.BackSide,
        });
        const innerGlow = new THREE.Mesh(new THREE.SphereGeometry(0.68, 32, 32), innerGlowMat);
        scene.add(innerGlow);

        // Rings
        const ringMat = new THREE.MeshStandardMaterial({
            color: 0x5a9eff,
            emissive: 0x1a4cff,
            emissiveIntensity: 0.3,
            metalness: 0.85,
            roughness: 0.3,
            transparent: true,
            opacity: 0.7,
        });
        const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.04, 64, 300), ringMat);
        const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.035, 64, 300), ringMat);
        const ring3 = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.03, 64, 300), ringMat);
        ring1.rotation.x = Math.PI / 2;
        ring2.rotation.z = Math.PI / 3;
        ring2.rotation.x = Math.PI / 4;
        ring3.rotation.x = Math.PI / 1.8;
        ring3.rotation.z = Math.PI / 3;
        scene.add(ring1, ring2, ring3);

        // Particle system
        const particleCount = 1200;
        const particlePositions = new Float32Array(particleCount * 3);
        const particleColors = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const radius = 1.4 + Math.random() * 0.8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            particlePositions[i * 3 + 2] = radius * Math.cos(phi);
            const choice = Math.random();
            if (choice < 0.6) {
                particleColors[i * 3] = 0.2 + Math.random() * 0.3;
                particleColors[i * 3 + 1] = 0.4 + Math.random() * 0.5;
                particleColors[i * 3 + 2] = 0.8 + Math.random() * 0.2;
            } else {
                particleColors[i * 3] = 0.6 + Math.random() * 0.4;
                particleColors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
                particleColors[i * 3 + 2] = 1.0;
            }
        }
        const particleGeo = new THREE.BufferGeometry();
        particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
        particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));
        const particleMat = new THREE.PointsMaterial({
            size: 0.025,
            vertexColors: true,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending,
        });
        const particles = new THREE.Points(particleGeo, particleMat);
        scene.add(particles);

        // Network lines
        const lineCount = 400;
        const lineVertices: THREE.Vector3[] = [];
        for (let i = 0; i < lineCount; i++) {
            const idx1 = Math.floor(Math.random() * particleCount);
            const idx2 = Math.floor(Math.random() * particleCount);
            if (idx1 === idx2) continue;
            const p1 = new THREE.Vector3(
                particlePositions[idx1 * 3],
                particlePositions[idx1 * 3 + 1],
                particlePositions[idx1 * 3 + 2]
            );
            const p2 = new THREE.Vector3(
                particlePositions[idx2 * 3],
                particlePositions[idx2 * 3 + 1],
                particlePositions[idx2 * 3 + 2]
            );
            if (p1.distanceTo(p2) < 0.9 && p1.distanceTo(p2) > 0.2) {
                lineVertices.push(p1, p2);
            }
        }
        const lineGeo = new THREE.BufferGeometry();
        const verticesArray = new Float32Array(lineVertices.length * 3);
        lineVertices.forEach((v, idx) => {
            verticesArray[idx * 3] = v.x;
            verticesArray[idx * 3 + 1] = v.y;
            verticesArray[idx * 3 + 2] = v.z;
        });
        lineGeo.setAttribute("position", new THREE.BufferAttribute(verticesArray, 3));
        const lineMat = new THREE.LineBasicMaterial({ color: 0x3a86ff, transparent: true, opacity: 0.25 });
        const lines = new THREE.LineSegments(lineGeo, lineMat);
        scene.add(lines);

        // Orbiting satellites
        const satGroup = new THREE.Group();
        const satelliteCount = 24;
        for (let i = 0; i < satelliteCount; i++) {
            const boxGeo = new THREE.BoxGeometry(0.045, 0.045, 0.045);
            const boxMat = new THREE.MeshStandardMaterial({ color: 0x5a9eff, emissive: 0x2266cc, emissiveIntensity: 0.4 });
            const cube = new THREE.Mesh(boxGeo, boxMat);
            const angle = (i / satelliteCount) * Math.PI * 2;
            cube.position.x = Math.cos(angle) * 1.32;
            cube.position.z = Math.sin(angle) * 1.32;
            cube.position.y = Math.sin(angle * 2) * 0.25;
            satGroup.add(cube);
        }
        scene.add(satGroup);

        // Dust
        const dustCount = 800;
        const dustPositions = new Float32Array(dustCount * 3);
        for (let i = 0; i < dustCount; i++) {
            dustPositions[i * 3] = (Math.random() - 0.5) * 4.5;
            dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
            dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 1;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
        const dustMat = new THREE.PointsMaterial({ color: 0x88aaff, size: 0.008, transparent: true, opacity: 0.4 });
        const dust = new THREE.Points(dustGeo, dustMat);
        scene.add(dust);

        // ---------- Animation ----------
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.012;

            core.rotation.y = time * 0.3;
            core.rotation.x = Math.sin(time * 0.2) * 0.2;
            wireframeCore.rotation.copy(core.rotation);
            innerGlow.rotation.y = time * 0.15;
            innerGlow.rotation.x = time * 0.1;

            ring1.rotation.z = time * 0.2;
            ring2.rotation.x = time * 0.25;
            ring2.rotation.y = time * 0.15;
            ring3.rotation.y = time * 0.3;
            ring3.rotation.x = time * 0.18;

            particles.rotation.y = time * 0.05;
            particles.rotation.x = Math.sin(time * 0.1) * 0.1;
            lines.rotation.copy(particles.rotation);

            satGroup.rotation.y = time * 0.4;
            satGroup.rotation.x = Math.sin(time * 0.5) * 0.1;

            dust.rotation.y = time * 0.02;
            dust.rotation.x = time * 0.01;

            const intensity = 0.45 + Math.sin(time * 2.5) * 0.1;
            innerGlowMat.emissiveIntensity = intensity;
            coreMat.emissiveIntensity = 0.35 + Math.sin(time * 2) * 0.08;

            camera.position.x += (0 - camera.position.x) * 0.05;
            camera.position.y += (0.5 + Math.sin(time * 0.2) * 0.03 - camera.position.y) * 0.05;
            camera.lookAt(0, 0, 0);

            composer.render();
        }
        animate();

        // Resize handler
        const handleResize = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            renderer.setSize(w, h);
            composer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", handleResize);

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize);
            renderer.dispose();
            composer.renderer?.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return <div ref={containerRef} className="w-full h-full" />;
}