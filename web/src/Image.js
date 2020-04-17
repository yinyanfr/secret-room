import React from 'react'

const Image = ({src}) => {

    return (
        <img
          alt="image"
          src={`data:image/png;base64, ${src}`}
        />
    )
}

export default Image
