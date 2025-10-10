// lib/openaiService.ts - VERSIÓN CON FUNCTION CALLING Y BÚSQUEDA WEB
import OpenAI from "openai";
import { UserContext } from "../app/types/chatbot";

export class ChatbotService {
  private openai: OpenAI | null = null;
  private chatHistory: Array<{
    role: "system" | "user" | "assistant" | "function";
    content: string;
    name?: string;
  }> = [];
  private useFallback: boolean = false;
  private lastImageHash: string | null = null;

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

    if (!apiKey || !apiKey.startsWith("sk-")) {
      console.warn("❌ OpenAI API Key no válida");
      this.useFallback = true;
      return;
    }

    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true,
      });
      console.log("✅ OpenAI inicializado");
    } catch (error) {
      console.error("❌ Error inicializando OpenAI:", error);
      this.useFallback = true;
    }
  }

  private getSystemPrompt(userContext?: UserContext): string {
    return `Eres "EduBot", un asistente educativo universitario experto y empático.

DATOS DEL ESTUDIANTE:
- Nombre: ${userContext?.nombre || "Usuario"}
- Sesión activa: ${userContext?.isLoggedIn ? "Sí" : "No"}
- Fecha actual: ${new Date().toLocaleDateString("es-EC", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
- Hora actual: ${new Date().toLocaleTimeString("es-EC")}

INSTRUCCIONES CRÍTICAS:
1. **Mantén el contexto**: Recuerda lo que el estudiante preguntó antes y responde en consecuencia
2. **Sé conversacional**: Responde como un tutor amigable, no como un sistema automatizado
3. **Usa las funciones**: Cuando el estudiante pida información académica, usa las funciones disponibles
4. **Recomienda material**: Si detectas materias con calificación < 70, busca automáticamente recursos en internet
5. **Sigue el hilo**: Si el estudiante hace preguntas relacionadas, conecta con lo anterior

FORMATO ESPECIAL PARA ENLACES:
- NUNCA escribas URLs directamente como texto (ejemplo: https://www.youtube.com/...)
- SIEMPRE envuelve las URLs con el formato [LINK:url]
- Ejemplo correcto: [LINK:https://www.youtube.com/results?search_query=matematicas]
- Ejemplo incorrecto: https://www.youtube.com/results?search_query=matematicas
- Cuando presentes recursos, di "Enlace" y usa el formato especial

ESCALA DE CALIFICACIONES:
- 90-100: Excelente 🏆
- 80-89: Muy bueno ⭐
- 70-79: Satisfactorio ✅
- < 70: Necesita mejora urgente ⚠️

FUNCIONES DISPONIBLES:
- obtener_calificaciones: Consulta las notas del estudiante
- buscar_recursos_estudio: Busca material educativo en internet para materias específicas

ESTILO DE RESPUESTA:
- Natural y conversacional
- Empático pero honesto
- Motivador cuando sea apropiado
- Directo al punto sin ser robótico
- Usa emojis solo cuando agreguen valor emocional
- Presenta los recursos de forma clara usando el formato [LINK:url]`;
  }

  // ===== DEFINICIÓN DE FUNCIONES PARA FUNCTION CALLING =====

  private getFunctionDefinitions() {
    return [
      {
        name: "obtener_calificaciones",
        description:
          "Obtiene las calificaciones y datos académicos del estudiante. Úsala cuando el estudiante pregunte sobre sus notas, materias, promedio, aulas, o cualquier información académica.",
        parameters: {
          type: "object",
          properties: {
            tipo_consulta: {
              type: "string",
              enum: [
                "todas",
                "promedio",
                "mejor",
                "peor",
                "materias",
                "aulas",
                "especifica",
              ],
              description:
                "Tipo de consulta: todas las calificaciones, solo promedio, mejor nota, peor nota, lista de materias, información de aulas, o consulta específica de una materia",
            },
            materia_especifica: {
              type: "string",
              description:
                "Nombre de la materia si la consulta es específica (opcional)",
            },
          },
          required: ["tipo_consulta"],
        },
      },
      {
        name: "buscar_recursos_estudio",
        description:
          "Busca recursos educativos en internet para una materia específica. Úsala automáticamente cuando detectes que una materia tiene calificación menor a 70, o cuando el estudiante pida ayuda para mejorar.",
        parameters: {
          type: "object",
          properties: {
            materia: {
              type: "string",
              description: "Nombre de la materia para la cual buscar recursos",
            },
            tipo_recurso: {
              type: "string",
              enum: ["videos", "tutoriales", "ejercicios", "general"],
              description: "Tipo de recurso educativo a buscar",
            },
            nivel_urgencia: {
              type: "string",
              enum: ["alta", "media", "baja"],
              description:
                "Urgencia basada en la calificación: alta (< 60), media (60-69), baja (70+)",
            },
          },
          required: ["materia"],
        },
      },
    ];
  }

  // ===== IMPLEMENTACIÓN DE FUNCIONES =====

  private async ejecutarFuncion(
    functionName: string,
    functionArgs: any,
    userContext?: UserContext,
  ): Promise<string> {
    console.log(`🔧 Ejecutando función: ${functionName}`, functionArgs);

    try {
      switch (functionName) {
        case "obtener_calificaciones":
          return await this.obtenerCalificaciones(functionArgs, userContext);

        case "buscar_recursos_estudio":
          return await this.buscarRecursosEstudio(functionArgs);

        default:
          return JSON.stringify({ error: "Función no reconocida" });
      }
    } catch (error: any) {
      console.error(`❌ Error ejecutando ${functionName}:`, error);
      return JSON.stringify({
        error: "Error al ejecutar la función",
        detalles: error.message,
      });
    }
  }

  private async obtenerCalificaciones(
    args: any,
    userContext?: UserContext,
  ): Promise<string> {
    if (!userContext?.isLoggedIn || !userContext.token) {
      return JSON.stringify({
        error: "No autenticado",
        mensaje:
          "El estudiante debe iniciar sesión para consultar calificaciones",
      });
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mis-inscripciones/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${userContext.token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const inscripciones = await response.json();

      if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
        return JSON.stringify({
          mensaje: "No se encontraron materias inscritas",
          inscripciones: [],
        });
      }

      // Procesar según tipo de consulta
      return this.procesarConsultaCalificaciones(inscripciones, args);
    } catch (error: any) {
      return JSON.stringify({
        error: "Error al obtener datos",
        mensaje: error.message,
      });
    }
  }

  private procesarConsultaCalificaciones(
    inscripciones: any[],
    args: any,
  ): string {
    const tipo = args.tipo_consulta;
    const materiaEspecifica = args.materia_especifica?.toLowerCase();

    // Filtrar inscripciones con calificación
    const conNota = inscripciones.filter(
      (i) => i.calificacion !== null && i.calificacion !== undefined,
    );

    const resultado: any = {
      total_materias: inscripciones.length,
      materias_calificadas: conNota.length,
      materias: [],
    };

    switch (tipo) {
      case "todas":
        resultado.materias = inscripciones.map((i) => ({
          nombre: i.paralelo?.materia?.nombre || "Materia desconocida",
          calificacion: i.calificacion,
          aula: i.paralelo?.aula || "No asignada",
          paralelo: i.paralelo?.numero_paralelo || "N/A",
          carrera: i.carrera?.nombre || "N/A",
        }));
        break;

      case "promedio":
        if (conNota.length > 0) {
          const promedio =
            conNota.reduce((acc, i) => acc + i.calificacion, 0) /
            conNota.length;
          resultado.promedio = parseFloat(promedio.toFixed(2));
        } else {
          resultado.promedio = null;
          resultado.mensaje = "No hay calificaciones disponibles";
        }
        break;

      case "mejor":
        if (conNota.length > 0) {
          const mejor = conNota.reduce((max, i) =>
            i.calificacion > max.calificacion ? i : max,
          );
          resultado.mejor_materia = {
            nombre: mejor.paralelo?.materia?.nombre,
            calificacion: mejor.calificacion,
            aula: mejor.paralelo?.aula,
            paralelo: mejor.paralelo?.numero_paralelo,
          };
        }
        break;

      case "peor":
        if (conNota.length > 0) {
          const peor = conNota.reduce((min, i) =>
            i.calificacion < min.calificacion ? i : min,
          );
          resultado.peor_materia = {
            nombre: peor.paralelo?.materia?.nombre,
            calificacion: peor.calificacion,
            aula: peor.paralelo?.aula,
            paralelo: peor.paralelo?.numero_paralelo,
          };

          // ⭐ AUTO-TRIGGER: Si la peor nota es < 70, marcar para búsqueda de recursos
          if (peor.calificacion < 70) {
            resultado.necesita_recursos = true;
            resultado.materia_critica = peor.paralelo?.materia?.nombre;
          }
        }
        break;

      case "especifica":
        if (materiaEspecifica) {
          const materiaEncontrada = inscripciones.find((i) =>
            i.paralelo?.materia?.nombre
              ?.toLowerCase()
              .includes(materiaEspecifica),
          );

          if (materiaEncontrada) {
            resultado.materia = {
              nombre: materiaEncontrada.paralelo?.materia?.nombre,
              calificacion: materiaEncontrada.calificacion,
              aula: materiaEncontrada.paralelo?.aula,
              paralelo: materiaEncontrada.paralelo?.numero_paralelo,
              carrera: materiaEncontrada.carrera?.nombre,
            };
          } else {
            resultado.error = `No se encontró la materia: ${materiaEspecifica}`;
          }
        }
        break;

      case "materias":
      case "aulas":
        resultado.materias = inscripciones.map((i) => ({
          nombre: i.paralelo?.materia?.nombre || "Materia desconocida",
          aula: i.paralelo?.aula || "No asignada",
          paralelo: i.paralelo?.numero_paralelo || "N/A",
          calificacion: i.calificacion,
        }));
        break;
    }

    // Detectar materias críticas automáticamente
    const materiasCriticas = conNota.filter((i) => i.calificacion < 70);
    if (materiasCriticas.length > 0) {
      resultado.materias_necesitan_atencion = materiasCriticas.map((i) => ({
        nombre: i.paralelo?.materia?.nombre,
        calificacion: i.calificacion,
      }));
    }

    return JSON.stringify(resultado);
  }

  private async buscarRecursosEstudio(args: any): Promise<string> {
    const materia = args.materia;
    const tipoRecurso = args.tipo_recurso || "general";
    const urgencia = args.nivel_urgencia || "media";

    const recursos = this.generarRecursosEducativos(
      materia,
      tipoRecurso,
      urgencia,
    );
    const textoFormateado = this.formatearRecursosParaGPT(recursos);

    return JSON.stringify({
      materia: materia,
      tipo_recurso: tipoRecurso,
      urgencia: urgencia,
      mensaje_formateado: textoFormateado,
      recursos: recursos,
    });
  }

  private generarRecursosEducativos(
    materia: string,
    tipo: string,
    urgencia: string,
  ): any[] {
    const recursos: any[] = [];

    // YouTube
    const youtubeLink1 = `https://www.youtube.com/results?search_query=${encodeURIComponent(materia + " tutorial español")}`;
    const youtubeLink2 = `https://www.youtube.com/results?search_query=${encodeURIComponent(materia + " explicación paso a paso")}`;

    recursos.push({
      plataforma: "YouTube",
      tipo: "Videos educativos",
      descripcion: "Videos explicativos en español",
      enlaces: [
        { texto: "Tutorial en español", url: youtubeLink1 },
        { texto: "Explicación paso a paso", url: youtubeLink2 },
      ],
    });

    // Khan Academy
    const khanLink = `https://es.khanacademy.org/search?search_again=1&page_search_query=${encodeURIComponent(materia)}`;
    recursos.push({
      plataforma: "Khan Academy",
      tipo: "Cursos interactivos",
      descripcion: "Cursos gratuitos con ejercicios prácticos",
      enlace: { texto: "Buscar en Khan Academy", url: khanLink },
    });

    // Coursera
    const courseraLink = `https://www.coursera.org/search?query=${encodeURIComponent(materia)}`;
    recursos.push({
      plataforma: "Coursera",
      tipo: "Cursos universitarios",
      descripcion: "Cursos de universidades reconocidas",
      enlace: { texto: "Buscar en Coursera", url: courseraLink },
    });

    // MIT OpenCourseWare
    const mitLink = `https://ocw.mit.edu/search/?q=${encodeURIComponent(materia)}`;
    recursos.push({
      plataforma: "MIT OpenCourseWare",
      tipo: "Material académico avanzado",
      descripcion: "Recursos del MIT de acceso libre",
      enlace: { texto: "Buscar en MIT OCW", url: mitLink },
    });

    // Ejercicios prácticos
    if (tipo === "ejercicios" || urgencia === "alta") {
      const ejerciciosLink1 = `https://www.google.com/search?q=${encodeURIComponent(materia + " ejercicios resueltos pdf")}`;
      const ejerciciosLink2 = `https://www.google.com/search?q=${encodeURIComponent(materia + " problemas resueltos paso a paso")}`;

      recursos.push({
        plataforma: "Varios",
        tipo: "Ejercicios resueltos",
        descripcion: "Problemas resueltos paso a paso",
        enlaces: [
          { texto: "Ejercicios resueltos PDF", url: ejerciciosLink1 },
          { texto: "Problemas paso a paso", url: ejerciciosLink2 },
        ],
      });
    }

    return recursos;
  }
  private formatearRecursosParaGPT(recursos: any[]): string {
    let texto = "\n📚 **RECURSOS EDUCATIVOS ENCONTRADOS**\n\n";
    texto +=
      "⚠️ IMPORTANTE: Usa el formato [LINK:url] para TODOS los enlaces.\n\n";

    recursos.forEach((recurso, index) => {
      texto += `${index + 1}. **${recurso.plataforma}**\n`;
      texto += `   - ${recurso.descripcion}\n`;

      if (recurso.enlaces && Array.isArray(recurso.enlaces)) {
        recurso.enlaces.forEach((enlace: any) => {
          texto += `   - ${enlace.texto}: [LINK:${enlace.url}]\n`;
        });
      } else if (recurso.enlace) {
        texto += `   - ${recurso.enlace.texto}: [LINK:${recurso.enlace.url}]\n`;
      }
      texto += "\n";
    });

    texto += "\n💡 **Instrucción para presentación:**\n";
    texto +=
      "Presenta estos recursos de forma amigable manteniendo EXACTAMENTE el formato [LINK:url] para cada enlace.\n";

    return texto;
  }

  // ===== MÉTODO PRINCIPAL CON FUNCTION CALLING =====

  async sendMessage(
    message: string,
    userContext?: UserContext,
  ): Promise<string> {
    if (this.useFallback || !this.openai) {
      return "El servicio de IA no está disponible. Configura la API Key de OpenAI.";
    }

    try {
      // Inicializar historial si es necesario
      if (this.chatHistory.length === 0) {
        this.chatHistory = [
          {
            role: "system",
            content: this.getSystemPrompt(userContext),
          },
        ];
      }

      // Agregar mensaje del usuario
      this.chatHistory.push({
        role: "user",
        content: message,
      });

      let continueLoop = true;
      let iteraciones = 0;
      const MAX_ITERACIONES = 5;

      while (continueLoop && iteraciones < MAX_ITERACIONES) {
        iteraciones++;

        const response = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo-0125",
          messages: this.chatHistory as any,
          functions: this.getFunctionDefinitions(),
          function_call: "auto",
          temperature: 0.7,
          max_tokens: 1500,
        });

        const choice = response.choices[0];
        const finishReason = choice.finish_reason;

        // Si el modelo quiere llamar a una función
        if (finishReason === "function_call" && choice.message.function_call) {
          const functionName = choice.message.function_call.name;
          const functionArgs = JSON.parse(
            choice.message.function_call.arguments,
          );

          console.log(
            `🤖 OpenAI solicita función: ${functionName}`,
            functionArgs,
          );

          // Agregar la solicitud de función al historial
          this.chatHistory.push({
            role: "assistant",
            content: choice.message.content || "",
            // @ts-ignore
            function_call: choice.message.function_call,
          });

          // Ejecutar la función
          const functionResult = await this.ejecutarFuncion(
            functionName,
            functionArgs,
            userContext,
          );

          console.log(`✅ Resultado de función:`, functionResult);

          // Agregar el resultado al historial
          this.chatHistory.push({
            role: "function",
            name: functionName,
            content: functionResult,
          });

          // ⭐ AUTO-TRIGGER: Buscar recursos si se detecta materia crítica
          const resultObj = JSON.parse(functionResult);
          if (resultObj.necesita_recursos && resultObj.materia_critica) {
            console.log(
              `🚨 Materia crítica detectada: ${resultObj.materia_critica}`,
            );

            const recursosResult = await this.ejecutarFuncion(
              "buscar_recursos_estudio",
              {
                materia: resultObj.materia_critica,
                tipo_recurso: "general",
                nivel_urgencia: "alta",
              },
              userContext,
            );

            this.chatHistory.push({
              role: "function",
              name: "buscar_recursos_estudio",
              content: recursosResult,
            });
          }

          // Continuar el loop para que el modelo procese el resultado
          continue;
        } else {
          // El modelo dio una respuesta final
          const assistantResponse =
            choice.message.content || "No pude generar una respuesta.";

          this.chatHistory.push({
            role: "assistant",
            content: assistantResponse,
          });

          // Limpiar historial si es muy largo
          if (this.chatHistory.length > 20) {
            const systemMessage = this.chatHistory[0];
            const recentMessages = this.chatHistory.slice(-19);
            this.chatHistory = [systemMessage, ...recentMessages];
          }

          return assistantResponse;
        }
      }

      return "Lo siento, tuve problemas procesando tu solicitud. ¿Podrías reformularla?";
    } catch (error: any) {
      console.error("❌ Error en sendMessage:", error);
      return `Error: ${error.message}. Por favor intenta nuevamente.`;
    }
  }

  // ===== MÉTODOS DE MULTIMEDIA (IMAGEN Y VOZ) =====

  async sendMessageWithImage(
    message: string,
    imageFile: File,
    userContext?: UserContext,
  ): Promise<string> {
    if (this.useFallback || !this.openai) {
      return "El servicio de análisis de imágenes no está disponible.";
    }

    try {
      const base64Image = await this.fileToBase64(imageFile);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(userContext),
          },
          {
            role: "user",
            content: [
              { type: "text", text: message || "Analiza esta imagen." },
              {
                type: "image_url",
                image_url: { url: base64Image },
              },
            ] as any,
          },
        ],
        max_tokens: 1000,
      });

      const assistantResponse =
        response.choices[0]?.message?.content || "No pude analizar la imagen";

      this.chatHistory.push({
        role: "user",
        content: `[Imagen: ${message}]`,
      });
      this.chatHistory.push({
        role: "assistant",
        content: assistantResponse,
      });

      return assistantResponse;
    } catch (error: any) {
      console.error("❌ Error procesando imagen:", error);
      return "Error al procesar la imagen. Verifica que el archivo sea válido.";
    }
  }

  async sendMessageWithAudio(
    audioFile: File,
    userContext?: UserContext,
  ): Promise<string> {
    try {
      console.log("🎙️ Transcribiendo audio...");

      const transcription = await this.transcribeAudio(audioFile);

      if (!transcription || transcription.trim().length < 3) {
        return "No pude entender el audio. Habla más claro e intenta nuevamente.";
      }

      console.log("✅ Transcripción:", transcription);

      // Procesar como mensaje normal
      return await this.sendMessage(transcription, userContext);
    } catch (error: any) {
      console.error("❌ Error procesando audio:", error);
      return "Error procesando el audio. Intenta nuevamente.";
    }
  }

  private async transcribeAudio(audioFile: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append("file", audioFile);
      formData.append("model", "whisper-1");
      formData.append("language", "es");

      const response = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Error en transcripción: ${response.status}`);
      }

      const data = await response.json();
      return data.text || "";
    } catch (error) {
      console.error("Error en Whisper:", error);
      throw error;
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ===== MÉTODOS AUXILIARES =====

  resetChat(): void {
    this.chatHistory = [];
  }

  getChatHistory(): any[] {
    return this.chatHistory;
  }

  getServiceStatus(): {
    available: boolean;
    mode: "openai" | "fallback";
  } {
    return {
      available: !this.useFallback,
      mode: this.useFallback ? "fallback" : "openai",
    };
  }
}

export const chatbotService = new ChatbotService();
