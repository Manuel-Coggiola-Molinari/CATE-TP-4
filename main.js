let quotesData = [];
let matchedCount = 0;

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

  const shuffledQuotes = [...quotesData].sort(() => Math.random() - 0.5);

  quotesData.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${item.image}" alt="${item.character}">
      <span>${item.character}</span>
      <input type="checkbox" class="checkbox image-checkbox" data-index="${index}">
    `;
    imagesColumn.appendChild(card);
  });

  shuffledQuotes.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <span>"${item.quote}"</span>
      <input type="checkbox" class="checkbox quote-checkbox" data-character="${item.character}">
    `;
    quotesColumn.appendChild(card);
  });
}

function checkMatch() {
  const imageCheckboxes = document.querySelectorAll(".image-checkbox:not(:disabled)");
  const quoteCheckboxes = document.querySelectorAll(".quote-checkbox:not(:disabled)");

  const selectedImage = Array.from(imageCheckboxes).find(cb => cb.checked);
  const selectedQuote = Array.from(quoteCheckboxes).find(cb => cb.checked);

  const resultDiv = document.getElementById("result");

  if (!selectedImage || !selectedQuote) {
    resultDiv.textContent = "Debes seleccionar una imagen y una frase.";
    resultDiv.style.color = "red";
    return;
  }

  const imageIndex = selectedImage.getAttribute("data-index");
  const quoteCharacter = selectedQuote.getAttribute("data-character");

  if (quotesData[imageIndex].character === quoteCharacter) {
    resultDiv.textContent = "¡Correcto!";
    resultDiv.style.color = "green";

    // Bloquear checkboxes acertados
    selectedImage.disabled = true;
    selectedQuote.disabled = true;
    selectedImage.checked = false;
    selectedQuote.checked = false;

    matchedCount++;

    // Recargar al acertar todos
    if (matchedCount === 5) {
      resultDiv.textContent = "¡Completaste todos los pares correctamente! Recargando...";
      setTimeout(() => location.reload(), 3000);
    }
  } else {
    resultDiv.textContent = "Incorrecto. Intenta otra vez.";
    resultDiv.style.color = "red";
  }

  // Limpiar selección actual para evitar múltiples selecciones
  document.querySelectorAll(".image-checkbox:not(:disabled)").forEach(cb => cb.checked = false);
  document.querySelectorAll(".quote-checkbox:not(:disabled)").forEach(cb => cb.checked = false);
}

loadQuotes();
