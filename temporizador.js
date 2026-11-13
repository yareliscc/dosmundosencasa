function crearTemporizadorVisual(idContenedor) {
  const contenedor = document.getElementById(idContenedor);
  if (!contenedor) return;

  let tiempoTotalSegundos = 120; // 2 minutos por defecto
  let tiempoRestante = 120;
  let intervalo = null;
  let enMarcha = false;

  // Inyectar estructura HTML del reloj visual
  contenedor.innerHTML = `
    <div class="caja-temporizador-visual">
      <p class="titulo-timer">⏳ Temporizador Visual</p>
      
      <div class="reloj-visual-contenedor">
        <div class="disco-progreso" id="${idContenedor}-disco"></div>
        <div class="centro-reloj">
          <span class="tiempo-digital" id="${idContenedor}-texto">02:00</span>
          <span class="estado-timer" id="${idContenedor}-estado">Listo</span>
        </div>
      </div>

      <div class="presets-timer">
        <button type="button" class="btn-preset" data-min="1">1 min</button>
        <button type="button" class="btn-preset activo" data-min="2">2 min</button>
        <button type="button" class="btn-preset" data-min="3">3 min</button>
        <button type="button" class="btn-preset" data-min="5">5 min</button>
        <button type="button" class="btn-preset" data-min="10">10 min</button>
        <button type="button" class="btn-preset" data-min="15">15 min</button>
        <button type="button" class="btn-preset" data-min="30">30 min</button>
        <button type="button" class="btn-preset" data-min="45">45 min</button>
      </div>

      <div class="controles-timer">
        <button type="button" class="btn-timer-accion btn-iniciar" id="${idContenedor}-btn-play">▶ Iniciar</button>
        <button type="button" class="btn-timer-accion btn-reiniciar" id="${idContenedor}-btn-reset">↺ Reiniciar</button>
      </div>
    </div>
  `;

  const disco = document.getElementById(`${idContenedor}-disco`);
  const textoTiempo = document.getElementById(`${idContenedor}-texto`);
  const textoEstado = document.getElementById(`${idContenedor}-estado`);
  const btnPlay = document.getElementById(`${idContenedor}-btn-play`);
  const btnReset = document.getElementById(`${idContenedor}-btn-reset`);
  const botonesPreset = contenedor.querySelectorAll('.btn-preset');

  function actualizarVista() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    textoTiempo.textContent = `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;

    // Calcular ángulo y color según porcentaje restante
    const porcentaje = tiempoTotalSegundos > 0 ? (tiempoRestante / tiempoTotalSegundos) : 0;
    const grados = porcentaje * 360;

    let color = '#2ecc71'; // Verde (mucho tiempo)
    if (porcentaje <= 0.5 && porcentaje > 0.2) {
      color = '#f1c40f'; // Amarillo (mitad del tiempo)
    } else if (porcentaje <= 0.2) {
      color = '#e74c3c'; // Rojo (queda poco)
    }

    disco.style.background = `conic-gradient(${color} ${grados}deg, #ecf0f1 0deg)`;
  }

  function hablarAviso(mensaje) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const voz = new SpeechSynthesisUtterance(mensaje);
      voz.lang = 'es-ES';
      voz.rate = 0.85;
      window.speechSynthesis.speak(voz);
    }
  }

  function iniciarPausar() {
    if (enMarcha) {
      // Pausar
      clearInterval(intervalo);
      enMarcha = false;
      btnPlay.textContent = '▶ Continuar';
      btnPlay.className = 'btn-timer-accion btn-iniciar';
      textoEstado.textContent = 'En pausa';
    } else {
      // Iniciar
      if (tiempoRestante <= 0) tiempoRestante = tiempoTotalSegundos;
      enMarcha = true;
      btnPlay.textContent = '⏸ Pausar';
      btnPlay.className = 'btn-timer-accion btn-pausar';
      textoEstado.textContent = 'Corriendo...';

      intervalo = setInterval(() => {
        tiempoRestante--;
        actualizarVista();

        if (tiempoRestante <= 0) {
          clearInterval(intervalo);
          enMarcha = false;
          btnPlay.textContent = '▶ Iniciar';
          btnPlay.className = 'btn-timer-accion btn-iniciar';
          textoEstado.textContent = '¡Tiempo terminado!';
          hablarAviso('El tiempo ha terminado. ¡Muy bien!');
        }
      }, 1000);
    }
  }

  function reiniciar() {
    clearInterval(intervalo);
    enMarcha = false;
    tiempoRestante = tiempoTotalSegundos;
    btnPlay.textContent = '▶ Iniciar';
    btnPlay.className = 'btn-timer-accion btn-iniciar';
    textoEstado.textContent = 'Listo';
    actualizarVista();
  }

  // Eventos de botones de minutos
  botonesPreset.forEach(btn => {
    btn.addEventListener('click', () => {
      botonesPreset.forEach(b => b.classList.remove('activo'));
      btn.classList.add('activo');
      tiempoTotalSegundos = parseInt(btn.getAttribute('data-min')) * 60;
      reiniciar();
    });
  });

  btnPlay.addEventListener('click', iniciarPausar);
  btnReset.addEventListener('click', reiniciar);

  actualizarVista();
}
