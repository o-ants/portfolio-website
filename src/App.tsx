import { useEffect, useRef, useState } from 'react'
import SelectedWork from './SelectedWork'
import OtherProjects from './OtherProjects'
import { copy, projects, otherProjects, type Language } from './content'
import './style.css'

export default function App() {
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem('portfolio-language') === 'ru' ? 'ru' : 'en')
  const [opened, setOpened] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const hero = useRef<HTMLElement>(null)
  const text = copy[language]
  useEffect(() => { document.documentElement.lang = language; localStorage.setItem('portfolio-language', language); document.title = `${text.name} — ${text.role}` }, [language, text])
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) } }), { threshold: .12 })
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    const update = () => {
      frame = 0
      if (hero.current) hero.current.style.setProperty('--hero-scroll', String(media.matches ? 0 : Math.min(1, scrollY / innerHeight)))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    update(); addEventListener('scroll', schedule, { passive: true }); media.addEventListener('change', update)
    return () => { cancelAnimationFrame(frame); removeEventListener('scroll', schedule); media.removeEventListener('change', update) }
  }, [])
  const openProject = (index: number) => { setOpened(index); dialog.current?.showModal() }
  const project = opened === null ? null : opened < 3 ? projects[opened] : otherProjects[opened - 3]
  return <>
    <div className="ambient-background" aria-hidden="true" />
    <a className="skip-link" href="#main">{language === 'en' ? 'Skip to content' : 'К содержимому'}</a>
    <div className="page">
      <header className="header"><a className="wordmark" href="#home">{text.name}<span>{text.role}</span></a><div className="header-right"><nav aria-label={language === 'en' ? 'Main navigation' : 'Основная навигация'}>{['work', 'about', 'contact'].map((id, i) => <a href={`#${id}`} key={id}>{text.nav[i]}</a>)}</nav><div className="language-switch" aria-label="Language / Язык"><button aria-pressed={language === 'en'} onClick={() => setLanguage('en')}>EN</button><span>/</span><button aria-pressed={language === 'ru'} onClick={() => setLanguage('ru')}>RU</button></div></div></header>
      <main id="main">
        <section id="home" className="hero" ref={hero} aria-labelledby="hero-title"><div className="hero-top"><span>{text.role}</span><span>{text.experience}</span></div><div className="hero-copy"><h1 id="hero-title">{text.hero[0]}<br /><em>{text.hero[1]}</em></h1><div className="hero-description"><span className="small-star" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 2v36M2 20h36M7 7l26 26M7 33L33 7" /></svg></span><p>{text.intro}</p></div></div><a className="hero-scroll" href="#work"><span>{text.explore}</span><span aria-hidden="true">↓</span></a><div className="hero-line" aria-hidden="true" /></section>
        <SelectedWork language={language} onOpen={openProject} />
        <OtherProjects language={language} onOpen={openProject} />
        <section className="about-section" id="about" aria-labelledby="about-title"><div className="section-heading reveal"><h2 id="about-title"><span className="section-index">03 /</span>{text.about}</h2><p>{text.workspace}</p></div><div className="about-grid"><div className="workspace-scene reveal" data-animation-idle="pending" data-animation-greeting="pending"><div className="desk-art" aria-hidden="true"><span className="desk-note">ideas<br /><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></span><div className="desk-screen"><span>□ ──<br />── □<br />▱ ──</span></div><div className="desk-surface" /><div className="desk-cup" /></div><p>{text.workspaceNote}</p><span>{text.workspaceState}</span></div><div className="about-copy reveal"><h3>{text.aboutTitle[0]}<br /><em>{text.aboutTitle[1]}</em></h3><p>{text.aboutText}</p><p>{text.aboutSecond}</p><ul className="expertise">{text.scope.map(item => <li key={item}>{item}</li>)}</ul><div className="experience"><strong>5<span>+</span></strong><span>{text.years}</span></div></div></div></section>
        <section className="contact-section reveal" id="contact" aria-labelledby="contact-title"><div><span className="section-index">04 / {text.nav[2]}</span><h2 id="contact-title">{text.contact}</h2><p>{text.contactText}</p></div><div className="contact-links"><a href="mailto:o.antsinova@gmail.com">o.antsinova@gmail.com <span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></span></a><a href="https://t.me/olgamaio" target="_blank" rel="noopener noreferrer">Telegram <span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg></span></a><span className="inactive-contact">LinkedIn <small>{text.linked}</small></span></div></section>
      </main><footer><span>© {new Date().getFullYear()} {text.name}</span><span>{text.role}</span><a href="#home">{text.back} ↑</a></footer>
    </div>
    <dialog ref={dialog} className="project-dialog" onClose={() => setOpened(null)} onClick={event => { if (event.target === dialog.current) { const box = dialog.current.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.current.close() } }}><div className="dialog-top"><span>{text.details}</span><button onClick={() => dialog.current?.close()} aria-label={text.close}>×</button></div>{project && <><h2>{project.title}</h2><div className={`dialog-visual ${project.theme}`}><span>{'mark' in project ? project.mark : ''}</span><small>{text.image}</small></div><p>{text.placeholder}</p><span className="case-status">{text.soon}</span></>}</dialog>
  </>
}
