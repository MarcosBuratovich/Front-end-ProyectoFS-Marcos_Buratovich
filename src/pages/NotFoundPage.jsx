import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div>
      <h1>404 - Página No Encontrada</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/">Volver al Inicio</Link>
    </div>
  );
}

export default NotFoundPage;
