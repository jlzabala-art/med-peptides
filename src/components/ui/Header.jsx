import React from 'react';

/**
 * Header — A Google Cloud Platform (GCP) inspired top app bar.
 *
 * @param {React.ReactNode} leftContent - e.g., Logo, title, or menu toggle
 * @param {React.ReactNode} centerContent - e.g., Search bar
 * @param {React.ReactNode} rightContent - e.g., User profile, notifications
 */
export default function Header({ leftContent, centerContent, rightContent, className = '' }) {
  return (
    <header className={`ui-header ${className}`}>
      <div className="ui-header__left">{leftContent}</div>
      <div className="ui-header__center">{centerContent}</div>
      <div className="ui-header__right">{rightContent}</div>
    </header>
  );
}
