<img width="1280" height="720" alt="Logo" src="https://github.com/user-attachments/assets/73af88d1-5d19-4963-b98a-d99c15f67c23" />
<h2>Introducción y funcionalidades</h2>

<p>
<b>ShowMeShows</b> es una aplicación web centrada en el mundo de las series de entretenimiento cuyo objetivo es ofrecer un espacio social donde los usuarios puedan descubrir nuevo contenido, compartir sus opiniones y llevar un seguimiento organizado de las series que siguen.
</p>

<p>
La plataforma permite:
</p>

<ul>
  <li>Crear listas personalizadas</li>
  <li>Consultar la actividad de otros usuarios</li>
  <li>Acceder a información detallada de cada serie</li>
  <li>Llevar un registro de series vistas, pendientes o favoritas</li>
</ul>

<p>
En conclusión, ShowMeShows busca reunir en un solo lugar herramientas que actualmente se encuentran dispersas en distintas webs, proporcionando una experiencia completa y orientada exclusivamente al ámbito de las series.
</p>

<hr>

<h2>Motivación</h2>

<p>
La motivación principal para el desarrollo de este proyecto surge de la falta de plataformas enfocadas únicamente en series. Como usuaria habitual de aplicaciones de seguimiento y descubrimiento de contenido audiovisual, observé que la mayoría de estas se centran en películas o combinan ambos formatos sin ofrecer una experiencia específica para el público seriéfilo.
</p>

<p>
Esta carencia me llevó a considerar esta idea como una oportunidad ideal para desarrollar una solución centrada exclusivamente en las series y crear un proyecto que resultara útil y diferenciador.
</p>

<hr>

## Demo de la aplicación

[![Demo de la aplicación](https://img.youtube.com/vi/jw2OtHrI2HA/0.jpg)](https://youtu.be/jw2OtHrI2HA)

En este vídeo se muestra una demo funcional de la aplicación, recorriendo el flujo principal y las características más importantes del proyecto.



<h2>3. Análisis y diseño del proyecto</h2>

<h3>3.1 Descripción de la arquitectura web</h3>

<p>
ShowMeShows utiliza una arquitectura basada en una <b>SPA (Single Page Application)</b> en el lado cliente y una <b>API REST</b> en el lado del servidor.
</p>

<p>
El frontend está desarrollado con <b>Angular</b>, que gestiona la navegación mediante un enrutador sin necesidad de recargar la página completa. Cada apartado de la aplicación (listas, favoritos, actividad, perfil, etc.) se representa como un componente independiente renderizado dinámicamente.
</p>

<p>
El backend está desarrollado con <b>Node.js</b> y <b>Express</b>, estructurado mediante controladores, modelos y rutas. Se encarga de procesar la autenticación, gestión de listas, reseñas y usuarios.
</p>

<p>
Ambas partes se comunican mediante peticiones HTTP en formato JSON siguiendo un modelo tradicional cliente-servidor.
</p>

<hr>

<h3>3.2 Tecnologías y herramientas</h3>

<h4>Frontend</h4>
<table border="1" cellpadding="6">
  <tr>
    <th>Tecnología</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td>Angular 19</td>
    <td>Framework para la construcción del frontend</td>
  </tr>
  <tr>
    <td>TypeScript</td>
    <td>Lenguaje principal del proyecto</td>
  </tr>
  <tr>
    <td>Angular Router</td>
    <td>Gestión del enrutamiento entre vistas</td>
  </tr>
  <tr>
    <td>RxJS</td>
    <td>Programación reactiva y asincrona</td>
  </tr>
  <tr>
    <td>CSS</td>
    <td>Estilos de la aplicación</td>
  </tr>
  <tr>
    <td>Bootstrap Icons</td>
    <td>Iconos utilizados en la interfaz</td>
  </tr>
</table>

<h4>Backend</h4>
<table border="1" cellpadding="6">
  <tr>
    <th>Tecnología</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td>Node.js</td>
    <td>Entorno de ejecución del servidor</td>
  </tr>
  <tr>
    <td>Express.js</td>
    <td>Framework para la API REST</td>
  </tr>
  <tr>
    <td>Mongoose</td>
    <td>ODM para MongoDB</td>
  </tr>
</table>

<h4>Base de datos</h4>
<ul>
  <li><b>MongoDB</b> — Base de datos NoSQL</li>
  <li>Estructuración mediante documentos JSON</li>
</ul>

<h4>Integración y pruebas</h4>
<ul>
  <li><b>API TMDB</b> — Información de series</li>
  <li><b>Postman</b> — Pruebas de endpoints</li>
  <li><b>Git & GitHub</b> — Control de versiones</li>
</ul>

<h4>Otras herramientas</h4>
<ul>
  <li>Figma — Diseño y prototipado</li>
  <li>Visual Studio Code — Entorno de desarrollo</li>
</ul>

<hr>

<h3>3.3 Análisis de usuarios</h3>

<ul>
  <li>
    <b>Usuario invitado:</b> acceso al home y opción de registro o inicio de sesión.
  </li>
  <li>
    <b>Usuario registrado:</b> acceso completo a todas las funcionalidades de la aplicación.
  </li>
</ul>

<hr>

<h3>3.4 Requisitos funcionales y no funcionales</h3>

<h4>Requisitos funcionales</h4>
<ul>
  <li>Registro e inicio de sesión</li>
  <li>Búsqueda y visualización de series</li>
  <li>Creación y gestión de listas</li>
  <li>Seguimiento de series</li>
  <li>Publicación de opiniones</li>
  <li>Visualización de actividad social</li>
  <li>Seguimiento de usuarios y visualización de perfiles</li>
</ul>

<h4>Requisitos no funcionales</h4>
<ul>
  <li>Navegación fluida sin recargas</li>
  <li>Seguridad mediante autenticación JWT</li>
  <li>Interfaz usable y responsive</li>
  <li>Arquitectura escalable</li>
</ul>

<hr>

<h3>3.5 Mapa del sitio</h3>

<h4>Páginas públicas</h4>
<ul>
  <li>/ — Home</li>
  <li>/login — Inicio de sesión</li>
  <li>/registro — Registro</li>
</ul>

<h4>Páginas principales (usuario autenticado)</h4>
<ul>
  <li>/favoritas — Series favoritas</li>
  <li>/listas — Gestión de listas</li>
  <li>/listas/:id — Detalle de lista</li>
  <li>/serie/:id — Información de una serie</li>
  <li>/descubre — Descubrimiento de series</li>
  <li>/perfil — Perfil propio</li>
  <li>/usuario/:username — Perfil de otro usuario</li>
  <li>/seguimiento — Seguimiento de series</li>
  <li>/actividad — Feed social</li>
  <li>/listas-publicas — Top 50 listas públicas</li>
</ul>

<hr>

<h2>3.6 Organización de la Lógica del Backend</h2>

<p>
El backend de <strong>ShowMeShows</strong> sigue una estructura modular basada en una API REST,
permitiendo una correcta separación de responsabilidades y facilitando el mantenimiento del sistema.
</p>

<ul>
  <li>
    <strong>Rutas:</strong> Gestionan las peticiones HTTP y las redirigen a los controladores correspondientes.
  </li>
  <li>
    <strong>Controladores:</strong> Implementan la lógica de negocio relacionada con usuarios, listas,
    opiniones, favoritos y seguimiento de series.
  </li>
  <li>
    <strong>Middleware JWT:</strong> Protege las rutas privadas y controla el acceso de los usuarios autenticados.
  </li>
  <li>
    <strong>Modelos (Mongoose):</strong> Definen la estructura de los datos almacenados en MongoDB.
  </li>
  <li>
    <strong>API externa:</strong> El servidor se comunica con la API de <strong>TMDB</strong> para obtener
    información actualizada sobre las series.
  </li>
</ul>

<hr>

<h3>3.7 Modelo de datos simplificado</h3>

<p>
La aplicación utiliza una base de datos <strong>NoSQL (MongoDB)</strong>, donde la información se almacena
en forma de documentos JSON. A continuación se describen las principales colecciones del sistema,
indicando su finalidad y las relaciones existentes entre ellas.
</p>

<table border="1" cellpadding="6">
<thead>
    <tr>
      <th>Colección</th>
      <th>Descripción</th>
      <th>Relaciones principales</th>
    </tr>
  </thead>
  <tbody>
<tr>
<td><strong>usuarios</strong></td>
<td>
Almacena la información de los usuarios registrados en la plataforma, así como sus datos de
autenticación y relaciones sociales.
</td>
<td>
• Puede crear múltiples listas<br>
• Puede seguir y ser seguido por otros usuarios<br>
• Puede marcar series como favoritas<br>
• Puede realizar opiniones y seguimientos
</td>
</tr>

<tr>
<td><strong>listas</strong></td>
<td>
Representa listas personalizadas de series creadas por los usuarios. Estas listas pueden ser
públicas o privadas y recibir interacciones del resto de usuarios.
</td>
<td>
• Pertenece a un usuario creador<br>
• Contiene múltiples series (IDs de TMDB)<br>
• Puede recibir likes de otros usuarios
</td>
</tr>

<tr>
<td><strong>opiniones</strong></td>
<td>
Almacena las reseñas y valoraciones que los usuarios realizan sobre las series, incluyendo
puntuaciones y comentarios.
</td>
<td>
• Asociada a un usuario<br>
• Asociada a una serie (ID de TMDB)<br>
• Puede recibir interacciones (me gusta)
</td>
</tr>

<tr>
<td><strong>seguimientoSeries</strong></td>
<td>
Guarda el progreso de visualización de cada usuario sobre las series que está siguiendo,
indicando el estado y avance de episodios y temporadas.
</td>
<td>
• Asociado a un usuario<br>
• Asociado a una serie (ID de TMDB)<br>
• Permite controlar el estado de visualización
</td>
</tr>
</tbody>
</table>
<hr>

<h2>4. Conclusiones</h2>

<h3>Resultados obtenidos y cumplimiento de objetivos</h3>

<p>
El proyecto <strong>ShowMeShows</strong> ha cumplido los objetivos definidos,
desarrollando una aplicación web que permite descubrir series mediante una API externa,
gestionar el seguimiento personal y fomentar la interacción social entre usuarios.
</p>

<p>
Se han implementado funcionalidades como la creación de listas personalizadas, el control del
progreso de visualización, la publicación de reseñas y la visualización de la actividad de otros
usuarios, ofreciendo una experiencia completa y coherente con la idea inicial del proyecto.
</p>

<h3>Retos encontrados y soluciones implementadas</h3>

<p>
Entre los principales retos destacan la integración de la API de TMDB y la implementación de un
sistema de autenticación seguro mediante JWT. Estos desafíos se resolvieron centralizando las
peticiones externas desde el backend y utilizando middleware para proteger las rutas privadas.
</p>


<h3>Aprendizajes y mejoras futuras</h3>

<p>
El desarrollo del proyecto ha permitido afianzar conocimientos en desarrollo full stack,
arquitecturas cliente-servidor y consumo de APIs externas.
</p>

<p>
Como mejoras futuras se plantea la incorporación de un chat en tiempo real entre usuarios,
la implementación de recomendaciones inteligentes basadas en los gustos del usuario y la
ampliación de las interacciones sociales dentro de la plataforma.
</p>

<hr>

<h2>5. Bibliografía y fuentes de información</h2>

<ul>
  <li><b>TMDB (The Movie Database) API:</b> Fuente principal de información sobre series y películas. 
      <a href="https://www.themoviedb.org/documentation/api" target="_blank">Documentación oficial</a>.
  </li>
  <li><b>Bootstrap Icons:</b> Conjunto de iconos utilizados en la interfaz. 
      <a href="https://icons.getbootstrap.com/" target="_blank">Sitio oficial</a>.
  </li>
  <li><b>Angular:</b> Framework utilizado para el desarrollo del frontend. 
      <a href="https://angular.io/" target="_blank">Documentación oficial</a>.
  </li>
</ul>

<h2>6. Anexos</h2>
<h3>6.1 Guía de instalación, configuración y despliegue</h3>

<p>Este proyecto está desarrollado con Angular en el frontend y Node.js/Express en el backend. A continuación, se detallan los pasos para ponerlo en funcionamiento:</p>

<ol>
  <li>Clonar el repositorio: <code>git clone https://github.com/TFGS-2DAW-Sept-Dic-2025-2026/SofiaGomezGarcia_TFG.git</code></li>
  <li>Instalar dependencias del backend: <code>cd .\nodejs\ && npm install</code></li>
  <li>Iniciar el servidor backend: <code>npm start</code></li>
  <li>Instalar dependencias del frontend: <code>cd .\angular\ npm install</code></li>
  <li>Iniciar el servidor de desarrollo de Angular: <code>ng serve</code></li>
</ol>
<hr>

<p><b>Proyecto desarrollado por <strong>Sofía Gómez García</strong>, Desarrollo de Aplicaciones Web 2025 IES Alonso de Avellaneda</p>

