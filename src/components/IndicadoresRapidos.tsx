/**
 * Componente: IndicadoresRapidos
 * Muestra el resumen de tareas para el estudiante.
 * 
 * Cumplimiento estricto de requisitos de accesibilidad:
 * - Compatible con pantallas desde 320 px de ancho con una sola mano.
 * - Alto contraste para exteriores y lectura bajo el sol.
 * - Tipografía NUNCA menor a 16 px (text-base como mínimo en todo el componente).
 * - Estilos secundarios para no competir con el botón principal de la app.
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Clock, CalendarDays } from 'lucide-react';
import { MetricasTareas } from '../types/tarea';

interface IndicadoresRapidosProps {
  metricas: MetricasTareas;
  filtroActivo: 'pendientes' | 'completadas' | 'todas';
  alSeleccionarFiltro: (filtro: 'pendientes' | 'completadas' | 'todas') => void;
}

export const IndicadoresRapidos: React.FC<IndicadoresRapidosProps> = ({
  metricas,
  filtroActivo,
  alSeleccionarFiltro
}) => {
  return (
    <section aria-label="Resumen rápido de deberes escolares" className="w-full">
      {/* Cuadrícula adaptable desde 320 px: 2 columnas en móviles pequeños, 4 en pantallas amplias */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Tarjeta 1: Pendientes */}
        <button
          type="button"
          onClick={() => alSeleccionarFiltro('pendientes')}
          className={`flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all border-2 min-h-[96px] ${
            filtroActivo === 'pendientes'
              ? 'bg-indigo-50 border-indigo-700 shadow-sm'
              : 'bg-white border-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-base font-bold text-slate-900">
              Pendientes
            </span>
            <Clock className="w-5 h-5 text-indigo-700 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-950 tabular-nums">
              {metricas.totalPendientes}
            </span>
            <span className="text-base font-semibold text-slate-700">activas</span>
          </div>
        </button>

        {/* Tarjeta 2: Vencidas */}
        <div
          className={`flex flex-col justify-between p-3.5 rounded-2xl border-2 transition-all min-h-[96px] ${
            metricas.vencidas > 0
              ? 'bg-rose-50 border-rose-600 text-rose-950'
              : 'bg-white border-slate-300 text-slate-900'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className={`text-base font-bold ${
              metricas.vencidas > 0 ? 'text-rose-900' : 'text-slate-900'
            }`}>
              Vencidas
            </span>
            <AlertTriangle className={`w-5 h-5 shrink-0 ${
              metricas.vencidas > 0 ? 'text-rose-700' : 'text-slate-600'
            }`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-3xl font-extrabold tabular-nums ${
              metricas.vencidas > 0 ? 'text-rose-900' : 'text-slate-950'
            }`}>
              {metricas.vencidas}
            </span>
            <span className={`text-base font-semibold ${
              metricas.vencidas > 0 ? 'text-rose-800' : 'text-slate-700'
            }`}>
              atrasadas
            </span>
          </div>
        </div>

        {/* Tarjeta 3: Vencen Hoy */}
        <div className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border-2 border-slate-300 min-h-[96px]">
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-base font-bold text-amber-950">
              Para Hoy
            </span>
            <CalendarDays className="w-5 h-5 text-amber-700 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-slate-950 tabular-nums">
              {metricas.paraHoy}
            </span>
            <span className="text-base font-semibold text-slate-700">urgentes</span>
          </div>
        </div>

        {/* Tarjeta 4: Entregadas Hoy */}
        <button
          type="button"
          onClick={() => alSeleccionarFiltro('completadas')}
          className={`flex flex-col justify-between p-3.5 rounded-2xl text-left transition-all border-2 min-h-[96px] ${
            filtroActivo === 'completadas'
              ? 'bg-emerald-50 border-emerald-700 shadow-sm'
              : 'bg-white border-slate-300 hover:border-slate-500'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-base font-bold text-emerald-950">
              Logradas
            </span>
            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-emerald-900 tabular-nums">
              {metricas.entregadasHoy}
            </span>
            <span className="text-base font-semibold text-emerald-800">hoy</span>
          </div>
        </button>
      </div>
    </section>
  );
};
