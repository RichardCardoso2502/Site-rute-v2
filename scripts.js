// Função para iniciar o contador
function startCounter(element) {
    const counterElement = element.querySelector('span'); // Seleciona o <span> que contém o número
    const target = parseInt(counterElement.getAttribute('data-target'), 10);
    if (isNaN(target)) {
        console.error('O valor de data-target não é um número válido');
        return; // Evita a execução se o valor não for numérico
    }
    let count = 0;
    let varCount = Math.round(target/100);
    const interval = setInterval(() => {
        if (count < target) {
            count += varCount;
            counterElement.textContent = `+${count}`;
        } else {
            clearInterval(interval);
            counterElement.textContent = `+${target}`;
        }
    }, 50); // Ajuste o intervalo para controlar a velocidade do contador
}

// Função de callback unificada do IntersectionObserver
const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Verifica se o elemento é um contador e inicia a contagem
            if (entry.target.classList.contains('counter')) {
                startCounter(entry.target);
                observer.unobserve(entry.target); // Para garantir que o contador só seja iniciado uma vez
            } 
            // Verifica se o elemento é um elemento de fade-in e aplica a classe
            else if (entry.target.classList.contains('fade-in')) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Para garantir que a animação de fade-in seja aplicada uma vez
            }
        }
    });
};

// Configuração do IntersectionObserver
const observer = new IntersectionObserver(observerCallback, {
    root: null, // Observa em relação à viewport
    rootMargin: '0px',
    threshold: 0.1 // Ajuste de acordo com seu caso, para considerar a visibilidade
});

// Selecione todos os elementos que devem ter a animação de fade-in e contadores
const fadeElements = document.querySelectorAll('.fade-in');
const counterElements = document.querySelectorAll('.counter');

// Observe todos os elementos
fadeElements.forEach(element => observer.observe(element));
counterElements.forEach(element => observer.observe(element));

// Verifique se a animação de fade-in e contador já está funcionando
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente carregado e analisado.');
});

emailjs.init('2qiBtPUCZEbWJ2fGW');

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os dados do formulário
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Envia o e-mail usando o template configurado
    emailjs.send('service_k2p24ps', 'template_i3x1m68', data)
        .then(function(response) {
            alert('Mensagem enviada com sucesso!');
            event.target.reset(); // Limpa o formulário após o envio
        }, function(error) {
            console.error('Erro ao enviar a mensagem: ', error);
            alert('Erro ao enviar a mensagem: ' + error.text);
        });
});

let currentIndex = 0;
const cards = document.querySelectorAll('.card');
const cardsContainer = document.querySelector('.cards-container');

function moveCarousel(direction) {
    // Remove a classe 'active' do card atual
    cards[currentIndex].classList.remove('active');

    // Atualiza o índice
    currentIndex += direction;

    // Verifica se o índice está fora do intervalo e ajusta
    if (currentIndex < 0) {
        currentIndex = cards.length - 1;
    } else if (currentIndex >= cards.length) {
        currentIndex = 0;
    }

    // Adiciona a classe 'active' ao novo card
    cards[currentIndex].classList.add('active');

    // Move o card ativo para o final da fila após a rotação
    const offset = -currentIndex * 250; // Ajuste para a largura do card (250px) + qualquer gap
    cardsContainer.style.transform = `translateX(${offset}px)`;
}

// Adiciona a classe 'active' ao primeiro card por padrão
cards[currentIndex].classList.add('active');
