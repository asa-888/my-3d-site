import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { useGLTF, Environment, useProgress, Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)

const COLOR_OPTIONS = [
  { id: 'silver', name: '白銀 — SHIROGANE', hex: '#e2e6ec', metalness: 0.85, roughness: 0.25 },
  { id: 'black', name: '墨黒 — SUMIKURO', hex: '#23262b', metalness: 0.6, roughness: 0.45 },
  { id: 'gold', name: 'シャンパン — KOHAKU', hex: '#d4be98', metalness: 0.85, roughness: 0.28 },
  { id: 'navy', name: '深藍 — FUKAAI', hex: '#28384d', metalness: 0.7, roughness: 0.35 },
]

function LoadingScreen() {
  const { progress, active } = useProgress()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!active && progress === 100) {
      const timer = setTimeout(() => {
        setHidden(true)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [active, progress])

  if (hidden) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#111',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        opacity: !active && progress === 100 ? 0 : 1,
        transition: 'opacity 0.8s ease-out',
        pointerEvents: 'none',
      }}
    >
      <div style={{ fontSize: '1rem', letterSpacing: '0.4em', marginBottom: '20px', color: '#888' }}>
      PURE ALUMINUM BOTTLE — SUMIMIZU
      </div>
      <div style={{ fontSize: '3.5rem', fontWeight: '700', fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(progress)}%
      </div>
      <div style={{ width: '200px', height: '2px', backgroundColor: '#333', marginTop: '20px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#fff',
            transition: 'width 0.2s ease-out',
          }}
        />
      </div>
    </div>
  )
}

function Model({ selectedColor }) {
  const { scene } = useGLTF('/WaterBottle.glb')
  const modelRef = useRef()
  const { viewport } = useThree()
  const isMobile = viewport.width < 5.5

  useEffect(() => {
    if (!scene || !selectedColor) return
    const targetColor = new THREE.Color(selectedColor.hex)

    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.color.lerp(targetColor, 0.85)
        if ('metalness' in child.material) {
          child.material.metalness = selectedColor.metalness
        }
        if ('roughness' in child.material) {
          child.material.roughness = selectedColor.roughness
        }
        child.material.needsUpdate = true
      }
    })
  }, [scene, selectedColor])

  useGSAP(() => {
    if (!modelRef.current) return

    gsap.set(modelRef.current.position, {
      x: 0,
      y: isMobile ? 0.65 : 0,
      z: 0,
    })

    const offsetX = Math.min(1.3, viewport.width * 0.22)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-3d-area",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      }
    })

    if (isMobile) {
      tl.to(modelRef.current.position, { x: 0, y: 0.75, z: 0.2 }, 0)
      tl.to(modelRef.current.rotation, { y: Math.PI * 2, z: 0.08 }, 0)
      tl.to(modelRef.current.scale, { x: 1.0, y: 1.0, z: 1.0 }, 0)

      tl.to(modelRef.current.position, { x: 0, y: 0.8, z: 0.1 }, 1)
      tl.to(modelRef.current.rotation, { y: Math.PI * 4, z: -0.08 }, 1)
      tl.to(modelRef.current.scale, { x: 1.0, y: 1.0, z: 1.0 }, 1)
    } else {
      tl.to(modelRef.current.position, { x: offsetX, y: 0, z: 0.4 }, 0)
      tl.to(modelRef.current.rotation, { y: Math.PI * 2, z: 0.1 }, 0)
      tl.to(modelRef.current.scale, { x: 1.15, y: 1.15, z: 1.15 }, 0)

      tl.to(modelRef.current.position, { x: -offsetX * 1.05, y: -0.05, z: 0.4 }, 1)
      tl.to(modelRef.current.rotation, { y: Math.PI * 4, z: -0.15 }, 1)
      tl.to(modelRef.current.scale, { x: 1.2, y: 1.2, z: 1.2 }, 1)
    }
  }, [isMobile, viewport.width])

  return (
    <group ref={modelRef}>
      <Float
        speed={3}
        rotationIntensity={0.2}
        floatIntensity={0.5}
        floatingRange={[-0.1, 0.1]}
      >
        <primitive 
          object={scene} 
          scale={isMobile ? 6.5 : 8.8} 
          position={[0, -0.55, 0]} 
          rotation={[0, Math.PI * 0.25, 0]}
        />
      </Float>
    </group>
  )
}

function PurchaseModal({ isOpen, onClose, selectedColor, onSelectColor }) {
  const [quantity, setQuantity] = useState(1)
  const [isCompleted, setIsCompleted] = useState(false)
  const unitPrice = 6800

  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setIsCompleted(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalPrice = (unitPrice * quantity).toLocaleString()

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 18, 22, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#f4f6f9',
          color: '#1a1a1a',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          border: '1px solid rgba(255, 255, 255, 0.8)',
        }}
      >
        <button
          onClick={onClose}
          aria-label="閉じる"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            color: '#666',
            cursor: 'pointer',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
      
        </button>

        {!isCompleted ? (
          <>
            <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: '#666', marginBottom: '8px' }}>
              SUMIMIZU BOTTLE
            </div>
            <h3
              style={{
                fontFamily: "'Shippori Mincho', serif",
                fontSize: '1.65rem',
                fontWeight: '700',
                marginBottom: '20px',
              }}
            >
              澄水 オリジナルボトル 500ml
            </h3>

            <div
              style={{
                padding: '14px 0',
                borderTop: '1px solid #d5dae2',
                borderBottom: '1px solid #d5dae2',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                <span style={{ color: '#555' }}>カラー</span>
                <span style={{ fontWeight: '600' }}>{selectedColor.name}</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {COLOR_OPTIONS.map((c) => {
                  const active = c.id === selectedColor.id
                  return (
                    <button
                      key={c.id}
                      onClick={() => onSelectColor(c)}
                      title={c.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: active ? '2px solid #1a1a1a' : '1px solid #bbb',
                        boxShadow: active ? '0 0 0 2px #f4f6f9, 0 0 0 4px #1a1a1a' : 'none',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  )
                })}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 0',
                borderBottom: '1px solid #d5dae2',
                marginBottom: '20px',
                fontSize: '0.95rem',
              }}
            >
              <span style={{ color: '#555' }}>単価（税込）</span>
              <span style={{ fontWeight: '600' }}>6,800円</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <span style={{ fontSize: '0.95rem', color: '#555' }}>数量</span>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  backgroundColor: '#e6e9ef',
                  padding: '6px 14px',
                  borderRadius: '50px',
                }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '28px',
                    height: '28px',
                    color: quantity === 1 ? '#aaa' : '#222',
                  }}
                >
              
                </button>
                <span style={{ fontSize: '1.05rem', fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '28px',
                    height: '28px',
                    color: '#222',
                  }}
                >
                  ＋
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingTop: '16px',
                borderTop: '1px solid #d5dae2',
                marginBottom: '28px',
              }}
            >
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>合計金額（税込・送料無料）</span>
              <span style={{ fontSize: '1.8rem', fontWeight: '700' }}>{totalPrice}円</span>
            </div>

            <button
              onClick={() => setIsCompleted(true)}
              style={{
                width: '100%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                border: 'none',
                padding: '16px',
                fontSize: '0.95rem',
                fontWeight: '600',
                letterSpacing: '0.15em',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#383838')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a1a1a')}
            >
              カートに追加する
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#1a1a1a',
                color: '#fff',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto',
              }}
            >
              ✓
            </div>
            <h3
              style={{
                fontFamily: "'Shippori Mincho', serif",
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '12px',
              }}
            >
              カートに追加しました
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7, marginBottom: '28px' }}>
              澄水 オリジナルボトル 500ml<br />
              カラー：{selectedColor.name} × {quantity}点<br />
              （小計：{totalPrice}円）
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                backgroundColor: '#e2e6ed',
                color: '#1a1a1a',
                border: 'none',
                padding: '14px',
                fontSize: '0.9rem',
                fontWeight: '600',
                letterSpacing: '0.12em',
                borderRadius: '50px',
                cursor: 'pointer',
              }}
            >
              ページに戻る
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

const faqItems = [
  {
    q: '炭酸飲料やスポーツドリンクを入れることはできますか？',
    a: '高純度アルミニウム合金の内面に特殊コーティングを施しているため、スポーツドリンクや酸性の飲み物にも対応しております。ただし、内圧が高まる炭酸飲料やドライアイスは破損の原因となるためご使用をお控えください。',
  },
  {
    q: '食洗機や乾燥機での洗浄は可能ですか？',
    a: '表面の繊細なヘアライン仕上げと真空断熱構造を長く保つため、食器洗い乾燥機のご使用はお控えいただき、中性洗剤と柔らかいスポンジでの手洗いをおすすめしております。',
  },
  {
    q: '注文からどれくらいで届きますか？',
    a: '平日14時までのご注文は当日中に発送いたします。通常、発送日の翌日〜翌々日にお届けいたします（沖縄・離島を除く）。全国どこでも送料無料でお届けします。',
  },
  {
    q: '交換用のパッキンやキャップは購入できますか？',
    a: 'はい、シリコーンパッキンおよび専用キャップは消耗パーツとして単品でもお買い求めいただけます。長くご愛用いただけるようアフターサポート体制を整えております。',
  },
]

export default function App() {
  const containerRef = useRef()
  const lenisRef = useRef(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0])

  useEffect(() => {
    const lenis = new Lenis()
    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [])

  useEffect(() => {
    if (!lenisRef.current) return
    if (isModalOpen) {
      lenisRef.current.stop()
    } else {
      lenisRef.current.start()
    }
  }, [isModalOpen])

  const scrollToSection = (selector) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(selector, { duration: 1.5 })
    }
  }

  useGSAP(() => {
    gsap.from(".title-main", {
      y: 50,
      opacity: 0,
      duration: 1.5,
      ease: "power3.out",
      delay: 0.8
    })

    // ★3. 背景の巨大透かし文字をスクロールに合わせて左右逆方向へパララックス移動
    gsap.fromTo(
      ".watermark-line-1",
      { xPercent: 8 },
      {
        xPercent: -14,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-3d-area",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      }
    )

    gsap.fromTo(
      ".watermark-line-2",
      { xPercent: -10 },
      {
        xPercent: 12,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero-3d-area",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      }
    )

    gsap.from(".text-fade-up-2", {
      scrollTrigger: {
        trigger: ".section-2",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    })

    gsap.from(".text-fade-up-3", {
      scrollTrigger: {
        trigger: ".section-3",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out"
    })

    gsap.from(".story-fade-up", {
      scrollTrigger: {
        trigger: ".story-section",
        start: "top 80%",
      },
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    })

    // 3Dキャンバス・透かし文字・カラーバーをストーリーセクション以降でフェードアウト
    gsap.to([".canvas-wrapper", ".bg-watermark-wrapper", ".color-picker-bar"], {
      scrollTrigger: {
        trigger: ".story-section",
        start: "top 95%",
        end: "top 40%",
        scrub: true,
      },
      opacity: 0,
      pointerEvents: "none",
    })
  }, { scope: containerRef })

  return (
    <>
      <LoadingScreen />
      <PurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedColor={selectedColor}
        onSelectColor={setSelectedColor}
      />

      <header
        className="site-header"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          padding: '24px 10%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        <div
          className="site-logo blend-text"
          onClick={() => scrollToSection('.section-1')}
          style={{
            fontFamily: "'Shippori Mincho', serif",
            fontSize: '1.35rem',
            fontWeight: '700',
            letterSpacing: '0.2em',
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          澄水 — SUMIMIZU
        </div>

        <nav className="site-nav" style={{ display: 'flex', alignItems: 'center', gap: '32px', pointerEvents: 'auto' }}>
          <button
            className="nav-link blend-text"
            onClick={() => scrollToSection('.section-2')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            コンセプト
          </button>

          <button
            className="nav-link blend-text"
            onClick={() => scrollToSection('.section-3')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            製品仕様
          </button>

          <button
            className="nav-link blend-text"
            onClick={() => scrollToSection('.story-section')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '500',
              letterSpacing: '0.1em',
              cursor: 'pointer',
            }}
          >
            物語・FAQ
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: '#222',
              color: '#fff',
              border: 'none',
              padding: '10px 24px',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '0.12em',
              borderRadius: '50px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease, background-color 0.2s ease',
            }}
          >
            購入する
          </button>
        </nav>
      </header>

      <div
        className="color-picker-bar"
        style={{
          position: 'fixed',
          bottom: '28px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          backgroundColor: 'rgba(244, 246, 249, 0.78)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '10px 20px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
      >
        <span style={{ fontSize: '0.78rem', fontWeight: '600', letterSpacing: '0.08em', color: '#333', whiteSpace: 'nowrap' }}>
          {selectedColor.name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {COLOR_OPTIONS.map((color) => {
            const isSelected = selectedColor.id === color.id
            return (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                aria-label={color.name}
                title={color.name}
                style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: color.hex,
                  border: isSelected ? '2px solid #1a1a1a' : '1px solid rgba(0,0,0,0.2)',
                  boxShadow: isSelected ? '0 0 0 2px #f4f6f9, 0 0 0 3.5px #1a1a1a' : 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease',
                  transform: isSelected ? 'scale(1.12)' : 'scale(1)',
                }}
              />
            )
          })}
        </div>
      </div>

      <div ref={containerRef} className="scroll-container" style={{ backgroundColor: '#d8dce3' }}>
        {/* ★3. 最背面の巨大透かしタイポグラフィ（zIndex: 0） */}
        <div className="bg-watermark-wrapper" aria-hidden="true">
          <div className="bg-watermark-text watermark-line-1">SUMIMIZU</div>
          <div className="bg-watermark-text watermark-line-2">PURE WATER</div>
        </div>

        {/* 透明3Dキャンバス（透かし文字の手前に重ねるため zIndex: 1、alpha: true） */}
        <div
          className="canvas-wrapper"
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 1, pointerEvents: 'none' }}
        >
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ alpha: true }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[-6, 8, -4]} intensity={1.2} />
            <Environment preset="studio" environmentIntensity={0.5} />
            
            <Suspense fallback={null}>
              <Model selectedColor={selectedColor} />
            </Suspense>

            <Sparkles
              count={80}
              scale={[8, 6, 6]}
              size={2.5}
              speed={0.3}
              opacity={0.65}
              color="#ffffff"
            />
          </Canvas>
        </div>

        {/* 前景テキスト・セクション群（zIndex: 2） */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-3d-area">
            <section className="section-1" style={{ height: '100vh', display: 'flex', alignItems: 'center', paddingLeft: '10%' }}>
            <h1 className="title-main blend-text" style={{ fontSize: '4.5rem', fontWeight: '700' }}>
              静寂を、<br/>持ち歩く。
            </h1>
            </section>

            <section className="section-2" style={{ height: '100vh', display: 'flex', alignItems: 'center', paddingLeft: '10%' }}>
              <div className="content-box" style={{ maxWidth: '440px' }}>
              <h2 className="text-fade-up-2 blend-text" style={{ fontSize: '2.6rem', marginBottom: '24px' }}>
               継ぎ目なき、純アルミの美学
               </h2>
              <p className="text-fade-up-2 blend-text" style={{ fontSize: '1.05rem', lineHeight: 1.9 }}>
               光を柔らかく受け止めるマットな肌理（きめ）と、一切の無駄を排した円筒のフォルム。高純度アルミニウムがもたらす静かな存在感が、日常のひとときを特別な体験へと変えます。
              </p>
              </div>
            </section>

            <section
              className="section-3"
              style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '10%',
              }}
            >
              <div className="content-box" style={{ maxWidth: '440px', width: '100%' }}>
                <h2 className="text-fade-up-3 blend-text" style={{ fontSize: '2.5rem', marginBottom: '28px' }}>
                  製品仕様
                </h2>

                <div className="text-fade-up-3 blend-text" style={{ borderTop: '1px solid #aab0ba', padding: '14px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>選択カラー</span>
                  <span style={{ fontWeight: '600' }}>{selectedColor.name}</span>
                </div>
                <div className="text-fade-up-3 blend-text" style={{ borderTop: '1px solid #aab0ba', padding: '14px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>容量</span>
                  <span style={{ fontWeight: '600' }}>500ミリリットル</span>
                </div>
                <div className="text-fade-up-3 blend-text" style={{ borderTop: '1px solid #aab0ba', padding: '14px 0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>素材</span>
                  <span style={{ fontWeight: '600' }}>高純度アルミニウム合金</span>
                </div>
                <div className="text-fade-up-3 blend-text" style={{ borderTop: '1px solid #aab0ba', borderBottom: '1px solid #aab0ba', padding: '14px 0', display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                  <span>保冷効力</span>
                  <span style={{ fontWeight: '600' }}>最大24時間</span>
                </div>

                <div className="text-fade-up-3 price-action-row" style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                  <span className="blend-text" style={{ fontSize: '2rem', fontWeight: '700' }}>
                    6,800円 <span style={{ fontSize: '0.9rem', fontWeight: '400' }}>（税込）</span>
                  </span>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    style={{
                      backgroundColor: '#222',
                      color: '#fff',
                      border: 'none',
                      padding: '16px 36px',
                      fontSize: '0.95rem',
                      fontWeight: '600',
                      letterSpacing: '0.15em',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, background-color 0.2s ease',
                    }}
                  >
                    購入する
                  </button>
                </div>
              </div>
            </section>
          </div>

          <section
            className="story-section"
            style={{
              backgroundColor: '#cfd5df',
              padding: '140px 10%',
              borderTop: '1px solid #bcc3cf',
            }}
          >
            <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
              <div
                className="story-fade-up"
                style={{ fontSize: '0.85rem', letterSpacing: '0.35em', color: '#5c6472', marginBottom: '20px' }}
              >
                BRAND STORY
              </div>
              <h2
                className="story-fade-up story-title"
                  style={{ fontSize: '2.4rem', color: '#1a1a1a', marginBottom: '36px', lineHeight: 1.5 }}
                > 
                  満たすのは、<br />喉ではなく、心。
              </h2>
                <p
                className="story-fade-up"
                style={{ fontSize: '1.05rem', color: '#3b414c', lineHeight: 2.1, marginBottom: '24px' }}
                >
                「澄水 — SUMIMIZU」は、ただ喉を潤すための道具ではなく、忙しい日常の中で呼吸を整えるための小さな静寂として生まれました。
                </p>
                <p
                  className="story-fade-up"
                  style={{ fontSize: '1.05rem', color: '#3b414c', lineHeight: 2.1 }}
                  >
                  職人の手仕事による精密な金属加工と、朝露のように光を宿す質感。10年後も美しいまま寄り添う、一生ものの器をお届けします。 
                </p>
            </div>
          </section>

          <section
            className="faq-section"
            style={{
              backgroundColor: '#d8dce3',
              padding: '120px 10%',
              borderTop: '1px solid #c2c8d4',
            }}
          >
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '56px' }}>
                <div style={{ fontSize: '0.85rem', letterSpacing: '0.35em', color: '#5c6472', marginBottom: '12px' }}>
                  FAQ
                </div>
                <h2 className="faq-title" style={{ fontSize: '2.2rem', color: '#1a1a1a' }}>
                  よくある質問
                </h2>
              </div>

              <div>
                {faqItems.map((item, idx) => {
                  const isOpen = openFaqIndex === idx
                  return (
                    <div
                      key={idx}
                      style={{
                        borderTop: '1px solid #b5bcc8',
                        borderBottom: idx === faqItems.length - 1 ? '1px solid #b5bcc8' : 'none',
                      }}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        style={{
                          width: '100%',
                          padding: '24px 8px',
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '16px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          color: '#1a1a1a',
                          fontSize: '1.05rem',
                          fontWeight: '600',
                        }}
                      >
                        <span>{item.q}</span>
                        <span
                          style={{
                            fontSize: '1.4rem',
                            fontWeight: '400',
                            color: '#555',
                            transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                            transition: 'transform 0.25s ease',
                          }}
                        >
                          ＋
                        </span>
                      </button>
                      {isOpen && (
                        <div
                          style={{
                            padding: '0 8px 24px 8px',
                            color: '#444b57',
                            fontSize: '0.96rem',
                            lineHeight: 1.9,
                          }}
                        >
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>

          <footer
            className="site-footer"
            style={{
              backgroundColor: '#1a1d22',
              color: '#d8dce3',
              padding: '64px 10%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Shippori Mincho', serif",
                  fontSize: '1.3rem',
                  fontWeight: '700',
                  letterSpacing: '0.2em',
                  color: '#fff',
                  marginBottom: '10px',
                }}
              >
                澄水 — SUMIMIZU
              </div>
              <div style={{ fontSize: '0.8rem', color: '#88909e', letterSpacing: '0.08em' }}>
                © 2026 SUMIMIZU. All Rights Reserved.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  background: 'none',
                  border: '1px solid #4a515e',
                  color: '#fff',
                  padding: '10px 24px',
                  borderRadius: '50px',
                  fontSize: '0.85rem',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                }}
              >
                オンラインストア
              </button>

              <button
                onClick={() => scrollToSection('.section-1')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9aa2b0',
                  fontSize: '0.85rem',
                  letterSpacing: '0.1em',
                  cursor: 'pointer',
                }}
              >
                PAGE TOP ↑
              </button>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}