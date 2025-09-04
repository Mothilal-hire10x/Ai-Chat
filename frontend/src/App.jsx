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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto max-w-4xl p-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center mb-4">AI Chat - Kali OS Learning Assistant</h1>
          
          {/* System Prompt Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              System Prompt (Set context for AI - e.g., "Teach me hacking commands for Kali OS")
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system prompt to set context for the AI..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>
        </div>

        {/* Chat Messages */}
        <div className="bg-gray-800 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-20">
              <p>Start a conversation! This AI is specialized for learning Kali OS and hacking commands.</p>
              <p className="text-sm mt-2">Set a system prompt above to give context to the AI.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-3xl p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-100'
                }`}>
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  {message.role === 'assistant' && (
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="mt-2 text-xs text-gray-400 hover:text-white"
                    >
                      📋 Copy
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-left mb-4">
              <div className="inline-block max-w-3xl p-3 rounded-lg bg-gray-700 text-gray-100">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about Kali OS commands, hacking techniques, or any cybersecurity topic..."
            className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            <button
              onClick={resetChat}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
