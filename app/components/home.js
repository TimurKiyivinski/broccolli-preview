import xs from 'xstream'
import { div, p, img, input } from '@cycle/dom'

const HomeComponent = sources => {
  const greetingSocket$ = sources.socketIO.get('Webcam')

  const vdom$ = greetingSocket$.map(data => {
    const chunk = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(data.chunk)))}`
    const date = new Date(data.date)

    return div('.card .card-inverse .card-primary', [
      div('.card-block', [
        p('.card-text', `Date: ${date}`),
        img('.col-xs-12', { attrs: { src: chunk } }), // Assign value from input as text
      ])
    ])
  })

  return {
    DOM: vdom$
  }
}

export default HomeComponent
