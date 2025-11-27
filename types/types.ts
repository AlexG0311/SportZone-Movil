export interface Imagen {
  id: number;
  escenarioId: number;
  url: string;
  descripcion: string;
  orden: number;
  createdAt: string;
}

export interface Estado {
  id: number;
  nombre: string;
}

export interface Encargado {
  id: number;
  nombre: string;
  email: string;
}

export interface Escenario {
  id: number;
  nombre: string;
  tipo: string;
  estadoId: number;
  imagenes: Imagen[];
  descripcion: string;
  precio: string; // Viene como string del backend
  direccion: string;
  latitud: string; // Viene como string del backend
  longitud: string; // Viene como string del backend
  capacidad: number;
  estado: Estado;
  encargado: Encargado;
}



export const getImagenPrincipal = (imagenes: Imagen[]): string => {
  if (!imagenes || imagenes.length === 0) {
    return 'https://via.placeholder.com/400x300?text=Sin+imagen';
  }
  const imagenPrincipal = imagenes.find(img => img.orden === 0);
  return imagenPrincipal?.url || imagenes[0].url;
}