import xs from 'xstream'
import throttle from 'xstream/extra/throttle'
import { div, p, img } from '@cycle/dom'
import { encode } from 'base64-arraybuffer'

const HomeComponent = sources => {
  const chunkToBase64 = chunk => `data:image/jpeg;base64,${encode(chunk)}`

  const camera$ = xs.of({
    url: '/v2/streams',
    category: 'streams'
  })

  const getStream$ = sources.HTTP.select('streams')
    .flatten()
    .map(res => res.body)
    .startWith({ err: false, streams: [] })

  const getStreamSocket$ = getStream$.map(data => xs.combine(...data.streams.map(
    stream => sources.socketIO.get(stream)
  )).compose(throttle(33))).flatten()

  const vdom$ = getStreamSocket$.map(([...data]) => {
    const streamsDOM = data.map(stream => {
      const base64 = chunkToBase64(stream.chunk)
      const date = new Date(stream.date)
      return div('.card .card-inverse .card-primary', [
        div('.card-block', [
          p('.card-text', `Date: ${date}`),
          img('.col-xs-12', {
            attrs: {
              src: base64
            }
          })
        ])
      ])
    })
    return div('.card-columns', streamsDOM)
  })

  return {
    DOM: vdom$,
    HTTP: camera$
  }
}

export default HomeComponent
