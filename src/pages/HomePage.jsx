import React from 'react';

export function HomePage({ markup }) {
  return <main id="top" dangerouslySetInnerHTML={{ __html: markup }} />;
}
