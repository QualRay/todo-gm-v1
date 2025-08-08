import React from 'react'
import { Target } from 'lucide-react'

export default function Header() {
    return (
        <div className='bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white flex justify-center items-center text-center p-8 shadow-lg'>
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                    <Target className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold">ToDo List</h1>
            </div>
        </div>
    )
}
