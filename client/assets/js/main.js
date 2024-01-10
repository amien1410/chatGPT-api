// Importing images
import botImage from '../images/bot.svg';
import userImage from '../images/user.svg';

// DOM elements
const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');
const HeroSection = document.querySelector('.hero');
const areaField = document.getElementById("form_fill");
const buttons = document.querySelectorAll("#button_data");

// Global variable to handle loader interval
let loadInterval;

// Function to simulate loading animation
function loader(element) {
  element.textContent = '';
  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent.length > 3) {
      element.textContent = '';
    }
  }, 300);
}

// Function to type text in a chat bubble
function typeText(element, text) {
  let index = 0;
  const typingInterval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(typingInterval);
    }
  }, 20);
}

// Function to generate a unique ID
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);
  return `id-${timestamp}-${hexadecimalString}`;
}

// Function to create chat bubble HTML
function chatStripe(isAi, value, uniqueId) {
  const imageSource = isAi ? botImage : userImage;
  const altText = isAi ? 'bot' : 'user';
  return `
    <div class="wrapper ${isAi ? 'ai' : ''}">
      <div class="chat">
        <div class="profile">
          <img src="${imageSource}" alt="${altText}" />
        </div>
        <div dir="auto" class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

// Function to handle form submission
const handleSubmit = async (e) => {
  e.preventDefault();

  // Remove Hero Section
  HeroSection.remove();

  const data = new FormData(form);
  const userPrompt = data.get('prompt');

  // Display user's chat
  chatContainer.innerHTML += chatStripe(false, userPrompt);

  form.reset();

  // Display bot's chat with loader
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, ' ', uniqueId);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // Fetch data from server -> bot's response
  try {
    const response = await fetch('http://localhost:5000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: userPrompt
      })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (response.ok) {
      const responseData = await response.json();
      const botResponse = responseData.bot.trim();
      typeText(messageDiv, botResponse);
    } else {
      const errorText = await response.text();
      messageDiv.innerHTML = 'Something went wrong';
      alert(errorText);
    }
  } catch (error) {
    console.error('Error:', error);
    clearInterval(loadInterval);
    messageDiv.innerHTML = 'Something went wrong';
    alert('Failed to communicate with the server');
  }
};

// Event listeners
form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});

buttons.forEach(button => {
  button.addEventListener('click', () => {
    areaField.value = button.dataset.area;
  });
});
