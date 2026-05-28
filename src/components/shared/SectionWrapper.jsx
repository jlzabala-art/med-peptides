 
import React from 'react';
import './SectionWrapper.css';

/**
 * SectionWrapper — Componente envolvente para las secciones del Home.
 * Proporciona un espaciado vertical estandarizado, ancho máximo y
 * soporte para transiciones visuales opcionales.
 */
export default function SectionWrapper({ 
  children, 
  id, 
  className = '', 
  variant = 'default', // 'default', 'light', 'dark', 'none'
  noPadding = false,
  fullWidth = false,
  withTransition = false,
  containerClass = ''
}) {
  const sectionClasses = [
    'home-section',
    `home-section--${variant}`,
    noPadding ? 'home-section--no-padding' : '',
    withTransition ? 'home-section--with-transition' : '',
    className
  ].filter(Boolean).join(' ');

  const containerClasses = [
    fullWidth ? 'home-section__full' : 'home-section__container',
    containerClass
  ].filter(Boolean).join(' ');

  return (
    <section id={id} className={sectionClasses}>
      <div className={containerClasses}>
        {children}
      </div>
    </section>
  );
}
