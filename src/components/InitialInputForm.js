"use client"
import React, { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, CheckCircle2, Circle, Loader2, Sparkles, Target, Zap } from 'lucide-react'

export default function InitialInputForm() {
    const [title, setTitle] = useState("")
    const [desc, setDesc] = useState("")
    const [displayTask, setDisplayTask] = useState([])
    const [selectedTasks, setSelectedTasks] = useState([])
    const [isPending, startTransition] = useTransition()

    const toggleCheckbox = (index) => {
        startTransition(() => {
            if (selectedTasks.includes(index)) {
                setSelectedTasks(selectedTasks.filter(item => item !== index))
            } else {
                setSelectedTasks([...selectedTasks, index])
            }
        })
    }

    const submitHandler = (e) => {
        e.preventDefault()
        
        if (!title.trim()) {
            return
        }

        startTransition(() => {
            setDisplayTask([...displayTask, { 
                title: title.trim(), 
                desc: desc.trim() || "No description provided",
                id: Date.now(),
                createdAt: new Date().toISOString()
            }])
            setTitle("")
            setDesc("")
        })
    }

    const deleteHandler = (index) => {
        startTransition(() => {
            const copyTask = [...displayTask]
            copyTask.splice(index, 1)
            setDisplayTask(copyTask)
            // Remove from selected tasks if it was selected
            setSelectedTasks(selectedTasks.filter(item => item !== index))
        })
    }

    const clearCompleted = () => {
        startTransition(() => {
            const incompleteTasks = displayTask.filter((_, index) => !selectedTasks.includes(index))
            setDisplayTask(incompleteTasks)
            setSelectedTasks([])
        })
    }

    const completedCount = selectedTasks.length
    const totalCount = displayTask.length

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
            <div className="max-w-6xl mx-auto space-y-8 pt-8">
                {/* Form Card */}
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Sparkles className="h-6 w-6 text-white" />
                                </div>
                                Create New Task
                            </CardTitle>
                            <CardDescription className="text-blue-100 text-base">
                                Transform your ideas into actionable tasks
                            </CardDescription>
                        </CardHeader>
                    </div>
                    <CardContent className="p-8">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Task Title <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        placeholder="What needs to be done?"
                                        maxLength={40}
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="h-14 text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 rounded-xl transition-all duration-300"
                                        required
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-xs text-gray-500">
                                            {title.length}/40 characters
                                        </p>
                                        {!title.trim() && (
                                            <span className="text-xs text-red-500 font-medium">Required field</span>
                                        )}
                                    </div>
                                </div>
                                <div className="sm:col-span-1">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Description <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <Input
                                        placeholder="Add more details..."
                                        maxLength={80}
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        className="h-14 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-300"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        {desc.length}/80 characters
                                    </p>
                                </div>
                                <div className="sm:col-span-1 flex items-center">
                                    <Button 
                                        type="submit" 
                                        className="w-full h-14 text-base font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl border-0"
                                        disabled={isPending || !title.trim()}
                                    >
                                        {isPending ? (
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        ) : (
                                            <Zap className="h-5 w-5 mr-2" />
                                        )}
                                        Create Task
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Tasks List Card */}
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6">
                        <CardHeader className="pb-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-xl">
                                            <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                        </div>
                                        Your Tasks
                                    </CardTitle>
                                    <CardDescription className="text-blue-100 text-sm sm:text-base">
                                        {totalCount === 0 
                                            ? "No tasks yet. Create your first task above!"
                                            : `${completedCount} of ${totalCount} tasks completed`
                                        }
                                    </CardDescription>
                                </div>
                                {completedCount > 0 && (
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={clearCompleted}
                                        className="bg-white/20 text-white border-white/30 hover:bg-white/30 hover:border-white/50 transition-all duration-300 w-full sm:w-auto"
                                    >
                                        Clear Completed
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                    </div>
                    <CardContent className="p-4 sm:p-8">
                        {displayTask.length === 0 ? (
                            <div className="text-center py-12 sm:py-16">
                                <div className="p-4 sm:p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                                    <Circle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 sm:mb-3">
                                    No Tasks Available
                                </h3>
                                <p className="text-gray-500 max-w-md mx-auto text-sm sm:text-base">
                                    Start by adding a task using the beautiful form above. Let's get organized!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3 sm:space-y-4">
                                {displayTask.map((task, index) => {
                                    const isChecked = selectedTasks.includes(index)
                                    
                                    return (
                                        <div
                                            key={task.id || index}
                                            className={`group flex items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
                                                isChecked 
                                                    ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 shadow-md' 
                                                    : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-xl'
                                            }`}
                                        >
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() => toggleCheckbox(index)}
                                                className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
                                            />
                                            
                                            <div className="flex-1 min-w-0">
                                                <h5 className={`text-base sm:text-lg font-semibold text-gray-900 transition-all duration-300 ${
                                                    isChecked ? 'line-through text-gray-500' : ''
                                                }`}>
                                                    {task.title}
                                                </h5>
                                                <p className={`text-gray-600 mt-1 sm:mt-2 transition-all duration-300 text-sm sm:text-base ${
                                                    isChecked ? 'line-through text-gray-400' : ''
                                                }`}>
                                                    {task.desc}
                                                </p>
                                                {task.createdAt && (
                                                    <div className="flex items-center gap-2 mt-2 sm:mt-3">
                                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                                                        <p className="text-xs text-gray-400">
                                                            Created {new Date(task.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteHandler(index)}
                                                className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-red-600 hover:text-red-700 hover:bg-red-50 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0"
                                            >
                                                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
