import React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import d from '../../utils/API/DOM'

const Title = ({ value, desc, un }) => {
  // for removing app default description in the topHeader.hbs
  // to avoid two meta tags for description
  new d('meta[data-desc-src="hbs"]').remove()

  return (
    <Helmet>
      <title>
        {un ? `(${un})` : ''} {`${value}`} • Not Existing
      </title>
      <meta name="description" content={desc} />
    </Helmet>
  )
}

Title.defaultProps = {
  value: '',
  desc:
    "Share AI generated picture and inspire the world!!",
}

Title.propTypes = {
  value: PropTypes.string.isRequired,
  desc: PropTypes.string,
}

const mapStateToProps = state => ({
  un: state.Notification.unreadNotifications,
})

export default connect(mapStateToProps)(Title)
