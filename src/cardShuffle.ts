const settle = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const lift = 'cubic-bezier(0.16, 1, 0.3, 1)'
const throwRight = 'cubic-bezier(0.5, 0, 1, 0.6)'

// The three project stops use the first two throws from the Figma timeline.
export const cardStops = [0, 1600, 3100]
const duration = cardStops[cardStops.length - 1]
const front = 'translate(0%, 0%) rotate(0rad) scale(1)'
const middle = 'translate(0%, -8%) rotate(-0.027925rad) scale(0.93)'
const back = 'translate(0%, -14.667%) rotate(0.038397rad) scale(0.86)'
const anticipation = 'translate(-4.722%, -3.111%) rotate(-0.05236rad) scale(1.05)'
const offstage = 'translate(144.444%, 6.667%) rotate(-0.349066rad) scale(0.98)'

function pose(time: number, transform: string, easing = 'linear'): Keyframe {
  return { offset: time / duration, transform, easing }
}

function exitFrames(start: number) {
  return [
    pose(start, front, lift),
    pose(start + 180, anticipation, throwRight),
    pose(start + 760, offstage),
    pose(duration, offstage),
  ]
}

const transforms = [
  [pose(0, front), ...exitFrames(700)],
  [pose(0, middle), pose(840, middle, settle), pose(1600, front), ...exitFrames(2200)],
  [pose(0, back), pose(840, back, settle), pose(1600, middle), pose(2340, middle, settle), pose(duration, front)],
]
const depths = [
  [{ offset: 0, opacity: 0.01 }, { offset: 1, opacity: 0.01 }],
  [
    { offset: 0, opacity: 0.12 },
    { offset: 840 / duration, opacity: 0.12, easing: lift },
    { offset: 1600 / duration, opacity: 0.01 },
    { offset: 1, opacity: 0.01 },
  ],
  [
    { offset: 0, opacity: 0.24 },
    { offset: 840 / duration, opacity: 0.24, easing: lift },
    { offset: 1600 / duration, opacity: 0.12 },
    { offset: 2340 / duration, opacity: 0.12, easing: lift },
    { offset: 1, opacity: 0.01 },
  ],
]

function pausedTrack(element: Element, frames: Keyframe[]) {
  const animation = element.animate(frames, { duration, fill: 'both' })
  animation.pause()
  return animation
}

export function createCardTracks(cards: HTMLCollection) {
  return Array.from(cards).flatMap((card, index) => {
    const tracks = [
      pausedTrack(card, transforms[index]),
      pausedTrack(card.querySelector('.project-depth')!, depths[index]),
    ]
    if (index < 2) {
      const exit = index === 0 ? 1460 : 2960
      tracks.push(pausedTrack(card, [
        { offset: 0, opacity: 1 },
        { offset: (exit - 120) / duration, opacity: 1, easing: throwRight },
        { offset: exit / duration, opacity: 0 },
        { offset: 1, opacity: 0 },
      ]))
    } else {
      tracks.push(pausedTrack(card, [
        { offset: 0, filter: 'blur(1.5px)' },
        { offset: 840 / duration, filter: 'blur(1.5px)', easing: lift },
        { offset: 1600 / duration, filter: 'blur(0px)' },
        { offset: 1, filter: 'blur(0px)' },
      ]))
    }
    return tracks
  })
}
