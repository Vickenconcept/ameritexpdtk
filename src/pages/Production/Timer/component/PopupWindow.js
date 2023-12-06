import {useEffect, useState, useRef} from 'react' 
import { createPortal } from "react-dom"
import { BACKEND } from "./helpers/axiosConfig"

export const PopupWindow = props => {
  const { links } = props
  const [container, setContainer] = useState(null)
  const [shouldUpdate, setShouldUpdate] = useState(0)
  const newWindow = useRef(window)
  const linkcss = () => {
    for (var i = 0; i < links.length; i++) {
      var fileref = document.createElement("link")
      fileref.setAttribute("rel", "stylesheet")
      fileref.setAttribute("type", "text/css")
      fileref.setAttribute("href", links[i].startsWith('http')?links[i]:BACKEND + links[i])
      newWindow.current.document.head.appendChild(fileref)
    }
  }

  useEffect(() => {
    const div = document.createElement("div")
    setContainer(div)
  }, [])

  useEffect(() => {
    if (container && newWindow.current) {
      if (newWindow.current) {
        const width = window.screen.availWidth;
        const height = window.screen.availHeight;
        newWindow.current = window.open(
          "",
          "",
          `toolbar=no,menubar=no,scrollbars=no, resizable=no,location=no, status=no, titlebar=no, fullscreen=yes, alwaysOnTop=yes`
        )
        newWindow.current.document.body.appendChild(container)

        newWindow.current.addEventListener("beforeunload", () => {
          props.onClose()
        })
        newWindow.current.addEventListener("resize", () => {
          props.onResize(
            newWindow.current.innerWidth,
            newWindow.current.innerHeight
          )
        })
        const curWindow = newWindow.current
        linkcss()
        console.log (links)
        return () => curWindow.close()
      }
    }
  }, [container])

  return (
    container &&
    createPortal(
      <>
        <title>{props.title}</title>
        {props.children}
      </>,
      container
    )
  )
}

export default PopupWindow
