const settle = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const lift = 'cubic-bezier(0.16, 1, 0.3, 1)'
const throwRight = 'cubic-bezier(0.5, 0, 1, 0.6)'

export const cardInterval = 1500
const duration = cardInterval * 3
const front = 'translate(0%, 0%) rotate(0rad) scale(1)'
const middle = 'translate(0%, -8%) rotate(-0.027925rad) scale(0.93)'
const back = 'translate(0%, -14.667%) rotate(0.038397rad) scale(0.86)'
const anticipation = 'translate(-4.722%, -3.111%) rotate(-0.05236rad) scale(1.05)'
const offstage = 'translate(144.444%, 6.667%) rotate(-0.349066rad) scale(0.98)'

function track(element: Element, frames: Array<Keyframe & { time: number }>) {
  const animation = element.animate(
    frames.map(({ time, ...frame }) => ({ ...frame, offset: time / duration })),
    { duration, iterations: Infinity },
  )
  animation.pause()
  return animation
}

export function createCardTracks(cards: HTMLCollection) {
  return Array.from(cards, (card, index) => {
    const tracks = [
      track(card, [
        { time: 0, transform: front },
        { time: 700, transform: front, easing: lift },
        { time: 880, transform: anticipation, easing: throwRight },
        { time: 1460, transform: offstage, easing: 'step-end' },
        { time: 1480, transform: back },
        { time: 2340, transform: back, easing: settle },
        { time: 3100, transform: middle },
        { time: 3840, transform: middle, easing: settle },
        { time: duration, transform: front },
      ]),
      track(card, [
        { time: 0, opacity: 1 },
        { time: 1340, opacity: 1, easing: throwRight },
        { time: 1460, opacity: 0 },
        { time: 1480, opacity: 0, easing: lift },
        { time: 1600, opacity: 1 },
        { time: duration, opacity: 1 },
      ]),
      track(card, [
        { time: 0, zIndex: 3, easing: 'step-end' },
        { time: 1480, zIndex: 1, easing: 'step-end' },
        { time: 2980, zIndex: 2, easing: 'step-end' },
        { time: 4480, zIndex: 3 },
        { time: duration, zIndex: 3 },
      ]),
      track(card, [
        { time: 0, filter: 'blur(0px)', easing: 'step-end' },
        { time: 1480, filter: 'blur(3px)', easing: lift },
        { time: 1600, filter: 'blur(1.5px)' },
        { time: 2340, filter: 'blur(1.5px)', easing: lift },
        { time: 3100, filter: 'blur(0px)' },
        { time: duration, filter: 'blur(0px)' },
      ]),
      track(card.querySelector('.project-depth')!, [
        { time: 0, opacity: 0.01, easing: 'step-end' },
        { time: 1480, opacity: 0.24 },
        { time: 2340, opacity: 0.24, easing: lift },
        { time: 3100, opacity: 0.12 },
        { time: 3840, opacity: 0.12, easing: lift },
        { time: duration, opacity: 0.01 },
      ]),
    ]
    return { tracks, phase: (cards.length - index) * cardInterval }
  })
}
