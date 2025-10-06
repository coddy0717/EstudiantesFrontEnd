// components/ChatbotPage.tsx - DISEÑO MEJORADO DEL INDICADOR "EN LÍNEA"
'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '@/hooks/useChatbot';
import { useAuthToken } from '@/hooks/useAuthToken';
import { Send, User, Bot, BookOpen, GraduationCap, MapPin, BarChart3, Image as ImageIcon, Mic, XCircle, Sparkles, TrendingUp, CheckCircle2, Wifi } from 'lucide-react';
import { MessageRenderer } from '../components/MessageRenderer/MessageRenderer';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  audioUrl?: string;
}

export default function ChatbotPage() {
  const { sendMessage, isLoading } = useChatbot();
  const userContext = useAuthToken();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Definir quickActions aquí
  const quickActions = [
    { label: "Mis Calificaciones", prompt: "¿Cuáles son mis calificaciones?", icon: BarChart3, color: "from-violet-500 to-purple-600" },
    { label: "Mis Materias", prompt: "¿En qué materias estoy inscrito?", icon: BookOpen, color: "from-blue-500 to-cyan-600" },
    { label: "Plan de Mejora", prompt: "Ayúdame a mejorar mis notas", icon: Sparkles, color: "from-amber-500 to-orange-600" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: userContext.isLoggedIn 
          ? `¡Hola${userContext.nombre ? ` ${userContext.nombre}` : ''}! 👋 Soy EduBot, tu asistente educativo inteligente. Puedo ayudarte con:\n\n• 📊 Consultar tus calificaciones\n• 📖 Ver tus materias inscritas\n• 🏫 Información de aulas\n• 🎓 Orientación académica\n• 🎯 Planes de mejora personalizados\n\n¿En qué puedo ayudarte hoy?`
          : '¡Hola! 👋 Soy EduBot, tu asistente educativo inteligente. Inicia sesión para acceder a tus calificaciones y obtener asesoramiento académico personalizado.',
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [userContext.isLoggedIn, userContext.nombre, messages.length]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setSelectedAudio(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        setSelectedAudio(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearAttachments = () => {
    setSelectedImage(null);
    setSelectedAudio(null);
    setImagePreview('');
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage && !selectedAudio) || isLoading) return;

    let userMessageText = inputMessage;
    let imageUrl = '';
    let audioUrl = '';

    if (selectedImage) {
      userMessageText = inputMessage || '📷 [Imagen adjunta]';
      imageUrl = imagePreview;
    }
    if (selectedAudio) {
      userMessageText = inputMessage || '🎤 [Audio adjunto]';
      audioUrl = URL.createObjectURL(selectedAudio);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
      imageUrl: imageUrl || undefined,
      audioUrl: audioUrl || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    try {
      const files: File[] = [];
      if (selectedImage) files.push(selectedImage);
      if (selectedAudio) files.push(selectedAudio);

      const response = await sendMessage(inputMessage, files, userContext);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      clearAttachments();
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta nuevamente.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar Moderno */}
          <div className="lg:col-span-1">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/60 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Acciones Rápidas</h3>
              </div>
              
              {/* INDICADOR "EN LÍNEA" MEJORADO */}
              <div className="flex items-center justify-between mb-6">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-sm transition-all duration-300 ${
                  userContext.isLoggedIn 
                    ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200/80 shadow-lg shadow-emerald-500/10' 
                    : 'bg-gradient-to-r from-slate-50/80 to-gray-50/80 border border-slate-200/60 shadow-sm'
                }`}>
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full ${
                      userContext.isLoggedIn 
                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-lg shadow-emerald-400/50' 
                        : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}></div>
                    {userContext.isLoggedIn && (
                      <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${
                      userContext.isLoggedIn ? 'text-emerald-700' : 'text-slate-600'
                    }`}>
                      {userContext.isLoggedIn ? 'Conectado' : 'Desconectado'}
                    </span>
                    {userContext.nombre && (
                      <span className="text-xs font-medium text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full">
                        {userContext.nombre}
                      </span>
                    )}
                  </div>
                  {userContext.isLoggedIn && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-1" />
                  )}
                </div>

                {!userContext.isLoggedIn && (
                  <a 
                    href="/login"
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-xs hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 flex items-center gap-1"
                  >
                    <Wifi className="w-3 h-3" />
                    Conectar
                  </a>
                )}
              </div>
              
              <div className="space-y-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setInputMessage(action.prompt);
                        setTimeout(() => handleSendMessage(), 100);
                      }}
                      disabled={!userContext.isLoggedIn || isLoading}
                      className="group w-full text-left p-4 text-sm font-medium text-slate-700 bg-gradient-to-r from-white to-slate-50 hover:from-slate-50 hover:to-white rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 border border-slate-200/60 hover:border-indigo-200 hover:shadow-md disabled:hover:shadow-none"
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="group-hover:text-indigo-700 transition-colors">{action.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  Tips de Uso
                </h4>
                <ul className="text-sm text-slate-600 space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>Pregunta sobre tus calificaciones y promedio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>Solicita planes de mejora personalizados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>Consulta ubicaciones y horarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span>Envía imágenes y audios</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Chat Area Premium */}
          <div className="lg:col-span-3">
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 flex flex-col h-[calc(100vh-180px)]">
              
              {/* Messages con Gradiente de Fondo */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-slate-50/50 to-white/50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 ${message.isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
                  >
                    {/* Avatar Mejorado */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
                      message.isUser 
                        ? 'bg-gradient-to-br from-indigo-500 to-purple-600' 
                        : 'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600'
                    }`}>
                      {message.isUser ? (
                        <User className="w-5 h-5 text-white" />
                      ) : (
                        <Bot className="w-5 h-5 text-white" />
                      )}
                    </div>
                    
                    <div className={`max-w-[75%] ${message.isUser ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block px-6 py-4 rounded-2xl shadow-lg ${
                        message.isUser
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-sm'
                          : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white rounded-tl-sm'
                      }`}>
                        {message.imageUrl && (
                          <img 
                            src={message.imageUrl} 
                            alt="Imagen enviada" 
                            className="rounded-xl mb-3 max-w-sm shadow-md"
                          />
                        )}
                        {message.audioUrl && (
                          <audio controls className="mb-3 w-full">
                            <source src={message.audioUrl} type="audio/webm" />
                          </audio>
                        )}
                        
                        {message.isUser ? (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.text}</div>
                        ) : (
                          <MessageRenderer content={message.text} isBot={true} />
                        )}
                      </div>
                      <div className={`text-xs text-slate-500 mt-2 font-medium ${
                        message.isUser ? 'text-right' : 'text-left'
                      }`}>
                        {message.timestamp.toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex gap-4 animate-fade-in">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white px-6 py-4 rounded-2xl rounded-tl-sm shadow-lg">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area Mejorada */}
              <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl p-6">
                
                {/* Preview de Adjuntos */}
                {(selectedImage || selectedAudio) && (
                  <div className="mb-4 flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/60 backdrop-blur-sm">
                    {selectedImage && (
                      <div className="flex items-center gap-3">
                        <img src={imagePreview} alt="Preview" className="w-14 h-14 object-cover rounded-lg shadow-sm" />
                        <span className="text-sm font-medium text-slate-700">Imagen lista</span>
                      </div>
                    )}
                    {selectedAudio && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Mic className="w-5 h-5 text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">Audio listo</span>
                      </div>
                    )}
                    <button
                      onClick={clearAttachments}
                      className="ml-auto p-2 hover:bg-indigo-100 rounded-full transition-colors"
                    >
                      <XCircle className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  
                  {/* Botones de Adjuntos */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!userContext.isLoggedIn || isLoading}
                      className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                      title="Adjuntar imagen"
                    >
                      <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                    
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={!userContext.isLoggedIn || isLoading}
                      className={`p-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group ${
                        isRecording 
                          ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                          : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
                      }`}
                      title={isRecording ? "Detener grabación" : "Grabar audio"}
                    >
                      <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioSelect}
                    
                      className="hidden"
                    />
                  </div>

                  {/* Input de Texto */}
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        userContext.isLoggedIn
                          ? "Escribe tu mensaje aquí..."
                          : "Inicia sesión para comenzar..."
                      }
                      disabled={!userContext.isLoggedIn || isLoading}
                      rows={1}
                      className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-300 bg-white/80 backdrop-blur-sm"
                      style={{ minHeight: '56px', maxHeight: '120px' }}
                    />
                  </div>
                  
                  {/* Botón de Enviar */}
                  <button
                    onClick={handleSendMessage}
                    disabled={(!inputMessage.trim() && !selectedImage && !selectedAudio) || !userContext.isLoggedIn || isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-3 font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 disabled:hover:scale-100"
                  >
                    <Send className="w-5 h-5" />
                    Enviar
                  </button>
                </div>
                
                {!userContext.isLoggedIn && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-slate-600">
                      Necesitas{' '}
                      <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline decoration-2 underline-offset-2">
                        iniciar sesión
                      </a>{' '}
                      para acceder a tus datos académicos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}