import app, { Component } from '../src/apprun';

describe('app.start', () => {
  it('should allow no parameters', () => {
    app.start()
  })

  it('should allow empty element', () => {
    app.start('')
  })

  it('should allow null element', () => {
    app.start(null)
  })

  it('should allow only element, state', () => {
    app.start('', null)
  })

  it('should allow null state, view, update', () => {
    app.start('', null, s=>s)
  })
})