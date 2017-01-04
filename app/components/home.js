import xs from 'xstream'
import { div, p, input } from '@cycle/dom'

const HomeComponent = sources => {
  const greetingSocket$ = sources.socketIO.get('Webcam')

  const vdom$ = greetingSocket$.map(data => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(data)))

    return div('.card .card-inverse .card-primary', [
      div('.card-block', [
        p('.card-text', base64), // Assign value from input as text
      ])
    ])
  })

  return {
    DOM: vdom$
  }
}

export default HomeComponent
