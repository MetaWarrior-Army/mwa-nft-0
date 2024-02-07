// PROJECT CONFIG
import { project } from '../src/config.jsx';

export default function Footer() {
    return (
      <>
      <footer className="mt-auto text-white-50">
        <p className="small"><a href={project.PROJECT_URL} className="link-light"><img src={project.PROJECT_ICON_URL} height="30px"/></a> | <a className="link-light" target="_blank" href={project.PROJECT_PRIVACY_POLICY}>Privacy Policy</a> | <a className="link-light" target="_blank" href={project.PROJECT_TOS}>Terms of Service</a></p>
      </footer>
      </>
    );
}