import app from './app';

export default (_, children) => {
  const el = document.createElement('section');
  el.attachShadow({ mode: 'open' });
  app.render(el.shadowRoot as any, children);
  return <>{el}</>;
};
