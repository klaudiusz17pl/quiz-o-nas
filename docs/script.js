document.addEventListener('DOMContentLoaded', () => {

  // ================= PYTANIA =================
  const ALL_QUESTIONS = [
    { q: "Kiedy się poznaliśmy?", answers: ["14 lutego", "1 marca", "28 stycznia", "18 sierpnia"], correct: 2 },
    { q: "Jakim pieszczotliwym imieniem mnie nazywałaś?", answers: ["Wszystkie odpowiedzi", "Kochanie", "Misiu", "Baranek"], correct: 0 },
    { q: "Kiedy był nasz pierwszy pocałunek?", answers: ["14 lutego", "1 września", "28 stycznia", "18 sierpnia"], correct: 3 },
    { q: "Gdzie była nasza pierwsza randka?", answers: ["Cliffs Old Head of Kinsale", "Nad jeziorem w Górzynie", "Pizzeria przy stacji", "Zoo we Wrocławiu"], correct: 0 },
    { q: "W jaką grę ciągle graliśmy razem?", answers: ["Among Us", "Ludo", "FIFA", "Minecraft"], correct: 1 },
    { q: "Co się stało gdy szliśmy na pizzę?", answers: ["Zamknęli pizzerię", "Jedliśmy ją na ławeczce", "Zgubiliśmy się", "Spotkaliśmy znajomych"], correct: 1 },
    { q: "Jaki drink piłaś u mojej mamy?", answers: ["Aperol", "Prosecco", "Malibu ananasowe", "Mojito"], correct: 2 },
    { q: "Co się stało z Twoim drinkiem?", answers: ["Przypadkowo Ci go wylałem", "Zostawiłaś go", "Wypiłam go szybko", "Nic się nie stało"], correct: 0 },
    { q: "Jakie lody kupiliśmy razem?", answers: ["Waniliowe", "Truskawkowe", "Z nutelli", "Czekoladowe"], correct: 2 },
    { q: "Gdzie byliśmy na Twoich urodzinach?", answers: ["We Wrocławiu w zoo", "Nad jeziorem", "W kinie", "W restauracji"], correct: 0 },
    { q: "Co było nie tak z hotelem w Poznaniu?", answers: ["Za daleko", "Zimno było", "Kamień na kranach i włosy w łazience", "Za drogi"], correct: 2 },
    { q: "Dlaczego nazywałaś mnie barankiem?", answers: ["Bo lubiłem owce", "Bo moje włosy puszyły się na deszczu", "Bo byłem uparty", "Bo dużo jadłem"], correct: 1 },
    { q: "Gdzie usiedliśmy gdy przyleciałem do Ciebie?", answers: ["Na lotnisku", "W kawiarni", "Nad jeziorkiem w Górzynie", "W parku"], correct: 2 },
    { q: "Jak nazwałaś mnie 28 stycznia?", answers: ["Moim szczęściem", "Moją miłością", "Moim wszystkim", "Moim światem"], correct: 0 },
    { q: "Co robiliśmy podczas nocnych rozmów?", answers: ["Pisaliśmy wiadomości", "Zasypialiśmy razem", "Graliśmy", "Oglądaliśmy filmy"], correct: 1 }
  ];

  // ================= NAGRODY =================
  const REWARD_LEVELS = [
    { points: 5,  name: "Licznik miłości ❤️", type: "counter",    startDate: "2025-03-15" },
    { points: 10, name: "Galeria wspomnień 📸", type: "slideshow", images: ["https://via.placeholder.com/600x400/ffb3c6/ffffff?text=Zdjęcie+1","https://via.placeholder.com/600x400/ff99b4/ffffff?text=Zdjęcie+2","https://via.placeholder.com/600x400/ffccd5/ffffff?text=Zdjęcie+3"] },
    { points: 15, name: "Wiadomość ❤️", type: "text", content: () => getDailyRewardMessage()},
    { points: 20, name: "Narysuj naszą przyszłość ♡", type: "drawing" },
    { points: 35, name: "Odliczamy do naszej rocznicy! 🎉❤️", type: "countdown", targetDate: "2026-03-15" }
  ];

  // ================= STAN =================
  let QUESTIONS = [];
  let qIndex = 0;
  let score = 0;
  let lives = 3;
  let total = 0;
  let lock = false;
  let counterInterval = null;
  let currentStreak = 0;
  let wyrUnlocked = localStorage.getItem('wyrUnlocked') === 'true';

  // ================= ELEMENTY =================
  const els = {
    menu: document.getElementById('menu'),
    game: document.getElementById('game'),
    rewards: document.getElementById('rewardsScreen'),
    final: document.getElementById('final'),
    scoreDisplay: document.getElementById('score'),
    livesDisplay: document.getElementById('lives'),
    totalScore: document.getElementById('totalScore'),
    totalScoreGame: document.getElementById('totalScoreGame'),
    totalScoreRewards: document.getElementById('totalScoreRewards'),
    question: document.getElementById('question'),
    options: document.getElementById('options'),
    result: document.getElementById('result'),
    finalContent: document.getElementById('finalContent'),
    rewardsList: document.getElementById('rewardsList'),
    addQuestion: document.getElementById('addQuestionScreen'),
  };

  // ================= NARZĘDZIA =================
  window.showScreen = function(s) {
    Object.values(els).forEach(e => {
      if (e?.classList) e.classList.remove("active");
    });
    if (els[s]) els[s].classList.add("active");
  }

  function shuffle(a) {
    return [...a].sort(() => Math.random() - 0.5);
  }

  function saveTotal() {
    localStorage.setItem("quizTotalPoints", total);
  }

  function loadTotal() {
    total = parseInt(localStorage.getItem("quizTotalPoints") || "0") || 0;
    els.totalScore.textContent = total;
    els.totalScoreGame.textContent = total;
    els.totalScoreRewards.textContent = total;
  }

  // ================= COUNTDOWN =================
  function calculateCountdown(targetDate) {
    const target = new Date(targetDate + "T23:59:59");
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return { days:0,hours:0,minutes:0,seconds:0,message:"Już rok razem! 🎉💕" };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  }

  function createCountdown(targetDate) {
    const container = document.createElement('div');
    container.className = 'counter-display';
    container.innerHTML = '<h3>Do rocznicy za:</h3><div class="counter-grid"></div>';
    const grid = container.querySelector('.counter-grid');

    const update = () => {
      const t = calculateCountdown(targetDate);
      grid.innerHTML = t.message ?
        `<div style="grid-column:1/-1;font-size:1.9rem;color:#ff4081;padding:15px;">${t.message}</div>` :
        `<div class="counter-item"><span class="counter-number">${t.days}</span><span class="counter-label">dni</span></div>
         <div class="counter-item"><span class="counter-number">${t.hours}</span><span class="counter-label">godzin</span></div>
         <div class="counter-item"><span class="counter-number">${t.minutes}</span><span class="counter-label">minut</span></div>
         <div class="counter-item"><span class="counter-number">${t.seconds}</span><span class="counter-label">sekund</span></div>`;
    };
    update();
    setInterval(update, 1000);
    return container;
  }

  // ================= LICZNIK MIŁOŚCI =================
  function calculateTimeDiff(startDate) {
    const diff = Date.now() - new Date(startDate).getTime();
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000)
    };
  }

  function createCounter(startDate) {
    const container = document.createElement('div');
    container.className = 'counter-display';
    container.innerHTML = '<h3>Jesteśmy razem już:</h3><div class="counter-grid"></div>';
    const grid = container.querySelector('.counter-grid');

    const update = () => {
      const t = calculateTimeDiff(startDate);
      grid.innerHTML = `
        <div class="counter-item"><span class="counter-number">${t.days}</span><span class="counter-label">dni</span></div>
        <div class="counter-item"><span class="counter-number">${t.hours}</span><span class="counter-label">godzin</span></div>
        <div class="counter-item"><span class="counter-number">${t.minutes}</span><span class="counter-label">minut</span></div>
        <div class="counter-item"><span class="counter-number">${t.seconds}</span><span class="counter-label">sekund</span></div>`;
    };
    update();
    counterInterval = setInterval(update, 1000);
    return container;
  }

  // ================= SLIDESHOW =================
  function createSlideshow(images) {
    const container = document.createElement('div');
    container.className = 'slideshow-container';
    images.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'slide' + (i===0 ? ' active' : '');
      slide.innerHTML = `<img src="${src}" alt="Zdjęcie ${i+1}">`;
      container.appendChild(slide);
    });
    const ctr = document.createElement('div');
    ctr.className = 'slideshow-controls';
    ctr.innerHTML = `<button onclick="changeSlide(-1)">◀ Poprzednie</button><button onclick="changeSlide(1)">Następne ▶</button>`;
    container.appendChild(ctr);
    window.currentSlide = 0;
    return container;
  }

  window.changeSlide = function(dir) {
    const slides = document.querySelectorAll('.slide');
    if (!slides.length) return;
    slides[window.currentSlide].classList.remove('active');
    window.currentSlide = (window.currentSlide + dir + slides.length) % slides.length;
    slides[window.currentSlide].classList.add('active');
  };

  // ================= GRA =================
  function startGame(){
    const custom = getUserQuestions();
    QUESTIONS = shuffle([...ALL_QUESTIONS, ...custom]).slice(0,15);
    qIndex = score = currentStreak = 0;
    lives = 3;
    lock = false;
    els.scoreDisplay.textContent = 0;
    els.livesDisplay.textContent = "❤️❤️❤️";
    els.result.textContent = "";
    els.result.className = "";
    showScreen("game");
    loadQuestion();
  }

  function loadQuestion(){
    if (qIndex >= QUESTIONS.length) return endGame(true);
    lock = false;
    els.result.textContent = "";
    els.result.className = "";

    const q = QUESTIONS[qIndex];
    const opts = shuffle(q.answers.map((a,i) => ({a,i})));
    const correctIdx = opts.findIndex(x => x.i === q.correct);

    els.question.textContent = q.q;
    els.options.innerHTML = "";
    opts.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "option";
      div.textContent = item.a;
      div.onclick = () => check(idx, correctIdx);
      els.options.appendChild(div);
    });
  }

  function check(selected, correct){
    if (lock) return;
    lock = true;

    if (selected === correct){
      score++;
      total++;
      currentStreak++;
      saveTotal();
      loadTotal();
      els.scoreDisplay.textContent = score;
      els.result.textContent = "Dobrze ❤️";
      els.result.className = "correct";

      const snd = document.getElementById('correctSound');
      if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }

      for (let i = 0; i < 8; i++){
        const h = document.createElement('div');
        h.className = 'heart-burst';
        h.innerHTML = Math.random() > 0.5 ? '💕' : '❤️';
        h.style.left = (30 + Math.random()*40) + '%';
        h.style.top = '10%';
        h.style.animationDelay = (Math.random()*0.5) + 's';
        h.style.fontSize = (2 + Math.random()*1.5) + 'rem';
        els.result.appendChild(h);
        setTimeout(() => h.remove(), 1800);
      }

      // Unlock WYR after 10 correct in a row
      if (currentStreak >= 10 && !wyrUnlocked) {
        wyrUnlocked = true;
        localStorage.setItem('wyrUnlocked', 'true');
        document.getElementById('wyrMenuBtn').style.display = 'block';
        setTimeout(() => {
          alert("Wow! 10 poprawnych z rzędu! ❤️\nMinigra 'Would You Rather… z nami?' jest teraz dostępna w menu głównym ♡");
        }, 1000);
      }

    } else {
      lives--;
      currentStreak = 0;
      els.livesDisplay.textContent = "❤️".repeat(lives) + "🤍".repeat(3-lives);
      els.result.textContent = "Źle 😢";
      els.result.className = "wrong";
      const snd = document.getElementById('wrongSound');
      if (snd) { snd.currentTime = 0; snd.play().catch(() => {}); }
      if (lives <= 0) return endGame(false);
    }

    qIndex++;
    setTimeout(loadQuestion, 1400);
  }

  function endGame(win){
    total += score;
    saveTotal();
    loadTotal();
    els.finalContent.innerHTML = win
      ? `Świetnie ❤️<br>Punkty w tej grze: <b>${score}</b><br>Razem: <b>${total}</b>`
      : `Koniec żyć 😭<br>Punkty w tej grze: <b>${score}</b><br>Razem: <b>${total}</b>`;
    showScreen("final");
  }

  // ================= NAGRODY =================
  function showRewards(){
    if (counterInterval) clearInterval(counterInterval);
    counterInterval = null;

    els.rewardsList.innerHTML = "";

    REWARD_LEVELS.forEach(r => {
      const unlocked = total >= r.points;
      const div = document.createElement("div");
      div.className = `reward-item ${unlocked ? "unlocked" : "locked"}`;

      const header = document.createElement('h3');
      header.textContent = r.name;
      div.appendChild(header);

      const status = document.createElement('p');
      status.textContent = unlocked ? "Odblokowane ❤️" : `Wymaga ${r.points} pkt`;
      div.appendChild(status);

      if (unlocked) {
        if (r.type === "counter" && r.startDate) {
          div.appendChild(createCounter(r.startDate));
        } else if (r.type === "slideshow" && r.images) {
          div.appendChild(createSlideshow(r.images));
        } else if (r.type === "text" && r.content) {
          const msg = document.createElement('p');
          msg.style.cssText = "font-size:1.45rem; color:#d81b60; margin-top:20px; font-style:italic; line-height:1.7;";
          msg.textContent = r.content();
          div.appendChild(msg);
        } else if (r.type === "drawing") {
          document.getElementById("drawReward").style.display = "block";
          div.appendChild(document.getElementById("drawReward"));
          initDrawingCanvas();
        } else if (r.type === "countdown" && r.targetDate) {
          div.appendChild(createCountdown(r.targetDate));
        }
      }

      els.rewardsList.appendChild(div);
    });

    showScreen("rewards");
  }

  // ================= WOULD YOU RATHER – DAILY + SAVING CHOICES =================
  const baseWyrQuestions = [
    { q: "Wolałabyś…", a: "Całować się ze mną w deszczu w Dublinie", b: "Tulić się do mnie pod kocem przy kominku w górach" },
    { q: "Wolałabyś…", a: "Zrobić ze mną spontaniczną podróż samochodem w nocy", b: "Cały dzień leżeć ze mną w łóżku i oglądać seriale" },
    { q: "Wolałabyś…", a: "Zjeść ze mną pizzę o 3 w nocy na ławce", b: "Zjeść ze mną elegancką kolację przy świecach" },
    { q: "Wolałabyś…", a: "Usłyszeć ode mnie „kocham Cię" 100 razy dziennie", b: "Dostać ode mnie codziennie mały liścik z sercem" },
    { q: "Wolałabyś…", a: "Tańczyć ze mną w kuchni o północy", b: "Śpiewać ze mną pod prysznicem (nawet jak fałszujemy)" },
    { q: "Wolałabyś…", a: "Mieć ze mną romantyczny piknik nad jeziorem", b: "Oglądać ze mną zachód słońca na dachu" },
    { q: "Wolałabyś…", a: "Zrobić ze mną sesję zdjęciową w strojach z epoki", b: "Zrobić ze mną challenge na TikToku" },
    { q: "Wolałabyś…", a: "Podróżować ze mną autostopem po Europie", b: "Mieszkać ze mną w małym domku nad morzem" },
    { q: "Wolałabyś…", a: "Dostać ode mnie kwiaty codziennie przez miesiąc", b: "Dostać ode mnie jedną wielką niespodziankę raz w roku" },
    { q: "Wolałabyś…", a: "Spędzić ze mną weekend w spa", b: "Spędzić ze mną weekend na biwaku pod namiotem" },
    { q: "Wolałabyś…", a: "Zobaczyć ze mną zorzę polarną", b: "Pływać z delfinami na Malediwach" },
    { q: "Wolałabyś…", a: "Być ze mną na koncercie ulubionego zespołu", b: "Być ze mną na festiwalu muzycznym przez cały weekend" },
    { q: "Wolałabyś…", a: "Mieć ze mną leniwy poranek z kawą do łóżka", b: "Mieć ze mną romantyczną kolację przy zachodzie słońca" },
    { q: "Wolałabyś…", a: "Oglądać ze mną gwiazdy na polu", b: "Oglądać ze mną filmy w kinie domowym pod kocem" },
    { q: "Wolałabyś…", a: "Zrobić ze mną tatuaż z naszym znaczkiem", b: "Zrobić ze mną piercing w pasujących miejscach" }
  ];

  function getDailyWyrQuestions() {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem('wyrDate');
    let dailyQuestions = JSON.parse(localStorage.getItem('wyrDailyQuestions') || 'null');

    if (savedDate !== today || !dailyQuestions || dailyQuestions.length === 0) {
      const shuffled = [...baseWyrQuestions].sort(() => 0.5 - Math.random());
      dailyQuestions = shuffled.slice(0, 6);
      localStorage.setItem('wyrDailyQuestions', JSON.stringify(dailyQuestions));
      localStorage.setItem('wyrDate', today);
      localStorage.setItem('wyrCurrentIndex', '0');
    }

    return dailyQuestions;
  }

  function saveChoice(index, choice, questionObj) {
    const today = new Date().toDateString();
    const time = new Date().toLocaleTimeString();
    let choices = JSON.parse(localStorage.getItem('wyrChoices') || '[]');

    choices.push({
      date: today,
      timestamp: time,
      question: `${questionObj.q}\nA: ${questionObj.a}\nB: ${questionObj.b}`,
      chosen: choice
    });

    localStorage.setItem('wyrChoices', JSON.stringify(choices));
  }

  function startWyrGame() {
    const modal = document.getElementById('wyrModal');
    const qEl = document.getElementById('wyrQuestion');
    const btnA = document.getElementById('wyrA');
    const btnB = document.getElementById('wyrB');

    const dailyQuestions = getDailyWyrQuestions();
    let current = parseInt(localStorage.getItem('wyrCurrentIndex') || '0');

    function showQuestion() {
      if (current >= dailyQuestions.length) {
        qEl.innerHTML = "Koniec pytań na dziś! ❤️<br>Nowe czekają na Ciebie jutro ♡";
        btnA.style.display = 'none';
        btnB.style.display = 'none';
        return;
      }

      const item = dailyQuestions[current];
      qEl.textContent = `${item.q}\nA: ${item.a}\nB: ${item.b}`;
      btnA.textContent = item.a;
      btnB.textContent = item.b;

      btnA.onclick = () => { 
        saveChoice(current, 'A', item);
        current++; 
        localStorage.setItem('wyrCurrentIndex', current);
        showQuestion(); 
      };

      btnB.onclick = () => { 
        saveChoice(current, 'B', item);
        current++; 
        localStorage.setItem('wyrCurrentIndex', current);
        showQuestion(); 
      };
    }

    showQuestion();
    modal.style.display = 'flex';
  }

  window.closeWyrModal = function() {
    document.getElementById('wyrModal').style.display = 'none';
  };

  // ================= ADMIN PANEL =================
  const ADMIN_PASSWORD = "Klaudiusz+Marysia";

  function tryOpenAdmin() {
    const pw = prompt("Podaj hasło (tylko dla Klaudiusza):");
    if (pw === ADMIN_PASSWORD) {
      document.getElementById("adminPanel").style.display = "block";
      document.getElementById("adminTotal").textContent = total;
    } else if (pw !== null) {
      alert("Nieprawidłowe hasło.");
    }
  }

  window.adminAddPoints = function() {
    const input = document.getElementById("adminPointsInput");
    const val = parseInt(input.value);
    if (isNaN(val)) return alert("Wpisz poprawną liczbę.");
    total += val;
    saveTotal();
    loadTotal();
    document.getElementById("adminTotal").textContent = total;
    input.value = "";
  }

  window.adminSetPoints = function(val) {
    if (!confirm(`Ustawić punkty na dokładnie ${val}?`)) return;
    total = val;
    saveTotal();
    loadTotal();
    document.getElementById("adminTotal").textContent = total;
  }

  window.closeAdmin = function() {
    document.getElementById("adminPanel").style.display = "none";
    showScreen("menu");
  }

  // ================= KEYBOARD SHORTCUT =================
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      tryOpenAdmin();
    }
  });

  // ================= PRZYCISKI =================
  document.getElementById('playBtn').onclick = startGame;
  document.getElementById('rewardsBtn').onclick = showRewards;
  document.getElementById('backToMenuBtn').onclick = () => showScreen("menu");
  document.getElementById('backRewardsBtn').onclick = () => {
    if (counterInterval) clearInterval(counterInterval);
    counterInterval = null;
    document.getElementById("drawReward").style.display = "none";
    showScreen("menu");
  };
  document.getElementById('finalMenuBtn').onclick = () => showScreen("menu");
  document.getElementById('addQuestionBtn').onclick = () => {
    showScreen('addQuestion');
  };

  // ================= SHOW WYR BUTTON IF UNLOCKED =================
  if (wyrUnlocked) {
    document.getElementById('wyrMenuBtn').style.display = 'block';
  }
  document.getElementById('wyrMenuBtn').onclick = startWyrGame;

  // ================= INIT =================
  loadTotal();
  showScreen("menu");

  // ================= UNOSZĄCE SIĘ SERCA =================
  function createFloatingHearts() {
    const count = window.innerWidth > 768 ? 14 : 8;
    for (let i = 0; i < count; i++) {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.innerHTML = Math.random() > 0.4 ? '💗' : '♡';
      heart.style.left = Math.random() * 100 + '%';
      heart.style.animationDuration = (10 + Math.random() * 14) + 's';
      heart.style.animationDelay = Math.random() * 8 + 's';
      document.body.appendChild(heart);
    }
  }

  createFloatingHearts();

  // ================= PYTANIA UŻYTKOWNIKA =================
  function getUserQuestions(){
    return JSON.parse(localStorage.getItem("customQuizQuestions") || "[]");
  }

  // ================= ZAPISYWANIE PYTAŃ DO FIREBASE =================
  window.saveUserQuestion = async function() {
    const q = document.getElementById("userQ").value.trim();
    const answers = [...document.querySelectorAll(".userA")].map(i => i.value.trim());
    const correct = parseInt(document.getElementById("userCorrect").value);

    if (!q || answers.some(a => !a)) {
      alert("Uzupełnij wszystko ❤️");
      return;
    }

    try {
      // Dynamiczny import Firebase
      const { collection, addDoc, serverTimestamp } = 
        await import("https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js");

      // Pobierz db z window (ustawione w index.html)
      const db = window.firebaseDB;
      
      if (!db) {
        throw new Error("Firebase nie jest zainicjalizowany");
      }

      // Zapisz do Firebase
      await addDoc(collection(db, "questions"), {
        q,
        answers,
        correct,
        author: "ona",
        createdAt: serverTimestamp()
      });

      alert("Dodano pytanie 💕\nBędzie użyte w quizie!");
      
      // Wyczyść formularz
      document.getElementById("userQ").value = "";
      document.querySelectorAll(".userA").forEach(i => i.value = "");
      
      showScreen("menu");
      
    } catch (error) {
      console.error("Błąd zapisywania pytania:", error);
      alert("Wystąpił błąd podczas zapisywania pytania 😢\nSpróbuj ponownie.");
    }
  };

});

// ===== RYSOWANIE – CANVAS =====
const canvas = document.getElementById("drawCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");

  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.offsetX,
      y: e.offsetY
    };
  }

  function startDraw(e) {
    drawing = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
  }

  function draw(e) {
    if (!drawing) return;
    const p = getPos(e);

    ctx.strokeStyle = document.getElementById("drawColor").value;
    ctx.lineWidth = document.getElementById("drawSize").value;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    lastX = p.x;
    lastY = p.y;
  }

  function stopDraw() {
    drawing = false;
  }

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);

  canvas.addEventListener("touchstart", e => {
    e.preventDefault();
    startDraw(e);
  });
  canvas.addEventListener("touchmove", e => {
    e.preventDefault();
    draw(e);
  });
  canvas.addEventListener("touchend", stopDraw);

  window.clearCanvas = function () {
    if (!confirm("Wyczyścić rysunek?")) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

// ===== FULLSCREEN RYSOWANIA =====
window.openDrawingFullscreen = function () {
  const dataURL = canvas.toDataURL("image/png");

  const overlay = document.createElement("div");
  overlay.style = `
    position:fixed; inset:0; background:rgba(0,0,0,0.9);
    z-index:5000; display:flex; justify-content:center; align-items:center;
  `;

  const box = document.createElement("div");
  box.style = `
    background:white; padding:20px; border-radius:16px;
    max-width:95%; max-height:95%;
  `;

  const bigCanvas = document.createElement("canvas");
  bigCanvas.width = 900;
  bigCanvas.height = 600;
  bigCanvas.style = "border:2px solid #ff4081; border-radius:12px;";

  const bctx = bigCanvas.getContext("2d");
  const img = new Image();
  img.onload = () => bctx.drawImage(img, 0, 0, bigCanvas.width, bigCanvas.height);
  img.src = dataURL;

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Zamknij";
  closeBtn.style = `
    display:block; margin:15px auto 0;
    padding:10px 24px; background:#ff4081;
    color:white; border:none; border-radius:10px;
    font-size:1.1rem; cursor:pointer;
  `;
  closeBtn.onclick = () => document.body.removeChild(overlay);

  box.appendChild(bigCanvas);
  box.appendChild(closeBtn);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

// ================= NAGRODA: CODZIENNA WIADOMOŚĆ =================
const LOVE_MESSAGES = [
  "Kocham Cię bardziej, niż potrafię to ubrać w słowa ❤️",
  "Jesteś moim ulubionym miejscem na świecie 💕",
  "Każdy dzień z Tobą jest dla mnie nagrodą ✨",
  "Twoje istnienie sprawia, że wszystko ma sens 💖",
  "Nie potrzebuję nic więcej, skoro mam Ciebie 🥰",
  "Z Tobą nawet cisza jest piękna 💫",
  "Jesteś moim spokojem, radością i domem ❤️"
];

function getDailyRewardMessage() {
  const today = new Date().toDateString();
  const saved = JSON.parse(localStorage.getItem("dailyRewardMessage") || "null");

  if (saved && saved.date === today) {
    return saved.text;
  }

  const text = LOVE_MESSAGES[Math.floor(Math.random() * LOVE_MESSAGES.length)];

  localStorage.setItem(
    "dailyRewardMessage",
    JSON.stringify({ date: today, text })
  );

  return text;
}
