import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createCar } from '../car/createCar'
import { createParticleField, type ParticleField } from '../particles/createParticles'
import { createPostProcessing, type PostProcessing } from '../postprocessing/createPostprocessing'
import { computeCameraFrame, type CameraFrameInput } from '../scroll/cameraPath'

export class ExperienceScene {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene: THREE.Scene
  private readonly camera: THREE.PerspectiveCamera
  private readonly post: PostProcessing
  private readonly car: THREE.Group
  private readonly particles: ParticleField
  private readonly clock = new THREE.Clock()
  private readonly pmrem: THREE.PMREMGenerator
  private readonly environment: THREE.Texture
  private frameId = 0
  private disposed = false

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x020306, 0)
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.05
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.scene = new THREE.Scene()
    this.scene.fog = new THREE.FogExp2(0x05070b, 0.055)
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60)
    this.camera.position.set(5.8, 2.3, 5.7)
    this.pmrem = new THREE.PMREMGenerator(this.renderer)
    this.environment = this.pmrem.fromScene(new RoomEnvironment(), 0.035).texture
    this.scene.environment = this.environment
    this.addStudio()
    const carModel = createCar()
    this.car = carModel.group
    this.scene.add(this.car)
    this.particles = createParticleField()
    this.scene.add(this.particles.points)
    this.post = createPostProcessing(this.renderer, this.scene, this.camera)
    this.resize()
  }

  start(getFrameInput: () => CameraFrameInput) {
    const render = () => { if (this.disposed) return; this.frameId = window.requestAnimationFrame(render); this.update(getFrameInput()); this.post.composer.render() }
    render()
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth)
    const height = Math.max(1, this.canvas.clientHeight)
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.setSize(width, height, false)
    this.post.composer.setPixelRatio(pixelRatio)
    this.post.composer.setSize(width, height)
  }

  dispose() {
    this.disposed = true
    window.cancelAnimationFrame(this.frameId)
    this.post.dispose()
    this.environment.dispose()
    this.pmrem.dispose()
    this.scene.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((material) => material.dispose()) } })
    this.renderer.dispose()
  }

  private addStudio() {
    this.scene.add(new THREE.HemisphereLight(0x4f6580, 0x030304, 1.25))
    const key = new THREE.SpotLight(0xeff6ff, 70, 22, Math.PI * 0.19, 0.45, 1); key.position.set(2.5, 6.2, 4.7); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); this.scene.add(key)
    const rim = new THREE.SpotLight(0x5d8cff, 42, 18, Math.PI * 0.22, 0.6, 1.2); rim.position.set(-4.8, 3.2, -4.6); this.scene.add(rim)
    const sweep = new THREE.PointLight(0x9ebcff, 2.3, 7.5); sweep.name = 'slow-light-sweep'; sweep.position.set(-1.8, 1.1, 2.3); this.scene.add(sweep)
    const floor = new THREE.Mesh(new THREE.CircleGeometry(9.8, 96), new THREE.MeshPhysicalMaterial({ color: '#06070a', metalness: 0.35, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.25 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; this.scene.add(floor)
    const horizon = new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.012, 8, 128), new THREE.MeshBasicMaterial({ color: '#31425c', transparent: true, opacity: 0.38 })); horizon.position.y = 0.025; horizon.rotation.x = -Math.PI / 2; this.scene.add(horizon)
  }

  private update(input: CameraFrameInput) {
    const elapsed = this.clock.getElapsedTime()
    const frame = computeCameraFrame(input)
    this.camera.position.lerp(new THREE.Vector3(frame.position.x, frame.position.y, frame.position.z), 0.08)
    this.camera.lookAt(new THREE.Vector3(frame.target.x, frame.target.y, frame.target.z))
    this.car.rotation.y = frame.carRotationY + Math.sin(elapsed * 0.18) * 0.045
    this.car.position.y = Math.sin(elapsed * 0.42) * 0.018
    const sweep = this.scene.getObjectByName('slow-light-sweep')
    if (sweep) { sweep.position.x = Math.sin(elapsed * 0.35) * 2.8; sweep.position.z = Math.cos(elapsed * 0.25) * 2.4 }
    this.post.bloomPass.strength = 0.45 + Math.sin(elapsed * 0.24) * 0.04
    this.particles.update(elapsed)
  }
}
