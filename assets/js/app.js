// ===== VARIABLES GLOBALES =====
const APP = {
  currentUser: null,
  aiAssistantActive: false,
  currentPage: 'dashboard',
  eduCredits: 0,
  notifications: []
};

// ===== UTILIDADES GENERALES =====
const Utils = {
  // Formatear números con separadores de miles
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  },

  // Formatear fecha
  formatDate(date) {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'America/Tegucigalpa'
    };
    return new Date(date).toLocaleDateString('es-HN', options);
  },

  // Generar ID único
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Mostrar notificación
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;

    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
    
    // Botón de cerrar
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    });
  },

  // Validar email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validar contraseña
  validatePassword(password) {
    return password.length >= 8;
  }
};

// ===== MANEJO DE NAVEGACIÓN =====
const Navigation = {
  init() {
    this.setupMobileMenu();
    this.setupSmoothScroll();
    this.setupActiveLinks();
  },

  setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
      });
    }
  },

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  },

  setupActiveLinks() {
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        navLinks.forEach(l => l.classList.remove('active'));
        e.target.closest('.nav-item').classList.add('active');
      });
    });
  }
};

// ===== ASISTENTE DE IA =====
const AIAssistant = {
  responses: {
    greeting: [
      "¡Hola! Soy tu asistente de EduCírculos. ¿En qué puedo ayudarte hoy?",
      "¡Bienvenido a EduCírculos! Estoy aquí para apoyarte en tu aprendizaje.",
      "¡Hola! ¿Quieres que te muestre cursos, círculos de estudio o tu progreso?",
      "¡Qué gusto verte! ¿Listo para seguir aprendiendo?"
    ],
    courses: [
      "Tenemos cursos adaptados al currículo hondureño en todas las materias clave.",
      "¿Prefieres explorar cursos de Matemáticas, Ciencias, Español o Historia?",
      "También tenemos cursos de competencias digitales y habilidades blandas.",
      "Si me dices tu nivel (básico, intermedio, avanzado), te recomiendo cursos específicos."
    ],
    credits: [
      "Los EduCréditos se ganan completando cursos, retos y actividades grupales.",
      "Con más EduCréditos, puedes desbloquear insignias y recompensas.",
      "¡Cada curso completado suma! Así avanzas en tu nivel educativo dentro de EduCírculos.",
      "¿Quieres ver formas rápidas de ganar más EduCréditos?"
    ],
    circles: [
      "Los Círculos de Estudio son espacios para aprender colaborativamente.",
      "Puedes invitar a tus amigos o unirte a un círculo existente en tu materia favorita.",
      "Cada círculo tiene un chat grupal, materiales compartidos y retos colaborativos.",
      "¿Quieres que te muestre cómo crear un círculo paso a paso?"
    ],
    help: [
      "Puedo guiarte en cursos, EduCréditos, círculos de estudio o resolver dudas de la plataforma.",
      "Si es tu primera vez, te recomiendo empezar con el tour del dashboard.",
      "¿Tienes un problema técnico? Puedo darte pasos para solucionarlo.",
      "Cuéntame: ¿quieres ayuda con tu cuenta, cursos o círculos?"
    ],
    motivation: [
      "¡Vas muy bien! Recuerda: cada minuto que estudias te acerca más a tus metas.",
      "No te rindas, tu esfuerzo construye tu futuro.",
      "¡EduCírculos es un viaje, no una carrera! Aprende a tu ritmo.",
      "Ya completaste varios logros, ¿quieres ver tu progreso?"
    ],
    progress: [
      "Puedes revisar tu progreso en el dashboard en la sección de estadísticas.",
      "Tienes un historial de cursos completados y certificaciones en tu perfil.",
      "¿Quieres que te muestre tus logros recientes?",
      "Con cada curso que terminas, tu nivel académico en EduCírculos sube."
    ]
  },

  normalizeText(text) {
    return text.toLowerCase()
               .normalize("NFD")
               .replace(/[\u0300-\u036f]/g, "");
  },

  init() {
    this.setupAssistantButton();
    this.setupChat();
  },

  setupAssistantButton() {
    const fab = document.getElementById('aiAssistantFab');
    const chat = document.getElementById('aiChat');
    
    if (fab && chat) {
      fab.addEventListener('click', () => {
        chat.classList.toggle('active');
        APP.aiAssistantActive = !APP.aiAssistantActive;
        
        if (APP.aiAssistantActive) {
          this.addMessage('¡Hola! Soy tu asistente de EduCírculos. ¿En qué puedo ayudarte hoy?', 'ai');
        }
      });
    }
  },

  setupChat() {
    const closeBtn = document.getElementById('aiChatClose');
    const sendBtn = document.getElementById('aiChatSend');
    const input = document.getElementById('aiChatInput');
    const chat = document.getElementById('aiChat');
    
    if (closeBtn && chat) {
      closeBtn.addEventListener('click', () => {
        chat.classList.remove('active');
        APP.aiAssistantActive = false;
      });
    }
    
    if (sendBtn && input) {
      sendBtn.addEventListener('click', () => this.sendMessage());
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.sendMessage();
        }
      });
    }
  },

  sendMessage() {
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    
    if (message) {
      this.addMessage(message, 'user');
      input.value = '';
      
      setTimeout(() => {
        const response = this.generateResponse(message);
        this.addMessage(response, 'ai');
      }, 1000);
    }
  },

  addMessage(text, sender) {
    const messagesContainer = document.getElementById('aiChatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ${sender === 'user' ? 'user-message' : ''}`;
    
    messageDiv.innerHTML = `
      <div class="ai-message-avatar">
        <i class="fas fa-${sender === 'user' ? 'user' : 'robot'}"></i>
      </div>
      <div class="ai-message-content">${text}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  generateResponse(message) {
    const lowerMessage = this.normalizeText(message);

    if (lowerMessage.includes('hola') || lowerMessage.includes('buenas')) {
      return this.getRandomResponse('greeting');
    } else if (lowerMessage.includes('curso') || lowerMessage.includes('materia')) {
      return this.getRandomResponse('courses');
    } else if (lowerMessage.includes('credito') || lowerMessage.includes('punto')) {
      return this.getRandomResponse('credits');
    } else if (lowerMessage.includes('circulo') || lowerMessage.includes('grupo')) {
      return this.getRandomResponse('circles');
    } else if (lowerMessage.includes('animo') || lowerMessage.includes('motivacion')) {
      return this.getRandomResponse('motivation');
    } else if (lowerMessage.includes('progreso') || lowerMessage.includes('estadistica')) {
      return this.getRandomResponse('progress');
    } else if (lowerMessage.includes('ayuda') || lowerMessage.includes('problema')) {
      return this.getRandomResponse('help');
    } else {
      return this.getRandomResponse('help');
    }
  },

  getRandomResponse(category) {
    const responses = this.responses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

// (El resto del código de Auth, Dashboard, Courses y estilos se mantiene igual que en tu versión, solo se actualizaron Utils y AIAssistant).

// ===== AUTENTICACIÓN =====
const Auth = {
  init() {
    this.setupAuthTabs();
    this.setupForms();
  },

  setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        
        // Actualizar tabs activos
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Mostrar formulario correspondiente
        forms.forEach(form => {
          form.style.display = form.id === target ? 'block' : 'none';
        });
      });
    });
  },

  setupForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const guestBtn = document.getElementById('guestAccess');
    
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin(new FormData(loginForm));
      });
    }
    
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister(new FormData(registerForm));
      });
    }
    
    if (guestBtn) {
      guestBtn.addEventListener('click', () => {
        this.handleGuestAccess();
      });
    }
  },

  handleLogin(formData) {
    const email = formData.get('email');
    const password = formData.get('password');
    
    if (!Utils.validateEmail(email)) {
      Utils.showNotification('Por favor ingresa un email válido', 'error');
      return;
    }
    
    if (!Utils.validatePassword(password)) {
      Utils.showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    
    // Simular login
    APP.currentUser = {
      id: Utils.generateId(),
      name: 'Usuario Demo',
      email: email,
      avatar: email.charAt(0).toUpperCase(),
      eduCredits: 1250,
      level: 'Intermedio',
      coursesCompleted: 12,
      isGuest: false
    };
    
    Utils.showNotification('¡Bienvenido de vuelta!', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  },

  handleRegister(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (!name || name.length < 2) {
      Utils.showNotification('Por favor ingresa tu nombre completo', 'error');
      return;
    }
    
    if (!Utils.validateEmail(email)) {
      Utils.showNotification('Por favor ingresa un email válido', 'error');
      return;
    }
    
    if (!Utils.validatePassword(password)) {
      Utils.showNotification('La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      Utils.showNotification('Las contraseñas no coinciden', 'error');
      return;
    }
    
    // Simular registro
    APP.currentUser = {
      id: Utils.generateId(),
      name: name,
      email: email,
      avatar: name.charAt(0).toUpperCase(),
      eduCredits: 100, // Créditos de bienvenida
      level: 'Principiante',
      coursesCompleted: 0,
      isGuest: false
    };
    
    Utils.showNotification('¡Cuenta creada exitosamente! Bienvenido a EduCírculos', 'success');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1500);
  },

  handleGuestAccess() {
    APP.currentUser = {
      id: 'guest',
      name: 'Invitado',
      email: 'invitado@educirculos.hn',
      avatar: 'I',
      eduCredits: 0,
      level: 'Invitado',
      coursesCompleted: 0,
      isGuest: true
    };
    
    Utils.showNotification('Accediendo como invitado...', 'info');
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 1000);
  }
};

// ===== DASHBOARD =====
const Dashboard = {
  init() {
    this.loadUserData();
    this.setupStats();
    this.setupQuickActions();
    this.setupRecentActivity();
  },

  loadUserData() {
    // Cargar datos del usuario (simulado)
    if (!APP.currentUser) {
      APP.currentUser = {
        id: Utils.generateId(),
        name: 'Ana García',
        email: 'ana.garcia@email.com',
        avatar: 'A',
        eduCredits: 2450,
        level: 'Avanzado',
        coursesCompleted: 25,
        isGuest: false
      };
    }
    
    this.updateUserInfo();
  },

  updateUserInfo() {
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    const eduCreditsDisplay = document.querySelector('.educredits-count');
    
    if (userAvatar) {
      userAvatar.textContent = APP.currentUser.avatar;
    }
    
    if (userName) {
      userName.textContent = APP.currentUser.name;
    }
    
    if (eduCreditsDisplay) {
      eduCreditsDisplay.textContent = Utils.formatNumber(APP.currentUser.eduCredits);
    }
  },

  setupStats() {
    const stats = [
      { id: 'courses-completed', value: APP.currentUser.coursesCompleted },
      { id: 'educredits-earned', value: APP.currentUser.eduCredits },
      { id: 'study-hours', value: APP.currentUser.coursesCompleted * 8 },
      { id: 'certificates', value: Math.floor(APP.currentUser.coursesCompleted / 3) }
    ];
    
    stats.forEach(stat => {
      const element = document.getElementById(stat.id);
      if (element) {
        this.animateNumber(element, stat.value);
      }
    });
  },

  animateNumber(element, targetValue) {
    let currentValue = 0;
    const increment = targetValue / 60; // 60 frames para la animación
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      element.textContent = Utils.formatNumber(Math.floor(currentValue));
    }, 16);
  },

  setupQuickActions() {
    const actions = document.querySelectorAll('.quick-action');
    actions.forEach(action => {
      action.addEventListener('click', (e) => {
        e.preventDefault();
        const actionType = action.dataset.action;
        this.handleQuickAction(actionType);
      });
    });
  },

  handleQuickAction(actionType) {
    switch (actionType) {
      case 'new-course':
        Utils.showNotification('Redirigiendo a cursos disponibles...', 'info');
        break;
      case 'join-circle':
        Utils.showNotification('Buscando círculos de estudio...', 'info');
        break;
      case 'view-progress':
        Utils.showNotification('Cargando tu progreso...', 'info');
        break;
      case 'get-help':
        document.getElementById('aiAssistantFab').click();
        break;
    }
  },

  setupRecentActivity() {
    const activities = [
      { type: 'course', title: 'Completaste: Álgebra Básica', time: '2 horas', icon: 'graduation-cap' },
      { type: 'credit', title: 'Ganaste 50 EduCréditos', time: '3 horas', icon: 'coins' },
      { type: 'circle', title: 'Te uniste al círculo: Matemáticas 9°', time: '1 día', icon: 'users' },
      { type: 'certificate', title: 'Certificado obtenido: Ciencias Básicas', time: '2 días', icon: 'certificate' }
    ];
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
      activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
          <div class="activity-icon">
            <i class="fas fa-${activity.icon}"></i>
          </div>
          <div class="activity-content">
            <p class="activity-title">${activity.title}</p>
            <span class="activity-time">hace ${activity.time}</span>
          </div>
        </div>
      `).join('');
    }
  }
};

// ===== CURSOS =====
const Courses = {
  courses: [
    {
      id: 1,
      title: 'Matemáticas Básicas',
      description: 'Fundamentos matemáticos según el CNB hondureño',
      level: 'Básico',
      duration: '40 horas',
      students: 1200,
      rating: 4.8,
      image: 'calculator',
      category: 'matematicas'
    },
    {
      id: 2,
      title: 'Ciencias Naturales',
      description: 'Exploración del mundo natural desde Honduras',
      level: 'Intermedio',
      duration: '35 horas',
      students: 800,
      rating: 4.7,
      image: 'flask',
      category: 'ciencias'
    },
    {
      id: 3,
      title: 'Español y Literatura',
      description: 'Lengua y literatura con enfoque centroamericano',
      level: 'Todos',
      duration: '45 horas',
      students: 2100,
      rating: 4.9,
      image: 'book',
      category: 'espanol'
    }
  ],

  init() {
    this.renderCourses();
    this.setupFilters();
    this.setupSearch();
  },

  renderCourses(coursesToRender = this.courses) {
    const container = document.querySelector('.courses-grid');
    if (!container) return;
    
    container.innerHTML = coursesToRender.map(course => `
      <div class="course-card" data-id="${course.id}">
        <div class="course-image">
          <i class="fas fa-${course.image}"></i>
        </div>
        <div class="course-content">
          <h3>${course.title}</h3>
          <p>${course.description}</p>
          <div class="course-meta">
            <span class="course-level">${course.level}</span>
            <span class="course-duration">${course.duration}</span>
          </div>
          <div class="course-stats">
            <span class="course-students">
              <i class="fas fa-users"></i>
              ${Utils.formatNumber(course.students)} estudiantes
            </span>
            <span class="course-rating">
              <i class="fas fa-star"></i>
              ${course.rating}
            </span>
          </div>
          <div class="course-actions">
            <button class="btn btn-primary btn-enroll" data-course-id="${course.id}">
              Inscribirse
            </button>
            <button class="btn btn-outline btn-preview" data-course-id="${course.id}">
              Vista Previa
            </button>
          </div>
        </div>
      </div>
    `).join('');
    
    this.setupCourseActions();
  },

  setupCourseActions() {
    document.querySelectorAll('.btn-enroll').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = parseInt(e.target.dataset.courseId);
        this.enrollInCourse(courseId);
      });
    });
    
    document.querySelectorAll('.btn-preview').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const courseId = parseInt(e.target.dataset.courseId);
        this.previewCourse(courseId);
      });
    });
  },

  enrollInCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      Utils.showNotification(`Te has inscrito en: ${course.title}`, 'success');
      
      // Simular inscripción
      APP.currentUser.eduCredits += 10; // Bonus por inscripción
      this.updateStats();
    }
  },

  previewCourse(courseId) {
    const course = this.courses.find(c => c.id === courseId);
    if (course) {
      Utils.showNotification(`Cargando vista previa de: ${course.title}`, 'info');
    }
  },

  setupFilters() {
    const filters = document.querySelectorAll('.filter-btn');
    filters.forEach(filter => {
      filter.addEventListener('click', (e) => {
        const filterValue = e.target.dataset.filter;
        
        filters.forEach(f => f.classList.remove('active'));
        e.target.classList.add('active');
        
        this.filterCourses(filterValue);
      });
    });
  },

  filterCourses(filter) {
    let filteredCourses = this.courses;
    
    if (filter !== 'all') {
      filteredCourses = this.courses.filter(course => 
        course.category === filter || course.level.toLowerCase() === filter
      );
    }
    
    this.renderCourses(filteredCourses);
  },

  setupSearch() {
    const searchInput = document.querySelector('.search-courses');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredCourses = this.courses.filter(course =>
          course.title.toLowerCase().includes(searchTerm) ||
          course.description.toLowerCase().includes(searchTerm)
        );
        this.renderCourses(filteredCourses);
      });
    }
  },

  updateStats() {
    const eduCreditsDisplay = document.querySelector('.educredits-count');
    if (eduCreditsDisplay) {
      eduCreditsDisplay.textContent = Utils.formatNumber(APP.currentUser.eduCredits);
    }
  }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar componentes basados en la página actual
  const path = window.location.pathname;
  const page = path.substring(path.lastIndexOf('/') + 1);
  
  // Componentes globales
  Navigation.init();
  AIAssistant.init();
  
  // Componentes específicos por página
  switch (page) {
    case 'login.html':
      Auth.init();
      break;
    case 'dashboard.html':
      Dashboard.init();
      break;
    case 'cursos.html':
      Courses.init();
      break;
    case 'index.html':
    case '':
    default:
      // Inicialización para landing page
      console.log('EduCírculos iniciado correctamente');
      break;
  }
});

// ===== ESTILOS DINÁMICOS PARA NOTIFICACIONES =====
const notificationStyles = `
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  max-width: 400px;
  background: var(--white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  border-left: 4px solid var(--primary-blue);
  padding: var(--spacing-lg);
  z-index: 10000;
  transform: translateX(100%);
  opacity: 0;
  transition: all var(--transition-normal);
}

.notification.show {
  transform: translateX(0);
  opacity: 1;
}

.notification-success {
  border-left-color: var(--success);
}

.notification-error {
  border-left-color: var(--error);
}

.notification-warning {
  border-left-color: var(--warning);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.notification-content i {
  font-size: 1.25rem;
  color: var(--primary-blue);
}

.notification-success .notification-content i {
  color: var(--success);
}

.notification-error .notification-content i {
  color: var(--error);
}

.notification-warning .notification-content i {
  color: var(--warning);
}

.notification-close {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.notification-close:hover {
  color: var(--gray-600);
  background: var(--gray-100);
}
`;

// Agregar estilos de notificaciones al documento
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
