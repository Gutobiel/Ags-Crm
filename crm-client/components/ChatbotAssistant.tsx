"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiChevronUp, FiX, FiSend, FiUser } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useProfile } from '@/contexts/ProfileContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const PHRASES = [
  "Quantos contratos fechei esse mês?",
  "Quais leads estão sem documentação?",
  "Qual o funil com mais oportunidades?",
  "Me mostre as tarefas de hoje.",
  "Quais negociações estão paradas há mais tempo?",
  "Qual foi meu faturamento este mês?",
  "Quais contratos vencem nos próximos 7 dias?"
];

export default function ChatbotAssistant() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { fotoPerfil } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleState, setBubbleState] = useState<'HIDDEN' | 'APPEARING' | 'TYPING' | 'WAITING' | 'HIDING'>('HIDDEN');
  const [currentPhrase, setCurrentPhrase] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  
  const [messages, setMessages] = useState<{ id: string; sender: 'bot' | 'user'; text: string }[]>([
    { id: '1', sender: 'bot', text: 'Olá! Como posso ajudar você hoje?' }
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cycleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
    if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
  };

  const startTyping = (phrase: string) => {
    let i = 0;
    setDisplayedText("");
    setBubbleState('TYPING');
    
    const typeNextChar = () => {
      if (i < phrase.length) {
        setDisplayedText(phrase.slice(0, i + 1));
        i++;
        typingTimerRef.current = setTimeout(typeNextChar, 40);
      } else {
        setBubbleState('WAITING');
        displayTimerRef.current = setTimeout(() => {
          setBubbleState('HIDING');
          setTimeout(() => {
            setBubbleState('HIDDEN');
            scheduleNextCycle();
          }, 500); // 500ms for fade out
        }, 6000 + Math.random() * 2000); // 6 to 8 seconds
      }
    };
    
    typingTimerRef.current = setTimeout(typeNextChar, 600); // wait 600ms for bounce animation
  };

  const scheduleNextCycle = () => {
    clearAllTimers();
    const nextWait = 5000 + Math.random() * 10000;
    cycleTimerRef.current = setTimeout(() => {
      if (!isOpen) {
        const randomPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)];
        setCurrentPhrase(randomPhrase);
        setBubbleState('APPEARING');
        startTyping(randomPhrase);
      } else {
        scheduleNextCycle();
      }
    }, nextWait);
  };

  useEffect(() => {
    scheduleNextCycle();
    return clearAllTimers;
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (pathname === '/login') {
    return null;
  }

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Opening chat
      setBubbleState('HIDING');
      setTimeout(() => setBubbleState('HIDDEN'), 300);
      clearAllTimers();
    } else {
      // Closing chat
      scheduleNextCycle();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const currentInput = inputValue;
    const newUserMsg = { id: Date.now().toString(), sender: 'user' as const, text: currentInput };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");

    const tempId = (Date.now() + 1).toString();
    const newMessages = [...messages, newUserMsg];
    setMessages([...newMessages, { id: tempId, sender: 'bot', text: 'Pensando...' }]);

    try {
      const history = messages.filter(m => m.id !== '1').map(m => ({ role: m.sender, content: m.text }));
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.accessToken}`
        },
        body: JSON.stringify({ message: currentInput, history })
      });
      
      const data = await response.json();
      
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, text: data.reply } : msg
      ));
      
    } catch (error) {
      console.error('Erro no chatbot:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, text: 'Desculpe, ocorreu um erro ao se conectar com meus servidores neurais.' } : msg
      ));
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Floating Phrase Bubble */}
      {!isOpen && bubbleState !== 'HIDDEN' && (
        <div className={`
          mb-4 relative bg-white rounded-2xl shadow-lg border border-gray-100 p-4 max-w-sm
          ${bubbleState === 'APPEARING' ? 'animate-bounce-horizontal' : ''}
          transition-opacity duration-500 ${bubbleState === 'HIDING' ? 'opacity-0' : 'opacity-100'}
        `}
        style={{ minWidth: '220px' }}>
          <p className="text-blue-950 font-sans text-sm font-bold mb-1">
            Posso te ajudar com:
          </p>
          <p className="text-blue-900 font-sans text-sm min-h-[20px]">
            {displayedText ? `"${displayedText}"` : "\u00A0"}
          </p>
          
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative bg-white rounded-full overflow-hidden flex items-center justify-center p-1">
                <Image src="/chatbot-ia-nobg.png" alt="Bot" fill className="object-contain" />
              </div>
              <div>
                <h3 className="font-bold">IA Assistente</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <button onClick={handleToggle} className="text-white hover:bg-white/20 p-2 rounded-full transition">
              <FiX className="text-xl" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'bot' ? (
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-gray-100 flex-shrink-0 relative overflow-hidden flex items-center justify-center p-0.5">
                    <Image src="/chatbot-ia-nobg.png" alt="Bot" fill className="object-contain" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex-shrink-0 flex items-center justify-center overflow-hidden font-bold text-xs border border-gray-200">
                    {fotoPerfil ? (
                      <img src={fotoPerfil} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      session?.user?.name?.substring(0, 2).toUpperCase() || <FiUser />
                    )}
                  </div>
                )}
                
                <div className={`p-3 rounded-2xl max-w-[85%] text-sm overflow-hidden ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'}`}>
                  {msg.sender === 'user' ? (
                    msg.text
                  ) : (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800 break-words">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input 
                type="text" 
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Digite sua mensagem..." 
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toggle Button (only show if not open) */}
      {!isOpen && (
        <div 
          onClick={handleToggle}
          className="cursor-pointer flex items-center justify-center transition-all duration-300 w-14 h-14 sm:w-16 sm:h-16 relative"
        >
          <div className="relative w-full h-full group flex items-center justify-center">
            <Image 
              src="/chatbot-ia-nobg.png" 
              alt="Assistente de Chat" 
              fill
              sizes="(max-width: 640px) 56px, 64px"
              className="object-contain z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.6)] drop-shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
}
