let quotesData = [];
let matchedCount = 0;
let selectedImageEl = null;
let lines = [];
let lastWrongLine = null;  // ⬅️ Guardamos la línea incorrecta temporal

async function loadQuotes() {
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(fetch('https://thesimpsonsquoteapi.glitch.me/quotes').then(res => res.json()));
  }
  const results = await Promise.all(promises);
  quotesData = results.map(r => r[0]);
  renderGame();
}

function renderGame() {
  const imagesColumn = document.getElementById("images-column");
  const quotesColumn = document.getElementById("quotes-column");

  imagesColumn.innerHTML = '';
  quotesColumn.innerHTML = '';
  matchedCount = 0;
  lines.forEach(line => line.remove());
  lines = [];
  lastWrongLine = null;

  const shuffledQuotes = [...quotesData].sort(() => Math.random() - 0.5);

  quotesData.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card selectable image";
    card.dataset.index = index;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.character}">
      <span>${item.character}</span>
    `;
    card.addEventListener('click', () => handleImageClick(card));
    imagesColumn.appendChild(card);
  });

  shuffledQuotes.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card selectable quote";
    card.dataset.character = item.character;
    card.innerHTML = `<span>"${item.quote}"</span>`;
    card.addEventListener('click', () => handleQuoteClick(card));
    quotesColumn.appendChild(card);
  });
}

function handleImageClick(card) {
  if (card.classList.contains("disabled")) return;
  selectedImageEl = card;
  highlight(card);
}

function handleQuoteClick(card) {
  if (!selectedImageEl || card.classList.contains("disabled")) return;

  const imgIndex = selectedImageEl.dataset.index;
  const quoteCharacter = card.dataset.character;
  const resultDiv = document.getElementById("result");

  const isCorrect = quotesData[imgIndex].character === quoteCharacter;

  // Si había una línea incorrecta anterior, eliminarla
  if (lastWrongLine) {
    lastWrongLine.remove();
    lastWrongLine = null;
  }

  const newLine = new LeaderLine(
    LeaderLine.pointAnchor(selectedImageEl, { x: '100%' }),
    LeaderLine.pointAnchor(card, { x: '0%' }),
    {
      color: isCorrect ? 'green' : 'red',
      size: 4,
      startPlug: 'disc',
      endPlug: 'arrow',
      path: 'straight'
    }
  );

  if (isCorrect) {
    selectedImageEl.classList.add("disabled");
    card.classList.add("disabled");
    lines.push(newLine);
    matchedCount++;
    resultDiv.textContent = "¡Correcto!";
    resultDiv.style.color = "green";

    if (matchedCount === 5) {
      resultDiv.textContent = "¡Completaste todos los pares correctamente! Reiniciando...";
      setTimeout(() => loadQuotes(), 3000);
    }
  } else {
    resultDiv.textContent = "Incorrecto. Intenta otra vez.";
    resultDiv.style.color = "red";
    lastWrongLine = newLine; // Guardamos esta línea para borrarla si vuelve a fallar
  }

  removeHighlight(selectedImageEl);
  selectedImageEl = null;
}

function highlight(el) {
  document.querySelectorAll(".selectable").forEach(e => e.classList.remove("highlight"));
  el.classList.add("highlight");
}

function removeHighlight(el) {
  if (el) el.classList.remove("highlight");
}

loadQuotes();