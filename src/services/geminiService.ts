/**
 * Servicio para solicitar el desglose de tareas a la API de Gemini
 * (comunicación cliente -> servidor backend)
 */

import { RespuestaGeminiDesglose } from '../types/tarea';
import { EJEMPLO_RESPUESTA_PRUEBA_JSON } from '../utils/geminiEjemplo';

export interface ResultadoDesglose {
  exito: boolean;
  datos?: RespuestaGeminiDesglose;
  error?: string;
}

/**
 * Solicita a Gemini desglosar una tarea en 3 a 5 pasos con estimación de tiempo.
 * Manejo de fallo: si la IA no responde o falla, retorna el mensaje exacto solicitado
 * sin quebrar la aplicación.
 */
export async function solicitarDesgloseGemini(
  materia: string,
  titulo: string,
  usarModoPrueba = false
): Promise<ResultadoDesglose> {
  // Si se solicita modo de prueba para desarrollar sin gastar llamadas:
  if (usarModoPrueba) {
    // Simula una breve latencia realista de 400ms
    await new Promise((r) => setTimeout(r, 400));
    return {
      exito: true,
      datos: EJEMPLO_RESPUESTA_PRUEBA_JSON
    };
  }

  try {
    const respuesta = await fetch('/api/desglosar-tarea', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ materia, titulo })
    });

    const resultado = await respuesta.json();

    if (!respuesta.ok || !resultado.exito) {
      return {
        exito: false,
        error: resultado.error || "No pudimos conectar con el asistente de IA. Intenta de nuevo más tarde"
      };
    }

    return {
      exito: true,
      datos: resultado.datos
    };
  } catch (err) {
    console.error('Error al conectar con el servidor:', err);
    // Requisito 4: mensaje exacto de contingencia
    return {
      exito: false,
      error: "No pudimos conectar con el asistente de IA. Intenta de nuevo más tarde"
    };
  }
}
