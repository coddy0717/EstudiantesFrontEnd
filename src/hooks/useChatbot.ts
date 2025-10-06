// hooks/useChatbot.ts - VERSIÓN CORREGIDA
import { chatbotService } from '@/lib/geminiService';
import { useState } from 'react';
import { UserContext } from '@/app/types/chatbot';

export function useChatbot() {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (
    message: string, 
    files?: File[], 
    userContext?: UserContext
  ) => {
    setIsLoading(true);
    try {
      console.log('📤 Enviando mensaje:', { 
        message, 
        hasFiles: files?.length || 0,
        fileTypes: files?.map(f => f.type) 
      });

      // 🔥 CORRECCIÓN PRINCIPAL: Manejar archivos si existen
      if (files && files.length > 0) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const audioFiles = files.filter(file => file.type.startsWith('audio/'));

        // Priorizar imágenes
        if (imageFiles.length > 0) {
          console.log('🖼️ Procesando imagen:', imageFiles[0].name);
          const response = await chatbotService.sendMessageWithImage(
            message || "Analiza esta imagen", 
            imageFiles[0], 
            userContext
          );
          return response;
        }

        // Procesar audio
        if (audioFiles.length > 0) {
          console.log('🎵 Procesando audio:', audioFiles[0].name);
          const response = await chatbotService.sendMessageWithAudio(
            audioFiles[0], 
            userContext
          );
          return response;
        }
      }

      // Mensaje de texto normal
      console.log('📝 Procesando texto normal');
      const response = await chatbotService.sendMessage(message, userContext);
      return response;

    } catch (error) {
      console.error('❌ Error en useChatbot:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Mantener métodos individuales por si los necesitas
  const sendMessageWithImage = async (
    message: string, 
    imageFile: File, 
    userContext?: UserContext
  ) => {
    return sendMessage(message, [imageFile], userContext);
  };

  const sendMessageWithAudio = async (
    audioFile: File, 
    userContext?: UserContext
  ) => {
    return sendMessage("", [audioFile], userContext);
  };

  return { 
    sendMessage, // ✅ Este ahora maneja archivos
    sendMessageWithImage, 
    sendMessageWithAudio, 
    isLoading 
  };
}