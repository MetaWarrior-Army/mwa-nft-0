 // PROJECT CONFIG
import { project } from '../src/config.jsx';

export default function Header({id_token}) {
  let logoutURL;

  if(id_token !== false){
    logoutURL = project.OAUTH_LOGOUT_URL+process.env.OAUTH_CLIENTID+"&id_token_hint="+id_token+"&post_logout_redirect_uri="+encodeURIComponent("https://nft.metawarrior.army/logout");
  }

  return (
    <>
    <header className="mb-auto pb-5">
      <div>
        <h3 className="float-md-start mb-0"><img src={project.PROJECT_LOGO_URL} width="300px" className="img-fluid p-3"/></h3>
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark float-md-end">
          <img src={project.PROJECT_ICON_URL} height="30px"/>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              {(typeof logoutURL !== 'undefined') ? 
                <a className="nav-link link-light" aria-current="page" href={logoutURL}>Logout</a> :
                ''
              }
            </li>
          </ul>
        </nav>
      </div>
    </header>
    </>
  );
};