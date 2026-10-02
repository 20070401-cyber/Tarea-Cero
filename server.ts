/**
 * Servidor Express con Vite middleware y endpoint de Gemini API
 * para Tarea Cero.
 *
 * Cumplimiento de directrices:
 * - Toda llamada a Gemini SDK se realiza exclusivamente del lado del servidor.
 * - La API key se obtiene de process.env.GEMINI_API_KEY.
 * - Usa el modelo recomendado 'gemini-3.8-flash'.
 * - Configura responseSchema con Type.OBJECT, Type.ARRAY, Type.INTEGER, Type.STRING.
 * - Maneja fallos con mensaje seguro sin quebrar la aplicación.
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialización de cliente Gemini con telemetría de User-Agent requerida
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Ejemplo fijo de prueba para desarrollo sin gastar llamadas de API
const EJEMPLO_PRUEBA = {
  pasos: [
    "Revisar los apuntes de clase y la teoría del tema durante 10 minutos.",
    "Resolver los primeros ejercicios guiados paso a paso anotando las fórmulas.",
    "Completar los ejercicios restantes y verificar los resultados finales.",
    "Guardar la tarea en la mochila o carpeta para tenerla lista mañana."
  ],
  tiempoEstimadoMinutos: 45,
  consejoEstudio: "Divide el tiempo en bloques de 20 minutos con 5 de descanso (técnica Pomodoro) y mantén el celular en silencio."
};

async function iniciarServidor() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  /**
   * Endpoint: Desglosar tarea escolar con Gemini API
   */
  app.post('/api/desglosar-tarea', async (req, res) => {
    try {
      const { materia, titulo, usarModoPrueba } = req.body;

      // Si el cliente solicita explícitamente el modo de prueba para no gastar llamadas:
      if (usarModoPrueba) {
        return res.json({
          exito: true,
          datos: EJEMPLO_PRUEBA,
          modoPrueba: true
        });
      }

      // Si la API key no está configurada aún en el entorno:
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(503).json({
          exito: false,
          error: "No pudimos conectar con el asistente de IA. Intenta de nuevo más tarde",
          detalle: "Falta configurar GEMINI_API_KEY en el archivo .env"
        });
      }

      // Llamada oficial al modelo gemini-3.8-flash con responseSchema estructurado y timeout
      const promesaLlamada = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Eres un tutor pedagógico de bachillerato.
Analiza la siguiente tarea escolar y desglósala en un plan paso a paso claro y accesible de 3 a 5 pasos sencillos.
Calcula un tiempo total estimado realista en minutos y ofrece un consejo breve y práctico de estudio.

Materia: ${materia || 'General'}
Tarea: ${titulo || 'Sin descripción'}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pasos: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: "Lista de 3 a 5 pasos sencillos y ordenados para realizar la tarea."
              },
              tiempoEstimadoMinutos: {
                type: Type.INTEGER,
                description: "Tiempo total estimado en minutos para completar la tarea."
              },
              consejoEstudio: {
                type: Type.STRING,
                description: "Texto breve con un consejo práctico y motivador de estudio."
              }
            },
            required: ["pasos", "tiempoEstimadoMinutos", "consejoEstudio"]
          }
        }
      });

      // Timeout de 10 segundos para no bloquear la app si la red falla
      const promesaTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('TIMEOUT_GEMINI')), 10000)
      );

      const respuesta = await Promise.race([promesaLlamada, promesaTimeout]);

      const textoGenerado = respuesta.text?.trim() || '{}';
      const datosParseados = JSON.parse(textoGenerado);

      return res.json({
        exito: true,
        datos: datosParseados
      });
    } catch (error) {
      console.error('Error en llamada a Gemini API:', error);
      // Cumplimiento del requisito 4: mensaje exacto de contingencia
      return res.status(500).json({
        exito: false,
        error: "No pudimos conectar con el asistente de IA. Intenta de nuevo más tarde"
      });
    }
  });

  // Integración de Vite en desarrollo o servidor de estáticos en producción
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TAREA CERO server activo en http://localhost:${PORT}`);
  });
}

iniciarServidor();
