"use client"
import React, { useState } from 'react'

export default function InitialInputForm() {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [displayTask, setDisplayTask] = useState([]);
    const [selectedTasks, setSelectedTasks] = useState([]);

    const toggleCheckbox = (index) => {
        if (selectedTasks.includes(index)) {
            setSelectedTasks(selectedTasks.filter(item => item !== index));
        } else {
            setSelectedTasks([...selectedTasks, index]);
        }
    };

    const submitHandler = (e) => {
        e.preventDefault();

        setDisplayTask([...displayTask, { title, desc }]);

        setTitle("");
        setDesc("");
    }

    const deleteHandler = (i) => {
        let copyTask = [...displayTask]
        copyTask.splice(i, 1)
        setDisplayTask(copyTask)

    }

    let renderTask = <h2>No Task Available</h2>

    if (displayTask.length > 0) {
        renderTask = displayTask.map((t, i) => {
            const isChecked = selectedTasks.includes(i);
            const titleStyle = isChecked ? { textDecoration: 'line-through' } : {};
            const descStyle = isChecked ? { textDecoration: 'line-through' } : {};


            return (
                <li key={i} className="flex items-center justify-between mb-5">
                    <div className="flex items-center justify-between mb-5 w-2/3">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCheckbox(i)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <h5 className=" text-sky-400"
                            style={{ width: '25%', ...titleStyle }} >{t.title}</h5>
                        <h6 className=" text-sky-400 text-left"
                            style={{ width: '60%', ...descStyle }}>{t.desc}</h6>
                    </div>
                    <button
                        onClick={() => {
                            deleteHandler(i)
                        }}
                        className="bg-red-600 px-3 py-2 text-white rounded"> Delete </button>
                </li>
            );
        });

    }

    return (
        <>

            <form onSubmit={submitHandler}>
                <div className='flex justify-between mb-5'>
                    <input
                        className='space-x-2 rounded-full bg-gray-100 p-3 ml-5 mt-10 mb-3 text-sky-400 border-4'
                        placeholder='Enter Task Title'
                        maxLength={40}
                        style={{ width: '25%' }}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value)
                        }}
                    />

                    <input
                        className='space-x-2 rounded-full bg-gray-100 p-3 ml-5 mt-10 mb-3 text-sky-400 border-4'
                        placeholder='Enter Task Description'
                        maxLength={80}
                        style={{ width: '64%' }}
                        value={desc}
                        onChange={(e) => {
                            setDesc(e.target.value)
                        }}
                    />

                    <button className='space-x-2 rounded-full bg-blue-400 p-3 mr-6 mt-10 mb-3 border-4'>Add</button>
                </div>
            </form>

            <div className='p-8 bg-slate-100'>
                <ul>
                    {renderTask}
                </ul>
            </div>
        </>
    )
}
