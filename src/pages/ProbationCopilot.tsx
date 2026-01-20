import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, History, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  feedback?: 'positive' | 'negative' | null;
  isProgress?: boolean;
  nodeDetails?: Array<{
    nodeId: string;
    tenant?: string;
    sourceType?: string;
    model?: string;
    status?: string;
  }>;
  awaitingConfirmation?: boolean;
}

interface ChatHistory {
  id: string;
  query: string;
  timestamp: Date;
}

const STORAGE_KEY = 'probation-copilot-history';

const ProbationCopilot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Co-pilot Assistant. I can help you with:\n\n• Node status and details\n• Probation history and reasons\n• CRC and Burning status\n• Test run information\n• Filtering nodes by tenant, generation, age, etc.\n• Submitting nodes for probation testing\n\nHow can I assist you today?',
      timestamp: new Date(),
      feedback: null
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [pendingNodeIds, setPendingNodeIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const history = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setChatHistory(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = (query: string) => {
    try {
      const newEntry: ChatHistory = {
        id: Date.now().toString(),
        query,
        timestamp: new Date()
      };
      const updated = [newEntry, ...chatHistory];
      setChatHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const deleteHistoryItem = (id: string) => {
    try {
      const updated = chatHistory.filter(item => item.id !== id);
      setChatHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error deleting history item:', error);
    }
  };

  const clearAllHistory = () => {
    try {
      setChatHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleHistoryClick = (query: string) => {
    setInput(query);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFeedback = (messageId: string, feedbackType: 'positive' | 'negative') => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          feedback: msg.feedback === feedbackType ? null : feedbackType
        };
      }
      return msg;
    }));
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();

    if (awaitingConfirmation) {
      const isYes = /^(yes|y|confirm|submit|ok|yeah|sure)$/i.test(userQuery);
      const isNo = /^(no|n|cancel|abort|nope)$/i.test(userQuery);

      if (isYes) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: userQuery,
          timestamp: new Date(),
          feedback: null
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        const progressMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Submitting node(s) for probation testing...',
          timestamp: new Date(),
          feedback: null,
          isProgress: true
        };
        setMessages(prev => [...prev, progressMessage]);

        setAwaitingConfirmation(false);
        setIsLoading(true);

        try {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/probation-copilot`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              query: `submit nodes ${pendingNodeIds.join(', ')} for probation`,
              confirmSubmit: true,
              nodeIds: pendingNodeIds
            })
          });

          if (!response.ok) {
            throw new Error('Failed to submit nodes');
          }

          const data = await response.json();

          setMessages(prev => prev.filter(msg => !msg.isProgress));

          const assistantMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
            feedback: null
          };
          setMessages(prev => [...prev, assistantMessage]);
          setPendingNodeIds([]);
        } catch (error) {
          console.error('Error:', error);
          setMessages(prev => prev.filter(msg => !msg.isProgress));
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            role: 'assistant',
            content: 'I encountered an error while submitting the nodes. Please try again later.',
            timestamp: new Date(),
            feedback: null
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsLoading(false);
        }
        return;
      } else if (isNo) {
        const userMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: userQuery,
          timestamp: new Date(),
          feedback: null
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        const cancelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Okay, submission cancelled. Is there anything else I can help you with?',
          timestamp: new Date(),
          feedback: null
        };
        setMessages(prev => [...prev, cancelMessage]);
        setAwaitingConfirmation(false);
        setPendingNodeIds([]);
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuery,
      timestamp: new Date(),
      feedback: null
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    saveChatHistory(userQuery);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/probation-copilot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userQuery })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      if (data.awaitingConfirmation && data.nodeDetails) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          feedback: null,
          awaitingConfirmation: true,
          nodeDetails: data.nodeDetails
        };
        setMessages(prev => [...prev, assistantMessage]);
        setAwaitingConfirmation(true);
        setPendingNodeIds(data.nodeIds || []);
      } else {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          feedback: null
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please make sure the Azure OpenAI and Kusto endpoints are configured correctly.',
        timestamp: new Date(),
        feedback: null
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQueries = [
    'Show me all nodes in probation for tenant SAT4PrdApp13',
    'List M-Series nodes currently in probation',
    'What nodes have been in probation for more than 15 days?',
    'Show me the status of node b88cbc21-611e-5f35-86ad-0c07a051d6fb',
    'Submit node NODE001 for probation testing'
  ];

  const handleSuggestionClick = (query: string) => {
    setInput(query);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Co-pilot Assistant</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              AI-powered insights for node probation status and analytics
            </p>
          </div>
        </div>
      </div>

      {messages.length === 1 && (
        <div className="mb-4">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-[#0078D4] dark:text-[#479EF5] hover:text-[#106EBE] dark:hover:text-[#70B7FF] text-sm font-medium flex items-center gap-1 transition-colors mb-3"
          >
            {showSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Suggested queries
          </button>
          {showSuggestions && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 animate-slide-up">
              {suggestedQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(query)}
                  className="text-left p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Sidebar - Chat History */}
        <div
          className={`transition-all duration-300 ${
            showHistory ? 'w-80' : 'w-12'
          } bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col`}
        >
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            {showHistory && (
              <>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Chat History</span>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </>
            )}
            {!showHistory && (
              <button
                onClick={() => setShowHistory(true)}
                className="w-full flex justify-center p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Show History"
              >
                <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>

          {showHistory && (
            <>
              {chatHistory.length > 0 && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={clearAllHistory}
                    className="w-full text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {chatHistory.length === 0 ? (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-8">
                    No history yet
                  </div>
                ) : (
                  chatHistory.map((item) => (
                    <div
                      key={item.id}
                      className="group relative bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <button
                        onClick={() => handleHistoryClick(item.query)}
                        className="text-left w-full"
                      >
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2 pr-6">
                          {item.query}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.timestamp.toLocaleString()}
                        </p>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteHistoryItem(item.id);
                        }}
                        className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
                        title="Delete"
                      >
                        <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.isProgress && (
                      <div className="mt-3 space-y-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-blue-600 dark:bg-blue-500 rounded-full animate-pulse" style={{width: '100%'}}></div>
                        </div>
                        <p className="text-xs text-center text-gray-600 dark:text-gray-400">Processing your request...</p>
                      </div>
                    )}
                    {message.nodeDetails && message.nodeDetails.length > 0 && (
                      <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Node Details:</p>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {message.nodeDetails.map((node, idx) => (
                            <div key={idx} className="text-xs p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                              <p className="font-medium text-blue-900 dark:text-blue-200">Node ID: {node.nodeId}</p>
                              {node.tenant && <p className="text-gray-700 dark:text-gray-400">Tenant: {node.tenant}</p>}
                              {node.sourceType && <p className="text-gray-700 dark:text-gray-400">Source Type: {node.sourceType}</p>}
                              {node.model && <p className="text-gray-700 dark:text-gray-400">Model: {node.model}</p>}
                              {node.status && <p className="text-gray-700 dark:text-gray-400">Status: {node.status}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.role === 'assistant' && message.id !== '1' && (
                    <div className="flex items-center gap-2 mt-2 ml-2">
                      <button
                        onClick={() => handleFeedback(message.id, 'positive')}
                        className={`p-1 rounded transition-colors ${
                          message.feedback === 'positive'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'negative')}
                        className={`p-1 rounded transition-colors ${
                          message.feedback === 'negative'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-3">
                  <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about node status, probation details, test results..."
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProbationCopilot;
