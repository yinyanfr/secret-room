import React, { useState, useEffect, useRef } from 'react'
import { Gluejar } from '@charliewilco/gluejar'
import { blobToBase64String } from "blob-util"
import io from "socket.io-client"
import request from "superagent"

import Image from "./Image"

import "bulma/bulma.sass"
import './App.scss'

const socket = io()

const Main = ({ progress }) => {
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
                    <p>
                      {
                        e.type === "text"
                          ? <span>{e.msg}</span>
                          : ""
                      }
                      {
                        e.type === "image"
                          ? <Image src={e.msg} />
                          : ""
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))
          }
        </div>

        <div>
          <progress
            className="progress is-primary"
            value={progress}
            max={100}
          >
            {progress}%
      </progress>
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
                    socket.emit("send", {
                      type: "text", msg
                    })
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

const Paste = ({ sendImage }) => {

  return (
    <Gluejar
      onPaste={(files) => {
        let blobUrl = files.images[files.images.length - 1]

        if (blobUrl) {
          sendImage(blobUrl)
        }

      }}
      onError={err => console.error(err)}
    >

    </Gluejar>
  )
}

const App = () => {

  const [progress, setProgress] = useState(0)

  const sendImage = (blobUrl) => {
    
    return fetch(blobUrl)
      .then(res => res.blob())
      .then(blob => {
        return blobToBase64String(blob)
      })
      .then(src => {
        console.log("why do you rerender")
        return request.post("/img")
          .send({
            msg: {
              type: "image",
              msg: src
            }
          })
          // .on("progress", e => {
          //   setProgress(parseInt(e.percent))
          // })
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <div>
      <Main progress={progress} />
      <Paste sendImage={sendImage} />
    </div>
  )
}

export default App;
