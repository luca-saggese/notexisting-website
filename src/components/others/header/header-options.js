import React from 'react'
import PropTypes from 'prop-types'
import AppLink from '../link/link'

const HeaderOptions = ({ toggleOptions }) => {
  let clicked = () => toggleOptions()
let dark = () => {
    var style = document.createElement('link')
    style.href = '/styles/dark.css'
    style.rel = 'stylesheet'
    document.head.appendChild(style)
  }

  return (
    <div className="sp_options options">
      <ul className="o_ul">
        <li className="o_li" onClick={clicked}>
          <AppLink
            url="/settings"
            className="o_a"
            alt="Settings"
            label="Settings"
          />
        </li>
        <li className="o_li" onClick={clicked}>
          <AppLink
            url="/edit-profile"
            className="o_a"
            alt="Edit"
            label="Edit"
          />
        </li>
        <li className="o_li" onClick={dark}>
          <a className="o_a" alt="Dark">
            Dark mode
          </a>
        </li>
        <li className="o_li">
          <a href="/help" className="o_a" alt="Help">
            Help
          </a>
        </li>
        <li className="o_li">
          <a href="/about">About</a>
        </li>
        <li className="o_li o_divider">
          <hr className="menu_divider" />
        </li>
        <li className="o_li">
          <a href="/logout" className="o_a" alt="Settings">
            Logout
          </a>
        </li>
      </ul>
    </div>
  )
}

HeaderOptions.propTypes = {
  toggleOptions: PropTypes.func.isRequired,
}

export default HeaderOptions
