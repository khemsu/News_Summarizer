import React from 'react'
import { Link } from 'react-router-dom'

const NavBar = () => {
  return (
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f1f2f4] px-10 py-3 bg-white font-['Noto_Sans']" style={{color: '#000000'}}>
          <div className="flex items-center gap-4">
            <div className="size-4 text-black" style={{color: '#000000'}}>
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_330)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor"></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"></rect></clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-black font-bold text-lg leading-tight tracking-[-0.015em]" style={{color: '#000000'}}>News Summarizer</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <Link className="text-black font-medium text-sm leading-normal hover:text-gray-600 transition-colors" style={{color: '#000000'}} to="/">Home</Link>
              <Link className="text-black font-medium text-sm leading-normal hover:text-gray-600 transition-colors" style={{color: '#000000'}} to="/about">About</Link>
              <Link className="text-black font-medium text-sm leading-normal hover:text-gray-600 transition-colors" style={{color: '#000000'}} to="/contact">Contact</Link>
            </div>
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#d2e2f3] text-black font-bold text-sm leading-normal tracking-[0.015em] hover:bg-[#c1d7f0] transition-colors">
              <span className="truncate" style={{color: '#000000'}}>Sign Up</span>
            </button>
          </div>
      </header>
  )
}

export default NavBar