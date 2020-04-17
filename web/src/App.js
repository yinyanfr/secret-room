import React, { useState, useEffect, useRef, useContext } from 'react'
import { Gluejar } from '@charliewilco/gluejar'
import { blobToBase64String } from "blob-util"
import io from "socket.io-client"
import isBase64 from "is-base64"

import Image from "./Image"

import "bulma/bulma.sass"
import './App.scss'

const socket = io()

const send = (msg) => {
  socket.emit("send", msg)
}


const Main = () => {
  const [msg, setMsg] = useState("")
  const [msgList, setMsgList] = useState([])

  const talks = useRef(null)
  const userInput = useRef(null)



  useEffect(() => {
    userInput.current.focus()
    
    socket.on("receive", msg => {
      setMsgList(msgList => ([...msgList, msg]))
      talks.current.scrollTop = talks.current.scrollHeight
    })
  }, [])

  return (
    <div>
      <div className="mainframe">
        <div className="talks" ref={talks}>
          {
            msgList.map((e, i) => (
              <div className="card" key={i}>
                <div className="card-content">
                  <div className="content">
                    <p>{
                      isBase64(e)
                      ? (
                        <Image src={e} />
                      )
                      : (
                        <span>{e}</span>
                      )
                    }</p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <div className="typeinput">
          <div className="field">
            <div className="control">
              <input
                type="text"
                ref={userInput}
                className="input"
                placeholder="message"
                value={msg}
                onChange={(e) => {
                  setMsg(e.target.value)
                }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    send(msg)
                    setMsg("")
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const App = () => {

  return (
    <div>
      <Main />
      <Gluejar
        onPaste={(files) => {
          let blobUrl = files.images[files.images.length - 1]

          fetch(blobUrl)
            .then(res => res.blob())
            .then(blob => {
              return blobToBase64String(blob)
            })
            .then(src => {
              send(src)
            })
            .catch(err => {
              console.log(err)
            })

        }}
        onError={err => console.error(err)}
      >

      </Gluejar>
    </div>
  )
}

export default App;
