import React from 'react'

const CURR_YEAR = new Date().getFullYear();

export default function Footer() {

  return (
    <div>
      <div className='fixed bottom-0 left-0 w-full bg-black text-white flex justify-center text-center p-4 text-xl'>
        Tansenberg LLC {CURR_YEAR} &copy;
      </div>
    </div>
  )
}
