export default function App() {
  return (
    <div className="page">
      <header className="header">
        <a className="wordmark" href="#home" aria-label="Portfolio home">Portfolio<span>®</span></a>
        <a className="nav-link" href="#about">About me <span aria-hidden="true">↗</span></a>
      </header>

      <main id="home">
        <section className="hero" aria-labelledby="intro">
          <p className="eyebrow"><span className="dot" /> Product designer</p>
          <h1 id="intro">Turning complex ideas into <em>simple experiences.</em></h1>
          <p className="intro">I design thoughtful digital products that connect people and ideas. A little curiosity, a lot of care, and a focus on what matters.</p>
          <a className="button" href="#work">Explore my work <span aria-hidden="true">↓</span></a>
        </section>

        <section className="work" id="work" aria-labelledby="work-title">
          <div className="section-heading"><h2 id="work-title">Selected work</h2><span>01 — Coming soon</span></div>
          <div className="placeholder">
            <span className="asterisk" aria-hidden="true">✳</span>
            <div><h3>Good things take shape.</h3><p>Case studies are on their way. Stay curious.</p></div>
          </div>
        </section>

        <section className="about" id="about" aria-labelledby="about-title">
          <p className="eyebrow">Behind the work</p>
          <h2 id="about-title">Curious by nature.<br />Intentional by design.</h2>
          <p>I’m a product designer interested in making everyday interactions clearer, friendlier, and more useful. This is a space for my work and the thinking behind it.</p>
        </section>
      </main>

      <footer><span>Product design & thoughtful details.</span><a href="#home">Back to top ↑</a></footer>
    </div>
  )
}
