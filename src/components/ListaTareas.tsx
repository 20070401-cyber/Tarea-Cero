/**
 * Componente: ListaTareas
 * 
 * Cumplimiento de requisitos de interfaz:
 * - 320 px de ancho: Operable con una sola mano y sin hacer zoom.
 * - Alto contraste para exteriores y lectura bajo el sol.
 * - Tipografía mínima de 16 px en títulos, materias, fechas y botones.
 * - Botones secundarios (para mantener "+ Agregar Tarea" como único botón principal).
 * - Estado vacío con la frase animada solicitada:
 *   "🎉 ¡Felicidades! No tienes tareas pendientes. Toca '+' para agregar una."
 */

import React, { useState } from 'react';
import { Check, Circle, Trash2, Calendar, AlertTriangle, Layers, ArrowUpDown, Sparkles } from 'lucide-react';
import { FiltroEstado, Tarea } from '../types/tarea';
import { estaVencida, esParaHoy, formatearFechaAmigable, parsearFechaLocal } from '../utils/dateUtils';

interface ListaTareasProps {
  tareas: Tarea[];
  filtro: FiltroEstado;
  alCambiarFiltro: (filtro: FiltroEstado) => void;
  alAlternarCompletada: (id: string) => void;
  alEliminarTarea: (id: string) => void;
}

export const ListaTareas: React.FC<ListaTareasProps> = ({
  tareas,
  filtro,
  alCambiarFiltro,
  alAlternarCompletada,
  alEliminarTarea
}) => {
  const [tareaAEliminar, setTareaAEliminar] = useState<string | null>(null);

  // Auto-cancelar confirmación de eliminación tras 5 segundos sin interactuar
  React.useEffect(() => {
    if (!tareaAEliminar) return;
    const temporizador = setTimeout(() => setTareaAEliminar(null), 5000);
    return () => clearTimeout(temporizador);
  }, [tareaAEliminar]);

  // 1. Filtrado de tareas según estado
  const tareasFiltradas = tareas.filter((t) => {
    if (filtro === 'pendientes') return !t.completada;
    if (filtro === 'completadas') return t.completada;
    return true; // 'todas'
  });

  // 2. Ordenamiento por fecha más cercana
  const tareasOrdenadas = [...tareasFiltradas].sort((a, b) => {
    const fechaA = parsearFechaLocal(a.fechaEntrega).getTime();
    const fechaB = parsearFechaLocal(b.fechaEntrega).getTime();

    if (fechaA !== fechaB) {
      return fechaA - fechaB;
    }

    const pesoPrioridad = { Alta: 1, Media: 2, Baja: 3 };
    return pesoPrioridad[a.prioridad] - pesoPrioridad[b.prioridad];
  });

  const conteoPendientes = tareas.filter((t) => !t.completada).length;
  const conteoCompletadas = tareas.filter((t) => t.completada).length;

  return (
    <section aria-label="Lista de deberes escolares" className="space-y-3.5">
      {/* Barra de control y filtros (Botones secundarios) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center flex-wrap gap-2">
          <Layers className="w-5 h-5 text-slate-800" />
          <h2 className="text-xl font-bold text-slate-950">
            {filtro === 'pendientes' && 'Tareas Pendientes'}
            {filtro === 'completadas' && 'Tareas Completadas'}
            {filtro === 'todas' && 'Todas las Tareas'}
          </h2>
          <span className="text-base font-bold text-slate-700 tabular-nums">
            ({tareasFiltradas.length})
          </span>

          <span className="inline-flex items-center gap-1 text-base font-semibold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-lg border border-indigo-300">
            <ArrowUpDown className="w-4 h-4 text-indigo-700" />
            <span>Fecha más cercana</span>
          </span>
        </div>

        {/* Filtros segmentados táctiles (Secundarios) */}
        <div className="flex items-center p-1 bg-slate-200 border border-slate-300 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => alCambiarFiltro('todas')}
            className={`flex-1 sm:flex-initial px-3 py-2 min-h-[44px] text-base font-bold rounded-lg transition-all ${
              filtro === 'todas'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-300'
                : 'text-slate-800 hover:text-slate-950'
            }`}
          >
            Todas ({tareas.length})
          </button>
          <button
            type="button"
            onClick={() => alCambiarFiltro('pendientes')}
            className={`flex-1 sm:flex-initial px-3 py-2 min-h-[44px] text-base font-bold rounded-lg transition-all ${
              filtro === 'pendientes'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-300'
                : 'text-slate-800 hover:text-slate-950'
            }`}
          >
            Pendientes ({conteoPendientes})
          </button>
          <button
            type="button"
            onClick={() => alCambiarFiltro('completadas')}
            className={`flex-1 sm:flex-initial px-3 py-2 min-h-[44px] text-base font-bold rounded-lg transition-all ${
              filtro === 'completadas'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-300'
                : 'text-slate-800 hover:text-slate-950'
            }`}
          >
            Completadas ({conteoCompletadas})
          </button>
        </div>
      </div>

      {/* 
        REQUISITO 5: ESTADO VACÍO CON FRASE ANIMADA
        "🎉 ¡Felicidades! No tienes tareas pendientes. Toca '+' para agregar una."
      */}
      {tareasOrdenadas.length === 0 && (
        <div className="bg-white rounded-2xl border-2 border-slate-300 p-6 sm:p-8 text-center flex flex-col items-center justify-center shadow-xs">
          <div className="animacion-felicidades w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 border-2 border-amber-300 flex items-center justify-center mb-3">
            <Sparkles className="w-8 h-8" />
          </div>

          {/* Frase animada exacta solicitada */}
          <div className="animacion-felicidades max-w-md">
            <p className="text-lg sm:text-xl font-extrabold text-slate-950 leading-relaxed">
              🎉 ¡Felicidades! No tienes tareas pendientes. Toca '+' para agregar una.
            </p>
          </div>

          <p className="text-base font-medium text-slate-700 mt-2">
            {filtro === 'completadas'
              ? 'Cuando termines tareas de tus materias escolares, las verás aquí.'
              : 'Disfruta tu tiempo libre o aprovecha para adelantar materias escolares.'}
          </p>
        </div>
      )}

      {/* Lista de tarjetas con alto contraste y texto >= 16 px */}
      <div className="space-y-3">
        {tareasOrdenadas.map((tarea) => {
          const vencida = !tarea.completada && estaVencida(tarea.fechaEntrega);
          const paraHoy = !tarea.completada && esParaHoy(tarea.fechaEntrega);
          const fechaInfo = formatearFechaAmigable(tarea.fechaEntrega);
          const confirmandoEliminar = tareaAEliminar === tarea.id;

          return (
            <article
              key={tarea.id}
              className={`bg-white rounded-2xl border-2 transition-all p-4 ${
                tarea.completada
                  ? 'border-slate-300 bg-slate-100/90 opacity-90'
                  : vencida
                  ? 'border-rose-400 bg-rose-50/60'
                  : paraHoy
                  ? 'border-amber-400 bg-amber-50/60'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Botón táctil secundario de marcar completada (mínimo 48x48 px) */}
                <button
                  type="button"
                  onClick={() => alAlternarCompletada(tarea.id)}
                  aria-label={tarea.completada ? `Marcar pendiente: ${tarea.titulo}` : `Completar: ${tarea.titulo}`}
                  className="min-w-[48px] min-h-[48px] flex items-center justify-center -ml-1 -mt-1 rounded-xl text-slate-600 hover:text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 shrink-0"
                >
                  {tarea.completada ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  ) : (
                    <Circle className="w-8 h-8 text-slate-700 hover:text-indigo-700 stroke-[2.5] transition-colors" />
                  )}
                </button>

                {/* Contenido principal de la tarea */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-base font-bold text-slate-900 mb-1">
                    <span className="text-slate-950 underline decoration-indigo-300 underline-offset-2">
                      {tarea.materia}
                    </span>
                    <span aria-hidden="true" className="text-slate-400">·</span>
                    <span className={`${
                      tarea.prioridad === 'Alta' ? 'text-rose-900 font-extrabold' :
                      tarea.prioridad === 'Media' ? 'text-amber-900 font-extrabold' : 'text-slate-800'
                    }`}>
                      Prioridad {tarea.prioridad}
                    </span>
                  </div>

                  {/* Título de la tarea (mínimo 16 px, aquí 18 px para jerarquía) */}
                  <h3
                    className={`text-lg sm:text-xl font-bold leading-snug break-words ${
                      tarea.completada
                        ? 'line-through text-slate-600'
                        : 'text-slate-950'
                    }`}
                  >
                    {tarea.titulo}
                  </h3>

                  {/* Fecha de entrega e indicadores de estado */}
                  <div className="flex items-center flex-wrap gap-2.5 mt-2.5 text-base">
                    <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                      <Calendar className="w-4 h-4 text-slate-700 shrink-0" />
                      <span>{fechaInfo.texto}</span>
                    </div>

                    {vencida && (
                      <div className="flex items-center gap-1 font-bold text-rose-950 bg-rose-200 px-2.5 py-1 rounded-lg border border-rose-400">
                        <AlertTriangle className="w-4 h-4 text-rose-800 shrink-0" />
                        <span>¡Atrasada! ({fechaInfo.relativo})</span>
                      </div>
                    )}

                    {paraHoy && !vencida && (
                      <div className="flex items-center gap-1 font-bold text-amber-950 bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-400">
                        <span>⚠️ ¡Se entrega hoy!</span>
                      </div>
                    )}

                    {tarea.completada && (
                      <span className="font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                        ✓ Tarea completada
                      </span>
                    )}
                  </div>
                </div>

                {/* Botón secundario para eliminar */}
                <div className="shrink-0 flex items-center">
                  {confirmandoEliminar ? (
                    <div className="flex flex-col sm:flex-row items-center gap-1.5 bg-rose-50 border-2 border-rose-300 p-1.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          alEliminarTarea(tarea.id);
                          setTareaAEliminar(null);
                        }}
                        className="min-h-[44px] px-3 bg-rose-700 text-white text-base font-bold rounded-lg hover:bg-rose-800 transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        type="button"
                        onClick={() => setTareaAEliminar(null)}
                        className="min-h-[44px] px-3 bg-slate-200 text-slate-900 text-base font-bold rounded-lg hover:bg-slate-300 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setTareaAEliminar(tarea.id)}
                      aria-label={`Eliminar tarea ${tarea.titulo}`}
                      title="Eliminar tarea"
                      className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-100 border border-slate-300 hover:border-rose-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
