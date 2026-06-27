import React from 'react'
import { useDarkMode } from '../context/DarkModeContext'

const Header = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <header className="app-header">
      <div className="header-content">
        <div></div>
        <button
          className="btn-theme-toggle"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? (
            <i className="bi bi-sun-fill"></i>
          ) : (
            <i className="bi bi-moon-fill"></i>
          )}
        </button>
      </div>
    </header>
  )
}

export default Header
