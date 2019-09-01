import React, { Fragment } from 'react'
import { string, func } from 'prop-types'

const Status = ({ rating, text, imageSafe, ...props }) => {
  if (!imageSafe) {
    if (text.length > 0 && !rating) {
      var sweet = 'Awwww that nice 😍'
    } else {
      var sweet = 'Post something sweet'
    }
    return (
      <Fragment>
        <p className="pl-1">
          {rating.length > 0 ? (
            <span>That is {rating} and that's not very wholesome 😭</span>
          ) : (
            <span>{sweet}</span>
          )}
        </p>
      </Fragment>
    )
  } else {
    if (imageSafe === true) {
      return (
        <Fragment>
          <p className="pl-1">
            <span>Checking if image is safe</span>
          </p>
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          <p className="pl-1">
            <span>That image has {imageSafe}. Post something else</span>
          </p>
        </Fragment>
      )
    }
  }
}

export default Status
