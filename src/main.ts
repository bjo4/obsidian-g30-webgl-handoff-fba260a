import './style.css'
import { ExperienceScene } from './scene/createScene'
import { createScrollController } from './scroll/scrollController'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('App root not found')
}

app.innerHTML = `
  <canvas class="webgl-canvas" aria-label="程序化黑色金屬 520i G30 風格房車 WebGL 展示"></canvas>
  <main class="content-shell">
    <section class="panel hero-panel" aria-labelledby="hero-title">
      <p class="eyebrow">Night studio / procedural WebGL</p>
      <h1 id="hero-title">520i G30<br /><span>Obsidian</span></h1>
      <p class="lede">
        黑曜石般的金屬漆面、煙燻玻璃與暗鉻細節，在深夜攝影棚中慢速巡航。
      </p>
      <div class="hero-actions">
        <a href="#design" class="primary-link">探索設計語彙</a>
        <span class="asset-note">No official mesh. No logo assets.</span>
      </div>
      <div class="scroll-cue" aria-hidden="true">
        <span></span>
        向下滑動
      </div>
    </section>

    <section class="panel detail-panel" id="design">
      <div>
        <p class="eyebrow">Sculpted silhouette</p>
        <h2>長引擎蓋、四門比例、後窗折角暗示。</h2>
      </div>
      <p>
        以低中模程序化幾何塑造 G30 世代豪華房車的姿態：拉長車頭、穩定軸距、
        俐落肩線與 Hofmeister kink 風格後窗收折，避免任何官方 CAD、商標或 logo。
      </p>
    </section>

    <section class="panel spec-panel">
      <p class="eyebrow">Interactive ad frame</p>
      <h2>Scroll-linked camera, bloom highlights, fine studio dust.</h2>
      <ul>
        <li>滑鼠視差讓鏡頭有細微呼吸感。</li>
        <li>Bloom 與反射控制在輕量範圍，鎖定中階筆電流暢體驗。</li>
        <li>資源在頁面卸載時釋放，方便嵌入靜態託管。</li>
      </ul>
    </section>
  </main>
`

const canvas = app.querySelector<HTMLCanvasElement>('.webgl-canvas')

if (!canvas) {
  throw new Error('WebGL canvas not found')
}

const scroll = createScrollController()
const experience = new ExperienceScene(canvas)

const onResize = () => experience.resize()
window.addEventListener('resize', onResize)

experience.start(() => scroll.state)

window.addEventListener('beforeunload', () => {
  window.removeEventListener('resize', onResize)
  scroll.dispose()
  experience.dispose()
})
