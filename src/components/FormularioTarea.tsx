/**
 * Componente: FormularioTarea
 * Permite registrar una nueva tarea escolar con:
 * - Materia
 * - Título
 * - Fecha de entrega
 * - Prioridad (Alta, Media, Baja)
 *
 * ⚠️ PUNTOS DONDE LA GENTE SUELE EQUIVOCARSE:
 * 1. Olvidar `e.preventDefault()` en el submit: En formularios HTML, si no previenes
 *    el evento por defecto, el navegador intentará hacer un POST/GET y recargará la página,
 *    perdiendo todo el estado en memoria de React.
 * 2. No sanitizar con `.trim()`: Un estudiante puede ingresar espacios accidentales
 *    (ej: "   ") y crear una tarea "invisible" o vacía.
 * 3. En dispositivos móviles, inputs muy pequeños provocan zoom automático desagradable
 *    en iOS Safari si font-size < 16px. Usamos `text-base` en inputs para prevenirlo.
 */

import React, { useState } from 'react';
import { PlusCircle, Sparkles, AlertCircle } from 'lucide-react';
import { Prioridad, Tarea } from '../types/tarea';
import { obtenerFechaHoyISO } from '../utils/dateUtils';

interface FormularioTareaProps {
  alGuardarTarea: (nuevaTarea: Omit<Tarea, 'id' | 'completada' | 'creadaEn'>) => void;
}

// Materias comunes de bachillerato para autocompletar con un solo tap en celular
const MATERIAS_BACHILLERATO = [
  'Matemáticas',
  'Física',
  'Química',
  'Biología',
  'Lengua y Literatura',
  'Historia',
  'Inglés',
  'Filosofía'
];

export const FormularioTarea: React.FC<FormularioTareaProps> = ({ alGuardarTarea }) => {
  const hoyStr = obtenerFechaHoyISO();

  // Estados del formulario
  const [materia, setMateria] = useState('');
  const [titulo, setTitulo] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState(hoyStr);
  const [prioridad, setPrioridad] = useState<Prioridad>('Media');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  /**
   * Atajos rápidos de fecha para estudiantes en celular.
   */
  const seleccionarAtajoFecha = (diasAdicionales: number) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + diasAdicionales);
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    setFechaEntrega(`${year}-${month}-${day}`);
  };

  const manejarEnvio = (e: React.FormEvent) => {
    // ⚠️ CRÍTICO: Prevenir la recarga de página nativa de HTML
    e.preventDefault();

    const materiaLimpia = materia.trim();
    const tituloLimpio = titulo.trim();

    // Validaciones escolares básicas
    if (!materiaLimpia) {
      setErrorValidacion('Por favor escribe o selecciona la materia escolar.');
      return;
    }

    if (!tituloLimpio) {
      setErrorValidacion('Por favor indica qué tarea debes realizar.');
      return;
    }

    if (!fechaEntrega) {
      setErrorValidacion('Debes indicar una fecha de entrega.');
      return;
    }

    // Limpiar errores si todo está correcto
    setErrorValidacion(null);

    // Enviar datos
    alGuardarTarea({
      materia: materiaLimpia,
      titulo: tituloLimpio,
      fechaEntrega,
      prioridad
    });

    // Resetear formulario para la siguiente tarea
    setTitulo('');
    // Mantenemos la materia anterior como conveniencia si el estudiante tiene varias de la misma clase
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-indigo-600" />
        <h2 className="text-base font-bold text-slate-900">
          Registrar nueva tarea
        </h2>
      </div>

      {errorValidacion && (
        <div
          role="alert"
          className="mb-4 flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorValidacion}</span>
        </div>
      )}

      <form onSubmit={manejarEnvio} className="space-y-4">
        {/* Campo 1: Materia */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="materia-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              1. Materia o Asignatura
            </label>
            <span className="text-xs text-slate-400">Requerido</span>
          </div>
          <input
            id="materia-input"
            type="text"
            value={materia}
            onChange={(e) => {
              setMateria(e.target.value);
              if (errorValidacion) setErrorValidacion(null);
            }}
            placeholder="Ej: Matemáticas, Historia, Física..."
            className="w-full h-11 px-3.5 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors placeholder:text-slate-400"
          />

          {/* Sugerencias táctiles para celular (un toque para elegir materia) */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] text-slate-600 shrink-0 font-medium">Sugerencias:</span>
            {MATERIAS_BACHILLERATO.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setMateria(item);
                  if (errorValidacion) setErrorValidacion(null);
                }}
                className={`text-xs px-2.5 py-1 rounded-lg shrink-0 transition-colors font-medium ${
                  materia.toLowerCase() === item.toLowerCase()
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Campo 2: Título de la tarea */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="titulo-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              2. Título o Descripción
            </label>
            <span className="text-xs text-slate-400">Requerido</span>
          </div>
          <input
            id="titulo-input"
            type="text"
            value={titulo}
            onChange={(e) => {
              setTitulo(e.target.value);
              if (errorValidacion) setErrorValidacion(null);
            }}
            placeholder="Ej: Ejercicios del 1 al 15 sobre vectores (página 54)"
            className="w-full h-11 px-3.5 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors placeholder:text-slate-400"
          />
        </div>

        {/* Fila responsiva: Fecha de Entrega y Prioridad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Campo 3: Fecha de entrega */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="fecha-entrega-input" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                3. Fecha de entrega
              </label>
            </div>
            <input
              id="fecha-entrega-input"
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              className="w-full h-11 px-3 text-base sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors text-slate-900"
            />
            {/* Atajos de fecha rápida */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <button
                type="button"
                onClick={() => seleccionarAtajoFecha(0)}
                className={`text-xs px-2 py-1 rounded-md transition-colors ${
                  fechaEntrega === hoyStr ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => seleccionarAtajoFecha(1)}
                className="text-xs px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
              >
                Mañana
              </button>
              <button
                type="button"
                onClick={() => seleccionarAtajoFecha(7)}
                className="text-xs px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
              >
                En 1 semana
              </button>
            </div>
          </div>

          {/* Campo 4: Prioridad */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              4. Prioridad
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              {(['Baja', 'Media', 'Alta'] as Prioridad[]).map((p) => {
                const esSeleccionado = prioridad === p;
                let colorActivo = 'bg-white text-slate-900 shadow-sm';
                if (esSeleccionado && p === 'Alta') colorActivo = 'bg-rose-600 text-white shadow-sm';
                if (esSeleccionado && p === 'Media') colorActivo = 'bg-amber-500 text-white shadow-sm';
                if (esSeleccionado && p === 'Baja') colorActivo = 'bg-slate-800 text-white shadow-sm';

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPrioridad(p)}
                    className={`h-9 min-h-[36px] text-xs font-semibold rounded-lg transition-all flex items-center justify-center ${
                      esSeleccionado
                        ? colorActivo
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              {prioridad === 'Alta' && '⚠️ Requiere entrega urgente o calificación clave'}
              {prioridad === 'Media' && '📌 Tarea regular de semana'}
              {prioridad === 'Baja' && '📝 Lectura previa o repaso opcional'}
            </p>
          </div>
        </div>

        {/* Botón de Enviar */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full min-h-[46px] px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar tarea a la lista</span>
          </button>
        </div>
      </form>
    </div>
  );
};
