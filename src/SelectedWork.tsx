import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react'
import { bankingRegulations, copy, otherProjects, projects, type Language } from './content'
import { clamp, deckPose, mix, swipeSteps } from './deckMotion'

const selectedProjects = [...projects, ...otherProjects.slice(0, 3), bankingRegulations]
const last = selectedProjects.length - 1
const detailEasing = 'cubic-bezier(.38,0,.25,1)'

function category(project: (typeof selectedProjects)[number]) {
  return 'type' in project ? project.type : 'group' in project ? project.group : 'Sber Bank'
}

function ProjectVisual({ index, language }: { index: number; language: Language }) {
  const project = selectedProjects[index]
  return 'image' in project
    ? <img className="work-cover" src={project.image} alt={language === 'ru' ? 'Дашборд банковских нормативов Сбера' : 'Sber Bank banking regulations dashboard'} draggable={false} />
    : <span className="work-placeholder"><strong>{project.title}</strong><small>{copy[language].image}</small></span>
}

export default function SelectedWork({ language }: { language: Language }) {
  const text = copy[language]
  const [active, setActive] = useState(0)
  const [mobileAction, setMobileAction] = useState(false)
  const [detail, setDetail] = useState<number | null>(null)
  const track = useRef<HTMLDivElement>(null)
  const scene = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const cards = useRef<HTMLButtonElement[]>([])
  const dialog = useRef<HTMLDialogElement>(null)
  const detailPanel = useRef<HTMLDivElement>(null)
  const back = useRef<HTMLButtonElement>(null)
  const animations = useRef<Animation[]>([])
  const phase = useRef<'stack' | 'opening' | 'detail' | 'closing'>('stack')
  const hover = useRef<number | null>(null)
  const focus = useRef<number | null>(null)
  const touchSelection = useRef<number | null>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const touch = useRef<{ x: number; y: number; index: number; selected: boolean; step: number } | null>(null)
  const swipeEnd = useRef(-Infinity)
  const schedule = useRef(() => {})
  const returnIndex = useRef(0)
  const returnScroll = useRef(0)

  const scrollMetrics = () => {
    const bounds = track.current!.getBoundingClientRect()
    const height = scene.current!.clientHeight
    const interval = (bounds.height - height) / (last + .5)
    return { height, interval, start: window.scrollY + bounds.top, position: clamp(-bounds.top / interval, 0, last), pinned: bounds.top <= 1 && bounds.bottom >= height - 1 }
  }

  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = matchMedia('(pointer: coarse)')
    let frame = 0
    let previous = 0
    let position = 0
    let scrollReveal = false
    let poses: number[][] = []
    let eased: number[][] = []
    let displayed = 0
    let action = false

    const draw = (time: number) => {
      frame = 0
      if (phase.current !== 'stack') return
      const { position: target, pinned } = scrollMetrics()
      const dt = previous ? clamp(time - previous, 1, 64) : 16
      const response = (ms: number) => reduced.matches ? 1 : 1 - Math.exp(-dt / ms)
      position = Math.abs(position - target) < .0005 ? target : mix(position, target, response(78))
      scrollReveal = pinned && (scrollReveal || target > 0)
      const selected = focus.current ?? hover.current ?? touchSelection.current ?? (scrollReveal ? Math.round(position) : null)
      const label = selected ?? Math.round(position)
      if (label !== displayed) {
        displayed = label
        setActive(label)
      }

      const height = stage.current!.clientHeight
      const cardHeight = cards.current[0].offsetHeight
      let moving = position !== target
      cards.current.forEach((card, index) => {
        const goal = deckPose(index, position, selected, last, height, cardHeight, reduced.matches)
        const amount = response(selected !== null && index !== selected ? 72 : 105)
        const interpolate = (from: number[] | undefined, to: number[]) => to.map((value, axis) => {
          const old = from?.[axis]
          if (old === undefined || Math.abs(old - value) < (axis > 2 ? .001 : .1)) return value
          return mix(old, value, amount)
        })
        eased[index] = interpolate(eased[index], goal)
        const pose = interpolate(poses[index], eased[index])
        poses[index] = pose
        const [y, z, angle, scaleX, scaleY] = pose
        card.style.transform = `translate3d(0, ${y}px, ${z}px) rotateX(${angle}deg) scale(${scaleX}, ${scaleY})`
        card.style.setProperty('--shade', String(Math.min(.16, Math.abs(index - (selected ?? position)) * .02)))
        moving ||= pose.some((value, axis) => value !== goal[axis]) || eased[index].some((value, axis) => value !== goal[axis])
      })
      const showAction = coarse.matches && selected !== null && Math.abs(poses[selected][2]) <= 2
      if (showAction !== action) {
        action = showAction
        setMobileAction(action)
      }
      previous = moving ? time : 0
      if (moving) schedule.current()
    }

    schedule.current = () => {
      if (!frame && phase.current === 'stack') frame = requestAnimationFrame(draw)
    }
    const onScroll = () => {
      hover.current = null
      focus.current = null
      pointer.current = null
      if (!touch.current && !scrollMetrics().pinned) touchSelection.current = null
      schedule.current()
    }
    const observer = new ResizeObserver(() => {
      poses = []
      eased = []
      position = scrollMetrics().position
      schedule.current()
    })
    const galleryPanel = stage.current!
    const casePanel = detailPanel.current!
    const captureSwipe = (event: globalThis.TouchEvent) => {
      const gesture = touch.current
      const finger = event.touches[0]
      if (!gesture || !finger || event.touches.length !== 1 || !event.cancelable) return
      const delta = gesture.y - finger.clientY
      if (Math.abs(delta) < 8 || Math.abs(delta) <= Math.abs(gesture.x - finger.clientX)) return
      if (event.currentTarget === casePanel) {
        if (casePanel.scrollHeight <= casePanel.clientHeight) event.preventDefault()
      } else if (gesture.selected) {
        if ((gesture.index === 0 && delta < 0) || (gesture.index === last && delta > 0)) {
          touch.current = null
          touchSelection.current = null
          schedule.current()
        } else event.preventDefault()
      }
    }
    galleryPanel.addEventListener('touchmove', captureSwipe, { passive: false })
    casePanel.addEventListener('touchmove', captureSwipe, { passive: false })
    observer.observe(scene.current!)
    observer.observe(stage.current!)
    observer.observe(cards.current[0])
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('pageshow', onScroll)
    reduced.addEventListener('change', schedule.current)
    const scheduleDraw = schedule.current
    scheduleDraw()
    return () => {
      observer.disconnect()
      galleryPanel.removeEventListener('touchmove', captureSwipe)
      casePanel.removeEventListener('touchmove', captureSwipe)
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pageshow', onScroll)
      reduced.removeEventListener('change', scheduleDraw)
      animations.current.forEach(animation => animation.cancel())
      document.documentElement.classList.remove('work-detail-open')
      schedule.current = () => {}
    }
  }, [])

  useEffect(() => {
    if (detail === null || phase.current !== 'opening') return
    dialog.current!.showModal()
    detailPanel.current!.scrollTop = 0
    back.current!.focus({ preventScroll: true })
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const options: KeyframeAnimationOptions = { duration: reduced ? 110 : 620, easing: detailEasing, fill: 'both' }
    animations.current = [
      scene.current!.animate(reduced ? [{ opacity: 1 }, { opacity: 0 }] : [{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], options),
      detailPanel.current!.animate(reduced ? [{ opacity: 0 }, { opacity: 1 }] : [{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], options),
    ]
    void Promise.all(animations.current.map(animation => animation.finished)).then(() => {
      if (phase.current === 'opening') phase.current = 'detail'
    }, () => {})
  }, [detail])

  const open = (index: number) => {
    if (phase.current !== 'stack' || performance.now() - swipeEnd.current < 350) return
    returnIndex.current = index
    returnScroll.current = window.scrollY
    hover.current = focus.current = touchSelection.current = null
    setMobileAction(false)
    phase.current = 'opening'
    document.documentElement.classList.add('work-detail-open')
    setDetail(index)
  }

  const close = async () => {
    if (phase.current !== 'opening' && phase.current !== 'detail') return
    phase.current = 'closing'
    const slides = animations.current
    slides.forEach(animation => animation.reverse())
    await Promise.allSettled(slides.map(animation => animation.finished))
    if (!dialog.current) return
    dialog.current.close()
    slides.forEach(animation => animation.cancel())
    animations.current = []
    document.documentElement.classList.remove('work-detail-open')
    window.scrollTo({ top: returnScroll.current, behavior: 'instant' })
    cards.current[returnIndex.current].focus({ preventScroll: true })
    setDetail(null)
    phase.current = 'stack'
    schedule.current()
  }

  const startTouch = (event: TouchEvent, inDetail = false) => {
    if (event.touches.length !== 1 || (inDetail ? phase.current !== 'detail' : !scrollMetrics().pinned)) return
    const { clientX: x, clientY: y } = event.touches[0]
    touch.current = { x, y, index: inDetail ? detail! : touchSelection.current ?? Math.round(scrollMetrics().position), selected: touchSelection.current !== null, step: 0 }
  }

  const moveTouch = (event: TouchEvent) => {
    const gesture = touch.current
    if (!gesture?.selected || event.touches.length !== 1) return
    const finger = event.touches[0]
    const steps = swipeSteps(gesture.y - finger.clientY, gesture.x - finger.clientX, scene.current!.clientHeight)
    if (steps === gesture.step) return
    gesture.step = steps
    touchSelection.current = clamp(gesture.index + steps, 0, last)
    schedule.current()
  }

  const finishTouch = (event: TouchEvent, inDetail = false) => {
    const gesture = touch.current
    touch.current = null
    const finger = event.changedTouches[0]
    if (!gesture || !finger || event.touches.length !== 0) return
    const { start, height, interval, position } = scrollMetrics()
    const steps = swipeSteps(gesture.y - finger.clientY, gesture.x - finger.clientX, height)
    if (!steps) return
    swipeEnd.current = performance.now()
    const index = clamp(gesture.index + steps, 0, last)
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (inDetail && phase.current === 'detail' && detail !== index) {
      setDetail(index)
      const panel = detailPanel.current!
      panel.scrollTop = 0
      if (!reduced) panel.querySelector('.work-detail-body')?.animate([
        { transform: `translateY(${Math.sign(steps) * 24}px)`, opacity: .72 },
        { transform: 'translateY(0)', opacity: 1 },
      ], { duration: 180, easing: 'ease-out' })
    } else if (!inDetail && (gesture.selected || Math.sign(steps) * (index - position) > .06)) {
      window.scrollTo({ top: start + index * interval, behavior: reduced ? 'instant' : 'smooth' })
    }
  }

  const project = detail === null ? null : selectedProjects[detail]
  return (
    <section id="work" className="selected-section work-gallery" aria-labelledby="selected-title">
      <div className="section-heading">
        <h2 id="selected-title"><span className="section-index">01 /</span>{text.selected}</h2>
        <p>{text.selectedText}</p>
      </div>
      <div ref={track} className="work-track" style={{ '--work-steps': last + .5 } as CSSProperties}>
        <div ref={scene} className="work-scene">
          <div ref={stage} className="work-panel"
            onPointerMove={event => {
              if (event.pointerType === 'touch' || event.buttons || phase.current !== 'stack') return
              const point = { x: event.clientX, y: event.clientY }
              const previous = pointer.current
              if (previous && Math.hypot(point.x - previous.x, point.y - previous.y) < 5) return
              pointer.current = point
              const card = (event.target as Element).closest<HTMLElement>('[data-work-index]')
              if (card) hover.current = Number(card.dataset.workIndex)
              schedule.current()
            }}
            onPointerLeave={() => { hover.current = pointer.current = null; schedule.current() }}
            onTouchStart={event => startTouch(event)}
            onTouchMove={moveTouch}
            onTouchEnd={event => finishTouch(event)}
            onTouchCancel={() => { touch.current = null; schedule.current() }}>
            <div className="work-active"><small>{category(selectedProjects[active])}</small><span>{selectedProjects[active].title}</span></div>
            <span className="work-count">{selectedProjects.length} {language === 'ru' ? 'проектов' : 'projects'}</span>
            <div className="work-deck">
              {selectedProjects.map((item, index) => (
                <button key={item.title} ref={element => { if (element) cards.current[index] = element }}
                  type="button" className="work-card" style={{ zIndex: index }}
                  data-work-index={index}
                  aria-label={`${text.preview}: ${item.title}`}
                  onFocus={event => { if (phase.current === 'stack' && event.currentTarget.matches(':focus-visible')) { focus.current = index; schedule.current() } }}
                  onBlur={() => { if (focus.current === index) focus.current = null; schedule.current() }}
                  onClick={event => {
                    if (performance.now() - swipeEnd.current < 350) return
                    if (event.detail && matchMedia('(pointer: coarse)').matches) {
                      touchSelection.current = index
                      focus.current = hover.current = null
                      schedule.current()
                    } else {
                      const anchor = pointer.current
                      const hovered = anchor && Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) < 5 ? hover.current : null
                      open(event.detail ? hovered ?? index : index)
                    }
                  }}>
                  <ProjectVisual index={index} language={language} />
                  <span className="work-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            {mobileAction && <button type="button" className="work-open" onClick={() => open(active)}>{text.preview} ↗</button>}
          </div>
        </div>
      </div>
      <dialog ref={dialog} className="work-dialog" aria-labelledby="work-case-title" onCancel={event => { event.preventDefault(); void close() }}>
        <div ref={detailPanel} className="work-detail" onTouchStart={event => startTouch(event, true)}
          onTouchEnd={event => finishTouch(event, true)} onTouchCancel={() => { touch.current = null }}>
          <div className="work-detail-nav">
            <button ref={back} type="button" onClick={() => void close()}>← {language === 'ru' ? 'К проектам' : 'Back to projects'}</button>
            <span>{text.details}</span>
          </div>
          {project && detail !== null && <div className="work-detail-body">
            <div className="work-detail-intro">
              <div><small>{category(project)}</small><h2 id="work-case-title">{project.title}</h2></div>
              <p>{'en' in project ? project[language] : 'image' in project ? text.soon : text.placeholder}</p>
            </div>
            <div className="work-case-visual"><ProjectVisual index={detail} language={language} /></div>
          </div>}
        </div>
      </dialog>
    </section>
  )
}
