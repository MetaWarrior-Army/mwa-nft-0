 // PROJECT CONFIG
import { project } from '../src/config.jsx';

export default function Header() {
    return (
      <>
      <header className="mb-auto pb-5">
        <div>
          <h3 className="float-md-start mb-0"><img src={project.PROJECT_LOGO_URL} width="300px" class="img-fluid p-3"/>
          
          </h3>
          <nav className="nav nav-masthead justify-content-center float-md-end">
            <a className="nav-link fw-bold py-1 px-0" href="#">-</a>
          </nav>
        </div>
      </header>
      </>
    );
  }