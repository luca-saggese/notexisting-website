import React, { Fragment } from 'react'
import { string, func } from 'prop-types'

const Status = ({ rating, text, ...props }) => {
  if (text.length > 0 && !rating) {
    var sweet = 'Awwww that nice 😍'
  } else {
    var sweet = 'Post something sweet'
  }
  return (
    <Fragment>
      <p className='pl-1'>
      {(rating.length > 0) ? (
        <div>
          That is {rating} and that's not very wholesome 😭
        </div>
      ) : (
        <div>
          {sweet}
        </div>
      )}
      </p>
    </Fragment>
  )
}

Status.propTypes = {
  rating: string.isRequired,
  text: string.isRequired,
}

export default Status