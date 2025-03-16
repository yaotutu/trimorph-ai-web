<script setup lang="ts">
import * as THREE from 'three';
import { onMounted } from 'vue';
onMounted(() => {
  // 创建场景
  const scene = new THREE.Scene();
  // 创建相机
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // 设置相机位置
  camera.position.z = 10;
  camera.position.y = 3;
  // 创建渲染器
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  // document.body.appendChild(renderer.domElement);
  document.getElementById('container')?.appendChild(renderer.domElement);
  // 创建几何体
  const geometry = new THREE.BoxGeometry();
  // 创建材质
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  // 创建网格
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // 添加网格辅助
  const gridHelper = new THREE.GridHelper(10, 10);
  scene.add(gridHelper);
  // 渲染场景
  // function animate() {
  //   requestAnimationFrame(animate);
  //   cube.rotation.x += 0.01;
  //   cube.rotation.y += 0.01;
  //   renderer.render(scene, camera);
  // }
  // animate();
  renderer.render(scene, camera);
})
</script>

<template>
  <div id="container"></div>
</template>

<style scoped></style>
