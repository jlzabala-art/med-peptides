 
import React from 'react';

export const renderTitle = (titleString) => {
  if (!titleString) return null;
  const parts = titleString.split(/\{gradient:(.*?)\}/);
  return (
    <>
      {parts.map((part, i) => 
        i % 2 === 1 ? <span key={i} className="text-gradient">{part}</span> : part
      )}
    </>
  );
};
