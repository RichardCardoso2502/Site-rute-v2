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

// Inicia o EmailJS com a chave pública
emailjs.init('2qiBtPUCZEbWJ2fGW');

document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os dados do formulário
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    // Define a URL do CORS Anywhere (proxy)
    const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
    const emailJsUrl = 'https://api.emailjs.com/api/v1.0/email/send';

    // Envia o e-mail usando o template configurado via EmailJS
    fetch(corsProxyUrl + emailJsUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            service_id: 'service_dt571ve',
            template_id: 'template_i3x1m68',
            user_id: '2qiBtPUCZEbWJ2fGW', // Chave pública do EmailJS
            template_params: data
        })
    })
    .then(response => response.text()) // Tratamos como texto
    .then(function(responseText) {
        // Verifique se a resposta é "OK"
        if (responseText === 'OK') {
            alert('Mensagem enviada com sucesso!');
        } else {
            console.error('Resposta inesperada do servidor: ', responseText);
            alert('Erro ao enviar a mensagem: Resposta inesperada do servidor.');
        }
        event.target.reset(); // Limpa o formulário após o envio
    })
    .catch(function(error) {
        console.error('Erro ao enviar a mensagem: ', error);
        alert('Erro ao enviar a mensagem: ' + error.message);
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

document.querySelectorAll('.read-more').forEach(button => {
    button.addEventListener('click', function () {
        const testimonial = button.parentElement;
        const textElement = testimonial.querySelector('.testimonial-text');
        
        if (testimonial.classList.contains('expanded')) {
            // Mostrar o resumo
            textElement.textContent = textElement.getAttribute('data-summary');
            button.textContent = 'Leia Mais';
        } else {
            // Mostrar o texto completo
            textElement.textContent = textElement.getAttribute('data-full');
            button.textContent = 'Leia Menos';
        }

        testimonial.classList.toggle('expanded');
    });
});

