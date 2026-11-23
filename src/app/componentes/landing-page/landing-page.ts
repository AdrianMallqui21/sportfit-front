import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-landing-page',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatCardModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css',
})
export class LandingPage {
  menuAbierto = false;
  indiceEspacios = 0;
  indiceTestimonios = 0;

  ventajas = [
    {
      icono: 'search',
      titulo: 'Busca y compara',
      descripcion: 'Encuentra canchas por deporte, ubicación y precio.',
    },
    {
      icono: 'event_available',
      titulo: 'Reserva al instante',
      descripcion: 'Elige tu horario y asegura tu turno.',
    },
    {
      icono: 'credit_card',
      titulo: 'Paga de forma segura',
      descripcion: 'Consulta las opciones de pago disponibles.',
    },
    {
      icono: 'groups',
      titulo: 'Disfruta el deporte',
      descripcion: 'Vive grandes momentos con tu equipo.',
    },
  ];

  pasos = [
    {
      numero: '01',
      titulo: 'Elige tu cancha',
      descripcion: 'Explora las sedes, selecciona el deporte y encuentra un espacio disponible.',
      detalle: 'Filtra según tu preferencia',
      color: 'verde',
    },
    {
      numero: '02',
      titulo: 'Reserva y paga seguro',
      descripcion: 'Escoge el horario que prefieras y sigue los pasos para completar tu reserva.',
      detalle: 'Proceso fácil y rápido',
      color: 'naranja',
    },
    {
      numero: '03',
      titulo: 'Juega y disfruta',
      descripcion: 'Preséntate en la sede a la hora reservada y disfruta de tu partido.',
      detalle: 'Una mejor experiencia',
      color: 'oscuro',
    },
  ];

  espacios = [
    {
      nombre: 'Sede Surco',
      direccion: 'Surco, Lima',
      precio: 60,
      imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=900&q=80',
      deporte: 'Fútbol',
    },
    {
      nombre: 'Sede San Miguel',
      direccion: 'San Miguel, Lima',
      precio: 50,
      imagen: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=900&q=80',
      deporte: 'Tenis',
    },
    {
      nombre: 'Sede Monterrico',
      direccion: 'Monterrico, Lima',
      precio: 55,
      imagen: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=900&q=80',
      deporte: 'Básquet',
    },
    {
      nombre: 'Sede La Molina',
      direccion: 'La Molina, Lima',
      precio: 70,
      imagen: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900&q=80',
      deporte: 'Fútbol',
    },
  ];

  beneficios = [
    {
      icono: 'calendar_month',
      titulo: 'Reservas rápidas y seguras',
      descripcion: 'Reserva tu cancha en pocos pasos desde cualquier lugar.',
      imagen: '/beneficios-movil.png',
    },
    {
      icono: 'sports_soccer',
      titulo: 'Diversidad de deportes',
      descripcion: 'Fútbol, tenis, básquet y más opciones para elegir.',
      imagen: '/beneficio-deporte.png',
    },
    {
      icono: 'location_on',
      titulo: 'Múltiples sedes',
      descripcion: 'Encuentra instalaciones cercanas a tu ubicación.',
      imagen: '/beneficio-multiples.png',
    },
    {
      icono: 'groups',
      titulo: 'Ideal para grupos',
      descripcion: 'Organiza encuentros con amigos, familiares o compañeros.',
      imagen: '/beneficio-idealparagrupos.png',
    },
    {
      icono: 'payments',
      titulo: 'Pagos sencillos',
      descripcion: 'Revisa los métodos disponibles y confirma tu reserva.',
      imagen: '/beneficio-grupos.png',
    },
    {
      icono: 'star_outline',
      titulo: 'Mejor experiencia deportiva',
      descripcion: 'Más comodidad para disfrutar al máximo cada partido.',
      imagen: '/beneficio-mejorexperiencia.png',
    },
  ];

  testimonios = [
    {
      iniciales: 'DR',
      nombre: 'Diego R.',
      tipo: 'Jugador',
      texto:
        'La plataforma es muy fácil de usar. Ahora puedo reservar mi cancha en minutos y sin complicaciones.',
      etiqueta: 'Rápido y práctico',
      tono: 'rosa',
    },
    {
      iniciales: 'VM',
      nombre: 'Valeria M.',
      tipo: 'Estudiante',
      texto: 'Me encanta poder ver la disponibilidad y elegir la cancha que más me gusta.',
      etiqueta: 'Disponibilidad real',
      tono: 'azul',
    },
    {
      iniciales: 'AT',
      nombre: 'Andrés T.',
      tipo: 'Organizador',
      texto: 'Organizar partidos y encontrar horarios disponibles es mucho más sencillo.',
      etiqueta: 'Organización',
      tono: 'verde',
    },
  ];

  preguntas = [
    {
      pregunta: '¿Cómo puedo reservar una cancha?',
      respuesta:
        'Regístrate, selecciona una sede, el deporte, la fecha y la hora disponible. Luego sigue los pasos para confirmar tu reserva.',
    },
    {
      pregunta: '¿Qué métodos de pago aceptan?',
      respuesta: 'Consulta en el proceso de reserva los métodos habilitados para tu sede.',
    },
    {
      pregunta: '¿Puedo cancelar o reprogramar mi reserva?',
      respuesta:
        'Puedes solicitar la cancelación o reprogramación de acuerdo con las condiciones y plazos de la reserva.',
    },
  ];

  get espaciosVisibles() {
    return [
      ...this.espacios.slice(this.indiceEspacios),
      ...this.espacios.slice(0, this.indiceEspacios),
    ];
  }

  get testimoniosVisibles() {
    return [
      ...this.testimonios.slice(this.indiceTestimonios),
      ...this.testimonios.slice(0, this.indiceTestimonios),
    ];
  }

  moverEspacios(direccion: number) {
    this.indiceEspacios =
      (this.indiceEspacios + direccion + this.espacios.length) % this.espacios.length;
  }

  moverTestimonios(direccion: number) {
    this.indiceTestimonios =
      (this.indiceTestimonios + direccion + this.testimonios.length) % this.testimonios.length;
  }

  irASeccion(event: Event, id: string) {
    event.preventDefault();
    this.menuAbierto = false;

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}
