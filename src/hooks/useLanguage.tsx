
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en' | 'es' | 'pt' | 'de' | 'zh' | 'ru' | 'it' | 'ar';

interface Translations {
  [key: string]: {
    [lang in Language]: string;
  };
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  languages: { code: Language; name: string; flag: string }[];
}

const translations: Translations = {
  // Navigation
  'nav.applications': {
    fr: 'Applications',
    en: 'Applications', 
    es: 'Aplicaciones',
    pt: 'Aplicações',
    de: 'Anwendungen',
    zh: '应用程序',
    ru: 'Приложения',
    it: 'Applicazioni',
    ar: 'التطبيقات'
  },
  'nav.ecosystem': {
    fr: 'Écosystème',
    en: 'Ecosystem',
    es: 'Ecosistema', 
    pt: 'Ecossistema',
    de: 'Ökosystem',
    zh: '生态系统',
    ru: 'Экосистема',
    it: 'Ecosistema',
    ar: 'النظام البيئي'
  },
  'nav.news': {
    fr: 'Actualités',
    en: 'News',
    es: 'Noticias',
    pt: 'Notícias', 
    de: 'Nachrichten',
    zh: '新闻',
    ru: 'Новости',
    it: 'Notizie',
    ar: 'الأخبار'
  },
  'nav.signin': {
    fr: 'Se connecter',
    en: 'Sign In',
    es: 'Iniciar Sesión',
    pt: 'Entrar',
    de: 'Anmelden',
    zh: '登录',
    ru: 'Войти',
    it: 'Accedi',
    ar: 'تسجيل الدخول'
  },
  'nav.signup': {
    fr: "S'inscrire",
    en: 'Sign Up',
    es: 'Registrarse',
    pt: 'Cadastrar-se',
    de: 'Registrieren',
    zh: '注册',
    ru: 'Зарегистрироваться',
    it: 'Registrati',
    ar: 'التسجيل'
  },
  'nav.signout': {
    fr: 'Se déconnecter',
    en: 'Sign Out',
    es: 'Cerrar Sesión',
    pt: 'Sair',
    de: 'Abmelden',
    zh: '退出',
    ru: 'Выйти',
    it: 'Esci',
    ar: 'تسجيل الخروج'
  },
  // Dashboard
  'dashboard.title': {
    fr: 'Tableau de bord',
    en: 'Dashboard',
    es: 'Panel de Control',
    pt: 'Painel',
    de: 'Dashboard',
    zh: '仪表板',
    ru: 'Панель управления',
    it: 'Pannello di controllo',
    ar: 'لوحة التحكم'
  },
  'dashboard.welcome': {
    fr: 'Bienvenue',
    en: 'Welcome',
    es: 'Bienvenido',
    pt: 'Bem-vindo',
    de: 'Willkommen',
    zh: '欢迎',
    ru: 'Добро пожаловать',
    it: 'Benvenuto',
    ar: 'مرحباً'
  },
  'dashboard.ecosystem': {
    fr: 'Écosystème',
    en: 'Ecosystem',
    es: 'Ecosistema',
    pt: 'Ecossistema',
    de: 'Ökosystem',
    zh: '生态系统',
    ru: 'Экосистема',
    it: 'Ecosistema',
    ar: 'النظام البيئي'
  },
  'dashboard.connectedApps': {
    fr: 'Applications connectées',
    en: 'Connected Apps',
    es: 'Aplicaciones Conectadas',
    pt: 'Aplicações Conectadas',
    de: 'Verbundene Apps',
    zh: '已连接的应用',
    ru: 'Подключенные приложения',
    it: 'App Connesse',
    ar: 'التطبيقات المتصلة'
  },
  'dashboard.security': {
    fr: 'Sécurité',
    en: 'Security',
    es: 'Seguridad',
    pt: 'Segurança',
    de: 'Sicherheit',
    zh: '安全',
    ru: 'Безопасность',
    it: 'Sicurezza',
    ar: 'الأمان'
  },
  'dashboard.profile': {
    fr: 'Profil',
    en: 'Profile',
    es: 'Perfil',
    pt: 'Perfil',
    de: 'Profil',
    zh: '个人资料',
    ru: 'Профиль',
    it: 'Profilo',
    ar: 'الملف الشخصي'
  },
  'dashboard.connectedTo': {
    fr: 'Connecté à l\'écosystème LuvviX',
    en: 'Connected to LuvviX ecosystem',
    es: 'Conectado al ecosistema LuvviX',
    pt: 'Conectado ao ecossistema LuvviX',
    de: 'Mit LuvviX-Ökosystem verbunden',
    zh: '已连接到 LuvviX 生态系统',
    ru: 'Подключено к экосистеме LuvviX',
    it: 'Connesso all\'ecosistema LuvviX',
    ar: 'متصل بنظام LuvviX البيئي'
  },
  // Applications
  'app.aiStudio': {
    fr: 'LuvviX AI Studio',
    en: 'LuvviX AI Studio',
    es: 'LuvviX AI Studio',
    pt: 'LuvviX AI Studio',
    de: 'LuvviX AI Studio',
    zh: 'LuvviX AI Studio',
    ru: 'LuvviX AI Studio',
    it: 'LuvviX AI Studio',
    ar: 'LuvviX AI Studio'
  },
  'app.aiStudio.desc': {
    fr: 'Créez vos agents IA',
    en: 'Create your AI agents',
    es: 'Crea tus agentes IA',
    pt: 'Crie seus agentes IA',
    de: 'Erstellen Sie Ihre KI-Agenten',
    zh: '创建您的 AI 代理',
    ru: 'Создайте своих ИИ-агентов',
    it: 'Crea i tuoi agenti IA',
    ar: 'إنشاء وكلاء الذكاء الاصطناعي'
  },
  'app.translate': {
    fr: 'LuvviX Translate',
    en: 'LuvviX Translate',
    es: 'LuvviX Translate',
    pt: 'LuvviX Translate',
    de: 'LuvviX Translate',
    zh: 'LuvviX Translate',
    ru: 'LuvviX Translate',
    it: 'LuvviX Translate',
    ar: 'LuvviX Translate'
  },
  'app.translate.desc': {
    fr: 'Traduction IA instantanée',
    en: 'Instant AI translation',
    es: 'Traducción IA instantánea',
    pt: 'Tradução IA instantânea',
    de: 'Sofortige KI-Übersetzung',
    zh: '即时 AI 翻译',
    ru: 'Мгновенный ИИ-перевод',
    it: 'Traduzione IA istantanea',
    ar: 'ترجمة فورية بالذكاء الاصطناعي'
  },
  'app.mindmap': {
    fr: 'LuvviX MindMap',
    en: 'LuvviX MindMap',
    es: 'LuvviX MindMap',
    pt: 'LuvviX MindMap',
    de: 'LuvviX MindMap',
    zh: 'LuvviX MindMap',
    ru: 'LuvviX MindMap',
    it: 'LuvviX MindMap',
    ar: 'LuvviX MindMap'
  },
  'app.mindmap.desc': {
    fr: 'Cartes mentales IA',
    en: 'AI mind maps',
    es: 'Mapas mentales IA',
    pt: 'Mapas mentais IA',
    de: 'KI-Mindmaps',
    zh: 'AI 思维导图',
    ru: 'ИИ ментальные карты',
    it: 'Mappe mentali IA',
    ar: 'خرائط ذهنية بالذكاء الاصطناعي'
  },
  'app.codeStudio': {
    fr: 'LuvviX Code Studio',
    en: 'LuvviX Code Studio',
    es: 'LuvviX Code Studio',
    pt: 'LuvviX Code Studio',
    de: 'LuvviX Code Studio',
    zh: 'LuvviX Code Studio',
    ru: 'LuvviX Code Studio',
    it: 'LuvviX Code Studio',
    ar: 'LuvviX Code Studio'
  },
  'app.codeStudio.desc': {
    fr: 'Génération de code IA',
    en: 'AI code generation',
    es: 'Generación de código IA',
    pt: 'Geração de código IA',
    de: 'KI-Code-Generierung',
    zh: 'AI 代码生成',
    ru: 'ИИ генерация кода',
    it: 'Generazione codice IA',
    ar: 'توليد الكود بالذكاء الاصطناعي'
  },
  'app.forms': {
    fr: 'LuvviX Forms',
    en: 'LuvviX Forms',
    es: 'LuvviX Forms',
    pt: 'LuvviX Forms',
    de: 'LuvviX Forms',
    zh: 'LuvviX Forms',
    ru: 'LuvviX Forms',
    it: 'LuvviX Forms',
    ar: 'LuvviX Forms'
  },
  'app.forms.desc': {
    fr: 'Formulaires intelligents',
    en: 'Smart forms',
    es: 'Formularios inteligentes',
    pt: 'Formulários inteligentes',
    de: 'Intelligente Formulare',
    zh: '智能表单',
    ru: 'Умные формы',
    it: 'Moduli intelligenti',
    ar: 'نماذج ذكية'
  },
  'app.cloud': {
    fr: 'LuvviX Cloud',
    en: 'LuvviX Cloud',
    es: 'LuvviX Cloud',
    pt: 'LuvviX Cloud',
    de: 'LuvviX Cloud',
    zh: 'LuvviX Cloud',
    ru: 'LuvviX Cloud',
    it: 'LuvviX Cloud',
    ar: 'LuvviX Cloud'
  },
  'app.cloud.desc': {
    fr: 'Stockage sécurisé',
    en: 'Secure storage',
    es: 'Almacenamiento seguro',
    pt: 'Armazenamento seguro',
    de: 'Sichere Speicherung',
    zh: '安全存储',
    ru: 'Безопасное хранилище',
    it: 'Archiviazione sicura',
    ar: 'تخزين آمن'
  },
  'app.news': {
    fr: 'LuvviX News',
    en: 'LuvviX News',
    es: 'LuvviX News',
    pt: 'LuvviX News',
    de: 'LuvviX News',
    zh: 'LuvviX News',
    ru: 'LuvviX News',
    it: 'LuvviX News',
    ar: 'LuvviX News'
  },
  'app.news.desc': {
    fr: 'Actualités personnalisées',
    en: 'Personalized news',
    es: 'Noticias personalizadas',
    pt: 'Notícias personalizadas',
    de: 'Personalisierte Nachrichten',
    zh: '个性化新闻',
    ru: 'Персонализированные новости',
    it: 'Notizie personalizzate',
    ar: 'أخبار مخصصة'
  },
  'app.weather': {
    fr: 'LuvviX Weather',
    en: 'LuvviX Weather',
    es: 'LuvviX Weather',
    pt: 'LuvviX Weather',
    de: 'LuvviX Weather',
    zh: 'LuvviX Weather',
    ru: 'LuvviX Weather',
    it: 'LuvviX Weather',
    ar: 'LuvviX Weather'
  },
  'app.weather.desc': {
    fr: 'Météo intelligente',
    en: 'Smart weather',
    es: 'Clima inteligente',
    pt: 'Clima inteligente',
    de: 'Intelligentes Wetter',
    zh: '智能天气',
    ru: 'Умная погода',
    it: 'Meteo intelligente',
    ar: 'طقس ذكي'
  },
  'app.streamMix': {
    fr: 'LuvviX StreamMix',
    en: 'LuvviX StreamMix',
    es: 'LuvviX StreamMix',
    pt: 'LuvviX StreamMix',
    de: 'LuvviX StreamMix',
    zh: 'LuvviX StreamMix',
    ru: 'LuvviX StreamMix',
    it: 'LuvviX StreamMix',
    ar: 'LuvviX StreamMix'
  },
  'app.streamMix.desc': {
    fr: 'Bientôt disponible',
    en: 'Coming soon',
    es: 'Próximamente',
    pt: 'Em breve',
    de: 'Demnächst verfügbar',
    zh: '即将推出',
    ru: 'Скоро',
    it: 'Prossimamente',
    ar: 'قريباً'
  },
  'app.complete': {
    fr: 'Écosystème complet',
    en: 'Complete ecosystem',
    es: 'Ecosistema completo',
    pt: 'Ecossistema completo',
    de: 'Vollständiges Ökosystem',
    zh: '完整生态系统',
    ru: 'Полная экосистема',
    it: 'Ecosistema completo',
    ar: 'النظام البيئي الكامل'
  },
  // Settings
  'settings.language': {
    fr: 'Langue',
    en: 'Language',
    es: 'Idioma',
    pt: 'Idioma',
    de: 'Sprache',
    zh: '语言',
    ru: 'Язык',
    it: 'Lingua',
    ar: 'اللغة'
  },
  'settings.notifications': {
    fr: 'Notifications',
    en: 'Notifications',
    es: 'Notificaciones',
    pt: 'Notificações',
    de: 'Benachrichtigungen',
    zh: '通知',
    ru: 'Уведомления',
    it: 'Notifiche',
    ar: 'الإشعارات'
  },
  'settings.notifications.push': {
    fr: 'Notifications push',
    en: 'Push notifications',
    es: 'Notificaciones push',
    pt: 'Notificações push',
    de: 'Push-Benachrichtigungen',
    zh: '推送通知',
    ru: 'Push-уведомления',
    it: 'Notifiche push',
    ar: 'إشعارات الدفع'
  },
  'settings.notifications.email': {
    fr: 'Notifications email',
    en: 'Email notifications',
    es: 'Notificaciones por email',
    pt: 'Notificações por email',
    de: 'E-Mail-Benachrichtigungen',
    zh: '邮件通知',
    ru: 'Email-уведомления',
    it: 'Notifiche email',
    ar: 'إشعارات البريد الإلكتروني'
  },
  'settings.preferences': {
    fr: 'Préférences',
    en: 'Preferences',
    es: 'Preferencias',
    pt: 'Preferências',
    de: 'Einstellungen',
    zh: '偏好设置',
    ru: 'Настройки',
    it: 'Preferenze',
    ar: 'التفضيلات'
  },
  'settings.darkMode': {
    fr: 'Mode sombre',
    en: 'Dark mode',
    es: 'Modo oscuro',
    pt: 'Modo escuro',
    de: 'Dunkler Modus',
    zh: '深色模式',
    ru: 'Темный режим',
    it: 'Modalità scura',
    ar: 'الوضع المظلم'
  },
  'settings.autoSave': {
    fr: 'Sauvegarde automatique',
    en: 'Auto save',
    es: 'Guardado automático',
    pt: 'Salvamento automático',
    de: 'Automatisches Speichern',
    zh: '自动保存',
    ru: 'Автосохранение',
    it: 'Salvataggio automatico',
    ar: 'الحفظ التلقائي'
  },
  'settings.security.advanced': {
    fr: 'Sécurité avancée',
    en: 'Advanced security',
    es: 'Seguridad avanzada',
    pt: 'Segurança avançada',
    de: 'Erweiterte Sicherheit',
    zh: '高级安全',
    ru: 'Расширенная безопасность',
    it: 'Sicurezza avanzata',
    ar: 'الأمان المتقدم'
  },
  'settings.twoFactor': {
    fr: 'Authentification à deux facteurs',
    en: 'Two-factor authentication',
    es: 'Autenticación de dos factores',
    pt: 'Autenticação de dois fatores',
    de: 'Zwei-Faktor-Authentifizierung',
    zh: '双因子认证',
    ru: 'Двухфакторная аутентификация',
    it: 'Autenticazione a due fattori',
    ar: 'المصادقة الثنائية'
  },
  'settings.twoFactor.desc': {
    fr: 'Ajoutez une couche de sécurité supplémentaire',
    en: 'Add an extra layer of security',
    es: 'Añadir una capa extra de seguridad',
    pt: 'Adicionar uma camada extra de segurança',
    de: 'Eine zusätzliche Sicherheitsebene hinzufügen',
    zh: '添加额外的安全层',
    ru: 'Добавить дополнительный уровень безопасности',
    it: 'Aggiungi un livello di sicurezza extra',
    ar: 'إضافة طبقة أمان إضافية'
  },
  'settings.publicProfile': {
    fr: 'Profil public',
    en: 'Public profile',
    es: 'Perfil público',
    pt: 'Perfil público',
    de: 'Öffentliches Profil',
    zh: '公开档案',
    ru: 'Публичный профиль',
    it: 'Profilo pubblico',
    ar: 'الملف الشخصي العام'
  },
  'settings.publicProfile.desc': {
    fr: 'Permettre aux autres de voir votre profil',
    en: 'Allow others to see your profile',
    es: 'Permitir que otros vean tu perfil',
    pt: 'Permitir que outros vejam seu perfil',
    de: 'Anderen erlauben, Ihr Profil zu sehen',
    zh: '允许其他人查看您的档案',
    ru: 'Разрешить другим видеть ваш профиль',
    it: 'Permetti ad altri di vedere il tuo profilo',
    ar: 'السماح للآخرين برؤية ملفك الشخصي'
  },
  // Actions
  'action.changePassword': {
    fr: 'Changer le mot de passe',
    en: 'Change password',
    es: 'Cambiar contraseña',
    pt: 'Alterar senha',
    de: 'Passwort ändern',
    zh: '更改密码',
    ru: 'Изменить пароль',
    it: 'Cambia password',
    ar: 'تغيير كلمة المرور'
  },
  'action.changePassword.desc': {
    fr: 'Mettre à jour vos identifiants',
    en: 'Update your credentials',
    es: 'Actualizar tus credenciales',
    pt: 'Atualizar suas credenciais',
    de: 'Ihre Anmeldedaten aktualisieren',
    zh: '更新您的凭据',
    ru: 'Обновить ваши учетные данные',
    it: 'Aggiorna le tue credenziali',
    ar: 'تحديث بيانات الاعتماد'
  },
  'action.globalSignOut': {
    fr: 'Déconnexion globale',
    en: 'Global sign out',
    es: 'Cerrar sesión global',
    pt: 'Sair globalmente',
    de: 'Globale Abmeldung',
    zh: '全局退出',
    ru: 'Глобальный выход',
    it: 'Disconnessione globale',
    ar: 'تسجيل الخروج الشامل'
  },
  'action.globalSignOut.desc': {
    fr: 'Déconnecter tous les appareils',
    en: 'Disconnect all devices',
    es: 'Desconectar todos los dispositivos',
    pt: 'Desconectar todos os dispositivos',
    de: 'Alle Geräte trennen',
    zh: '断开所有设备',
    ru: 'Отключить все устройства',
    it: 'Disconnetti tutti i dispositivi',
    ar: 'قطع الاتصال عن جميع الأجهزة'
  },
  'action.updateProfile': {
    fr: 'Mettre à jour le profil',
    en: 'Update profile',
    es: 'Actualizar perfil',
    pt: 'Atualizar perfil',
    de: 'Profil aktualisieren',
    zh: '更新档案',
    ru: 'Обновить профиль',
    it: 'Aggiorna profilo',
    ar: 'تحديث الملف الشخصي'
  },
  'action.revokeAccess': {
    fr: "Révoquer l'accès",
    en: 'Revoke access',
    es: 'Revocar acceso',
    pt: 'Revogar acesso',
    de: 'Zugriff widerrufen',
    zh: '撤销访问',
    ru: 'Отозвать доступ',
    it: 'Revoca accesso',
    ar: 'إلغاء الوصول'
  },
  'action.revoking': {
    fr: 'Révocation...',
    en: 'Revoking...',
    es: 'Revocando...',
    pt: 'Revogando...',
    de: 'Widerrufen...',
    zh: '撤销中...',
    ru: 'Отзыв...',
    it: 'Revocando...',
    ar: 'إلغاء...'
  },
  'action.actions': {
    fr: 'Actions',
    en: 'Actions',
    es: 'Acciones',
    pt: 'Ações',
    de: 'Aktionen',
    zh: '操作',
    ru: 'Действия',
    it: 'Azioni',
    ar: 'الإجراءات'
  },
  // General
  'general.loading': {
    fr: 'Chargement...',
    en: 'Loading...',
    es: 'Cargando...',
    pt: 'Carregando...',
    de: 'Wird geladen...',
    zh: '加载中...',
    ru: 'Загрузка...',
    it: 'Caricamento...',
    ar: 'جاري التحميل...'
  },
  'general.noData': {
    fr: 'Aucune donnée disponible',
    en: 'No data available',
    es: 'No hay datos disponibles',
    pt: 'Nenhum dado disponível',
    de: 'Keine Daten verfügbar',
    zh: '无可用数据',
    ru: 'Нет доступных данных',
    it: 'Nessun dato disponibile',
    ar: 'لا توجد بيانات متاحة'
  },
  'general.error': {
    fr: 'Erreur',
    en: 'Error',
    es: 'Error',
    pt: 'Erro',
    de: 'Fehler',
    zh: '错误',
    ru: 'Ошибка',
    it: 'Errore',
    ar: 'خطأ'
  },
  'general.success': {
    fr: 'Succès',
    en: 'Success',
    es: 'Éxito',
    pt: 'Sucesso',
    de: 'Erfolg',
    zh: '成功',
    ru: 'Успех',
    it: 'Successo',
    ar: 'نجح'
  },
  'general.email': {
    fr: 'Email',
    en: 'Email',
    es: 'Correo',
    pt: 'Email',
    de: 'E-Mail',
    zh: '邮箱',
    ru: 'Электронная почта',
    it: 'Email',
    ar: 'البريد الإلكتروني'
  },
  'general.fullName': {
    fr: 'Nom complet',
    en: 'Full name',
    es: 'Nombre completo',
    pt: 'Nome completo',
    de: 'Vollständiger Name',
    zh: '全名',
    ru: 'Полное имя',
    it: 'Nome completo',
    ar: 'الاسم الكامل'
  },
  'general.username': {
    fr: "Nom d'utilisateur",
    en: 'Username',
    es: 'Nombre de usuario',
    pt: 'Nome de usuário',
    de: 'Benutzername',
    zh: '用户名',
    ru: 'Имя пользователя',
    it: 'Nome utente',
    ar: 'اسم المستخدم'
  },
  'general.memberSince': {
    fr: 'Membre depuis',
    en: 'Member since',
    es: 'Miembro desde',
    pt: 'Membro desde',
    de: 'Mitglied seit',
    zh: '注册时间',
    ru: 'Участник с',
    it: 'Membro da',
    ar: 'عضو منذ'
  },
  'general.grantedOn': {
    fr: 'Accordé le',
    en: 'Granted on',
    es: 'Otorgado el',
    pt: 'Concedido em',
    de: 'Gewährt am',
    zh: '授权于',
    ru: 'Предоставлено',
    it: 'Concesso il',
    ar: 'تم منحه في'
  },
  'general.lastAccess': {
    fr: 'Dernier accès',
    en: 'Last access',
    es: 'Último acceso',
    pt: 'Último acesso',
    de: 'Letzter Zugriff',
    zh: '最后访问',
    ru: 'Последний доступ',
    it: 'Ultimo accesso',
    ar: 'آخر وصول'
  },
  // Footer
  'footer.products': {
    fr: 'Produits',
    en: 'Products',
    es: 'Productos',
    pt: 'Produtos',
    de: 'Produkte',
    zh: '产品',
    ru: 'Продукты',
    it: 'Prodotti',
    ar: 'المنتجات'
  },
  'footer.resources': {
    fr: 'Ressources',
    en: 'Resources',
    es: 'Recursos',
    pt: 'Recursos',
    de: 'Ressourcen',
    zh: '资源',
    ru: 'Ресурсы',
    it: 'Risorse',
    ar: 'الموارد'
  },
  'footer.legal': {
    fr: 'Légal',
    en: 'Legal',
    es: 'Legal',
    pt: 'Legal',
    de: 'Rechtliches',
    zh: '法律',
    ru: 'Правовая информация',
    it: 'Legale',
    ar: 'قانوني'
  },
  'footer.description': {
    fr: "L'écosystème complet pour vos besoins numériques. IA, stockage cloud, traduction et bien plus.",
    en: 'The complete ecosystem for your digital needs. AI, cloud storage, translation and much more.',
    es: 'El ecosistema completo para tus necesidades digitales. IA, almacenamiento en la nube, traducción y mucho más.',
    pt: 'O ecossistema completo para suas necessidades digitais. IA, armazenamento em nuvem, tradução e muito mais.',
    de: 'Das komplette Ökosystem für Ihre digitalen Bedürfnisse. KI, Cloud-Speicher, Übersetzung und vieles mehr.',
    zh: '满足您数字需求的完整生态系统。AI、云存储、翻译等等。',
    ru: 'Полная экосистема для ваших цифровых потребностей. ИИ, облачное хранилище, перевод и многое другое.',
    it: "L'ecosistema completo per le tue esigenze digitali. IA, archiviazione cloud, traduzione e molto altro.",
    ar: 'النظام البيئي الكامل لاحتياجاتك الرقمية. الذكاء الاصطناعي والتخزين السحابي والترجمة وأكثر من ذلك بكثير.'
  },
  'footer.documentation': {
    fr: 'Documentation',
    en: 'Documentation',
    es: 'Documentación',
    pt: 'Documentação',
    de: 'Dokumentation',
    zh: '文档',
    ru: 'Документация',
    it: 'Documentazione',
    ar: 'التوثيق'
  },
  'footer.api': {
    fr: 'API',
    en: 'API',
    es: 'API',
    pt: 'API',
    de: 'API',
    zh: 'API',
    ru: 'API',
    it: 'API',
    ar: 'واجهة برمجة التطبيقات'
  },
  'footer.privacy': {
    fr: 'Confidentialité',
    en: 'Privacy',
    es: 'Privacidad',
    pt: 'Privacidade',
    de: 'Datenschutz',
    zh: '隐私',
    ru: 'Конфиденциальность',
    it: 'Privacy',
    ar: 'الخصوصية'
  },
  'footer.terms': {
    fr: "Conditions d'utilisation",
    en: 'Terms of use',
    es: 'Términos de uso',
    pt: 'Termos de uso',
    de: 'Nutzungsbedingungen',
    zh: '使用条款',
    ru: 'Условия использования',
    it: 'Termini di utilizzo',
    ar: 'شروط الاستخدام'
  },
  'footer.cookies': {
    fr: 'Cookies',
    en: 'Cookies',
    es: 'Cookies',
    pt: 'Cookies',
    de: 'Cookies',
    zh: 'Cookies',
    ru: 'Файлы cookie',
    it: 'Cookie',
    ar: 'ملفات تعريف الارتباط'
  },
  'footer.copyright': {
    fr: '© 2024 LuvviX. Tous droits réservés.',
    en: '© 2024 LuvviX. All rights reserved.',
    es: '© 2024 LuvviX. Todos los derechos reservados.',
    pt: '© 2024 LuvviX. Todos os direitos reservados.',
    de: '© 2024 LuvviX. Alle Rechte vorbehalten.',
    zh: '© 2024 LuvviX. 保留所有权利。',
    ru: '© 2024 LuvviX. Все права защищены.',
    it: '© 2024 LuvviX. Tutti i diritti riservati.',
    ar: '© 2024 LuvviX. جميع الحقوق محفوظة.'
  },
  'footer.availableLanguages': {
    fr: '🌐 Disponible en 9 langues',
    en: '🌐 Available in 9 languages',
    es: '🌐 Disponible en 9 idiomas',
    pt: '🌐 Disponível em 9 idiomas',
    de: '🌐 Verfügbar in 9 Sprachen',
    zh: '🌐 支持 9 种语言',
    ru: '🌐 Доступно на 9 языках',
    it: '🌐 Disponibile in 9 lingue',
    ar: '🌐 متوفر بـ 9 لغات'
  },
  // Messages
  'message.noAppsConnected': {
    fr: 'Aucune application connectée',
    en: 'No connected applications',
    es: 'No hay aplicaciones conectadas',
    pt: 'Nenhuma aplicação conectada',
    de: 'Keine verbundenen Anwendungen',
    zh: '没有连接的应用',
    ru: 'Нет подключенных приложений',
    it: 'Nessuna applicazione connessa',
    ar: 'لا توجد تطبيقات متصلة'
  },
  'message.noAppsConnected.desc': {
    fr: 'Les applications que vous autoriserez apparaîtront ici',
    en: 'Applications you authorize will appear here',
    es: 'Las aplicaciones que autorices aparecerán aquí',
    pt: 'As aplicações que autorizar aparecerão aqui',
    de: 'Anwendungen, die Sie autorisieren, werden hier angezeigt',
    zh: '您授权的应用程序将显示在这里',
    ru: 'Приложения, которые вы авторизуете, появятся здесь',
    it: 'Le applicazioni che autorizzi appariranno qui',
    ar: 'ستظهر التطبيقات التي تصرح بها هنا'
  },
  'message.loadingApps': {
    fr: 'Chargement des applications...',
    en: 'Loading applications...',
    es: 'Cargando aplicaciones...',
    pt: 'Carregando aplicações...',
    de: 'Anwendungen werden geladen...',
    zh: '正在加载应用程序...',
    ru: 'Загрузка приложений...',
    it: 'Caricamento applicazioni...',
    ar: 'جاري تحميل التطبيقات...'
  },
  'message.accessRevoked': {
    fr: 'Accès révoqué',
    en: 'Access revoked',
    es: 'Acceso revocado',
    pt: 'Acesso revogado',
    de: 'Zugriff widerrufen',
    zh: '访问已撤销',
    ru: 'Доступ отозван',
    it: 'Accesso revocato',
    ar: 'تم إلغاء الوصول'
  },
  'message.accessRevokedDesc': {
    fr: 'a été révoqué avec succès.',
    en: 'has been successfully revoked.',
    es: 'ha sido revocado con éxito.',
    pt: 'foi revogado com sucesso.',
    de: 'wurde erfolgreich widerrufen.',
    zh: '已成功撤销。',
    ru: 'был успешно отозван.',
    it: 'è stato revocato con successo.',
    ar: 'تم إلغاؤه بنجاح.'
  },
  'dashboard.ecosystemDescription': {
    fr: 'Accédez à toutes vos applications et services LuvviX',
    en: 'Access all your LuvviX applications and services',
    es: 'Accede a todas tus aplicaciones y servicios de LuvviX',
    pt: 'Acesse todos os seus aplicativos e serviços LuvviX',
    de: 'Greifen Sie auf alle Ihre LuvviX-Anwendungen und -Dienste zu',
    zh: '访问您所有的 LuvviX 应用程序和服务',
    ru: 'Получите доступ ко всем вашим приложениям и сервисам LuvviX',
    it: 'Accedi a tutte le tue applicazioni e servizi LuvviX',
    ar: 'الوصول إلى جميع تطبيقات وخدمات LuvviX الخاصة بك'
  },
  'dashboard.connectedAppsDescription': {
    fr: 'Voici les applications auxquelles vous avez accordé l\'accès via LuvviX ID',
    en: 'Here are the applications you have granted access to via LuvviX ID',
    es: 'Aquí están las aplicaciones a las que has otorgado acceso a través de LuvviX ID',
    pt: 'Aqui estão os aplicativos aos quais você concedeu acesso via LuvviX ID',
    de: 'Hier sind die Anwendungen, denen Sie über LuvviX ID Zugriff gewährt haben',
    zh: '这里是您通过 LuvviX ID 授权访问的应用程序',
    ru: 'Вот приложения, которым вы предоставили доступ через LuvviX ID',
    it: 'Ecco le applicazioni a cui hai concesso l\'accesso tramite LuvviX ID',
    ar: 'إليك التطبيقات التي منحت لها الوصول عبر LuvviX ID'
  },
  'dashboard.securityDescription': {
    fr: 'Gérez les paramètres de sécurité et les connexions récentes',
    en: 'Manage security settings and recent connections',
    es: 'Gestiona la configuración de seguridad y las conexiones recientes',
    pt: 'Gerencie configurações de segurança e conexões recentes',
    de: 'Verwalten Sie Sicherheitseinstellungen und aktuelle Verbindungen',
    zh: '管理安全设置和最近的连接',
    ru: 'Управляйте настройками безопасности и недавними подключениями',
    it: 'Gestisci le impostazioni di sicurezza e le connessioni recenti',
    ar: 'إدارة إعدادات الأمان والاتصالات الأخيرة'
  },
  'dashboard.profileDescription': {
    fr: 'Gérez vos informations personnelles',
    en: 'Manage your personal information',
    es: 'Gestiona tu información personal',
    pt: 'Gerencie suas informações pessoais',
    de: 'Verwalten Sie Ihre persönlichen Informationen',
    zh: '管理您的个人信息',
    ru: 'Управляйте вашей личной информацией',
    it: 'Gestisci le tue informazioni personali',
    ar: 'إدارة معلوماتك الشخصية'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languages = [
  { code: 'fr' as Language, name: 'Français', flag: '🇫🇷' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'es' as Language, name: 'Español', flag: '🇪🇸' },
  { code: 'pt' as Language, name: 'Português', flag: '🇵🇹' },
  { code: 'de' as Language, name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'ru' as Language, name: 'Русский', flag: '🇷🇺' },
  { code: 'it' as Language, name: 'Italiano', flag: '🇮🇹' },
  { code: 'ar' as Language, name: 'العربية', flag: '🇸🇦' }
];

const detectBrowserLanguage = (): Language => {
  const browserLang = navigator.language.toLowerCase();
  
  if (browserLang.startsWith('fr')) return 'fr';
  if (browserLang.startsWith('en')) return 'en';
  if (browserLang.startsWith('es')) return 'es';
  if (browserLang.startsWith('pt')) return 'pt';
  if (browserLang.startsWith('de')) return 'de';
  if (browserLang.startsWith('zh')) return 'zh';
  if (browserLang.startsWith('ru')) return 'ru';
  if (browserLang.startsWith('it')) return 'it';
  if (browserLang.startsWith('ar')) return 'ar';
  
  return 'fr'; // Default to French
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('luvvix-language') as Language;
    return saved || detectBrowserLanguage();
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('luvvix-language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key;
    return translation[language] || translation.fr || key;
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
