 // PROJECT CONFIG
import { project } from '../src/config.jsx';

export default function Header() {

    return (
      <>
      <header className="mb-auto pb-5">
        <div>
          <h3 className="float-md-start mb-0"><img src={project.PROJECT_LOGO_URL} width="300px" className="img-fluid p-3"/></h3>
          <nav className="navbar navbar-expand-lg navbar-dark bg-dark float-md-end">
            <img src={project.PROJECT_ICON_URL} height="30px"/>
            
          </nav>
        </div>
      </header>
      </>
    );
  }