/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, 
  Globe, 
  Activity, 
  Settings, 
  Power, 
  Zap, 
  Lock, 
  MessageSquare, 
  ChevronRight, 
  Server, 
  Cpu,
  Wifi,
  Terminal,
  AlertCircle,
  Send,
  Mail,
  Sun,
  Moon,
  Languages,
  ChevronDown,
  Search,
  Star,
  RefreshCw,
  Menu,
  Crown,
  ChevronsRight,
  ShieldCheck,
  Bug,
  ToggleRight,
  GitFork,
  Rocket,
  Infinity,
  MapPin,
  Plane,
  Clock,
  Info,
  Palette
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import * as d3 from 'd3';
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface ServerLocation {
  id: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
  latency: number;
  load: number;
}

interface TrafficData {
  time: string;
  down: number;
  up: number;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface AppInfo {
  id: string;
  name: string;
  icon: string;
}

// --- Constants ---
const AVAILABLE_APPS: AppInfo[] = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
  { id: 'facebook', name: 'Facebook', icon: '👥' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'youtube', name: 'YouTube', icon: '📺' },
  { id: 'chrome', name: 'Chrome', icon: '🌐' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'netflix', name: 'Netflix', icon: '🎬' },
  { id: 'spotify', name: 'Spotify', icon: '🎵' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'twitter', name: 'Twitter', icon: '🐦' },
];

const INITIAL_SERVERS: ServerLocation[] = [
  { id: 'ao-lua', name: 'Angola (Luanda)', flag: '🇦🇴', lat: -8.8390, lng: 13.2894, latency: 35, load: 15 },
  { id: 'na-win', name: 'Namibia (Windhoek)', flag: '🇳🇦', lat: -22.5745, lng: 17.0808, latency: 70, load: 25 },
  { id: 'za-cpt', name: 'South Africa (Cape Town)', flag: '🇿🇦', lat: -33.9249, lng: 18.4241, latency: 55, load: 30 },
  { id: 'ng-lag', name: 'Nigeria (Lagos)', flag: '🇳🇬', lat: 6.5244, lng: 3.3792, latency: 65, load: 45 },
  { id: 'ke-nbo', name: 'Kenya (Nairobi)', flag: '🇰🇪', lat: -1.2921, lng: 36.8219, latency: 80, load: 20 },
  { id: 'pt-lis', name: 'Portugal (Lisbon)', flag: '🇵🇹', lat: 38.7223, lng: -9.1393, latency: 110, load: 35 },
  { id: 'us-east', name: 'USA (New York)', flag: '🇺🇸', lat: 40.7128, lng: -74.0060, latency: 145, load: 65 },
  { id: 'us-west', name: 'USA (Los Angeles)', flag: '🇺🇸', lat: 34.0522, lng: -118.2437, latency: 180, load: 50 },
  { id: 'br-sao', name: 'Brazil (São Paulo)', flag: '🇧🇷', lat: -23.5505, lng: -46.6333, latency: 160, load: 20 },
  { id: 'uk-lon', name: 'UK (London)', flag: '🇬🇧', lat: 51.5074, lng: -0.1278, latency: 120, load: 40 },
  { id: 'de-fra', name: 'Germany (Frankfurt)', flag: '🇩🇪', lat: 50.1109, lng: 8.6821, latency: 115, load: 30 },
  { id: 'fr-par', name: 'France (Paris)', flag: '🇫🇷', lat: 48.8566, lng: 2.3522, latency: 118, load: 45 },
  { id: 'jp-tok', name: 'Japan (Tokyo)', flag: '🇯🇵', lat: 35.6762, lng: 139.6503, latency: 250, load: 85 },
  { id: 'sg-sin', name: 'Singapore', flag: '🇸🇬', lat: 1.3521, lng: 103.8198, latency: 210, load: 55 },
  { id: 'au-syd', name: 'Australia (Sydney)', flag: '🇦🇺', lat: -33.8688, lng: 151.2093, latency: 300, load: 40 },
  { id: 'in-mum', name: 'India (Mumbai)', flag: '🇮🇳', lat: 19.0760, lng: 72.8777, latency: 190, load: 60 },
  { id: 'ae-dxb', name: 'UAE (Dubai)', flag: '🇦🇪', lat: 25.2048, lng: 55.2708, latency: 150, load: 35 },
  { id: 'pl-war', name: 'Poland (Warsaw)', flag: '🇵🇱', lat: 52.2297, lng: 21.0122, latency: 125, load: 20 },
  { id: 'pl-kra', name: 'Poland (Kraków)', flag: '🇵🇱', lat: 50.0647, lng: 19.9450, latency: 130, load: 15 },
  { id: 'pl-gda', name: 'Poland (Gdańsk)', flag: '🇵🇱', lat: 54.3520, lng: 18.6466, latency: 128, load: 10 },
  { id: 'pl-poz', name: 'Poland (Poznań)', flag: '🇵🇱', lat: 52.4064, lng: 16.9252, latency: 132, load: 12 },
];

const PROVIDERS = ['Unitel', 'Movicel', 'Africell', 'Global Auto'];

type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'ru' | 'zh' | 'jp';

const TRANSLATIONS = {
  pt: {
    connected: "Conectado",
    disconnected: "Desconectado",
    connecting: "Conectando...",
    disconnect: "Desconectar",
    connect: "Conectar",
    military_encryption: "Criptografia de nível militar e contorno de censura",
    virtual_location: "Localização Virtual",
    latency: "Latência",
    protocol: "Protocolo",
    public_ip: "IP Público",
    optimized_path: "CAMINHO OTIMIZADO",
    protected: "PROTEGIDO",
    exposed: "EXPOSTO",
    global_node_map: "Mapa de Nós Global",
    active_nodes: "Nós Ativos",
    traffic_monitor: "Monitor de Tráfego",
    privacy_advisor: "Consultor de Privacidade",
    system_load: "Carga do Sistema",
    session: "Sessão",
    data: "Dados",
    dark_mode: "Ativar Modo Escuro",
    light_mode: "Ativar Modo Claro",
    settings: "Configurações",
    language: "Idioma",
    node: "NÓ",
    inicio: "Início",
    privacy_terms: "Privacidade e termos de BRC Conectar",
    support: "Suporte",
    tunel_ligado: "Rede Conectada",
    tunel_desligado: "Rede Desconectada",
    escudo_wifi: "Escudo Wi-Fi",
    alerta_malware: "Alerta de Malware",
    kill_switch: "Interruptor de E...",
    tunel_dividido: "Túnel Dividido",
    ai_connect: "AI Connect",
    ghost_jumper: "Ghost Jumper",
    velocidade_ultra: "Velocidade Ultra",
    especiais: "Especiais",
    tempo_ilimitado: "Tempo Ilimitado",
    change_serv: "Change Serv",
    global_network: "Rede de Nós Global",
    chat_placeholder: "Pergunte sobre privacidade ou redes...",
    chat_error: "Erro de conexão. Por favor, verifique sua configuração de API.",
    chat_fallback: "Desculpe, não consegui processar esse pedido.",
    user: "Você",
    ai_name: "BRC Conectar AI",
    operator: "Operadora (Angola/Global)",
    node_selection: "Seleção de Servidores",
    search_nodes: "Buscar por nome ou país...",
    favorites: "Favoritos",
    all_nodes: "Todos Servidores",
    change_ip: "Alterar IP",
    ip_changed: "IP Alterado com Sucesso",
    airplane_mode: "Modo de Voo",
    server_ip: "IP do Servidor",
    network_latency: "Latência da Rede",
    auto_optimize: "Otimização Automática",
    best_server_found: "Melhor servidor encontrado",
    split_tunneling_desc: "Selecione quais aplicativos devem usar o túnel VPN.",
    apps_selected: "aplicativos selecionados",
    search_apps: "Buscar aplicativos...",
    advisor_instruction: "Você é o Consultor de Privacidade BRC Conectar, um especialista em liberdade na internet, VPNs, criptografia e contorno de censura, com foco especial em redes de Angola (Unitel, Movicel, Africell). Forneça conselhos concisos, técnicos e úteis sobre como otimizar a conexão nessas redes. Mantenha um tom profissional e seguro. Se o usuário pedir suporte ou contato do desenvolvedor, informe o e-mail: borgeruicandala@gmail.com."
  },
  en: {
    connected: "Connected",
    disconnected: "Disconnected",
    connecting: "Connecting...",
    disconnect: "Disconnect",
    connect: "Connect",
    military_encryption: "Military-grade encryption and censorship bypass",
    virtual_location: "Virtual Location",
    latency: "Latency",
    protocol: "Protocol",
    public_ip: "Public IP",
    optimized_path: "OPTIMIZED PATH",
    protected: "PROTECTED",
    exposed: "EXPOSED",
    global_node_map: "Global Node Map",
    active_nodes: "Active Nodes",
    traffic_monitor: "Traffic Monitor",
    privacy_advisor: "Privacy Advisor",
    system_load: "System Load",
    session: "Session",
    data: "Data",
    dark_mode: "Enable Dark Mode",
    light_mode: "Enable Light Mode",
    settings: "Settings",
    language: "Language",
    node: "NODE",
    inicio: "Home",
    support: "Support",
    tunel_ligado: "Network Connected",
    tunel_desligado: "Network Offline",
    escudo_wifi: "Wi-Fi Shield",
    alerta_malware: "Malware Alert",
    kill_switch: "Kill Switch",
    tunel_dividido: "Split Tunneling",
    ai_connect: "AI Connect",
    ghost_jumper: "Ghost Jumper",
    velocidade_ultra: "Ultra Speed",
    especiais: "Specials",
    tempo_ilimitado: "Unlimited Time",
    change_serv: "Change Serv",
    global_network: "Global Node Network",
    chat_placeholder: "Ask about privacy or networks...",
    chat_error: "Connection error. Please check your API configuration.",
    chat_fallback: "Sorry, I could not process that request.",
    user: "You",
    ai_name: "BRC Conectar AI",
    operator: "Operator (Angola/Global)",
    node_selection: "Server Selection",
    search_nodes: "Search by name or country...",
    favorites: "Favorites",
    all_nodes: "All Servers",
    change_ip: "Change IP",
    ip_changed: "IP Changed Successfully",
    airplane_mode: "Airplane Mode",
    server_ip: "Server IP",
    network_latency: "Network Latency",
    auto_optimize: "Auto Optimization",
    best_server_found: "Best server found",
    split_tunneling_desc: "Select which apps should use the VPN tunnel.",
    apps_selected: "apps selected",
    search_apps: "Search apps...",
    advisor_instruction: "You are the BRC Conectar Privacy Advisor, an expert in internet freedom, VPNs, encryption, and censorship circumvention, with a special focus on Angolan networks (Unitel, Movicel, Africell). Provide concise, technical, and helpful advice on how to optimize connections on these networks. Maintain a professional and secure tone. If the user asks for support or developer contact, provide the email: borgeruicandala@gmail.com."
  },
  es: {
    connected: "Conectado",
    disconnected: "Desconectado",
    connecting: "Conectando...",
    disconnect: "Desconectar",
    connect: "Conectar",
    military_encryption: "Cifrado de nivel militar y evasión de censura",
    virtual_location: "Ubicación Virtual",
    latency: "Latencia",
    protocol: "Protocolo",
    public_ip: "IP Pública",
    optimized_path: "CAMINO OPTIMIZADO",
    protected: "PROTEGIDO",
    exposed: "EXPUESTO",
    global_node_map: "Mapa Global de Nodos",
    active_nodes: "Nodos Activos",
    traffic_monitor: "Monitor de Tráfico",
    privacy_advisor: "Asesor de Privacidad",
    system_load: "Carga del Sistema",
    session: "Sesión",
    data: "Datos",
    dark_mode: "Activar Modo Oscuro",
    light_mode: "Activar Modo Claro",
    settings: "Ajustes",
    language: "Idioma",
    node: "NODO",
    global_network: "Red Global de Nodos",
    chat_placeholder: "Pregunta sobre privacidad o redes...",
    chat_error: "Error de conexión. Por favor, verifique su configuración de API.",
    chat_fallback: "Lo siento, no pude procesar esa solicitud.",
    user: "Tú",
    ai_name: "BRC Conectar AI",
    operator: "Operador (Angola/Global)",
    node_selection: "Selección de Servidores",
    search_nodes: "Buscar por nombre o país...",
    favorites: "Favoritos",
    all_nodes: "Todos los Servidores",
    support: "Soporte",
    change_ip: "Cambiar IP",
    ip_changed: "IP Cambiada con Éxito",
    advisor_instruction: "Eres el Asesor de Privacidad de BRC Conectar, experto en libertad en internet, VPN, cifrado y elusión de censura, con especial atención a las redes angoleñas (Unitel, Movicel, Africell). Proporciona consejos concisos, técnicos y útiles sobre cómo optimizar las conexiones en estas redes. Mantén un tono profesional y seguro. Si el usuario solicita soporte o contacto del desarrollador, proporciona el correo electrónico: borgeruicandala@gmail.com."
  },
  fr: {
    connected: "Connecté",
    disconnected: "Déconnecté",
    connecting: "Connexion...",
    disconnect: "Déconnecter",
    connect: "Connecter",
    military_encryption: "Chiffrement de niveau militaire et contournement de la censure",
    virtual_location: "Localisation Virtuelle",
    latency: "Latence",
    protocol: "Protocole",
    public_ip: "IP Publique",
    optimized_path: "CHEMIN OPTIMISÉ",
    protected: "PROTÉGÉ",
    exposed: "EXPOSÉ",
    global_node_map: "Carte Mondiale des Noeuds",
    active_nodes: "Noeuds Actifs",
    traffic_monitor: "Moniteur de Trafic",
    privacy_advisor: "Conseiller en Confidentialité",
    system_load: "Charge du Système",
    session: "Session",
    data: "Données",
    dark_mode: "Activer le Mode Sombre",
    light_mode: "Activer le Mode Clair",
    settings: "Paramètres",
    language: "Langue",
    node: "NOEUD",
    global_network: "Réseau Mondial de Noeuds",
    chat_placeholder: "Posez des questions sur la confidentialité ou les réseaux...",
    chat_error: "Erreur de connexion. Veuillez vérifier votre configuration API.",
    chat_fallback: "Désolé, je n'ai pas pu traiter cette demande.",
    user: "Vous",
    ai_name: "BRC Conectar AI",
    operator: "Opérateur (Angola/Global)",
    node_selection: "Sélection de Nœud",
    search_nodes: "Rechercher par nom ou pays...",
    favorites: "Favoris",
    all_nodes: "Tous les Nœuds",
    support: "Support",
    change_ip: "Changer l'IP",
    ip_changed: "IP Changée avec Succès",
    advisor_instruction: "Vous êtes le conseiller en confidentialité BRC Conectar, expert en liberté sur Internet, VPN, chiffrement et contournement de la censure, avec un accent particulier sur les réseaux angolais (Unitel, Movicel, Africell). Fournissez des conseils concis, techniques et utiles sur la façon d'optimiser les connexions sur ces réseaux. Maintenez un ton professionnel et sécurisé. Si l'utilisateur demande de l'aide ou le contact du développeur, fournissez l'e-mail : borgeruicandala@gmail.com."
  },
  de: {
    connected: "Verbunden",
    disconnected: "Getrennt",
    connecting: "Verbinde...",
    disconnect: "Trennen",
    connect: "Verbinden",
    military_encryption: "Militärische Verschlüsselung und Zensurumgehung",
    virtual_location: "Virtueller Standort",
    latency: "Latenz",
    protocol: "Protokoll",
    public_ip: "Öffentliche IP",
    optimized_path: "OPTIMIERTER PFAD",
    protected: "GESCHÜTZT",
    exposed: "EXPONIERT",
    global_node_map: "Globale Knotenkarte",
    active_nodes: "Aktive Knoten",
    traffic_monitor: "Verkehrsmonitor",
    privacy_advisor: "Datenschutzberater",
    system_load: "Systemlast",
    session: "Sitzung",
    data: "Daten",
    dark_mode: "Dunkelmodus aktivieren",
    light_mode: "Hellmodus aktivieren",
    settings: "Einstellungen",
    language: "Sprache",
    node: "KNOTEN",
    global_network: "Globales Knotennetzwerk",
    chat_placeholder: "Fragen zu Datenschutz oder Netzwerken...",
    chat_error: "Verbindungsfehler. Bitte überprüfen Sie Ihre API-Konfiguration.",
    chat_fallback: "Entschuldigung, ich konnte diese Anfrage nicht bearbeiten.",
    user: "Sie",
    ai_name: "BRC Conectar AI",
    operator: "Betreiber (Angola/Global)",
    node_selection: "Knotenauswahl",
    search_nodes: "Suche nach Name oder Land...",
    favorites: "Favoriten",
    all_nodes: "Alle Knoten",
    support: "Support",
    change_ip: "IP Ändern",
    ip_changed: "IP Erfolgreich Geändert",
    advisor_instruction: "Sie sind der BRC Conectar Datenschutzberater, ein Experte für Internetfreiheit, VPNs, Verschlüsselung und Zensurumgehung, mit besonderem Fokus auf angolanische Netzwerke (Unitel, Movicel, Africell). Geben Sie prägnante, technische und hilfreiche Ratschläge zur Optimierung von Verbindungen in diesen Netzwerken. Bewahren Sie einen professionellen und sicheren Ton. Wenn der Benutzer nach Support oder Entwicklerkontakt fragt, geben Sie die E-Mail an: borgeruicandala@gmail.com."
  },
  it: {
    connected: "Connesso",
    disconnected: "Disconnesso",
    connecting: "Connessione...",
    disconnect: "Disconnetti",
    connect: "Connetti",
    military_encryption: "Crittografia di livello militare e bypass della censura",
    virtual_location: "Posizione Virtuale",
    latency: "Latenza",
    protocol: "Protocollo",
    public_ip: "IP Pubblico",
    optimized_path: "PERCORSO OTTIMIZZATO",
    protected: "PROTETTO",
    exposed: "ESPOSTO",
    global_node_map: "Mappa Globale dei Nodi",
    active_nodes: "Nodi Attivi",
    traffic_monitor: "Monitor del Traffico",
    privacy_advisor: "Consulente per la Privacy",
    system_load: "Carico di Sistema",
    session: "Sessione",
    data: "Dati",
    dark_mode: "Attiva Modalità Scura",
    light_mode: "Attiva Modalità Chiara",
    settings: "Impostazioni",
    language: "Lingua",
    node: "NODO",
    global_network: "Rete Globale di Nodi",
    chat_placeholder: "Chiedi informazioni sulla privacy o sulle reti...",
    chat_error: "Errore di connessione. Controlla la configurazione dell'API.",
    chat_fallback: "Spiacente, non è stato possibile elaborare la richiesta.",
    user: "Tu",
    ai_name: "BRC Conectar AI",
    operator: "Operatore (Angola/Global)",
    node_selection: "Selezione Nodo",
    search_nodes: "Cerca per nome o paese...",
    favorites: "Preferiti",
    all_nodes: "Tutti i Nodi",
    support: "Supporto",
    change_ip: "Cambia IP",
    ip_changed: "IP Cambiato con Successo",
    advisor_instruction: "Sei il consulente per la privacy di BRC Conectar, un esperto di libertà su Internet, VPN, crittografia e elusione della censura, con un focus speciale sulle reti angolane (Unitel, Movicel, Africell). Fornisci consigli concisi, tecnici e utili su come ottimizzare le connessioni su queste reti. Mantieni un tono professionale e sicuro. Se l'utente chiede supporto o il contatto dello sviluppatore, fornisci l'e-mail: borgeruicandala@gmail.com."
  },
  ru: {
    connected: "Подключено",
    disconnected: "Отключено",
    connecting: "Подключение...",
    disconnect: "Отключить",
    connect: "Подключить",
    military_encryption: "Шифрование военного уровня и обход цензуры",
    virtual_location: "Виртуальное местоположение",
    latency: "Задержка",
    protocol: "Протокол",
    public_ip: "Публичный IP",
    optimized_path: "ОПТИМИЗИРОВАННЫЙ ПУТЬ",
    protected: "ЗАЩИЩЕНО",
    exposed: "ОТКРЫТО",
    global_node_map: "Глобальная карта узлов",
    active_nodes: "Активные узлы",
    traffic_monitor: "Монитор трафика",
    privacy_advisor: "Консультант по конфиденциальности",
    system_load: "Загрузка системы",
    session: "Сессия",
    data: "Данные",
    dark_mode: "Включить темный режим",
    light_mode: "Включить светлый режим",
    settings: "Настройки",
    language: "Язык",
    node: "УЗЕЛ",
    global_network: "Глобальная сеть узлов",
    chat_placeholder: "Спросите о конфиденциальности или сетях...",
    chat_error: "Ошибка подключения. Проверьте конфигурацию API.",
    chat_fallback: "Извините, не удалось обработать запрос.",
    user: "Вы",
    ai_name: "BRC Conectar AI",
    operator: "Оператор (Ангола/Глобальный)",
    node_selection: "Выбор узла",
    search_nodes: "Поиск по имени или стране...",
    favorites: "Избранное",
    all_nodes: "Все узлы",
    support: "Поддержка",
    change_ip: "Сменить IP",
    ip_changed: "IP успешно изменен",
    advisor_instruction: "Вы — консультант по конфиденциальности BRC Conectar, эксперт в области свободы интернета, VPN, шифрования и обхода цензуры, с особым вниманием к ангольским сетям (Unitel, Movicel, Africell). Дайте краткие, технические и полезные советы по оптимизации соединений в этих сетях. Сохраняйте профессиональный и безопасный тон. Если пользователь запрашивает поддержку или контакт разработчика, укажите адрес электронной почты: borgeruicandala@gmail.com."
  },
  zh: {
    connected: "已连接",
    disconnected: "已断开",
    connecting: "正在连接...",
    disconnect: "断开连接",
    connect: "连接",
    military_encryption: "军用级加密和审查规避",
    virtual_location: "虚拟位置",
    latency: "延迟",
    protocol: "协议",
    public_ip: "公共 IP",
    optimized_path: "优化路径",
    protected: "受保护",
    exposed: "暴露",
    global_node_map: "全球节点地图",
    active_nodes: "活动节点",
    traffic_monitor: "流量监控",
    privacy_advisor: "隐私顾问",
    system_load: "系统负载",
    session: "会话",
    data: "数据",
    dark_mode: "启用深色模式",
    light_mode: "启用浅色模式",
    settings: "设置",
    language: "语言",
    node: "节点",
    global_network: "全球节点网络",
    chat_placeholder: "询问隐私或网络...",
    chat_error: "连接错误。请检查您的 API 配置。",
    chat_fallback: "抱歉，我无法处理该请求。",
    user: "您",
    ai_name: "BRC Conectar AI",
    operator: "运营商（安哥拉/全球）",
    node_selection: "节点选择",
    search_nodes: "按名称或国家搜索...",
    favorites: "收藏夹",
    all_nodes: "所有节点",
    support: "支持",
    change_ip: "更改 IP",
    ip_changed: "IP 更改成功",
    advisor_instruction: "您是 BRC Conectar 隐私顾问，是互联网自由、VPN、加密和审查规避方面的专家，特别关注安哥拉网络（Unitel、Movicel、Africell）。提供有关如何优化这些网络连接的简洁、技术性和有用的建议。保持专业和安全的语气。如果用户请求支持或开发人员联系方式，请提供电子邮件：borgeruicandala@gmail.com。"
  },
  jp: {
    connected: "接続済み",
    disconnected: "オフライン",
    connecting: "接続中...",
    disconnect: "切断",
    connect: "接続",
    military_encryption: "軍用レベルの暗号化と検閲回避",
    virtual_location: "仮想ロケーション",
    latency: "レイテンシ",
    protocol: "プロトコル",
    public_ip: "パブリック IP",
    optimized_path: "最適化されたパス",
    protected: "保護済み",
    exposed: "露出",
    global_node_map: "グローバルノードマップ",
    active_nodes: "アクティブノード",
    traffic_monitor: "トラフィックモニター",
    privacy_advisor: "プライバシーアドバイザー",
    system_load: "システム負荷",
    session: "セッション",
    data: "データ",
    dark_mode: "ダークモードを有効にする",
    light_mode: "ライトモードを有効にする",
    settings: "設定",
    language: "言語",
    node: "ノード",
    global_network: "グローバルノードネットワーク",
    chat_placeholder: "プライバシーやネットワークについて質問する...",
    chat_error: "接続エラー。API設定を確認してください。",
    chat_fallback: "申し訳ありませんが、リクエストを処理できませんでした。",
    user: "あなた",
    ai_name: "BRC Conectar AI",
    operator: "オペレーター (アンゴラ/グローバル)",
    node_selection: "ノードの選択",
    search_nodes: "名前または国で検索...",
    favorites: "お気に入り",
    all_nodes: "すべてのノード",
    support: "サポート",
    change_ip: "IPを変更",
    ip_changed: "IPが正常に変更されました",
    advisor_instruction: "あなたは BRC Conectar プライバシー アドバイザーです。インターネットの自由、VPN、暗号化、検閲回避の専門家であり、特にアンゴラのネットワーク (Unitel、Movicel、Africell) に重点を置いています。これらのネットワークでの接続を最適化する方法について、簡潔で技術的かつ役立つアドバイスを提供してください。プロフェッショナルで安全なトーンを維持してください。ユーザーがサポートや開発者の連絡先を求めた場合は、メールアドレス borgeruicandala@gmail.com を提供してください。"
  }
};

const LANGUAGE_NAMES: Record<Language, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  ru: "Русский",
  zh: "中文",
  jp: "日本語"
};

// --- Components ---

const StatusBadge = ({ connected, t }: { connected: boolean, t: any }) => (
  <div className={cn(
    "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest border",
    connected 
      ? "bg-brand-success/10 border-brand-success/30 text-brand-success" 
      : "bg-brand-danger/10 border-brand-danger/30 text-brand-danger"
  )}>
    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", connected ? "bg-brand-success" : "bg-brand-danger")} />
    {connected ? t.connected : t.disconnected}
  </div>
);

const NetworkMap = ({ selectedServer, isDarkMode, servers, t }: { selectedServer: ServerLocation | null, isDarkMode: boolean, servers: ServerLocation[], t: any }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 600;
    const height = 300;
    
    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .scale(90)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const mapFill = isDarkMode ? "#2a2b2f" : "#e2e8f0";
    const mapStroke = isDarkMode ? "#3a3b3f" : "#cbd5e1";
    const serverColor = isDarkMode ? "#8e9299" : "#64748b";

    // Draw world map (simplified)
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then((data: any) => {
      svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", mapFill)
        .attr("stroke", mapStroke)
        .attr("stroke-width", 0.5);

      // Draw servers
      svg.selectAll("circle")
        .data(servers)
        .enter()
        .append("circle")
        .attr("cx", d => projection([d.lng, d.lat])![0])
        .attr("cy", d => projection([d.lng, d.lat])![1])
        .attr("r", d => d.id === selectedServer?.id ? 6 : 3)
        .attr("fill", d => d.id === selectedServer?.id ? "#64ffda" : serverColor)
        .attr("class", d => d.id === selectedServer?.id ? "animate-pulse" : "")
        .style("cursor", "pointer")
        .append("title")
        .text(d => d.name);
        
      // Connection line if connected
      if (selectedServer) {
        const userPos = projection([-74.0060, 40.7128])!; // Mock user in NY
        const serverPos = projection([selectedServer.lng, selectedServer.lat])!;
        
        svg.append("path")
          .attr("d", `M${userPos[0]},${userPos[1]} Q${(userPos[0] + serverPos[0]) / 2},${Math.min(userPos[1], serverPos[1]) - 50} ${serverPos[0]},${serverPos[1]}`)
          .attr("fill", "none")
          .attr("stroke", "#64ffda")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "4,4")
          .attr("class", "animate-[dash_2s_linear_infinite]");
      }
    });
  }, [selectedServer, isDarkMode, servers]);

  return (
    <div className="w-full h-[300px] relative overflow-hidden rounded-lg bg-brand-bg/20 border border-brand-text-secondary/10">
      <svg ref={svgRef} viewBox="0 0 600 300" className="w-full h-full" />
      <div className="absolute bottom-4 left-4 flex flex-col gap-1">
        <span className="text-[10px] uppercase tracking-tighter text-brand-text-secondary font-mono">{t.global_network}</span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-accent" />
          <span className="text-xs font-medium">{t.active_nodes}: {servers.length}</span>
        </div>
      </div>
    </div>
  );
};

// --- Components ---

const BrcLogo = ({ size = "md", connected = false }: { size?: "sm" | "md" | "lg", connected?: boolean }) => {
  const sizes = {
    sm: { container: "gap-0.5", bars: "w-0.5 h-2", text: "text-base", shield: "w-10 h-10" },
    md: { container: "gap-1", bars: "w-1 h-5", text: "text-4xl", shield: "w-20 h-20" },
    lg: { container: "gap-1.5", bars: "w-2 h-10", text: "text-6xl", shield: "w-32 h-32" }
  };
  const s = sizes[size];

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Network Bars Above */}
      <div className={cn("flex items-end mb-1 z-10", s.container)}>
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            initial={false}
            animate={connected ? { 
              height: [`${i * 25}%`, "100%", `${i * 25}%`],
              opacity: [0.5, 1, 0.5]
            } : { 
              height: `${i * 25}%`,
              opacity: 0.2
            }}
            transition={connected ? { 
              repeat: 999999, 
              repeatType: "loop",
              duration: 1.2, 
              delay: i * 0.1,
              ease: "easeInOut"
            } : { duration: 0.5 }}
            className={cn(
              s.bars,
              "rounded-full transition-colors duration-500",
              connected ? "bg-brand-success shadow-[0_0_15px_rgba(34,197,94,0.5)]" : "bg-white/20"
            )}
          />
        ))}
      </div>
      {/* BRC Text & Shield */}
      <div className="relative flex items-center justify-center z-10">
        <span className={cn(
          s.text,
          "font-black tracking-tighter italic leading-none block transition-all duration-500",
          connected ? "text-white scale-105" : "text-white/20"
        )}>
          BRC
        </span>
      </div>

      {/* Background Shield */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Shield className={cn(
          "absolute transition-all duration-700",
          s.shield,
          connected ? "text-brand-success/20 scale-110 opacity-100" : "text-white/5 scale-100 opacity-50"
        )} />
        {connected && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-brand-success/10 blur-2xl rounded-full -z-10"
          />
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [servers, setServers] = useState<ServerLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<ServerLocation | null>(null);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  const [showSideMenu, setShowSideMenu] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [showServerSelector, setShowServerSelector] = useState(false);
  const [showSplitTunnelModal, setShowSplitTunnelModal] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [airplaneMode, setAirplaneMode] = useState(false);
  const [splitTunnelEnabled, setSplitTunnelEnabled] = useState(false);
  const [selectedApps, setSelectedApps] = useState<string[]>(AVAILABLE_APPS.map(a => a.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [appSearchQuery, setAppSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [connectionStartTime, setConnectionStartTime] = useState<number | null>(null);
  const [connectionDuration, setConnectionDuration] = useState(0);
  const [publicIp, setPublicIp] = useState("185.12.44.201");
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [toast, setToast] = useState<{ message: string, visible: boolean, type: 'success' | 'error' | 'info' }>({ 
    message: '', 
    visible: false, 
    type: 'info' 
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  };
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const toggleFavorite = (e: React.MouseEvent, serverId: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(serverId) 
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const changeIp = () => {
    const newIp = Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
    setPublicIp(newIp);
    showToast(t.ip_changed, 'success');
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const findBestServer = () => {
    // Score = Latency + (Load * 0.8) - lower is better
    return [...servers].sort((a, b) => {
      const scoreA = a.latency + (a.load * 0.8);
      const scoreB = b.latency + (b.load * 0.8);
      return scoreA - scoreB;
    })[0];
  };

  useEffect(() => {
    setChatMessages([
      { role: 'model', text: lang === 'pt' ? 'Olá! Eu sou o seu Consultor de Privacidade BRC Conectar. Como posso ajudá-lo a proteger sua vida digital hoje?' : 
        lang === 'en' ? 'Hello! I am your BRC Conectar Privacy Advisor. How can I help you protect your digital life today?' :
        lang === 'es' ? '¡Hola! Soy su Asesor de Privacidad de BRC Conectar. ¿Cómo puedo ayudarle a proteger su vida digital hoy?' :
        lang === 'fr' ? 'Bonjour ! Je suis votre conseiller en confidentialité BRC Conectar. Comment puis-je vous aider à protéger votre vie numérique aujourd\'hui ?' :
        lang === 'de' ? 'Hallo! Ich bin Ihr BRC Conectar Datenschutzberater. Wie kann ich Ihnen heute helfen, Ihr digitales Leben zu schützen?' :
        lang === 'it' ? 'Ciao! Sono il tuo consulente per la privacy di BRC Conectar. Come posso aiutarti a proteggere la tua vita digitale oggi?' :
        lang === 'ru' ? 'Здравствуйте! Я ваш консультант по конфиденциальности BRC Conectar. Как я могу помочь вам защитить вашу цифровую жизнь сегодня?' :
        lang === 'zh' ? '您好！我是您的 BRC Conectar 隐私顾问。今天我该如何帮助您保护您的数字生活？' :
        'こんにちは！私は BRC Conectar プライバシー アドバイザーです。今日はあなたのデジタル ライフを守るためにどのようにお手伝いしましょうか？'
      }
    ]);
  }, [lang]);

  // Initialize Gemini
  const ai = useMemo(() => {
    const key = process.env.GEMINI_API_KEY || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : '');
    return new GoogleGenAI({ apiKey: key || '' });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [serversRes, statusRes] = await Promise.all([
          fetch('/api/servers'),
          fetch('/api/status')
        ]);
        
        const serversData = await serversRes.json();
        const statusData = await statusRes.json();
        
        setServers(serversData);
        if (statusData.connected) {
          setConnected(true);
          setSelectedServer(statusData.server);
          setPublicIp(statusData.ip);
          setConnectionStartTime(Date.now() - (parseUptime(statusData.uptime) * 1000));
        } else {
          // Auto-connect logic if not connected
          const bestServer = serversData.reduce((prev: any, curr: any) => {
            const prevScore = prev.latency * (1 + prev.load / 100);
            const currScore = curr.latency * (1 + curr.load / 100);
            return currScore < prevScore ? curr : prev;
          }, serversData[0]);
          setSelectedServer(bestServer);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setServers(INITIAL_SERVERS);
        setSelectedServer(INITIAL_SERVERS[0]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const parseUptime = (uptime: string) => {
    const [hrs, mins, secs] = uptime.split(':').map(Number);
    return (hrs * 3600) + (mins * 60) + secs;
  };

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.remove('light');
      } else {
        root.classList.add('light');
      }
    };

    applyTheme();

    if (theme === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  const isDarkMode = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    // Generate mock traffic data
    const interval = setInterval(() => {
      setTrafficData(prev => {
        const newData = [
          ...prev.slice(-19),
          {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            down: connected ? Math.random() * 50 + 10 : 0,
            up: connected ? Math.random() * 15 + 2 : 0,
          }
        ];
        return newData;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [connected]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (connected && connectionStartTime) {
      interval = setInterval(() => {
        setConnectionDuration(Math.floor((Date.now() - connectionStartTime) / 1000));
      }, 1000);
    } else {
      setConnectionDuration(0);
    }
    return () => clearInterval(interval);
  }, [connected, connectionStartTime]);

  useEffect(() => {
    // Dynamic server updates when online
    const interval = setInterval(() => {
      if (navigator.onLine) {
        setServers(currentServers => 
          currentServers.map(s => ({
            ...s,
            latency: Math.max(20, Math.min(500, s.latency + (Math.random() * 10 - 5))),
            load: Math.min(100, Math.max(5, s.load + (Math.random() * 6 - 3)))
          }))
        );
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleConnect = () => {
    if (airplaneMode) return;
    if (connected) {
      setConnected(false);
      setConnectionStartTime(null);
    } else {
      if (autoOptimize) {
        const best = findBestServer();
        setSelectedServer(best);
        showToast(`${t.best_server_found}: ${best.name}`, 'info');
      }
      setConnecting(true);
      setTimeout(() => {
        setConnecting(false);
        setConnected(true);
        setConnectionStartTime(Date.now());
      }, 2000);
    }
  };

  const toggleAirplaneMode = () => {
    const newState = !airplaneMode;
    setAirplaneMode(newState);
    if (newState && connected) {
      setConnected(false);
      setConnectionStartTime(null);
    }
  };

  const changeProvider = () => {
    const currentIndex = PROVIDERS.indexOf(selectedProvider);
    const nextIndex = (currentIndex + 1) % PROVIDERS.length;
    setSelectedProvider(PROVIDERS[nextIndex]);
    setToast({ message: `${t.operator}: ${PROVIDERS[nextIndex]}`, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 2000);
  };

  const toggleApp = (appId: string) => {
    setSelectedApps(prev => 
      prev.includes(appId) 
        ? prev.filter(id => id !== appId)
        : [...prev, appId]
    );
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMsg = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: t.advisor_instruction,
        }
      });

      setChatMessages(prev => [...prev, { role: 'model', text: response.text || t.chat_fallback }]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: t.chat_error }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white">
        <BrcLogo size="lg" connected={true} />
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <div className="text-brand-accent font-mono text-xs tracking-widest uppercase">Initializing Secure Tunnel</div>
          <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-full h-full bg-brand-accent"
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col bg-[#121212] text-white font-sans selection:bg-brand-accent/30"
    )}>
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-[#1a1a1a] border-b border-white/5 sticky top-0 z-[60]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowSideMenu(true)}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center gap-4">

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors relative"
          >
            <Settings className="w-6 h-6" />
          </button>

          <button 
            onClick={changeIp}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors text-brand-accent"
            title={t.change_ip}
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {showSideMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSideMenu(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 left-0 bottom-0 w-72 bg-brand-bg z-[210] border-r border-black/5 dark:border-white/10 shadow-2xl flex flex-col",
                !isDarkMode && "light"
              )}
            >
              <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <BrcLogo size="sm" connected={connected} />
                  <div className="flex flex-col">
                    <span className="font-bold tracking-tight text-brand-text-primary">BRC Conectar</span>
                    <span className="text-[8px] font-mono text-brand-accent uppercase tracking-widest">Secure Tunnel</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowSideMenu(false)}
                  className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-90" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="px-2 py-4">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary mb-4">Menu</h3>
                  
                  <div className="space-y-0 divide-y divide-black/5 dark:divide-white/5">
                    <div className="flex flex-col">
                      <button
                        onClick={() => setShowThemeMenu(!showThemeMenu)}
                        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-brand-text-secondary group"
                      >
                        <div className="flex items-center gap-3">
                          <Palette className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
                          <span className="text-sm font-medium">Tema</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase">
                            {theme === 'dark' ? t.dark_mode : theme === 'light' ? t.light_mode : 'Sistema'}
                          </span>
                          <ChevronDown className={cn("w-4 h-4 transition-transform", showThemeMenu && "rotate-180")} />
                        </div>
                      </button>

                      <AnimatePresence>
                        {showThemeMenu && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-black/5 dark:bg-white/5"
                          >
                            {(['light', 'dark', 'system'] as const).map((tOption) => (
                              <button
                                key={tOption}
                                onClick={() => setTheme(tOption)}
                                className={cn(
                                  "w-full flex items-center justify-between px-12 py-3 text-xs transition-colors hover:text-brand-accent",
                                  theme === tOption ? "text-brand-accent font-bold" : "text-brand-text-secondary"
                                )}
                              >
                                <span>{tOption === 'dark' ? t.dark_mode : tOption === 'light' ? t.light_mode : 'Sistema'}</span>
                                {theme === tOption && <div className="w-1.5 h-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(var(--brand-accent-rgb),0.5)]" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <button
                      onClick={() => {
                        setShowServerSelector(true);
                        setShowSideMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-brand-text-secondary group"
                    >
                      <Server className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-brand-text-primary dark:text-brand-text-secondary">{t.node_selection}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowLanguages(true);
                        setShowSideMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-brand-text-secondary group"
                    >
                      <Languages className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{t.language}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowAdvisorModal(true);
                        setShowSideMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-brand-text-secondary group"
                    >
                      <MessageSquare className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{t.privacy_advisor}</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowPrivacyModal(true);
                        setShowSideMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-brand-text-secondary group"
                    >
                      <ShieldCheck className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{t.privacy_terms}</span>
                    </button>

                    <a
                      href="mailto:borgeruicandala@gmail.com"
                      onClick={() => setShowSideMenu(false)}
                      className="w-full flex items-center gap-3 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all text-brand-text-secondary group"
                    >
                      <Mail className="w-5 h-5 text-brand-accent group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-medium">{t.support}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/5">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-mono text-brand-text-secondary uppercase">Versão</span>
                  <span className="text-xs font-medium text-brand-accent">v2.5.0-PRO</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Privacy & Terms Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrivacyModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg hardware-card flex flex-col max-h-[80vh] shadow-2xl border-brand-accent/20"
            >
              <div className="p-6 border-b border-white/5 bg-brand-accent/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-brand-accent" />
                  <h2 className="text-lg font-bold tracking-tight">Privacidade e Termos</h2>
                </div>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="p-1 hover:bg-white/5 rounded-full transition-colors"
                >
                  <ChevronDown className="w-6 h-6 rotate-180" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 text-brand-text-secondary leading-relaxed">
                <section className="space-y-2">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-brand-accent" />
                    Missão e Propósito
                  </h3>
                  <p className="text-sm">
                    O BRC Conectar é uma ferramenta desenvolvida para promover a liberdade digital. Nosso objetivo principal é facilitar o acesso irrestrito à informação, contornando a censura e as barreiras técnicas impostas em redes móveis e infraestruturas limitadas.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-brand-success" />
                    Caráter Gratuito
                  </h3>
                  <p className="text-sm">
                    Este aplicativo é, e sempre será, de caráter **totalmente gratuito**. Não cobramos taxas de ativação, assinaturas mensais ou qualquer valor pelo uso de nossos servidores e tecnologias.
                  </p>
                </section>

                <section className="space-y-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <h3 className="text-red-400 font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Proibição de Venda
                  </h3>
                  <p className="text-sm italic">
                    É estritamente **proibida a venda, revenda ou comercialização** deste aplicativo ou de seus serviços. O BRC Conectar é um bem público para a comunidade. Se você pagou por este app, você foi enganado.
                  </p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Lock className="w-4 h-4 text-brand-accent" />
                    Privacidade de Dados
                  </h3>
                  <p className="text-sm">
                    Sua privacidade é nossa prioridade. Utilizamos criptografia de ponta a ponta para proteger seu tráfego. Não coletamos logs de navegação, não armazenamos seu histórico e não vendemos seus dados para terceiros.
                  </p>
                </section>

                <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-center opacity-50">
                  BRC CONECTAR © 2026 • LIBERDADE DIGITAL PARA TODOS
                </div>
              </div>

              <div className="p-4 bg-[#1a1a1a] border-t border-white/5">
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full py-3 bg-brand-accent text-brand-bg font-bold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Entendi e Aceito
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Dropdown (Repositioned for the new header) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-4 top-14 w-56 hardware-card z-[70] overflow-hidden shadow-2xl border-brand-accent/20"
            >
              <div className="p-3 border-b border-brand-text-secondary/10 bg-brand-accent/5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-accent flex items-center gap-2">
                  <Settings className="w-3 h-3" />
                  {t.settings}
                </span>
              </div>
              


              <div className="p-2 border-b border-brand-text-secondary/10">
                <button
                  onClick={() => {
                    setShowSplitTunnelModal(true);
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] font-mono rounded-md transition-all flex items-center justify-between text-brand-text-secondary hover:bg-brand-text-secondary/10"
                >
                  <div className="flex items-center gap-2">
                    <GitFork className="w-3 h-3 text-brand-accent" />
                    {t.tunel_dividido}
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              </div>

              <div className="p-2 border-b border-brand-text-secondary/10 bg-brand-accent/5">
                <button
                  onClick={() => {
                    changeIp();
                    setShowSettings(false);
                  }}
                  className="w-full text-left px-3 py-2 text-[11px] font-mono rounded-md transition-all flex items-center gap-2 text-brand-accent hover:bg-brand-accent/10"
                >
                  <RefreshCw className="w-3 h-3" />
                  {t.change_ip}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Language Selection Overlay */}
        <AnimatePresence>
          {showLanguages && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setShowLanguages(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm hardware-card overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-white/10 bg-brand-accent/5 flex items-center justify-between">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-brand-accent">{t.language}</h3>
                  <button onClick={() => setShowLanguages(false)} className="p-1 hover:bg-white/10 rounded-full">
                    <ChevronDown className="w-5 h-5 rotate-180" />
                  </button>
                </div>
                <div className="p-2 grid grid-cols-1 gap-1">
                  {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                    <button
                      key={code}
                      onClick={() => {
                        setLang(code as Language);
                        setShowLanguages(false);
                      }}
                      className={cn(
                        "w-full text-left px-4 py-3 text-sm font-mono rounded-lg transition-all flex items-center justify-between",
                        lang === code 
                          ? "text-brand-accent bg-brand-accent/10" 
                          : "text-brand-text-secondary hover:bg-white/5"
                      )}
                    >
                      {name}
                      {lang === code && <div className="w-2 h-2 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(100,255,218,0.8)]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        {/* Background Gradient Effect */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-brand-accent/10 to-transparent pointer-events-none" />

        <div className="max-w-md mx-auto px-4 py-6 flex flex-col gap-8 relative z-10">
          
          {/* Server Selection Card */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between shadow-lg border border-white/5 cursor-pointer hover:bg-[#333] transition-colors"
            onClick={() => setShowServerSelector(true)}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-brand-text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-medium">{selectedServer?.name.split(' (')[0] || '---'}</span>
                <span className="text-xs text-brand-text-secondary">{selectedServer?.name.includes('(') ? selectedServer?.name.split('(')[1].replace(')', '') : 'Global Node'}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedServer?.flag || '🌐'}</span>
              <ChevronsRight className="w-5 h-5 text-brand-text-secondary" />
            </div>
          </motion.div>



          {/* Central Logo & Status */}
          <div className="flex flex-col items-center gap-10 py-8">
            <div className="relative">
              <BrcLogo size="lg" connected={connected} />
              
              {/* Connection Pulse Rings */}
              {connected && (
                <div className="absolute inset-0 -z-10 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-brand-success/20 rounded-full animate-ping [animation-duration:3s]" />
                  <div className="w-48 h-48 border-2 border-brand-success/10 rounded-full animate-ping [animation-duration:3s] [animation-delay:1s]" />
                </div>
              )}
            </div>

            <motion.div 
              key={connecting ? 'connecting' : connected ? 'connected' : 'disconnected'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className={cn(
                "w-2.5 h-2.5 rounded-full",
                connecting ? "bg-orange-500 animate-pulse" : connected ? "bg-brand-success shadow-[0_0_12px_rgba(34,197,94,0.8)]" : "bg-brand-text-secondary/40"
              )} />
              <span className={cn(
                "text-xl font-bold tracking-tight transition-colors",
                connecting ? "text-orange-500" : connected ? "text-brand-success" : "text-brand-text-secondary"
              )}>
                {connecting ? t.connecting : connected ? t.connected : t.disconnected}
              </span>
            </motion.div>
          </div>

          {/* Feature Options */}
          <div className="grid grid-cols-1 gap-3">
            {/* Operator Selection */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={changeProvider}
              className="bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between border border-white/5 shadow-md transition-all hover:border-brand-accent/30"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-brand-accent/10 text-brand-accent">
                  <Wifi className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{t.operator}</span>
                  <span className="text-[10px] text-brand-text-secondary uppercase font-mono">
                    {selectedProvider}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-text-secondary" />
            </motion.button>

            {/* Public IP */}
            <motion.div
              className="bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between border border-white/5 shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-white/5 text-brand-text-secondary">
                  <Globe className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{t.public_ip}</span>
                  <span className="text-[10px] text-brand-text-secondary uppercase font-mono">
                    {publicIp}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Airplane Mode */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={toggleAirplaneMode}
              className={cn(
                "bg-[#2a2a2a] rounded-xl p-4 flex items-center justify-between border border-white/5 shadow-md transition-all",
                airplaneMode ? "border-orange-500/30 bg-orange-500/5" : ""
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  airplaneMode ? "bg-orange-500 text-white" : "bg-white/5 text-brand-text-secondary"
                )}>
                  <Plane className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium">{t.airplane_mode}</span>
                  <span className="text-[10px] text-brand-text-secondary uppercase font-mono">
                    {airplaneMode ? "Ativado" : "Desativado"}
                  </span>
                </div>
              </div>
              <div className={cn(
                "w-10 h-5 rounded-full p-1 transition-colors relative",
                airplaneMode ? "bg-orange-500" : "bg-white/10"
              )}>
                <div className={cn(
                  "w-3 h-3 rounded-full bg-white transition-transform",
                  airplaneMode ? "translate-x-5" : "translate-x-0"
                )} />
              </div>
            </motion.button>


          </div>
        </div>
      </main>

      {/* Bottom Control Bar */}
      <AnimatePresence>
        {!showPrivacyModal && !showSideMenu && !showAdvisorModal && !showServerSelector && !showSplitTunnelModal && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full z-[100] px-4 pb-6 pt-2 bg-gradient-to-t from-black to-transparent"
          >
            <div className="max-w-md mx-auto relative">
              {/* Top Line */}
              <div className="absolute -top-2 left-0 w-full h-px bg-gradient-to-r from-transparent via-brand-accent/40 to-transparent" />
              
              <div className="bg-[#1a1a1a] rounded-2xl p-4 flex items-center justify-between shadow-2xl border border-white/10">
                {/* Left Info: Connection Time */}
                <div className="flex items-center gap-2 text-brand-text-secondary">
                  <div className={cn(
                    "p-1.5 rounded-lg bg-white/5",
                    connected ? "text-brand-accent" : "text-brand-text-secondary/40"
                  )}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary leading-none">Tempo</span>
                    <span className="text-[10px] font-mono font-medium text-white">
                      {connected ? formatTime(connectionDuration) : "00:00:00"}
                    </span>
                  </div>
                </div>

                {/* Large Power Button */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-10">
                  <div className="relative">
                    <motion.button
                      onClick={handleConnect}
                      disabled={connecting}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "w-24 h-24 rounded-full flex items-center justify-center shadow-lg shadow-black/30 border-4 transition-all duration-300 z-10",
                        connecting
                          ? "bg-gradient-to-br from-gray-600 to-gray-800 border-orange-500/50"
                          : connected
                            ? "bg-gradient-to-br from-brand-success to-emerald-600 border-emerald-400/50 shadow-brand-success/40"
                            : "bg-gradient-to-br from-gray-600 to-gray-800 border-gray-500/50"
                      )}
                    >
                      <Power className={cn(
                        "w-10 h-10 text-white transition-transform duration-500",
                        connected ? "rotate-0" : "rotate-135",
                        connecting && "animate-spin"
                      )} />
                    </motion.button>
                    

                    {/* Connecting Spinner */}
                    <AnimatePresence>
                      {connecting && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute -inset-2 z-0 pointer-events-none"
                        >
                          <motion.svg viewBox="0 0 100 100" className="w-full h-full">
                            <motion.circle 
                              cx="50" 
                              cy="50" 
                              r="45" 
                              fill="none" 
                              strokeWidth="5"
                              className="stroke-orange-500"
                              strokeDasharray="1, 4"
                              strokeLinecap="round"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.svg>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right Info: Latency */}
                <div className="flex items-center gap-2 text-brand-text-secondary">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary leading-none">Ping</span>
                    <span className={cn(
                      "text-[10px] font-mono font-medium",
                      connected ? "text-brand-success" : "text-brand-text-secondary/40"
                    )}>
                      {connected && selectedServer ? `${selectedServer.latency}ms` : "---"}
                    </span>
                  </div>
                  <div className={cn(
                    "p-1.5 rounded-lg bg-white/5",
                    connected ? "text-brand-success" : "text-brand-text-secondary/40"
                  )}>
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
            exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
            className={cn(
              "fixed bottom-24 left-1/2 z-[300] px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-3 min-w-[280px] border backdrop-blur-md",
              toast.type === 'success' && "bg-brand-success/90 border-brand-success text-white shadow-brand-success/20",
              toast.type === 'error' && "bg-brand-danger/90 border-brand-danger text-white shadow-brand-danger/20",
              toast.type === 'info' && "bg-brand-accent/90 border-brand-accent text-brand-bg shadow-brand-accent/20"
            )}
          >
            <div className="p-1 rounded-full bg-white/20">
              {toast.type === 'success' && <ShieldCheck className="w-4 h-4" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4" />}
              {toast.type === 'info' && <Info className="w-4 h-4" />}
            </div>
            <span className="text-sm tracking-tight">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server Selection Modal */}
      <AnimatePresence>
        {showServerSelector && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowServerSelector(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md hardware-card flex flex-col h-[500px] shadow-2xl"
            >
              <div className="p-4 border-b border-brand-text-secondary/10 flex items-center justify-between bg-brand-accent/5">
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest flex items-center gap-2 text-brand-text-primary dark:text-white">
                  <Server className="w-4 h-4 text-brand-accent" />
                  {t.node_selection}
                </h2>
                <button 
                  onClick={() => setShowServerSelector(false)}
                  className="p-1 hover:bg-brand-text-secondary/10 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <div className="p-4 border-b border-brand-text-secondary/10">
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.search_nodes}
                    className="w-full bg-brand-bg border border-brand-text-secondary/20 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-accent transition-all text-brand-text-primary"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary" />
                </div>

                {/* Auto Optimize Toggle in Modal */}
                <button
                  onClick={() => setAutoOptimize(!autoOptimize)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                    autoOptimize 
                      ? "bg-brand-success/10 border-brand-success/50 text-brand-success" 
                      : "border-transparent text-brand-text-primary"
                  )}
                  style={!autoOptimize ? {
                    backgroundColor: 'var(--brand-surface-button)',
                  } : {}}
                  onMouseEnter={(e) => { if (!autoOptimize) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button-hover)'; }}
                  onMouseLeave={(e) => { if (!autoOptimize) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button)'; }}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      autoOptimize ? "bg-brand-success text-white" : "bg-white/10 text-brand-text-secondary"
                    )}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{t.auto_optimize}</span>
                      <span className={cn(
                        "text-[9px] uppercase font-mono",
                        autoOptimize ? "text-brand-success" : "text-brand-text-secondary/60"
                      )}>
                        {autoOptimize ? "Ativado" : "Desativado"}
                      </span>
                    </div>
                  </div>
                  <div className={cn(
                    "w-8 h-4 rounded-full p-0.5 transition-colors relative",
                    autoOptimize ? "bg-brand-success" : "bg-white/20"
                  )}>
                    <div className={cn(
                      "w-3 h-3 rounded-full bg-white transition-transform",
                      autoOptimize ? "translate-x-4" : "translate-x-0"
                    )} />
                  </div>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-brand-text-secondary/10">
                {/* Favorites Section */}
                {favorites.length > 0 && !searchQuery && (
                  <div className="px-2">
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary mb-2 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-brand-accent text-brand-accent" />
                      {t.favorites}
                    </h3>
                    <div className="space-y-1">
                      {servers
                        .filter(server => favorites.includes(server.id))
                        .map((server) => (
                        <button
                          key={`fav-${server.id}`}
                          onClick={() => {
                            setSelectedServer(server);
                            setShowServerSelector(false);
                          }}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                            selectedServer?.id === server.id 
                              ? "bg-brand-accent/10 border-brand-accent/50 text-brand-accent" 
                              : "border-transparent text-brand-text-primary"
                          )}
                          style={selectedServer?.id !== server.id ? {
                            backgroundColor: 'var(--brand-surface-button)',
                          } : {}}
                           onMouseEnter={(e) => { if (selectedServer?.id !== server.id) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button-hover)'; }}
                          onMouseLeave={(e) => { if (selectedServer?.id !== server.id) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button)'; }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              server.load > 80 ? "bg-red-500" : server.load > 50 ? "bg-yellow-500" : "bg-green-500"
                            )} />
                            <span className="text-xl">{server.flag}</span>
                            <div className="flex flex-col items-start">
                              <span className="text-sm font-medium">{server.name}</span>
                              <span className="text-[10px] font-mono text-brand-text-secondary uppercase">{server.id}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono">{server.latency}MS</span>
                            <div 
                              onClick={(e) => toggleFavorite(e, server.id)}
                              className="p-1 hover:bg-brand-text-secondary/20 rounded-full transition-colors"
                            >
                              <Star className="w-4 h-4 fill-brand-accent text-brand-accent" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="h-px w-full bg-brand-text-secondary/10 my-4" />
                  </div>
                )}

                {/* All Servers */}
                <div className="px-2">
                  <h3 className="text-[10px] font-mono uppercase tracking-widest text-brand-text-secondary mb-2">
                    {t.all_nodes}
                  </h3>
                  <div className="space-y-1">
                    {servers
                      .filter(server => 
                        server.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        server.id.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((server) => (
                      <button
                        key={server.id}
                        onClick={() => {
                          setSelectedServer(server);
                          setShowServerSelector(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                          selectedServer?.id === server.id 
                            ? "bg-brand-accent/10 border-brand-accent/50 text-brand-accent" 
                            : "border-transparent text-brand-text-primary"
                        )}
                        style={selectedServer?.id !== server.id ? {
                          backgroundColor: 'var(--brand-surface-button)',
                        } : {}}
                         onMouseEnter={(e) => { if (selectedServer?.id !== server.id) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button-hover)'; }}
                        onMouseLeave={(e) => { if (selectedServer?.id !== server.id) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button)'; }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            server.load > 80 ? "bg-red-500" : server.load > 50 ? "bg-yellow-500" : "bg-green-500"
                          )} />
                          <span className="text-xl">{server.flag}</span>
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">{server.name}</span>
                            <span className="text-[10px] font-mono text-brand-text-secondary uppercase">{server.id}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono">{server.latency}MS</span>
                          <div 
                            onClick={(e) => toggleFavorite(e, server.id)}
                            className="p-1 hover:bg-brand-text-secondary/20 rounded-full transition-colors"
                          >
                            <Star className={cn(
                              "w-4 h-4 transition-colors",
                              favorites.includes(server.id) 
                                ? "fill-brand-accent text-brand-accent" 
                                : "text-brand-text-secondary hover:text-brand-accent"
                            )} />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Split Tunneling Modal */}
      <AnimatePresence>
        {showSplitTunnelModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSplitTunnelModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md hardware-card flex flex-col h-[550px] shadow-2xl"
            >
              <div className="p-4 border-b border-brand-text-secondary/10 flex items-center justify-between bg-brand-accent/5">
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest flex items-center gap-2 text-brand-text-primary dark:text-white">
                  <GitFork className="w-4 h-4 text-brand-accent" />
                  {t.tunel_dividido}
                </h2>
                <button 
                  onClick={() => setShowSplitTunnelModal(false)}
                  className="p-1 hover:bg-brand-text-secondary/10 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
              </div>

              <div className="p-4 border-b border-brand-text-secondary/10 space-y-4">
                <div className="flex items-center justify-between bg-brand-surface p-4 rounded-xl border border-brand-text-secondary/10">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{t.tunel_dividido}</span>
                    <span className="text-[10px] text-brand-text-secondary uppercase font-mono">
                      {splitTunnelEnabled ? "Ativado" : "Desativado"}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSplitTunnelEnabled(!splitTunnelEnabled)}
                    className={cn(
                      "w-12 h-6 rounded-full p-1 transition-colors relative",
                      splitTunnelEnabled ? "bg-brand-accent" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded-full bg-white transition-transform",
                      splitTunnelEnabled ? "translate-x-6" : "translate-x-0"
                    )} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <input 
                    type="text" 
                    placeholder={t.search_apps}
                    value={appSearchQuery}
                    onChange={(e) => setAppSearchQuery(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-text-secondary/20 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-brand-accent transition-all text-brand-text-primary"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-brand-text-secondary/10">
                {AVAILABLE_APPS
                  .filter(app => app.name.toLowerCase().includes(appSearchQuery.toLowerCase()))
                  .map(app => (
                    <button
                      key={app.id}
                      onClick={() => toggleApp(app.id)}
                      className={cn(
                        "w-full p-3 rounded-xl flex items-center justify-between border transition-all text-brand-text-primary",
                        selectedApps.includes(app.id)
                          ? "bg-brand-accent/10 border-brand-accent/30"
                          : "border-transparent"
                      )}
                      style={!selectedApps.includes(app.id) ? {
                        backgroundColor: 'var(--brand-surface-button)',
                      } : {}}
                      onMouseEnter={(e) => { if (!selectedApps.includes(app.id)) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button-hover)'; }}
                      onMouseLeave={(e) => { if (!selectedApps.includes(app.id)) e.currentTarget.style.backgroundColor = 'var(--brand-surface-button)'; }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">
                          {app.icon}
                        </div>
                        <span className="text-sm font-medium">{app.name}</span>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                        selectedApps.includes(app.id)
                          ? "bg-brand-accent border-brand-accent text-white"
                          : "border-brand-text-secondary/20"
                      )}>
                        {selectedApps.includes(app.id) && <ShieldCheck className="w-4 h-4" />}
                      </div>
                    </button>
                  ))}
              </div>
              
              <div className="p-4 bg-brand-surface border-t border-brand-text-secondary/10">
                <button 
                  onClick={() => setShowSplitTunnelModal(false)}
                  className="w-full bg-brand-accent text-brand-bg font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Advisor Modal */}
      <AnimatePresence>
        {showAdvisorModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdvisorModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl hardware-card flex flex-col h-[600px] shadow-2xl border-brand-accent/20"
            >
              <div className="p-4 border-b border-brand-text-secondary/10 flex items-center justify-between bg-brand-accent/5">
                <h2 className="text-sm font-bold font-mono uppercase tracking-widest flex items-center gap-2 text-brand-text-primary dark:text-white">
                  <MessageSquare className="w-4 h-4 text-brand-accent" />
                  {t.privacy_advisor}
                </h2>
                <button 
                  onClick={() => setShowAdvisorModal(false)}
                  className="p-1 hover:bg-brand-text-secondary/10 rounded-full transition-colors"
                >
                  <ChevronDown className="w-5 h-5 rotate-180" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-brand-text-secondary/10">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={cn(
                    "flex flex-col max-w-[85%] gap-1",
                    msg.role === 'user' ? "ml-auto items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.role === 'user' 
                        ? "bg-brand-accent text-white rounded-tr-none shadow-lg shadow-brand-accent/20" 
                        : "bg-brand-text-secondary/10 text-brand-text-primary rounded-tl-none border border-brand-text-secondary/5"
                    )}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-brand-text-secondary uppercase font-mono mt-1">
                      {msg.role === 'user' ? t.user : t.ai_name}
                    </span>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-1.5 items-center text-brand-text-secondary p-2">
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-brand-text-secondary/10 bg-brand-bg/50">
                <div className="relative">
                  <input 
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t.chat_placeholder}
                    className="w-full bg-brand-bg border border-brand-text-secondary/20 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-brand-accent transition-all shadow-inner"
                  />
                  <button 
                    onClick={handleSendMessage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-brand-text-secondary hover:text-brand-accent transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
