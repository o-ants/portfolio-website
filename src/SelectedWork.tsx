import { copy, otherProjects, projects, type Language } from './content'

const selectedProjects = [...projects, ...otherProjects.slice(0, 3)]

type Props = {
  language: Language
  onOpen: (index: number) => void
}

export default function SelectedWork({ language, onOpen }: Props) {
  const text = copy[language]

  return (
    <section id="work" className="selected-section project-stack-section" aria-labelledby="selected-title">
      <div className="section-heading">
        <h2 id="selected-title"><span className="section-index">01 /</span>{text.selected}</h2>
        <p>{text.selectedText}</p>
      </div>
      <ul className="project-stack">
        {selectedProjects.map((project, index) => (
          <li key={project.title}>
            <button
              type="button"
              className="project-stack-card"
              onClick={() => onOpen(index)}
              aria-label={`${text.preview}: ${project.title}`}
            >
              <span className="project-stack-preview">
                <span className="project-stack-title">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{project.title}</strong>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <path d="M5 19 19 5M5 5h14v14" />
                  </svg>
                </span>
                <span className="project-stack-placeholder" aria-hidden="true">
                  <span>+</span>
                  <small>{text.image}</small>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
