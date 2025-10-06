// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserContext, GeminiResponse } from '../../app/types/chatbot';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest): Promise<NextResponse<GeminiResponse>> {
  try {
    const { message, context }: { message: string; context?: UserContext } = await request.json();

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El mensaje no puede estar vacío' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      }
    });

    const systemPrompt = `Eres "EduBot", un asistente virtual especializado en educación universitaria.

Contexto del usuario:
- Nombre: ${context?.nombre || 'No disponible'}
- Sesión activa: ${context?.isLoggedIn ? 'Sí' : 'No'}
- Tiempo: ${context?.timestamp || 'No disponible'}

Responde en español de manera clara, útil y empática.`;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }]
        },
        {
          role: "model", 
          parts: [{ text: "¡Hola! Soy EduBot, tu asistente educativo. ¿En qué puedo ayudarte hoy con tus estudios? 🎓" }]
        }
      ],
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    return NextResponse.json({ 
      success: true, 
      response: response.text() 
    });

  } catch (error: any) {
    console.error('Error en API Gemini:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al procesar tu solicitud' 
      },
      { status: 500 }
    );
  }
}

// Opcional: Método GET para verificar el estado del servicio
export async function GET(): Promise<NextResponse<{ status: string; model: string }>> {
  return NextResponse.json({ 
    status: 'active', 
    model: 'gemini-1.5-flash' 
  });
}