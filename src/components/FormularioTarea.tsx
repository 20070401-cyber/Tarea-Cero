/**
 * Componente: FormularioTarea
 * 
 * Cumplimiento de requisitos de interfaz y blindaje de validaciones (QA):
 * - 320 px de ancho: Operable con una sola mano y sin hacer zoom.
 * - Contraste alto para exteriores: Bordes nítidos y texto oscuro legible al sol.
 * - Tipografía mínima de 16 px en etiquetas, campos, botones y mensajes.
 * - Etiquetas visibles para todos los campos (no únicamente placeholders).
 * - UN SOLO botón principal en pantalla ("+ Agregar Tarea"); los demás son controles secundarios.
 * - Mensajes de error en español claro, sin tecnicismos ni jerga de programación.
 * - Blindado contra: campos vacíos, espacios invisibles, títulos gigantes, doble clic, inyecciones y fechas incongruentes.
 */

import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { Prioridad, Tarea } from '../types/tarea';
import { obtenerFechaHoyISO } from '../utils/dateUtils';

interface FormularioTareaProps {
  alGuardarTarea: (nuevaTarea: Omit<Tarea, 'id' | 'completada' | 'creadaEn'>) => void;
}

const MATERIAS_BACHILLERATO = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Lengua',
  'Historia',
  'Inglés',
  'Filosofía'
];

export const FormularioTarea: React.FC<FormularioTareaProps> = ({ alGuardarTarea }) => {
  const hoyStr = obtenerFechaHoyISO();
  const fechaMaxima = `${new Date().getFullYear() + 2}-12-31`;

  const [materia, setMateria] = useState('');
  const [titulo, setTitulo] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState(hoyStr);
  const [prioridad, setPrioridad] = useState<Prioridad>('Media');
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false); // Protección contra doble clic

  const seleccionarAtajoFecha = (diasAdicionales: number) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasAdicionales);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    setFechaEntrega(`${year}-${month}-${day}`);
  };

  /**
   * Sanitización contra espacios invisibles de ancho cero y etiquetas
   */
  const limpiarTexto = (texto: string) => {
    return texto
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Elimina zero-width spaces
      .replace(/[<>]/g, '')                   // Previene inyecciones de tags
      .trim();
  };

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault();

    // Bloqueo inmediato para evitar doble submit por toques rápidos
    if (enviando) return;

    const materiaLimpia = limpiarTexto(materia);
    const tituloLimpio = limpiarTexto(titulo);

    if (!materiaLimpia) {
      setMensajeError('Por favor escribe o toca una materia para tu tarea.');
      return;
    }

    if (!tituloLimpio) {
      setMensajeError('Por favor escribe qué debes hacer en esta tarea.');
      return;
    }

    // Validación estricta de formato AAAA-MM-DD
    const esFechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fechaEntrega);
    if (!fechaEntrega || !esFechaValida) {
      setMensajeError('Por favor selecciona una fecha de entrega válida.');
      return;
    }

    setMensajeError(null);
    setEnviando(true);

    alGuardarTarea({
      materia: materiaLimpia,
      titulo: tituloLimpio,
      fechaEntrega,
      prioridad
    });

    setTitulo('');

    // Liberar bloqueo tras 400ms
    setTimeout(() => {
      setEnviando(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-4 sm:p-5">
      <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
        Registrar nueva tarea
      </h2>

      {/* Mensaje de error visible en español claro */}
      {mensajeError && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 p-3.5 text-base font-semibold text-rose-950 bg-rose-100 border-2 border-rose-400 rounded-xl"
        >
          <AlertCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          <span>{mensajeError}</span>
        </div>
      )}

      <form onSubmit={manejarEnvio} className="space-y-4">
        {/* Campo 1: Materia con etiqueta visible */}
        <div>
          <label
            htmlFor="campo-materia"
            className="block text-base font-bold text-slate-900 mb-1.5"
          >
            1. Materia o Asignatura <span className="text-rose-600">*</span>
          </label>
          <input
            id="campo-materia"
            type="text"
            maxLength={50}
            value={materia}
            onChange={(e) => {
              setMateria(e.target.value);
              if (mensajeError) setMensajeError(null);
            }}
            placeholder="Ejemplo: Matemáticas"
            className="w-full h-12 px-3.5 text-base font-medium text-slate-950 bg-slate-50 border-2 border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />

          {/* Botones secundarios de sugerencia rápida */}
          <div className="mt-2">
            <span className="block text-base font-semibold text-slate-700 mb-1.5">
              Elegir rápidamente:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MATERIAS_BACHILLERATO.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMateria(item);
                    if (mensajeError) setMensajeError(null);
                  }}
                  className={`text-base px-3 py-1.5 rounded-lg border font-semibold transition-colors min-h-[44px] flex items-center justify-center ${
                    materia.toLowerCase() === item.toLowerCase()
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Campo 2: Título con etiqueta visible y límite de 120 caracteres */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="campo-titulo"
              className="block text-base font-bold text-slate-900"
            >
              2. Título o Descripción de la tarea <span className="text-rose-600">*</span>
            </label>
            <span className="text-sm font-semibold text-slate-500 tabular-nums">
              {titulo.length}/120
            </span>
          </div>
          <input
            id="campo-titulo"
            type="text"
            maxLength={120}
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              if (mensajeError) setMensajeError(null);
            }}
            placeholder="Ejemplo: Ejercicios del 1 al 15 página 54"
            className="w-full h-12 px-3.5 text-base font-medium text-slate-950 bg-slate-50 border-2 border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
        </div>

        {/* Campo 3: Fecha de entrega con límites de fecha min y max */}
        <div>
          <label
            htmlFor="campo-fecha-entrega"
            className="block text-base font-bold text-slate-900 mb-1.5"
          >
            3. Fecha de entrega <span className="text-rose-600">*</span>
          </label>
          <input
            id="campo-fecha-entrega"
            type="date"
            min={hoyStr}
            max={fechaMaxima}
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
            className="w-full h-12 px-3.5 text-base font-semibold text-slate-950 bg-slate-50 border-2 border-slate-400 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
          />
          {/* Botones secundarios para atajos de fecha */}
          <div className="flex flex-wrap gap-2 mt-2">
            <button
              type="button"
              onClick={() => seleccionarAtajoFecha(0)}
              className={`text-base font-semibold px-3 py-1.5 rounded-lg border min-h-[44px] flex items-center justify-center ${
                fechaEntrega === hoyStr
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
              }`}
            >
              Para Hoy
            </button>
            <button
              type="button"
              onClick={() => seleccionarAtajoFecha(1)}
              className="text-base font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200 min-h-[44px] flex items-center justify-center"
            >
              Para Mañana
            </button>
            <button
              type="button"
              onClick={() => seleccionarAtajoFecha(7)}
              className="text-base font-semibold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 hover:bg-slate-200 min-h-[44px] flex items-center justify-center"
            >
              En 1 semana
            </button>
          </div>
        </div>

        {/* Campo 4: Nivel de prioridad con etiqueta visible */}
        <div>
          <label className="block text-base font-bold text-slate-900 mb-1.5">
            4. Nivel de prioridad
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Baja', 'Media', 'Alta'] as Prioridad[]).map((p) => {
              const seleccionado = prioridad === p;
              let estilo = 'bg-slate-100 text-slate-800 border-slate-300';
              if (seleccionado) {
                if (p === 'Alta') estilo = 'bg-rose-700 text-white border-rose-800 font-bold';
                if (p === 'Media') estilo = 'bg-amber-600 text-white border-amber-700 font-bold';
                if (p === 'Baja') estilo = 'bg-slate-900 text-white border-slate-950 font-bold';
              }

              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPrioridad(p)}
                  className={`min-h-[48px] text-base rounded-xl border-2 transition-all flex items-center justify-center font-semibold ${estilo}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* ÚNICO BOTÓN PRINCIPAL */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={enviando}
            className={`w-full min-h-[52px] px-4 py-3 bg-indigo-700 hover:bg-indigo-800 active:scale-[0.99] text-white font-bold text-base rounded-xl shadow-md flex items-center justify-center gap-2 border-2 border-indigo-900 ${
              enviando ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-5 h-5 stroke-[3]" />
            <span>+ Agregar Tarea</span>
          </button>
        </div>
      </form>
    </div>
  );
};
