// NextJS Helpers
import { Html, Head, Main, NextScript } from 'next/document';
import Script from 'next/script.js';
// More components
import Footer from '../src/footer.jsx';
import Header from '../src/header.jsx';

 
export default function Document(req) {
  return (
    <Html lang="en" className="h-100" data-bs-theme="auto">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-4bw+/aepP/YC94hEpVNVgiZdgIC5+VKNBQNGCHeKRQN+PtmoHDEXuppvnDJzQIu9" crossOrigin="anonymous"/>
      
      <Head/>
      <body className="h-100 text-center text-bg-dark">
        <div className="container h-100 d-flex p-3 mx-auto flex-column">
        <Header />
        <Main />
        <NextScript />
        <Footer/>
        </div>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.1/dist/js/bootstrap.bundle.min.js" integrity="sha384-HwwvtgBNo3bZJJLYd8oVXjrBZt8cqVSpeBNS5n7C8IVInixGAoxmnlMuBnhbgrkm" crossOrigin="anonymous"/>
      </body>
    </Html>
  );
}