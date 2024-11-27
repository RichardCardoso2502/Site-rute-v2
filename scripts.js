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

document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.cards');
    const cards = document.querySelectorAll('.card');
    const cardWidth = cards[0].offsetWidth + 20; // Considerando espaçamento
    let activeIndex = 0;

    // Clona os primeiros e últimos cards para criar um efeito de infinito
    const firstCardClone = cards[0].cloneNode(true);
    const lastCardClone = cards[cards.length - 1].cloneNode(true);
    carousel.appendChild(firstCardClone);
    carousel.insertBefore(lastCardClone, cards[0]);

    // Atualiza os cards e reposiciona o carrossel
    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.remove('active');
            if (index === activeIndex) {
                card.classList.add('active');
            }
        });

        const offset = -activeIndex * cardWidth;
        carousel.style.transform = `translateX(${offset}px)`;
    }

    // Mover para o próximo card
    document.querySelector('.carousel-nav.right').addEventListener('click', () => {
        activeIndex++;
        if (activeIndex >= cards.length - 1) {
            // Redefine o índice quando atinge o clone final
            activeIndex = 0;
            carousel.style.transition = 'none'; // Desabilita a transição para reposicionar rapidamente
            const offset = -activeIndex * cardWidth;
            carousel.style.transform = `translateX(${offset}px)`;
            // Retorna a transição
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease-in-out';
            }, 50);
        }
        updateCarousel();
    });

    // Mover para o card anterior
    document.querySelector('.carousel-nav.left').addEventListener('click', () => {
        activeIndex--;
        if (activeIndex < 0) {
            // Redefine o índice quando atinge o clone inicial
            activeIndex = cards.length - 3; // Um menos que a posição do clone inicial
            carousel.style.transition = 'none'; // Desabilita a transição para reposicionar rapidamente
            const offset = -activeIndex * cardWidth;
            carousel.style.transform = `translateX(${offset}px)`;
            // Retorna a transição
            setTimeout(() => {
                carousel.style.transition = 'transform 0.5s ease-in-out';
            }, 50);
        }
        updateCarousel();
    });

    // Inicializa o carrossel com o primeiro card ativo
    updateCarousel();
});

