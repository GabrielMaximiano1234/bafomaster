// Bafo Master - Jogo de Figurinha Retrô
// Lógica do Jogo, Motor de Precisão, IA do BOT e Simulação Online

// --- ÁUDIO NATIVO (SINTETIZADOR WEB AUDIO API) ---
let audioCtx = null;

function playSound(type) {
  // Inicialização sob demanda após interação do usuário
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Resumir se estiver suspenso (política de autoplay do navegador)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  try {
    const osc = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === "success") {
      // Som de tapa seco e estalo de figurinha virando
      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      
      osc.start(now);
      osc.stop(now + 0.15);
    } 
    else if (type === "fail") {
      // Som abafado de impacto sem vento
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.18);
      
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.2);
    } 
    else if (type === "slap") {
      // Som de vento (swoosh) antes do impacto
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
      
      osc.start(now);
      osc.stop(now + 0.12);
    }
    else if (type === "levelUp") {
      // Fanfarra triunfante
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
      
      osc2.type = "triangle";
      osc2.connect(gain);
      osc2.frequency.setValueAtTime(261.63, now); // C4
      osc2.frequency.setValueAtTime(329.63, now + 0.1); // E4
      osc2.frequency.setValueAtTime(392.00, now + 0.2); // G4
      osc2.frequency.setValueAtTime(523.25, now + 0.3); // C5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.65);
      
      osc.start(now);
      osc.stop(now + 0.65);
      osc2.start(now);
      osc2.stop(now + 0.65);
    }
    else if (type === "matchmakingFound") {
      // Bi-bip eletrônico de conexão
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      
      osc.start(now);
      osc.stop(now + 0.35);
    }
    else if (type === "victory") {
      // Som comemorativo alegre
      osc.type = "sine";
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.1); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.6); // D6
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);
      
      osc.start(now);
      osc.stop(now + 0.85);
    }
    else if (type === "defeat") {
      // Som dramático e melancólico de perda
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220.00, now); // A3
      osc.frequency.linearRampToValueAtTime(146.83, now + 0.25); // D3
      osc.frequency.linearRampToValueAtTime(110.00, now + 0.6); // A2
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);
      
      osc.start(now);
      osc.stop(now + 0.75);
    }
    else if (type === "triple") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.25);
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
    else if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch (e) {
    console.error("Erro ao gerar áudio nativo:", e);
  }
}

// --- ESTADO DO JOGO ---
let state = {
  highScore: 0,
  xp: 0,
  handLevel: 1,
  equippedGlove: "normal", // normal, la, couro, gamer
  activeMode: "practice",  // practice, bot, online
  
  // Controle de turno e jogo ativo
  isSlapping: false,
  currentScore: 0,         // figurinhas viradas pelo jogador
  opponentScore: 0,        // figurinhas viradas pelo oponente
  cardsInStack: 10,        // figurinhas restantes no monte
  isPlayerTurn: true,      // indica se é a vez do jogador
  opponentName: "BOT",
  opponentLevel: 1,
  slapStyle: "classic",
  
  // Matchmaking
  matchmakingTimeout: null,
  isOnlineMatchmaking: false
};

const GLOVE_DETAILS = {
  normal: { name: "Mão Limpa", speedMod: 1.0, zoneMod: 0 },
  la: { name: "Luva de Lã", speedMod: 0.85, zoneMod: 0 },
  couro: { name: "Luva de Couro", speedMod: 1.0, zoneMod: 3 },
  gamer: { name: "Luva Gamer", speedMod: 0.75, zoneMod: 2 }
};

const OPPONENT_NAMES = [
  "PedrinhoDoBafo", "JulioFigurinha", "AnaDoPacotinho", "RonaldoLegends", 
  "BetoDenteDeLeite", "TatiAlbum94", "ZeDaLuva", "GabiSlapMaster", 
  "CarlinhosDoBafão", "LeoCopa98", "ReiDoTapão", "MelFigurinhas"
];

const CARD_EMOJIS = ["🌟", "🔥", "⚽", "🏆", "🦄", "🎨", "🚀", "🍕", "🎮", "⚡", "👾", "👑", "🍀", "🍩"];
const CARD_RARITIES = [
  { name: "COMUM", color: "#666666" },
  { name: "RARO", color: "#012169" },
  { name: "ÉPICO", color: "#9c27b0" },
  { name: "LENDÁRIO", color: "#c29b38" }
];

// --- PERSISTÊNCIA & PROGRESSÃO ---
function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem("bafo_master_state"));
    if (saved && typeof saved === 'object') {
      state.highScore = Number(saved.highScore) || 0;
      state.xp = Number(saved.xp) || 0;
      state.handLevel = Number(saved.handLevel) || 1;
      state.equippedGlove = saved.equippedGlove || "normal";
    }
  } catch (e) {
    console.error("Erro ao ler localStorage, reiniciando progresso.", e);
  }
  updateUI();
}

function saveProgress() {
  try {
    localStorage.setItem("bafo_master_state", JSON.stringify({
      highScore: state.highScore,
      xp: state.xp,
      handLevel: state.handLevel,
      equippedGlove: state.equippedGlove
    }));
  } catch (e) {
    console.error("Erro ao salvar progresso:", e);
  }
}

function addXP(amount) {
  if (state.activeMode === "practice") return; // Sala de treino não gera XP

  state.xp += amount;
  const xpRequired = state.handLevel * 100;
  
  if (state.xp >= xpRequired) {
    state.xp -= xpRequired;
    state.handLevel++;
    playSound("levelUp");
    showLevelUpNotification();
    
    // Auto-salvar no level up
    saveProgress();
  }
  updateUI();
}

function showLevelUpNotification() {
  // Exibir temporariamente no modal de fim de jogo ou através de animações adicionais
  const lvlUpRow = document.getElementById("modal-stat-level-up-row");
  if (lvlUpRow) {
    document.getElementById("modal-new-level").innerText = state.handLevel;
    lvlUpRow.style.display = "flex";
  }
}

function updateUI() {
  // Atualizar Recorde e Nível no Menu
  document.getElementById("display-high-score").innerText = state.highScore + " FIGURINHAS";
  document.getElementById("display-hand-level").innerText = "Nível da Mão: " + state.handLevel;
  
  // Atualizar Barra de XP
  const xpRequired = state.handLevel * 100;
  const progressPercent = Math.min((state.xp / xpRequired) * 100, 100);
  document.getElementById("xp-fill").style.width = progressPercent + "%";
  document.getElementById("xp-text").innerText = `XP: ${state.xp} / ${xpRequired}`;

  // Atualizar Nome da Luva Equipada
  const gloveName = GLOVE_DETAILS[state.equippedGlove]?.name || "Mão Limpa";
  document.getElementById("display-equipped-glove").innerText = gloveName;

  // Desbloquear botões de luvas na loja conforme nível
  const btnLa = document.getElementById("btn-glove-la");
  const btnCouro = document.getElementById("btn-glove-couro");
  const btnGamer = document.getElementById("btn-glove-gamer");

  if (state.handLevel >= 3) btnLa.classList.remove("locked");
  if (state.handLevel >= 5) btnCouro.classList.remove("locked");
  if (state.handLevel >= 10) btnGamer.classList.remove("locked");

  // Atualizar seleção visual dos botões de luva
  document.querySelectorAll(".glove-btn").forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-glove") === state.equippedGlove) {
      btn.classList.add("active");
    }
  });

  // Atualizar cores da Luva/Mão nos SVGs (Menu e Arena)
  const colors = {
    normal: { base: "#fcd34d", cuff: "#111111" },
    la: { base: "#4586ff", cuff: "#ff4d4d" },
    couro: { base: "#8b5a2b", cuff: "#111111" },
    gamer: { base: "#9c27b0", cuff: "#00e5ff" }
  };
  
  const activeColor = colors[state.equippedGlove] || colors.normal;
  
  const menuHandBase = document.querySelector("#svg-menu-hand .hand-base-skin");
  const menuHandCuff = document.querySelector("#svg-menu-hand #glove-cuff");
  if (menuHandBase) menuHandBase.setAttribute("fill", activeColor.base);
  if (menuHandCuff) menuHandCuff.setAttribute("fill", activeColor.cuff);

  const gameHandLeftBase = document.querySelector("#slapping-hand-left-svg");
  const gameHandLeftCuff = document.querySelector("#game-glove-left-cuff");
  if (gameHandLeftBase) gameHandLeftBase.setAttribute("fill", activeColor.base);
  if (gameHandLeftCuff) gameHandLeftCuff.setAttribute("fill", activeColor.cuff);

  const gameHandRightBase = document.querySelector("#slapping-hand-right-svg");
  const gameHandRightCuff = document.querySelector("#game-glove-right-cuff");
  if (gameHandRightBase) gameHandRightBase.setAttribute("fill", activeColor.base);
  if (gameHandRightCuff) gameHandRightCuff.setAttribute("fill", activeColor.cuff);
  
  // Atualizar cores da mão do usuário na tela de matchmaking
  const matchUserHand = document.querySelector(".user-hand-color");
  if (matchUserHand) matchUserHand.setAttribute("fill", activeColor.base);
}

// --- MOTOR DA BARRA DE PRECISÃO ---
let precisionState = {
  cursorPos: 0,
  direction: 1,
  speed: 1.6,
  greenMin: 44,
  greenMax: 56,
  animFrameId: null
};

function configurePrecisionBar() {
  let baseSpeed = 1.6;
  let greenWidth = 12; // Largura padrão em porcentagem (de 0 a 100)

  // Configurações base por modo
  if (state.activeMode === "bot") {
    // Aumenta a velocidade e reduz ligeiramente o tamanho com base nas figurinhas já ganhas
    baseSpeed = 1.8 + (state.currentScore * 0.12);
    greenWidth = Math.max(14 - (state.currentScore * 0.6), 5);
  } else if (state.activeMode === "online") {
    // Modo online é mais dinâmico e veloz
    baseSpeed = 2.3;
    greenWidth = 10;
  }

  // Modificadores da luva equipada
  const glove = GLOVE_DETAILS[state.equippedGlove] || GLOVE_DETAILS.normal;
  baseSpeed *= glove.speedMod;
  greenWidth += glove.zoneMod;

  // Integre a modificação de dificuldade do golpe duplo
  if (state.slapStyle === "double") {
    baseSpeed *= 1.8;
    greenWidth *= 0.45;
    document.getElementById("precision-success-label").innerText = "ZONA VERDE ULTRA MINÚSCULA 👐";
  } else {
    document.getElementById("precision-success-label").innerText = "ZONA VERDE (SUCESSO!) 🖐️";
  }

  precisionState.speed = baseSpeed;
  precisionState.greenMin = 50 - (greenWidth / 2);
  precisionState.greenMax = 50 + (greenWidth / 2);

  // Aplicar estilos na barra
  const gz = document.getElementById("green-zone");
  gz.style.width = greenWidth + "%";
  gz.style.left = precisionState.greenMin + "%";
}

function startPrecisionBar() {
  cancelAnimationFrame(precisionState.animFrameId);
  precisionState.cursorPos = 0;
  precisionState.direction = 1;
  
  function animate() {
    precisionState.cursorPos += precisionState.speed * precisionState.direction;
    if (precisionState.cursorPos >= 100) {
      precisionState.cursorPos = 100;
      precisionState.direction = -1;
    } else if (precisionState.cursorPos <= 0) {
      precisionState.cursorPos = 0;
      precisionState.direction = 1;
    }
    
    const cursor = document.getElementById("bar-cursor");
    if (cursor) {
      cursor.style.left = precisionState.cursorPos + "%";
    }
    precisionState.animFrameId = requestAnimationFrame(animate);
  }
  precisionState.animFrameId = requestAnimationFrame(animate);
}

function stopPrecisionBar() {
  cancelAnimationFrame(precisionState.animFrameId);
}

// --- MECÂNICA DE IMPACTO (O TAPA!) ---
function triggerSlap() {
  // Bloquear se já estiver batendo ou se for a vez do oponente
  if (state.isSlapping || !state.isPlayerTurn || state.cardsInStack <= 0) return;
  
  state.isSlapping = true;
  stopPrecisionBar();
  playSound("slap");

  // Animar os strikers correspondentes
  const gameHandLeft = document.getElementById("interactive-game-hand-left");
  const gameHandRight = document.getElementById("interactive-game-hand-right");

  if (state.slapStyle === "double") {
    if (gameHandLeft) gameHandLeft.classList.add("slap-animation");
    if (gameHandRight) gameHandRight.classList.add("slap-animation");
  } else {
    if (gameHandLeft) gameHandLeft.classList.add("slap-animation");
  }

  // Obter o resultado com base no cursor
  const current = precisionState.cursorPos;
  const isSuccess = current >= precisionState.greenMin && current <= precisionState.greenMax;

  // Impacto ocorre aos 150ms da animação
  setTimeout(() => {
    const powText = document.getElementById("pow-particles");
    const mainCard = document.getElementById("main-collectible-card");
    const cardPile = document.getElementById("stack-pile-3d");

    if (isSuccess) {
      let cardsFlipped = 1;
      if (state.slapStyle === "double") {
        cardsFlipped = Math.random() < 0.75 ? 3 : 2;
        if (cardsFlipped === 3) playSound("triple");
        else playSound("success");
      } else {
        playSound("success");
      }

      // Limitar a quantidade de viradas ao monte restante
      const actualFlipped = Math.min(state.cardsInStack, cardsFlipped);

      // Atualizar placar do jogador e monte
      state.currentScore += actualFlipped;
      state.cardsInStack -= actualFlipped;
      
      document.getElementById("display-flipped-count").innerText = state.currentScore;
      document.getElementById("game-cards-left").innerText = `Figurinhas no Monte: ${state.cardsInStack}`;

      // Animação 3D de flip da figurinha
      const randomRotate = Math.floor(Math.random() * 30) - 15; // rotação aleatória de dispersão
      mainCard.style.transform = `rotateY(180deg) translateZ(30px) rotate(${randomRotate}deg) scale(1.05)`;

      // Partículas / Feedback de texto
      if (actualFlipped === 3) {
        const layer1 = document.getElementById("layer-card-1");
        const layer2 = document.getElementById("layer-card-2");
        if (layer1) layer1.style.opacity = "0";
        if (layer2) layer2.style.opacity = "0";
        powText.innerText = "VENTO DE DUAS MÃOS! +3 👐💥";
      } else {
        powText.innerText = `SENSACIONAL! +${actualFlipped} 🖐️`;
      }
      powText.className = "pow-text trigger";

      // Conceder XP se não for modo treino
      if (state.activeMode !== "practice") {
        addXP(actualFlipped * 20);
        // Atualizar recorde máximo se for modo competitivo
        if (state.currentScore > state.highScore) {
          state.highScore = state.currentScore;
          saveProgress();
        }
      }
    } else {
      playSound("fail");
      
      // Pilha treme para indicar vento fraco
      if (cardPile) cardPile.classList.add("shake-animation");
      
      // Feedback de erro
      powText.innerText = "SÓ SAIU AR! ❌";
      powText.className = "pow-text trigger";
      
      mainCard.style.transform = "translateY(-5px) rotate(2deg)";
      setTimeout(() => { 
        mainCard.style.transform = "rotate(0deg)";
        if (cardPile) cardPile.classList.remove("shake-animation");
      }, 250);
    }

    // Atualizar visual da pilha de cartas
    updateCardPileGraphics();
  }, 150);

  // Limpeza da animação e transição de turnos (850ms)
  setTimeout(() => {
    if (gameHandLeft) gameHandLeft.classList.remove("slap-animation");
    if (gameHandRight) gameHandRight.classList.remove("slap-animation");
    document.getElementById("pow-particles").classList.remove("trigger");
    document.getElementById("main-collectible-card").style.transform = "rotateY(0deg)";
    
    const layer1 = document.getElementById("layer-card-1");
    const layer2 = document.getElementById("layer-card-2");
    if (layer1) layer1.style.opacity = "1";
    if (layer2) layer2.style.opacity = "1";
    
    state.isSlapping = false;

    // Verificar se o jogo acabou
    if (state.cardsInStack <= 0) {
      endMatch();
    } else {
      // Se não for modo treino, passar a vez para o oponente
      if (state.activeMode !== "practice") {
        state.isPlayerTurn = false;
        updateTurnDisplay();
        setTimeout(opponentTurnExecution, 1200 + Math.random() * 1000); // tempo de reação do oponente
      } else {
        // Modo treino continua direto
        configurePrecisionBar();
        startPrecisionBar();
      }
    }
  }, 900);
}

// --- EXECUÇÃO DO TURNO DO OPONENTE (BOT / ONLINE SIMULADO) ---
function opponentTurnExecution() {
  if (state.cardsInStack <= 0) return;

  const gameHandLeft = document.getElementById("interactive-game-hand-left");
  const gameHandRight = document.getElementById("interactive-game-hand-right");

  // Simular se o oponente vai usar golpe duplo
  const opponentSlapStyle = state.activeMode === "online" && Math.random() < 0.4 ? "double" : "classic";

  // Mover strikers correspondentes para o lado esquerdo
  if (opponentSlapStyle === "double") {
    if (gameHandLeft) gameHandLeft.style.left = "10%";
    if (gameHandRight) {
      gameHandRight.style.left = "22%";
      gameHandRight.style.display = "block";
      gameHandRight.classList.remove("hidden");
    }
  } else {
    if (gameHandLeft) gameHandLeft.style.left = "15%";
    if (gameHandRight) {
      gameHandRight.style.display = "none";
      gameHandRight.classList.add("hidden");
    }
  }

  // Simulação de delay para bater
  setTimeout(() => {
    playSound("slap");
    if (opponentSlapStyle === "double") {
      if (gameHandLeft) gameHandLeft.classList.add("slap-animation");
      if (gameHandRight) gameHandRight.classList.add("slap-animation");
    } else {
      if (gameHandLeft) gameHandLeft.classList.add("slap-animation");
    }

    // Determinar sucesso da IA
    let successChance = 0.45; // Chance base do BOT
    
    if (state.activeMode === "bot") {
      successChance = 0.38 + (state.handLevel * 0.02);
      successChance = Math.min(successChance, 0.75);
    } else if (state.activeMode === "online") {
      successChance = 0.42 + (state.opponentLevel * 0.025);
      successChance = Math.min(successChance, 0.80);
    }

    const isSuccess = Math.random() < successChance;

    // Processamento do impacto do oponente
    setTimeout(() => {
      const powText = document.getElementById("pow-particles");
      const mainCard = document.getElementById("main-collectible-card");
      const cardPile = document.getElementById("stack-pile-3d");

      if (isSuccess) {
        let cardsFlipped = 1;
        if (opponentSlapStyle === "double") {
          cardsFlipped = Math.random() < 0.75 ? 3 : 2;
          if (cardsFlipped === 3) playSound("triple");
          else playSound("success");
        } else {
          playSound("success");
        }

        const actualFlipped = Math.min(state.cardsInStack, cardsFlipped);
        state.opponentScore += actualFlipped;
        state.cardsInStack -= actualFlipped;

        document.getElementById("display-opponent-flipped-count").innerText = state.opponentScore;
        document.getElementById("game-cards-left").innerText = `Figurinhas no Monte: ${state.cardsInStack}`;

        const randomRotate = Math.floor(Math.random() * 30) - 15;
        mainCard.style.transform = `rotateY(-180deg) translateZ(30px) rotate(${randomRotate}deg) scale(1.05)`;

        if (actualFlipped === 3) {
          const layer1 = document.getElementById("layer-card-1");
          const layer2 = document.getElementById("layer-card-2");
          if (layer1) layer1.style.opacity = "0";
          if (layer2) layer2.style.opacity = "0";
          powText.innerText = `${state.opponentName} USOU VENTO! +3 👐💥`;
        } else {
          powText.innerText = `${state.opponentName} VIRTOU! +${actualFlipped} 🎯`;
        }
        powText.className = "pow-text trigger";
      } else {
        playSound("fail");
        if (cardPile) cardPile.classList.add("shake-animation");
        powText.innerText = `${state.opponentName} ERROU! 💨`;
        powText.className = "pow-text trigger";
        
        mainCard.style.transform = "translateY(-5px) rotate(-2deg)";
        setTimeout(() => { 
          mainCard.style.transform = "rotate(0deg)";
          if (cardPile) cardPile.classList.remove("shake-animation");
        }, 250);
      }

      // Reações de chat simuladas do oponente online
      if (state.activeMode === "online" && Math.random() < 0.5) {
        setTimeout(() => {
          const reaction = isSuccess ? ["🏆", "🔥", "😂"][Math.floor(Math.random() * 3)] : ["😱", "💩", "🖐️"][Math.floor(Math.random() * 3)];
          triggerSpeechBubble("opponent", reaction);
        }, 800);
      }

      updateCardPileGraphics();
    }, 150);

    // Finalização do tapa do oponente e retorno do turno
    setTimeout(() => {
      if (gameHandLeft) gameHandLeft.classList.remove("slap-animation");
      if (gameHandRight) gameHandRight.classList.remove("slap-animation");
      document.getElementById("pow-particles").classList.remove("trigger");
      document.getElementById("main-collectible-card").style.transform = "rotateY(0deg)";
      
      const layer1 = document.getElementById("layer-card-1");
      const layer2 = document.getElementById("layer-card-2");
      if (layer1) layer1.style.opacity = "1";
      if (layer2) layer2.style.opacity = "1";
      
      // Reposicionar a mão de volta ao lado do jogador conforme seu estilo ativo
      if (state.slapStyle === "double") {
        if (gameHandLeft) gameHandLeft.style.left = "36%";
        if (gameHandRight) {
          gameHandRight.style.left = "54%";
          gameHandRight.style.display = "block";
          gameHandRight.classList.remove("hidden");
        }
      } else {
        if (gameHandLeft) gameHandLeft.style.left = "45%";
        if (gameHandRight) {
          gameHandRight.style.display = "none";
          gameHandRight.classList.add("hidden");
        }
      }

      if (state.cardsInStack <= 0) {
        endMatch();
      } else {
        state.isPlayerTurn = true;
        updateTurnDisplay();
        configurePrecisionBar();
        startPrecisionBar();
      }
    }, 900);

  }, 600);
}

// Atualiza a arte/pilha 3D com base nas cartas restantes
function updateCardPileGraphics() {
  const layer1 = document.getElementById("layer-card-1");
  const layer2 = document.getElementById("layer-card-2");
  const mainCard = document.getElementById("main-collectible-card");

  if (state.cardsInStack <= 0) {
    if (layer1) layer1.style.display = "none";
    if (layer2) layer2.style.display = "none";
    if (mainCard) mainCard.style.display = "none";
  } else {
    if (mainCard) mainCard.style.display = "block";
    
    if (state.cardsInStack >= 7) {
      if (layer1) layer1.style.display = "block";
      if (layer2) layer2.style.display = "block";
    } else if (state.cardsInStack >= 3) {
      if (layer1) layer1.style.display = "block";
      if (layer2) layer2.style.display = "none";
    } else {
      if (layer1) layer1.style.display = "none";
      if (layer2) layer2.style.display = "none";
    }
  }
}

// Atualizar visual do badge de turno
function updateTurnDisplay() {
  const turnBadge = document.getElementById("game-turn-badge");
  if (state.isPlayerTurn) {
    turnBadge.innerText = "SEU TURNO";
    turnBadge.className = "turn-status-badge player-turn";
    document.getElementById("btn-slap-trigger").disabled = false;
    document.getElementById("btn-slap-trigger").style.opacity = "1";
  } else {
    turnBadge.innerText = `TURNO: ${state.opponentName}`;
    turnBadge.className = "turn-status-badge opponent-turn";
    document.getElementById("btn-slap-trigger").disabled = true;
    document.getElementById("btn-slap-trigger").style.opacity = "0.6";
  }
}

// --- SIMULAÇÃO DE CHAT POR BALÃO DE EMOJI ---
function triggerSpeechBubble(sender, emoji) {
  const container = document.getElementById("chat-container");
  if (!container) return;

  // Criar elemento de balão de fala
  const bubble = document.createElement("div");
  bubble.className = `speech-bubble ${sender === 'player' ? 'bubble-player' : 'bubble-opponent'}`;
  bubble.innerText = emoji;

  container.appendChild(bubble);

  // Remover depois de 1.8 segundos
  setTimeout(() => {
    bubble.remove();
  }, 1800);

  // Lógica de resposta inteligente do oponente
  if (sender === "player" && state.activeMode === "online" && !state.isSlapping) {
    // 60% de chance de o oponente responder ao chat
    if (Math.random() < 0.6) {
      setTimeout(() => {
        let replyEmoji = "🖐️";
        if (emoji === "💩") replyEmoji = ["😱", "😂", "🔥"][Math.floor(Math.random() * 3)];
        else if (emoji === "😂") replyEmoji = ["😂", "🖐️", "🔥"][Math.floor(Math.random() * 3)];
        else if (emoji === "🔥") replyEmoji = ["🔥", "😱", "🏆"][Math.floor(Math.random() * 3)];
        else replyEmoji = ["🏆", "😂", "🖐️"][Math.floor(Math.random() * 3)];
        
        triggerSpeechBubble("opponent", replyEmoji);
      }, 700 + Math.random() * 800);
    }
  }
}

// --- CRIAÇÃO E CONTROLE DAS PARTIDAS ---
function startNewGame(mode) {
  state.activeMode = mode;
  state.currentScore = 0;
  state.opponentScore = 0;
  state.cardsInStack = 10;
  state.isPlayerTurn = true;
  state.isSlapping = false;
  
  // Resetar estilo de batida para o padrão
  setSlapStyle("classic");

  // Fechar quaisquer modais anteriores
  document.getElementById("game-over-modal").classList.add("hidden");
  document.getElementById("modal-stat-level-up-row").style.display = "none";

  // Configurar detalhes do card colecionável topo de forma aleatória para dar sensação premium
  const cardEmoji = CARD_EMOJIS[Math.floor(Math.random() * CARD_EMOJIS.length)];
  const cardRarity = CARD_RARITIES[Math.floor(Math.random() * CARD_RARITIES.length)];
  document.getElementById("card-emoji-illustration").innerText = cardEmoji;
  
  const rarityTag = document.getElementById("card-rarity-tag");
  rarityTag.innerText = cardRarity.name;
  rarityTag.style.color = cardRarity.color;
  rarityTag.style.borderColor = cardRarity.color;

  // Preparar os displays e placares
  document.getElementById("display-flipped-count").innerText = "0";
  document.getElementById("display-opponent-flipped-count").innerText = "0";
  document.getElementById("game-cards-left").innerText = `Figurinhas no Monte: ${state.cardsInStack}`;

  // Resetar visual da pilha
  updateCardPileGraphics();

  // Esconder lobby e abrir arena
  document.getElementById("screen-menu").style.display = "none";
  document.getElementById("screen-game").style.display = "block";
  document.getElementById("screen-game").classList.remove("hidden");

  // Ajustar layouts conforme modo de jogo
  const scoreboard = document.getElementById("game-scoreboard");
  const oppScoreBox = document.getElementById("opponent-scoreboard-box");
  const reactionPanel = document.getElementById("reaction-panel-box");
  const practiceWarn = document.getElementById("practice-warning");

  if (mode === "practice") {
    practiceWarn.style.display = "block";
    oppScoreBox.style.display = "none";
    reactionPanel.classList.add("hidden");
    document.getElementById("game-mode-tag").innerText = "SALA DE TREINO";
    document.getElementById("game-mode-tag").style.background = "var(--success-green)";
    state.opponentName = "NENHUM";
    
    // Iniciar jogo direto
    updateTurnDisplay();
    configurePrecisionBar();
    startPrecisionBar();
  } 
  else if (mode === "bot") {
    practiceWarn.style.display = "none";
    oppScoreBox.style.display = "flex";
    reactionPanel.classList.add("hidden");
    document.getElementById("game-mode-tag").innerText = "MODO VS BOT";
    document.getElementById("game-mode-tag").style.background = "var(--accent-gold)";
    
    state.opponentName = "ROBÔ BAFO";
    document.getElementById("display-opponent-name").innerText = state.opponentName;
    
    updateTurnDisplay();
    configurePrecisionBar();
    startPrecisionBar();
  }
  else if (mode === "online") {
    practiceWarn.style.display = "none";
    oppScoreBox.style.display = "flex";
    reactionPanel.classList.remove("hidden");
    document.getElementById("game-mode-tag").innerText = "MODO ONLINE";
    document.getElementById("game-mode-tag").style.background = "var(--retro-blue)";

    // Chamar fluxo de matchmaking
    runMatchmaking();
  }
}

// Simulador de Matchmaking Realista
function runMatchmaking() {
  const overlay = document.getElementById("matchmaking-screen");
  const status = document.getElementById("matchmaking-status");
  const oppAvatar = document.getElementById("matchmaking-opponent-avatar");
  const oppName = document.getElementById("matchmaking-opponent-name");
  const oppLvl = document.getElementById("matchmaking-opponent-lvl");
  
  document.getElementById("matchmaking-player-lvl").innerText = `Lvl ${state.handLevel}`;
  
  overlay.classList.remove("hidden");
  status.innerText = "Procurando oponente na rede...";
  oppAvatar.innerText = "🔍";
  oppName.innerText = "? ? ?";
  oppLvl.innerText = "Lvl -";

  state.isOnlineMatchmaking = true;

  // Passo 1: Encontrar oponente
  state.matchmakingTimeout = setTimeout(() => {
    if (!state.isOnlineMatchmaking) return;

    playSound("matchmakingFound");
    status.innerText = "Oponente encontrado! Estabelecendo conexão...";
    
    // Gerar oponente aleatório
    const randName = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
    const randLvl = Math.max(1, state.handLevel + Math.floor(Math.random() * 5) - 2);
    const avatars = ["🤪", "😎", "😤", "🧙", "🧑‍🚀", "🤠", "👽", "🦁", "🦊", "🥋"];
    const randAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    state.opponentName = randName;
    state.opponentLevel = randLvl;

    oppAvatar.innerText = randAvatar;
    oppName.innerText = randName;
    oppLvl.innerText = `Lvl ${randLvl}`;
    
    document.getElementById("display-opponent-name").innerText = randName;

    // Passo 2: Iniciar a partida após delay visual
    state.matchmakingTimeout = setTimeout(() => {
      if (!state.isOnlineMatchmaking) return;

      overlay.classList.add("hidden");
      state.isOnlineMatchmaking = false;

      // Iniciar batalha
      updateTurnDisplay();
      configurePrecisionBar();
      startPrecisionBar();

      // Oponente manda um emoji simpático ao começar
      setTimeout(() => {
        triggerSpeechBubble("opponent", ["🖐️", "🔥", "🏆"][Math.floor(Math.random() * 3)]);
      }, 1000);

    }, 1800);

  }, 2200);
}

function cancelMatchmaking() {
  clearTimeout(state.matchmakingTimeout);
  state.isOnlineMatchmaking = false;
  document.getElementById("matchmaking-screen").classList.add("hidden");
  exitToMenu();
}

function endMatch() {
  stopPrecisionBar();

  const modal = document.getElementById("game-over-modal");
  const title = document.getElementById("modal-result-title");
  const msg = document.getElementById("modal-result-msg");
  const oppRow = document.getElementById("modal-stat-opponent-row");

  // Definir pontuações finais no modal
  document.getElementById("modal-stat-player-score").innerText = state.currentScore;
  document.getElementById("modal-stat-opponent-score").innerText = state.opponentScore;

  let xpGained = 0;
  
  if (state.activeMode === "practice") {
    title.innerText = "FIM DO TREINO";
    title.className = "modal-title";
    msg.innerText = "Você calibrou a sua batida na arena de treino!";
    oppRow.style.display = "none";
    document.getElementById("modal-stat-xp").innerText = "+0 XP";
  } 
  else {
    oppRow.style.display = "flex";
    
    if (state.currentScore > state.opponentScore) {
      // Vitória
      playSound("victory");
      title.innerText = "VITÓRIA! 🏆";
      title.className = "modal-title win";
      msg.innerText = `Você bateu bafo melhor que o ${state.opponentName}!`;
      xpGained = state.activeMode === "online" ? 60 : 40;
    } 
    else if (state.currentScore < state.opponentScore) {
      // Derrota
      playSound("defeat");
      title.innerText = "DERROTA! ❌";
      title.className = "modal-title lose";
      msg.innerText = `O ${state.opponentName} virou mais figurinhas que você.`;
      xpGained = state.activeMode === "online" ? 15 : 10;
    } 
    else {
      // Empate
      playSound("levelUp"); // Som duplo alegre
      title.innerText = "EMPATE! 🤝";
      title.className = "modal-title";
      msg.innerText = "Um duelo equilibrado! Ninguém sobrou no monte.";
      xpGained = state.activeMode === "online" ? 30 : 20;
    }

    document.getElementById("modal-stat-xp").innerText = `+${xpGained} XP`;
    addXP(xpGained);
    saveProgress();
  }

  modal.classList.remove("hidden");
}

function exitToMenu() {
  stopPrecisionBar();
  clearTimeout(state.matchmakingTimeout);
  state.isOnlineMatchmaking = false;

  document.getElementById("screen-game").style.display = "none";
  document.getElementById("screen-menu").style.display = "block";
  document.getElementById("game-over-modal").classList.add("hidden");
  document.getElementById("matchmaking-screen").classList.add("hidden");
  
  // Limpar balões de fala pendentes
  const container = document.getElementById("chat-container");
  if (container) container.innerHTML = "";

  updateUI();
}

// --- CONTROLE DE UPGRADES (LOJA) ---
function equipGlove(gloveKey) {
  // Verificar travas de nível
  if (gloveKey === "la" && state.handLevel < 3) return;
  if (gloveKey === "couro" && state.handLevel < 5) return;
  if (gloveKey === "gamer" && state.handLevel < 10) return;

  state.equippedGlove = gloveKey;
  saveProgress();
  updateUI();
}

// --- ALTERAÇÃO DE ESTILO DE BATIDA ---
function setSlapStyle(style) {
  state.slapStyle = style;
  playSound("click");
  const btnClassic = document.getElementById("style-btn-classic");
  const btnDouble = document.getElementById("style-btn-double");

  const gameHandLeft = document.getElementById("interactive-game-hand-left");
  const gameHandRight = document.getElementById("interactive-game-hand-right");

  if (style === "double") {
    if (btnDouble) btnDouble.classList.add("active");
    if (btnClassic) btnClassic.classList.remove("active");
    if (gameHandLeft) gameHandLeft.style.left = "36%";
    if (gameHandRight) {
      gameHandRight.style.left = "54%";
      gameHandRight.style.display = "block";
      gameHandRight.classList.remove("hidden");
    }
  } else {
    if (btnClassic) btnClassic.classList.add("active");
    if (btnDouble) btnDouble.classList.remove("active");
    if (gameHandLeft) gameHandLeft.style.left = "45%";
    if (gameHandRight) {
      gameHandRight.style.display = "none";
      gameHandRight.classList.add("hidden");
    }
  }
  configurePrecisionBar();
}

// --- INICIALIZAÇÃO E EVENT LISTENERS ---
document.addEventListener("DOMContentLoaded", () => {
  // Botões de modos de jogo
  document.getElementById("btn-mode-practice").addEventListener("click", () => startNewGame("practice"));
  document.getElementById("btn-mode-bot").addEventListener("click", () => startNewGame("bot"));
  document.getElementById("btn-mode-online").addEventListener("click", () => startNewGame("online"));

  // Botões de navegação
  document.getElementById("btn-back-to-menu").addEventListener("click", exitToMenu);
  document.getElementById("btn-modal-close").addEventListener("click", exitToMenu);
  document.getElementById("btn-cancel-matchmaking").addEventListener("click", cancelMatchmaking);

  // Ação de bater
  document.getElementById("btn-slap-trigger").addEventListener("click", triggerSlap);

  // Seletores de estilo de batida
  document.getElementById("style-btn-classic").addEventListener("click", () => setSlapStyle("classic"));
  document.getElementById("style-btn-double").addEventListener("click", () => setSlapStyle("double"));

  // Clique rápido para equipar luvas na loja
  document.querySelectorAll(".glove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const glove = btn.getAttribute("data-glove");
      equipGlove(glove);
    });
  });

  // Reações de Emojis do chat
  document.querySelectorAll(".reaction-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const emoji = btn.getAttribute("data-reaction");
      triggerSpeechBubble("player", emoji);
    });
  });

  // Suporte à tecla de Espaço para bater
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      // Evitar rolagem de página indesejada ao pressionar espaço na tela do jogo
      const gameScreen = document.getElementById("screen-game");
      if (gameScreen && gameScreen.style.display !== "none" && !gameScreen.classList.contains("hidden")) {
        e.preventDefault();
        
        // Bloquear tecla se o matchmaking ou modal de fim de jogo estiver ativo
        const mmScreen = document.getElementById("matchmaking-screen");
        const modal = document.getElementById("game-over-modal");
        
        const isMmActive = mmScreen && !mmScreen.classList.contains("hidden");
        const isModalActive = modal && !modal.classList.contains("hidden");
        
        if (!isMmActive && !isModalActive) {
          triggerSlap();
        }
      }
    }
  });

  // Carregar progresso inicial
  loadProgress();
});
