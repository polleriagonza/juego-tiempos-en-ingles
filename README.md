# 🎮 Juego de Tiempos Verbales en Inglés

Un juego educativo interactivo para aprender y practicar la identificación de tiempos verbales en inglés.

## 📋 Descripción

Este juego te ayuda a aprender los tiempos verbales en inglés de manera divertida e interactiva. El juego:

- Selecciona un verbo al azar de la base de datos
- Presenta conjugaciones mezcladas aleatoriamente
- Te pide identificar el tiempo verbal, la variación y el tipo de oración
- Proporciona retroalimentación inmediata
- Muestra estadísticas de aciertos y errores

## 🎯 Objetivos de Aprendizaje

- Identificar **4 tiempos verbales**:
  - Presente Simple
  - Presente Continuo
  - Presente Perfecto
  - Presente Perfecto Continuo

- Reconocer **3 tipos de oraciones**:
  - Positivas
  - Negativas
  - Interrogativas

- Aprender **4 variaciones** por cada tiempo verbal

## 🚀 Cómo Jugar

1. **Abrir el juego**: Abre el archivo `index.html` en tu navegador web
2. **Comenzar**: Haz clic en "Comenzar Juego"
3. **Leer la oración**: Lee la oración en inglés y su traducción
4. **Seleccionar respuestas**: Elige la opción correcta para cada pregunta:
   - ¿Qué tiempo verbal es?
   - ¿Qué variación es?
   - ¿Qué tipo de oración es?
5. **Responder**: Haz clic en "Responder" para verificar tus respuestas
6. **Continuar**: Haz clic en "Siguiente" para pasar a la siguiente pregunta
7. **Ver resultados**: Al final verás tus estadísticas de aciertos y errores

## 📁 Estructura de Archivos

```
JuegoIngles/
├── index.html          # Página principal del juego
├── styles.css          # Estilos y diseño
├── script.js           # Lógica del juego
├── verbos.json         # Base de datos de verbos y conjugaciones
└── README.md           # Este archivo
```

## 🎨 Características

- **Interfaz moderna y atractiva** con gradientes y animaciones
- **Diseño responsive** que funciona en móviles y tablets
- **Retroalimentación visual** con colores para aciertos y errores
- **Barra de progreso** para seguir tu avance
- **Estadísticas en tiempo real** de aciertos y errores
- **Mezcla aleatoria** de conjugaciones para mayor variedad

## 🔧 Tecnologías Utilizadas

- **HTML5**: Estructura de la página
- **CSS3**: Estilos y animaciones
- **JavaScript ES6+**: Lógica del juego
- **JSON**: Almacenamiento de datos de verbos

## 📊 Sistema de Puntuación

- **Acierto completo**: 3 puntos (tiempo + variación + tipo correctos)
- **Acierto parcial**: 0 puntos (debe acertar las 3 para contar como acierto)
- **Porcentaje final**: Calculado sobre el total de preguntas

## 🎓 Beneficios Educativos

- **Aprendizaje por repetición**: Las conjugaciones se presentan de forma aleatoria
- **Identificación visual**: Asociar estructuras gramaticales con nombres
- **Práctica constante**: Múltiples conjugaciones por verbo
- **Retroalimentación inmediata**: Aprender de los errores al instante

## 🔄 Cómo Agregar Más Verbos

Para agregar más verbos al juego, edita el archivo `verbos.json` siguiendo la estructura existente:

```json
{
    "verbos": [
        {
            "id": 2,
            "verbo": "work",
            "traduccion": "trabajar",
            "conjugar_pronombre": [
                {
                    "pronombre": "I",
                    "traduccion": "yo",
                    "conjugar_tiempos": {
                        "tiempo_presente": {
                            // Agregar las 4 variaciones con sus 3 tipos
                        }
                    }
                }
            ]
        }
    ]
}
```

## 🎯 Consejos para Mejorar

- **Practica regularmente**: Juega varias veces para memorizar patrones
- **Presta atención a los auxiliares**: Te ayudan a identificar tiempos
- **Lee las traducciones**: Comprender el significado facilita la identificación
- **Analiza la estructura**: Busca patrones en las conjugaciones

¡Disfruta aprendiendo inglés de manera divertida! 🎉
