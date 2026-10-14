import React from 'react';

export function AboutPage({ markup }) {
  return <main id="top" dangerouslySetInnerHTML={{ __html: markup }} />;
}
