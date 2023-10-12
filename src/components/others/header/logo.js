import React from 'react'
import AppLink from '../link/link'

const HeaderLogo = () => (
  <div className="logo">
    <AppLink url="/">
      <img src="/images/logo.png" alt="Not Existing" />
    </AppLink>
  </div>
)

export default HeaderLogo
