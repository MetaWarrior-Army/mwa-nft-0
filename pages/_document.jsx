// NextJS Helpers
import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script.js';
// More components
import Footer from '../src/footer.jsx';

 
export default function Document(req) {
  return (
    <Html lang="en" className="h-100" data-bs-theme="auto">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossOrigin="anonymous"/>
      
      <Head/>
      <body className="h-100 text-center text-bg-dark">

        <Main />
        <NextScript />
        
      </body>

    </Html>
  );
}