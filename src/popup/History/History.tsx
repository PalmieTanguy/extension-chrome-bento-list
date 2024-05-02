import React, { useState, useEffect } from 'react'
import browser from 'webextension-polyfill'
import './History.css'

function HistoryComponent() {
  const [historyItems, setHistoryItems] = useState<string[]>([])

  useEffect(() => {
    async function fetchHistory() {
      const history = await browser.history.search({
        text: 'https://bentomanga.com/manga/',
        startTime: 0,
        maxResults: 1000,
      })
      setHistoryItems(history.map((item: any) => item.url))
    }
    fetchHistory()
  }, [])

  const copyToClipboard = async (data: string) => {
    try {
      await navigator.clipboard.writeText(data)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const filteredHistory = historyItems
    .filter((item) => item && !item.includes('_list') && !item.includes('no_scope'))
    .map((item) => {
      if (item) {
        const urlParts = item.split('?')[0].split('bentomanga.com/manga/')
        const url = urlParts[1]
        if (url) {
          return url.replace(/-/g, ' ')
        }
      }
    })

  let cacheArray: string[] = []

  filteredHistory.forEach((link) => {
    if (link) {
      const parts = link.split('/chapter/')
      const linkParts: string = parts[0]
      const numChapter = parts[1] || '0'

      const linkFull =
        numChapter == '0' ? linkParts : linkParts + ' | chapter ' + numChapter

      if (cacheArray.some((item) => item.includes(linkParts))) {
        const index = cacheArray.findIndex((item) => item.includes(linkParts))
        if (
          link.includes('chapter') &&
          parseInt(numChapter) > parseInt(cacheArray[index].split(' | ')[1])
        ) {
          cacheArray[index] = linkFull
        }
      } else {
        cacheArray.push(linkFull)
      }
    }
  })

  return (
    <div className="container">
      <h2 className="title">Historique de Bentomanga</h2>
      {cacheArray.length > 0 ? (
        <>
          <button
            className="button"
            onClick={() => copyToClipboard(cacheArray.join('\n'))}
          >
            Copier dans le presse-papiers
          </button>
          <div>
            {cacheArray.map((url, index) => (
              <div className="item" key={index}>
                <p>{url}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>L'historique est vide.</p>
      )}
    </div>
  )
}

export default HistoryComponent
