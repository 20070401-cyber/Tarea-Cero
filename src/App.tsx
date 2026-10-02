/**
 * Tarea Cero - Aplicación principal
 *
 * Diseñada para estudiantes de bachillerato:
 * 1. Formulario para registrar una nueva tarea (Materia, Título, Fecha de entrega y Prioridad).
 * 2. Lista visual de tareas pendientes con opción de marcar como completada o eliminar.
 * 3. Indicador rápido que muestra cuántas pendientes hay, cuántas vencidas y cuántas entregadas hoy.
 *
 * ⚠️ PUNTOS DONDE LA GENTE SUELE EQUIVOCARSE:
 * 1. Estado desincronizado con localStorage: Si se usa un `useEffect` que depende de `tareas`
 *    para guardar, asegurarse de no sobreescribir el almacenamiento con un array vacío en el primer render.
 * 2. Cálculo de métricas sin `useMemo`: En listas largas o actualizaciones frecuentes,
 *    recalcular los filtros en cada re-render innecesario degrada el rendimiento en móviles de gama media/baja.
 * 3. Generación de IDs con `crypto.randomUUID()`: Si el navegador es antiguo o no corre
 *    en HTTPS (contexto inseguro), `crypto.randomUUID` puede ser `undefined`. Implementamos
 *    un generador seguro con fallback automático.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CheckSquare, BookOpen, Plus, GraduationCap } from 'lucide-react';
import { Tarea, FiltroEstado, MetricasTareas } from './types/tarea';
import { estaVencida, esParaHoy, esFechaDeHoy } from './utils/dateUtils';
import { cargarTareasDesdeStorage, guardarTareasEnStorage } from './utils/storage';
import { IndicadoresRapidos } from './components/IndicadoresRapidos';
import { FormularioTarea } from './components/FormularioTarea';
import { ListaTareas } from './components/ListaTareas';

/**
 * Generador de ID robusto con fallback para evitar cuelgues si `crypto.randomUUID`
 * no está disponible en un navegador escolar o webview restringido.
 */
function generarIdSeguro(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `tarea-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export default function App() {
  // Inicialización diferida usando función para no leer localStorage en cada render
  const [tareas, setTareas] = useState<Tarea[]>(() => cargarTareasDesdeStorage());
  const [filtroActivo, setFiltroActivo] = useState<FiltroEstado>('pendientes');
  const [mostrarFormularioMobile, setMostrarFormularioMobile] = useState<boolean>(true);

  // Sincronizar con localStorage en cada cambio de tareas
  useEffect(() => {
    guardarTareasEnStorage(tareas);
  }, [tareas]);

  /**
   * Cálculo reactivo y memorizado de los indicadores rápidos
   */
  const metricas: MetricasTareas = useMemo(() => {
    let totalPendientes = 0;
    let vencidas = 0;
    let entregadasHoy = 0;
    let paraHoy = 0;

    for (const tarea of tareas) {
      if (!tarea.completada) {
        totalPendientes++;
        if (estaVencida(tarea.fechaEntrega)) {
          vencidas++;
        } else if (esParaHoy(tarea.fechaEntrega)) {
          paraHoy++;
        }
      } else {
        // Tareas marcadas como completadas hoy
        if (esFechaDeHoy(tarea.completadaEn)) {
          entregadasHoy++;
        }
      }
    }

    return { totalPendientes, vencidas, entregadasHoy, paraHoy };
  }, [tareas]);

  /**
   * 1. Registrar nueva tarea
   */
  const agregarTarea = (datosNuevaTarea: Omit<Tarea, 'id' | 'completada' | 'creadaEn'>) => {
    const nueva: Tarea = {
      ...datosNuevaTarea,
      id: generarIdSeguro(),
      completada: false,
      creadaEn: new Date().toISOString()
    };

    // Agregamos al inicio para que el estudiante vea su nueva tarea de inmediato
    setTareas((prev) => [nueva, ...prev]);

    // Si estaba viendo solo completadas, cambiar a pendientes para ver la tarea recién creada
    if (filtroActivo === 'completadas') {
      setFiltroActivo('pendientes');
    }
  };

  /**
   * 2. Marcar como completada o pendiente
   */
  const alternarCompletada = (id: string) => {
    setTareas((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const nuevoEstado = !t.completada;
        return {
          ...t,
          completada: nuevoEstado,
          completadaEn: nuevoEstado ? new Date().toISOString() : undefined
        };
      })
    );
  };

  /**
   * 2. Eliminar tarea
   */
  const eliminarTarea = (id: string) => {
    setTareas((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 pb-16">
      {/* Barra superior (Top Bar Contract) */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Zona 1: Título de marca */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <CheckSquare className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
                TAREA CERO
              </span>
            </div>
          </div>

          {/* Zona 2 & 3: Indicador sutil de bachillerato y acción rápida */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-lg">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bachillerato</span>
            </span>

            <button
              type="button"
              onClick={() => setMostrarFormularioMobile((prev) => !prev)}
              className="sm:hidden text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1 min-h-[36px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{mostrarFormularioMobile ? 'Ocultar' : 'Nueva'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal centrado para celular y escritorio */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        {/* Encabezado descriptivo amigable para el estudiante */}
        <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Planificador escolar</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Organiza tus pendientes sin complicaciones
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Registra tus deberes escolares, controla qué urge entregar hoy y mantén tu lista en cero.
            </p>
          </div>
        </section>

        {/* 3. Indicador rápido */}
        <IndicadoresRapidos
          metricas={metricas}
          filtroActivo={filtroActivo}
          alSeleccionarFiltro={(nuevoFiltro) => setFiltroActivo(nuevoFiltro)}
        />

        {/* 1. Formulario de registro */}
        <div className={mostrarFormularioMobile ? 'block' : 'hidden sm:block'}>
          <FormularioTarea alGuardarTarea={agregarTarea} />
        </div>

        {/* 2. Lista visual de tareas */}
        <ListaTareas
          tareas={tareas}
          filtro={filtroActivo}
          alCambiarFiltro={setFiltroActivo}
          alAlternarCompletada={alternarCompletada}
          alEliminarTarea={eliminarTarea}
        />
      </main>
    </div>
  );
}
