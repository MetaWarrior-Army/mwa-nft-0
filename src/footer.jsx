// PROJECT CONFIG
import { project } from '../src/config.jsx';

export default function Footer() {
    return (
      <>
      <footer className="mt-auto text-white-50">
        <p className="small">{project.PROJECT_NAME}</p>
      </footer>
      </>
    );
}