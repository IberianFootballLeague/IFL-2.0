import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/MTLLoader.js";

const host = document.getElementById("profile-roblox-model");
if (host) {
  let renderer, scene, camera, controls, currentModel, resizeObserver;
  function cdnUrl(hash) {
    let value = 31;
    for (let i = 0; i < 38; i++) value ^= (hash[i] || "").charCodeAt(0);
    return "https://t" + (Math.abs(value) % 8) + ".rbxcdn.com/" + hash;
  }
  function clearModel() {
    if (currentModel && scene) {
      scene.remove(currentModel);
      currentModel.traverse((child) => {
        if (!child.isMesh) return;
        child.geometry?.dispose();
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (!material) return;
          for (const key of ["map", "normalMap", "roughnessMap", "alphaMap"]) material[key]?.dispose?.();
          material.dispose?.();
        });
      });
    }
    currentModel = null;
  }
  function setup() {
    if (renderer) return;
    scene = new THREE.Scene();
    scene.background = null;
    camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
    camera.position.set(0, 3, 10);
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(host.clientWidth || 400, host.clientHeight || 430);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.replaceChildren(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6a7786, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 8, 6);
    scene.add(key);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    const render = () => {
      if (!renderer) return;
      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(render);
    };
    render();
    resizeObserver = new ResizeObserver(() => {
      if (!renderer || !host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    });
    resizeObserver.observe(host);
  }
  async function load(userId) {
    setup();
    host.dataset.loading = "true";
    try {
      const response = await fetch("https://thumbnails.roblox.com/v1/users/avatar-3d?userId=" + encodeURIComponent(userId));
      if (!response.ok) throw new Error("Roblox no ha podido generar el avatar 3D.");
      const thumbnail = await response.json();
      if (!thumbnail.imageUrl || thumbnail.state !== "Completed") throw new Error("El avatar 3D todavía no está disponible.");
      const modelResponse = await fetch(thumbnail.imageUrl);
      if (!modelResponse.ok) throw new Error("No se pudo descargar el modelo 3D.");
      const modelData = await modelResponse.json();
      const objUrl = cdnUrl(modelData.obj);
      const mtlUrl = cdnUrl(modelData.mtl);
      const manager = new THREE.LoadingManager();
      manager.setURLModifier((url) => {
        const hash = url.split("com/").pop().split(/[?#]/)[0];
        return /^[a-f0-9]{32}$/i.test(hash) ? cdnUrl(hash) : url;
      });
      const materials = await new Promise((resolve, reject) => {
        new MTLLoader(manager).load(mtlUrl, resolve, undefined, reject);
      });
      materials.preload();
      Object.values(materials.materials).forEach((material) => {
        material.transparent = false;
        material.alphaTest = 0;
        material.needsUpdate = true;
      });
      const object = await new Promise((resolve, reject) => {
        const loader = new OBJLoader(manager);
        loader.setMaterials(materials);
        loader.load(objUrl, resolve, undefined, reject);
      });
      clearModel();
      currentModel = object;
      const box = new THREE.Box3().setFromObject(object);
      const center = box.getCenter(new THREE.Vector3());
      object.position.sub(center);
      const size = box.getSize(new THREE.Vector3());
      const largest = Math.max(size.x, size.y, size.z) || 5;
      object.scale.setScalar(5.2 / largest);
      scene.add(object);
      controls.target.set(0, 0, 0);
      controls.update();
      camera.position.set(0, 2.2, 8.5);
      camera.lookAt(0, 0, 0);
      camera.near = 0.01;
      camera.far = 1000;
      camera.updateProjectionMatrix();
      host.dataset.loading = "false";
      host.dataset.loaded = "true";
      const fallback = document.getElementById("profile-roblox-avatar");
      if (fallback) fallback.hidden = true;
    } catch (error) {
      host.dataset.loading = "false";
      host.dataset.loaded = "false";
      console.warn("[IFL] No se pudo cargar el modelo 3D de Roblox:", error);
      const tip = document.getElementById("avatar-3d-tip");
      if (tip) tip.textContent = "Roblox no ha permitido cargar el modelo 3D en este momento. Puedes abrir tu perfil de Roblox para comprobar tu avatar.";
      const fallback = document.getElementById("profile-roblox-avatar");
      if (fallback && fallback.src) fallback.hidden = false;
    }
  }
  window.addEventListener("ifl-roblox-avatar-load", (event) => {
    const id = event.detail?.userId;
    if (id && /^\d+$/.test(id)) load(id);
  });
  // Recupera también un perfil ya vinculado si el módulo termina de cargar después del script principal.
  try {
    const saved = JSON.parse(localStorage.getItem("ifl-2-roblox-profile") || "null");
    const savedId = String(saved?.id || saved?.userId || "");
    if (savedId && /^\d+$/.test(savedId)) load(savedId);
  } catch (_) {}
}
