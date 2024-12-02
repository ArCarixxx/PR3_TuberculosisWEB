import React from 'react';
import Header from './HeaderAdmin';
import Footer from './Footer';
import './Layout.css';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen layout">
      <Header className='layout-header'/>
      <main className="layout-main">
        {children}
      </main>
      <Footer className='layout-footer'/>
    </div>
  );
};

export default Layout;
