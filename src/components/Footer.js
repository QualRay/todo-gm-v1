import React from 'react'
import { Heart } from 'lucide-react'

const CURR_YEAR = new Date().getFullYear();

export default function Footer() {

  return (
    <div>
      <div className='fixed bottom-0 left-0 w-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white flex justify-center items-center text-center p-4 shadow-lg'>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tansenberg LLC {CURR_YEAR} &copy;</span>
          <Heart className="h-4 w-4 text-red-400" />
        </div>
      </div>
    </div>
  )
}
