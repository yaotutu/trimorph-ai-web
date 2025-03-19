<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvasRef = ref<HTMLCanvasElement | null>(null)
const isAutoRotate = ref(true)
const showWireframe = ref(false)
const showColors = ref(true)

// 场景相关变量
let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let controls: OrbitControls
let model: THREE.Group
let coloredMaterials: Map<THREE.Mesh, THREE.Material> = new Map()
let monochromeMaterials: Map<THREE.Mesh, THREE.Material> = new Map()

// 初始化场景
function initScene() {
    // 创建场景
    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)

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
    controls.autoRotate = isAutoRotate.value

    // 添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight1.position.set(2, 2, 2)
    scene.add(directionalLight1)

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.4)
    directionalLight2.position.set(-2, -1, -1)
    scene.add(directionalLight2)

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x080820, 0.5)
    scene.add(hemisphereLight)
}

// 切换线框模式
function toggleWireframe() {
    model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material.wireframe = showWireframe.value
        }
    })
}

// 创建单色材质
function createMonochromeMaterial(originalMaterial: THREE.Material): THREE.Material {
    if (originalMaterial instanceof THREE.MeshStandardMaterial) {
        return new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.1,
            clearcoat: 0.3,
            clearcoatRoughness: 0.25,
            reflectivity: 0.5,
            side: originalMaterial.side,
            flatShading: false
        })
    }
    return new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
        clearcoat: 0.3,
        clearcoatRoughness: 0.25,
        reflectivity: 0.5,
        flatShading: false
    })
}

// 保存材质信息
function saveMaterials(mesh: THREE.Mesh) {
    const coloredMaterial = mesh.material
    if (coloredMaterial) {
        coloredMaterials.set(mesh, coloredMaterial)
        monochromeMaterials.set(mesh, createMonochromeMaterial(coloredMaterial))
    }
}

// 切换颜色显示
function toggleColors() {
    model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material = showColors.value
                ? coloredMaterials.get(child) || child.material
                : monochromeMaterials.get(child) || child.material
        }
    })
}

// 加载模型
async function loadModel() {
    const loader = new GLTFLoader()

    try {
        const gltf = await loader.loadAsync('/test.glb')
        model = gltf.scene
        scene.add(model)

        // 保存所有材质信息
        model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                saveMaterials(child)
            }
        })

        // 调整模型位置和缩放
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        model.position.sub(center)
        const maxSize = Math.max(size.x, size.y, size.z)
        const scale = 5 / maxSize
        model.scale.set(scale, scale, scale)

        // 初始化线框模式和颜色
        toggleWireframe()
    } catch (error) {
        console.error('加载模型失败:', error)
    }
}

// 渲染循环
function animate() {
    requestAnimationFrame(animate)
    controls.autoRotate = isAutoRotate.value
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
        <div class="flex gap-4 mb-4">
            <button @click="isAutoRotate = !isAutoRotate"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                {{ isAutoRotate ? '暂停旋转' : '开启旋转' }}
            </button>
            <button @click="showWireframe = !showWireframe; toggleWireframe()"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                {{ showWireframe ? '显示纹理' : '显示线框' }}
            </button>
            <button @click="showColors = !showColors; toggleColors()"
                class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                {{ showColors ? '隐藏颜色' : '显示颜色' }}
            </button>
        </div>
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