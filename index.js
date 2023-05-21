$(document).ready(function() {
    let totalPairs;
    let cardArray = [];
    let flippedCards = [];
    let matchedPairs = 0;
    let lastMatchedAtClickCount = 0;
    let clickCount = 0;
    let timeLimit = 0;
    let timerInterval;
    let elapsedTime = 0;
    let isLightMode = true;
  
    function updateHeader() {
      $('#click-count').text(clickCount);
      $('#matched-pairs').text(matchedPairs);
      $('#pairs-left').text(totalPairs - matchedPairs);
      $('#total-pairs').text(totalPairs);
      $('#time').text(elapsedTime);
      $('#time-limit').text(timeLimit);
    }
  
    function showGameStats() {
      const statsHTML = `
        <div style="width: 30%">
          <p><strong>Pairs Left:</strong> <span id="pairs-left">3</span></p>
          <p><strong>Total Pairs:</strong> <span id="total-pairs">3</span></p>
          <p><strong>Pairs Matched:</strong> <span id="matched-pairs">0</span></p>
        </div>
        <div>
          <p><strong>Clicks:</strong> <span id="click-count">0</span></p>
          <p><strong>Time:</strong><span id="time"></span></p>
          <p><strong>Time Limit:</strong> <span id="time-limit">100</span></p>
        </div>
      `;
  
      $('#game-stats').html(statsHTML); // Update the game stats container
    }
  
    function startTimer() {
      timerInterval = setInterval(function() {
        elapsedTime++;
        updateHeader();
  
        if (elapsedTime >= timeLimit) {
          clearInterval(timerInterval);
          endGame('Time limit exceeded! Game over.');
        }
  
        if (clickCount - lastMatchedAtClickCount >= 10) {
          lastMatchedAtClickCount = clickCount;
          showAllCardsTemporarily();
        }
      }, 1000);
    }
  
    function showAllCardsTemporarily() {
      // Add a delay of 1 second
      setTimeout(function() {
        // add alert here
        alert('Power Up!');

        // Close all currently open cards that are not matched
        $('.card.flipped').not('.matched').removeClass('flipped');
  
        // After a small delay, show all cards
        setTimeout(function() {
          $('.card').addClass('flipped');
        }, 500);
  
        // Hide all cards after 2 seconds
        setTimeout(function() {
          $('.card').not('.matched').removeClass('flipped');
        }, 2500);
      }, 1000);
    }
  
    function endGame(message) {
      clearInterval(timerInterval);
      $('#game-board').empty();
      $('#game-board').append('<h2 class="game-over">' + message + '</h2>');
      $('#game-stats').empty(); // Clear the game stats container
  
      // Modify background color and text color based on the mode
      if (isLightMode) {
        $('.game-over').css({
          'background-color': '#fff',
          'color': '#000'
        });
      } else {
        $('.game-over').css({
          'background-color': '#000',
          'color': '#fff'
        });
      }
    }
  
    function handleDifficultySelection(difficulty) {
      $('#game-board').empty();
      cardArray = [];
      flippedCards = [];
      matchedPairs = 0;
      clickCount = 0;
      elapsedTime = 0;
      clearInterval(timerInterval);
  
      if (difficulty === 'easy') {
        totalPairs = 3;
        timeLimit = 100;
        showGameStats();
        setGridDimensions(3, 2);
      } else if (difficulty === 'medium') {
        totalPairs = 6;
        timeLimit = 200;
        showGameStats();
        setGridDimensions(4, 3);
      } else if (difficulty === 'hard') {
        totalPairs = 12;
        timeLimit = 300;
        showGameStats();
        setGridDimensions(6, 4);
      }
  
      updateHeader();
    }
  
    function setGridDimensions(columns, rows) {
      $('#game-board').css({
        'grid-template-columns': `repeat(${columns}, 1fr)`,
        'grid-template-rows': `repeat(${rows}, 1fr)`
      });
    }
  
    function generateGameBoard() {
      const randomPokemonIds = getRandomPokemonIds(totalPairs);
  
      const pokemonDataPromises = randomPokemonIds.flatMap(id =>
        Promise.all([
          $.getJSON(`https://pokeapi.co/api/v2/pokemon/${id}`),
          $.getJSON(`https://pokeapi.co/api/v2/pokemon/${id}`)
        ])
      );
  
      Promise.all(pokemonDataPromises)
        .then(pokemonData => {
          pokemonData.forEach(([data1, data2]) => {
            const pokemon1 = {
              id: data1.id,
              name: data1.name,
              img: data1.sprites.other['official-artwork'].front_default
            };
  
            const pokemon2 = {
              id: data2.id,
              name: data2.name,
              img: data2.sprites.other['official-artwork'].front_default
            };
  
            cardArray.push(pokemon1);
            cardArray.push(pokemon2);
          });
  
          cardArray.sort(() => 0.5 - Math.random());
  
          cardArray.forEach((card, index) => {
            const cardElement = createCardElement(index, card);
            $('#game-board').append(cardElement);
          });
  
          if (!$('#light-mode-button').length && !$('#dark-mode-button').length) {
            $('#mode-toggle-container').append('  <button class="btn btn-outline-secondary mode-button active" id="light-mode-button">Light Mode</button>');
            $('#mode-toggle-container').append('<button class="btn btn-outline-secondary mode-button" id="dark-mode-button">Dark Mode</button>');
          }
        })
        .catch(error => {
          console.error('Error fetching Pokémon data:', error);
        });
    }
  
    function getRandomPokemonIds(count) {
      const maxId = 898; // Maximum Pokémon ID available in the API
      const randomIds = new Set();
  
      while (randomIds.size < count) {
        const randomId = Math.floor(Math.random() * maxId) + 1;
        randomIds.add(randomId);
      }
  
      return Array.from(randomIds);
    }
  
    function createCardElement(index, card) {
      return `
        <div class="card" data-id="${index}">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <img src="cardBack.png" alt="Card Back">
            </div>
            <div class="flip-card-back">
              <img src="${card.img}" alt="${card.name}">
            </div>
          </div>
        </div>
      `;
    }
  
    function handleCardClick() {
      if (elapsedTime >= timeLimit) {
        return;
      }
  
      const currentCard = $(this);
      const currentCardId = currentCard.data('id');
  
      if (flippedCards.length === 2 || flippedCards[0]?.data('id') === currentCardId || currentCard.hasClass('matched')) {
        return;
      }
  
      currentCard.addClass('flipped');
      flippedCards.push(currentCard);
  
      clickCount++;
      updateHeader();
  
      if (clickCount - lastMatchedAtClickCount >= 10) {
        lastMatchedAtClickCount = clickCount;
        showAllCardsTemporarily();
      }
  
      if (flippedCards.length === 2) {
        setTimeout(() => {
          const firstCardId = flippedCards[0].data('id');
          const secondCardId = flippedCards[1].data('id');
  
          if (cardArray[firstCardId].id === cardArray[secondCardId].id) {
            matchedPairs++;
            lastMatchedAtClickCount = clickCount;
            flippedCards.forEach(card => card.addClass('matched'));
            flippedCards = [];
  
            if (matchedPairs === totalPairs) {
              clearInterval(timerInterval);
              endGame('Congratulations! You won!');
            }
          } else {
            $(`.card[data-id=${firstCardId}]`).removeClass('flipped');
            $(`.card[data-id=${secondCardId}]`).removeClass('flipped');
            flippedCards = [];
          }
  
          updateHeader();
        }, 1000);
      }
    }
  
    function handleLightModeToggle() {
      document.documentElement.style.setProperty('--card-back-color-light', '#fff');
      $('.mode-button').removeClass('active');
      $(this).addClass('active');
      isLightMode = true;
    }
  
    function handleDarkModeToggle() {
      document.documentElement.style.setProperty('--card-back-color-light', '#000');
      $('.mode-button').removeClass('active');
      $(this).addClass('active');
      isLightMode = false;
    }
  
    $(document).on('click', '#light-mode-button', handleLightModeToggle);
    $(document).on('click', '#dark-mode-button', handleDarkModeToggle);
  
    $('.difficulty').click(function() {
      $('.difficulty').removeClass('active');
      $(this).addClass('active');
    });
  
    $('#start-button').click(function() {
      if (elapsedTime === 0) {
        const activeDifficulty = $('.difficulty.active').attr('id');
        handleDifficultySelection(activeDifficulty);
        showGameStats();
        generateGameBoard();
        startTimer();
        $(this).hide();
      }
    });
  
    $('#reset-button').click(function() {
      clearInterval(timerInterval);
      $('#game-board').empty();
      cardArray = [];
      flippedCards = [];
      matchedPairs = 0;
      clickCount = 0;
      elapsedTime = 0;
      updateHeader();
      $('#game-stats').empty();
      $('#start-button').show();
  
      // Hide or remove the mode buttons
      $('#light-mode-button').remove();
      $('#dark-mode-button').remove();

      // Reset the background color and text color
      document.documentElement.style.setProperty('--card-back-color-light', '#fff');

      isLightMode = true;
    });
  
    $('#game-board').on('click', '.card', handleCardClick);
  
    // Set 'easy' as the default difficulty
    $('#easy').addClass('active');
  });
  
