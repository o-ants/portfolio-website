import { useState } from 'react'
import { copy, otherProjects, type Language } from './content'

export default function OtherProjects({ language, onOpen }: { language: Language; onOpen: (index: number) => void }) {
  const [paused, setPaused] = useState(false)
  const text = copy[language]
  const rows = [otherProjects.map((_, index) => index), [3, 4, 0, 1, 2]]
  return <section className="other-section" id="other" aria-labelledby="other-title">
    <div className="section-heading reveal"><h2 id="other-title"><span className="section-index">02 /</span>{text.other}</h2><p>{text.otherText}</p></div>
    <div className={`project-marquees${paused ? ' is-paused' : ''}`}>
      {rows.map((row, rowIndex) => <div className={`project-marquee row-${rowIndex}`} key={rowIndex}>
        <div className="marquee-track">
          {[0, 1].map(duplicate => <div className="marquee-group" key={duplicate} aria-hidden={duplicate === 1 ? true : undefined}>
            {row.map(index => {
              const item = otherProjects[index]
              return <article className="marquee-card" key={item.title}>
                <button className="marquee-card-button" tabIndex={duplicate === 1 ? -1 : undefined} onClick={() => onOpen(index + 3)} aria-label={`${text.preview}: ${item.title}`}>
                  <span className="marquee-card-top"><span>0{index + 1}</span><span>{item.group}</span></span>
                  <span className="marquee-placeholder"><span aria-hidden="true">+</span><small>{text.image}</small></span>
                  <span className="marquee-card-caption"><strong>{item.title}</strong><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></span>
                </button>
              </article>
            })}
          </div>)}
        </div>
      </div>)}
    </div>
    <div className="gallery-bottom marquee-bottom"><span>{language === 'en' ? 'Small initiatives. Different perspectives.' : 'Небольшие инициативы. Разные взгляды.'}</span><button className="marquee-pause" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? (language === 'en' ? 'Play animation' : 'Продолжить анимацию') : (language === 'en' ? 'Pause animation' : 'Остановить анимацию')}</button></div>
  </section>
}
