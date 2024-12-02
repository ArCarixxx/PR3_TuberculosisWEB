// src/components/Footer.js
import React from 'react';
import './Footer.css';  // Importamos el archivo de estilo

const Footer = () => {
  return (
    <footer id='footer' className='footer' ap-type="footer">
      <div className='l-wrap'>

        <a id='go-to-top' href='#main' className='btn-r btn-r-gotop'>
          <i className='icon icon-arrow-top'></i> 
          <br></br>
          <span>TOP</span>
        </a>

        <div className='footer-links'>
          <h2 className='footer-links-h blind'>FOOTER MENUS</h2>
          <div className='footer-links-list'>
            <a href='#' target='_blank' className='footer-links-a'>blank</a>
          </div>
        </div>

        { /*
        <div className='footer-share'>
          <h2 className='footer-share-h'>SÍGUENOS EN</h2>
          <div className='footer-share-list sns'>
            <a href='https://www.facebook.com/' target='_blank' rel='noreferrer' className='footer-share-a logo-a sns_icon_wrap' title='Facebook' ap-click-area="footer" ap-click-name="Click Footer" ap-click-data="Facebook">
              <div className='sns_icon facebook'>
                <img src='./images/a/facebook.png' alt='Facebook'></img>
                <img src='./images/a/facebook_over.png' alt='Facebook' className='over_img'></img>
              </div>
              <span className='blind'>Facebook</span>
            </a>
            <a href='https://www.linkedin.com/' target='_blank' rel='noreferrer' className='footer-share-a logo-a sns_icon_wrap' title='Linkedin' ap-click-area="footer" ap-click-name="Click Footer" ap-click-data="Linkedin">
              <div className='sns_icon linked_in'>
                <img src='./images/a/linked_in.png' alt='Linked_in'></img>
                <img src='./images/a/linked_in_over.png' alt='Linked_in' className='over_img'></img>
              </div>
              <span className='blind'>Linked_in</span>
            </a>
            <a href='https://www.instagram.com/' target='_blank' rel='noreferrer' className='footer-share-a logo-a sns_icon_wrap' title='Instagram' ap-click-area="footer" ap-click-name="Click Footer" ap-click-data="Instagram">
              <div className='sns_icon insta'>
                <img src='./images/a/insta.png' alt='Instagram'></img>
                <img src='./images/a/insta_over.png' alt='Instagram' className='over_img'></img>
              </div>
              <span className='blind'>Instagram</span>
            </a>
            <a href='https://www.youtube.com/' target='_blank' rel='noreferrer' className='footer-share-a logo-a sns_icon_wrap' title='Youtube' ap-click-area="footer" ap-click-name="Click Footer" ap-click-data="Youtube">
              <div className='sns_icon youtube'>
                <img src='./images/a/youtube.png' alt='Youtube'></img>
                <img src='./images/a/youtube_over.png' alt='Youtube' className='over_img'></img>
              </div>
              <span className='blind'>Youtube</span>
            </a>
          </div>
        </div>
        */ }
        
        <p className='copyright'>&copyright; Since 1945 SEDES, All Rights Reserved.</p>

      </div>
    </footer>
  );
};

export default Footer;
