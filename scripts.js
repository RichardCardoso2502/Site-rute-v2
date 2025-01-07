// Função para iniciar o contador
function startCounter(element) {
    const counterElement = element.querySelector('span'); // Seleciona o <span> que contém o número
    const target = parseInt(counterElement.getAttribute('data-target'), 10);
    if (isNaN(target)) {
        console.error('O valor de data-target não é um número válido');
        return; // Evita a execução se o valor não for numérico
    }
    let count = 0;
    let varCount = Math.round(target / 100);
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

// Função para abrir o modal e carregar o conteúdo do serviço
function openModal(serviceId) {
    const modal = document.getElementById('modal');
    const title = document.getElementById('modal-title');
    const description = document.getElementById('modal-description');

    // Definindo o conteúdo do modal baseado no serviço clicado
    if (serviceId === 'service1') {
        title.textContent = 'Psicoterapia Individual';
        description.textContent = 'Atendimento presencial e online voltado para adultos que desejam compreender e transformar suas emoções. Ofereço suporte para lidar com ansiedade, depressão, baixa autoestima, conflitos internos e outros desafios emocionais, ajudando você a construir uma vida mais equilibrada, saudável e alinhada aos seus objetivos pessoais.';
    } else if (serviceId === 'service2') {
        title.textContent = 'Suporte para Crises Emocionais';
        description.textContent = 'Atendimento emergencial para ajudar a manejar momentos de crise emocional ou transições difíceis.';
    } else if (serviceId === 'service3') {
        title.textContent = 'Desenvolvimento de Inteligência Emocional';
        description.textContent = 'Desenvolva habilidades para gerenciar emoções, ampliar o repertório emocional e melhorar os relacionamentos interpessoais.';
    } else if (serviceId === 'service4') {
        title.textContent = 'Palestras e Eventos';
        description.textContent = 'Palestras para empresas, escolas ou comunidades sobre temas como saúde mental, inteligência emocional, autoconhecimento e gestão do estresse.';
    }

    modal.style.display = 'flex'; // Exibe o modal
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none'; // Oculta o modal
}

// Seleciona todos os elementos com a classe 'read-more'
const readMoreLinks = document.querySelectorAll('.read-more');

readMoreLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Impede o comportamento padrão do link (não vai para o topo)
        
        // Encontra o card do depoimento mais próximo
        const testimonial = link.closest('.testimonial');
        const testimonialText = testimonial.querySelector('p');
        
        // Verifica se o card já está expandido
        if (testimonial.classList.contains('expanded')) {
            // Recolhe o texto e volta ao formato inicial
            testimonialText.style.height = '120px'; // Reseta a altura do parágrafo
            link.textContent = 'Leia mais'; // Muda o texto do link
            testimonial.classList.remove('expanded');
        } else {
            // Expande o texto
            testimonialText.style.height = 'auto'; // Deixa o texto expandir totalmente
            link.textContent = 'Leia menos'; // Muda o texto do link
            testimonial.classList.add('expanded');
        }
    });
});







