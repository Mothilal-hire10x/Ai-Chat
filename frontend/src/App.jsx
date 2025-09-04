import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: sessionId,
          system_prompt: systemPrompt
        })
      })

      if (response.ok) {
        setIsTyping(false)
        const aiMessage = await response.json()
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Error:', error)
      setIsTyping(false)
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const resetChat = async () => {
    try {
      await fetch(`http://localhost:8000/api/chat/${sessionId}/reset`, {
        method: 'POST'
      })
      setMessages([])
    } catch (error) {
      console.error('Error resetting chat:', error)
    }
  }

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent mb-2 animate-gradient">
              🤖 AI Chat
            </h1>
            <p className="text-xl text-gray-300 font-medium animate-fade-in">Kali OS Learning Assistant</p>
          </div>
          
          {/* System Prompt Input */}
          <div className="mt-8 mb-4">
            <label className="block text-sm font-medium mb-3 text-gray-200">
              💡 System Prompt (Set context for AI - e.g., "Teach me hacking commands for Kali OS")
            </label>
            <div className="relative group">
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Enter system prompt to set context for the AI..."
                className="w-full p-4 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-xl resize-none 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-gray-800/90 focus-ring"
                rows="3"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none group-hover:from-blue-500/15 group-hover:to-purple-500/15 transition-all duration-300"></div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-gray-800/60 backdrop-blur-lg border border-gray-600 rounded-2xl p-6 mb-6 h-96 overflow-y-auto shadow-2xl">
          {messages.length === 0 ? (
            <div className="text-center text-gray-300 mt-20 animate-fade-in">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-lg mb-2">Start a conversation! This AI is specialized for learning Kali OS and hacking commands.</p>
              <p className="text-sm text-gray-400">Set a system prompt above to give context to the AI.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id} 
                   className={`mb-4 ${message.role === 'user' ? 'animate-slide-in-right text-right' : 'animate-slide-in text-left'}`}
                   style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`inline-block max-w-3xl p-4 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 btn-hover-lift ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="mt-3 px-3 py-1 text-xs text-gray-300 hover:text-white bg-gray-600/50 rounded-lg 
                               hover:bg-gray-600 transition-all duration-200 btn-hover-lift focus-ring"
                    >
                      📋 Copy
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-left mb-4 animate-slide-in">
              <div className="inline-block max-w-3xl p-4 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 text-gray-100 shadow-lg">
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-400 border-t-blue-400"></div>
                    <div className="absolute inset-0 rounded-full h-6 w-6 border-2 border-transparent border-t-purple-400 animate-ping"></div>
                  </div>
                  <span className="animate-pulse">
                    {isTyping ? (
                      <span className="typing-dots">
                        AI is typing<span>.</span><span>.</span><span>.</span>
                      </span>
                    ) : (
                      'AI is thinking...'
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-4">
          <div className="flex-1 relative group">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about Kali OS commands, hacking techniques, or any cybersecurity topic..."
              className="w-full p-4 bg-gray-800/80 backdrop-blur-sm border border-gray-600 rounded-xl resize-none 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       transition-all duration-300 shadow-lg hover:shadow-xl hover:bg-gray-800/90 focus-ring"
              rows="2"
              disabled={isLoading}
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl 
                       hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed 
                       btn-hover-lift focus-ring transition-all duration-200 hover:shadow-lg"
            >
              🚀 Send
            </button>
            <button
              onClick={resetChat}
              className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl 
                       hover:from-red-700 hover:to-red-800 btn-hover-lift focus-ring 
                       transition-all duration-200 hover:shadow-lg"
            >
              🔄 Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
