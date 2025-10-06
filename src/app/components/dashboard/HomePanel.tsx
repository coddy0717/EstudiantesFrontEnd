'use client';

import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Star,
  TrendingUp,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { inscripcionService } from "@/services/inscripcionService";
import type { Inscripcion } from "@/app/types/models";

const MisCursos: React.FC = () => {
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerInscripciones();
  }, []);

  const obtenerInscripciones = async () => {
    try {
      const data = await inscripcionService.getMisInscripciones();
      console.log("Datos de inscripciones recibidos:", data);
      console.log("Primera inscripción:", data[0]);
      console.log(
        "Calificaciones:",
        data.map((item: Inscripcion) => ({
          id: item.id_Inscripcion,
          calificacion: item.calificacion,
          tipo: typeof item.calificacion,
        })),
      );
      setInscripciones(data);
      setLoading(false);
    } catch (err) {
      setError("Error al cargar los cursos. Por favor, intenta nuevamente.");
      setLoading(false);
      console.error("Error detallado:", err);
    }
  };

  // Función mejorada para verificar calificación float
  const tieneCalificacion = (inscripcion: Inscripcion) => {
    const calificacion = inscripcion.calificacion;
    console.log(
      `Verificando calificación para inscripción ${inscripcion.id_Inscripcion}:`,
      calificacion,
    );

    return (
      calificacion !== undefined &&
      calificacion !== null &&
      !isNaN(calificacion) &&
      calificacion > 0
    );
  };

  // Función para formatear calificación float
  const formatearCalificacion = (calificacion: number) => {
    // Si es entero, mostrar sin decimales, si tiene decimales mostrar 1 decimal
    return calificacion % 1 === 0
      ? calificacion.toString()
      : calificacion.toFixed(1);
  };

  const getCalificacionColor = (calificacion: number) => {
    if (calificacion >= 90) return "text-green-600 bg-green-50";
    if (calificacion >= 80) return "text-blue-600 bg-blue-50";
    if (calificacion >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getCalificacionIcon = (calificacion: number) => {
    if (calificacion >= 90) return "🎯";
    if (calificacion >= 80) return "⭐";
    if (calificacion >= 70) return "📊";
    return "📚";
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Error al cargar</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={obtenerInscripciones}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 font-medium"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Tus Materias</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Gestiona y revisa tu progreso académico
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {inscripciones.length}
                  </p>
                  <p className="text-sm text-gray-600">Total Cursos</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      inscripciones.filter(
                        (i) => tieneCalificacion(i) && i.calificacion! >= 70,
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Aprobados</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      inscripciones.filter(
                        (i) => tieneCalificacion(i) && i.calificacion! >= 90,
                      ).length
                    }
                  </p>
                  <p className="text-sm text-gray-600">Excelentes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">
                    {
                      new Set(
                        inscripciones.map((i) => i.paralelo?.numero_paralelo),
                      ).size
                    }
                  </p>
                  <p className="text-sm text-gray-600">Paralelos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cursos Grid */}
        {inscripciones.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-600 mb-2">
              No tienes cursos inscritos
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza tu journey académico inscribiéndote en cursos
            </p>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium">
              Explorar Cursos
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inscripciones.map((inscripcion) => (
              <div
                key={inscripcion.id_Inscripcion}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {inscripcion.carrera?.nombre || "Curso Sin Nombre"}
                      </h3>
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            Paralelo {inscripcion.paralelo?.numero_paralelo || "N/A"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Materia:{" "}
                            {inscripcion.paralelo?.materia?.nombre || "No asignada"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg 
                            className="w-4 h-4 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" 
                            />
                          </svg>
                          <span className="text-sm text-gray-500">
                            Aula {inscripcion.paralelo?.aula || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  {/* Calificación - MEJORADO PARA FLOAT */}
                  {tieneCalificacion(inscripcion) ? (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Calificación
                        </span>
                        <span className="text-2xl">
                          {getCalificacionIcon(inscripcion.calificacion!)}
                        </span>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getCalificacionColor(inscripcion.calificacion!)}`}
                      >
                        <Star className="w-4 h-4" />
                        {formatearCalificacion(inscripcion.calificacion!)} / 100
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">
                          Calificación
                        </span>
                        <span className="text-2xl">📝</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold text-gray-600 bg-gray-100">
                        <Clock className="w-4 h-4" />
                        Pendiente de calificación
                      </div>
                    </div>
                  )}

                  {/* Fecha */}
                  {inscripcion.fecha_inscripcion && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Inscrito el{" "}
                        {new Date(
                          inscripcion.fecha_inscripcion,
                        ).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar - SOLO SI HAY CALIFICACIÓN */}
                  {tieneCalificacion(inscripcion) && (
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progreso</span>
                        <span>
                          {formatearCalificacion(inscripcion.calificacion!)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            inscripcion.calificacion! >= 90
                              ? "bg-green-500"
                              : inscripcion.calificacion! >= 80
                                ? "bg-blue-500"
                                : inscripcion.calificacion! >= 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }`}
                          style={{ width: `${inscripcion.calificacion}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                  <button className="w-full bg-white text-blue-600 border border-blue-200 py-2 rounded-lg hover:bg-blue-50 transition duration-200 font-medium text-sm">
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MisCursos;