export const projects = [
  { title: 'PP Assistant', label: '01', theme: 'assistant', mark: 'pp', caption: 'A little more clarity.' },
  { title: 'X5 Blogger Platform', label: '02', theme: 'blogger', mark: 'X5', caption: 'A place to connect.' },
  { title: 'Food.ru', label: '03', theme: 'food', mark: 'food.ru', caption: 'Everyday inspiration.' },
]
export function ProjectCard({ index }: { index: number }) {
  const project = projects[index % 3]
  return <div className={`card-content ${project.theme}`}>
    <div className="card-top"><span>{project.mark}</span><span className="sample-tag">CONCEPT PREVIEW</span></div>
    <div className="mockup" aria-hidden="true">
      <div className="mockup-bar"><i /><i /><i /></div>
      <div className="mockup-body"><div className="mockup-sidebar"><b>{project.mark}</b><i /><i /><i /><i /></div>
        <div className="mockup-main"><div className="mockup-heading" /><div className="mockup-subtitle" />
          <div className="mockup-feature">{index % 3 === 0 ? <><span className="abstract-orbit">✳</span><div className="mockup-lines"><i /><i /><i /></div></> : index % 3 === 1 ? <><span className="profile p1" /><span className="profile p2" /><span className="profile p3" /></> : <><span className="plate"><i /><i /><i /></span><div className="mockup-lines"><i /><i /></div></>}</div>
          <div className="mockup-grid"><i /><i /><i /></div>
        </div>
      </div>
    </div>
    <div className="card-caption"><span>{project.caption}</span><span>↗</span></div>
    <div className="card-title"><h2>{project.title}</h2><span>{project.label}</span></div>
  </div>
}
