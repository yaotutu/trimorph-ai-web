<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)

// 场景相关变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let model: THREE.Group

// 初始化场景
function initScene() {
    // 创建场景
    scene = new THREE.Scene()

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    )
    camera.position.set(5, 5, 5)

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.value!,
        antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0xf0f0f0)

    // 添加控制器
    controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)
}

// 加载模型
async function loadModel() {
    const loader = new GLTFLoader()

    try {
        const gltf = await loader.loadAsync('/test.glb')
        model = gltf.scene
        scene.add(model)

        // 调整模型位置和缩放
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        model.position.sub(center)
        const maxSize = Math.max(size.x, size.y, size.z)
        const scale = 5 / maxSize
        model.scale.set(scale, scale, scale)
    } catch (error) {
        console.error('加载模型失败:', error)
    }
}

// 渲染循环
function animate() {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
}

onMounted(async () => {
    initScene()
    await loadModel()
    animate()
})

onBeforeUnmount(() => {
    // 清理资源
    scene?.dispose()
    renderer?.dispose()
    controls?.dispose()
})
</script>

<template>
    <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">3D 模型预览</h1>
        <div class="w-full h-[600px] bg-gray-100 rounded-lg">
            <canvas ref="canvasRef" class="w-full h-full"></canvas>
        </div>
    </div>
</template>

<style scoped>
canvas {
    display: block;
}
</style>