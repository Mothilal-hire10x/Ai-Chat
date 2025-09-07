import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [isLoading, setIsLoading] = useState(false)
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
        const aiMessage = await response.json()
        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Error:', error)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-30 animate-gradient-xy"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float animation-delay-4000"></div>
      
      <div className="relative z-10 container mx-auto max-w-6xl p-6">
        {/* Header Section */}
        <div className="mb-8 animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 animate-gradient-x">
              AI Chat Assistant
            </h1>
            <p className="text-xl text-gray-300 font-light">
              Your Professional Kali OS Learning Companion
            </p>
          </div>
          
          {/* System Prompt Panel */}
          <div className="glass-panel rounded-2xl p-6 mb-6 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
            <label className="block text-lg font-semibold mb-3 text-gray-200">
              🎯 System Prompt Configuration
            </label>
            <div className="relative">
              <textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="Define your AI assistant's expertise and behavior context..."
                className="w-full p-4 glass-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-400 transition-all duration-300"
                rows="3"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {systemPrompt.length}/500
              </div>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="glass-panel rounded-2xl p-6 mb-6 h-[500px] flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
          {/* Chat Header */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 font-medium">Live Chat Session</span>
            </div>
            <button
              onClick={resetChat}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              🔄 Reset
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4 animate-fade-in">
                  <div className="text-6xl animate-float">🤖</div>
                  <h3 className="text-2xl font-semibold text-gray-200">Welcome to AI Chat</h3>
                  <p className="text-gray-400 max-w-md">
                    Start your conversation with our specialized Kali OS and cybersecurity AI assistant.
                  </p>
                  <div className="flex justify-center space-x-4 text-sm text-gray-500">
                    <span>💡 Tips</span>
                    <span>🔐 Security</span>
                    <span>⚡ Commands</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={message.id} 
                    className={`animate-slide-up ${message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : 'order-0'}`}>
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
                          : 'glass-dark text-gray-100 shadow-lg'
                      } transition-all duration-300 hover:shadow-xl transform hover:scale-[1.02]`}>
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                        
                        {/* Message Actions */}
                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
                          <span className="text-xs opacity-70">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => copyMessage(message.content)}
                              className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              📋 Copy
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Loading Animation */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="max-w-[80%]">
                  <div className="glass-dark p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-300">AI is processing your request...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Section */}
        <div className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20">
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message about Kali OS, cybersecurity, or any technical question..."
                className="w-full p-4 glass-input rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-gray-400 transition-all duration-300"
                rows="3"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col justify-center">
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-green-500/25"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <span>🚀</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
          
          {/* Input Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>💬 Press Enter to send</span>
              <span>⇧ + Enter for new line</span>
            </div>
            <div className="text-sm text-gray-400">
              {inputMessage.length}/1000 characters
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Powered by <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">Advanced AI Technology</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
