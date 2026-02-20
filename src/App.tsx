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
  Languages
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

// --- Constants ---
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
];

const PROVIDERS = ['Unitel', 'Movicel', 'Africell', 'Global Auto'];

type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'ru' | 'zh' | 'jp';

const TRANSLATIONS = {
  pt: {
    connected: "Rede Conectada",
    disconnected: "Rede Desligada",
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
    global_network: "Rede de Nós Global",
    chat_placeholder: "Pergunte sobre privacidade ou redes...",
    chat_error: "Erro de conexão. Por favor, verifique sua configuração de API.",
    chat_fallback: "Desculpe, não consegui processar esse pedido.",
    user: "Você",
    ai_name: "BRC Conectar AI",
    operator: "Operadora (Angola/Global)",
    advisor_instruction: "Você é o Consultor de Privacidade BRC Conectar, um especialista em liberdade na internet, VPNs, criptografia e contorno de censura, com foco especial em redes de Angola (Unitel, Movicel, Africell). Forneça conselhos concisos, técnicos e úteis sobre como otimizar a conexão nessas redes. Mantenha um tom profissional e seguro. Se o usuário pedir suporte ou contato do desenvolvedor, informe o e-mail: borgeruicandala@gmail.com."
  },
  en: {
    connected: "Network Connected",
    disconnected: "Network Offline",
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
    global_network: "Global Node Network",
    chat_placeholder: "Ask about privacy or networks...",
    chat_error: "Connection error. Please check your API configuration.",
    chat_fallback: "Sorry, I could not process that request.",
    user: "You",
    ai_name: "BRC Conectar AI",
    operator: "Operator (Angola/Global)",
    advisor_instruction: "You are the BRC Conectar Privacy Advisor, an expert in internet freedom, VPNs, encryption, and censorship circumvention, with a special focus on Angolan networks (Unitel, Movicel, Africell). Provide concise, technical, and helpful advice on how to optimize connections on these networks. Maintain a professional and secure tone. If the user asks for support or developer contact, provide the email: borgeruicandala@gmail.com."
  },
  es: {
    connected: "Red Conectada",
    disconnected: "Red Desconectada",
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
    advisor_instruction: "Eres el Asesor de Privacidad de BRC Conectar, experto en libertad en internet, VPN, cifrado y elusión de censura, con especial atención a las redes angoleñas (Unitel, Movicel, Africell). Proporciona consejos concisos, técnicos y útiles sobre cómo optimizar las conexiones en estas redes. Mantén un tono profesional y seguro. Si el usuario solicita soporte o contacto del desarrollador, proporciona el correo electrónico: borgeruicandala@gmail.com."
  },
  fr: {
    connected: "Réseau Connecté",
    disconnected: "Réseau Déconnecté",
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
    advisor_instruction: "Vous êtes le conseiller en confidentialité BRC Conectar, expert en liberté sur Internet, VPN, chiffrement et contournement de la censure, avec un accent particulier sur les réseaux angolais (Unitel, Movicel, Africell). Fournissez des conseils concis, techniques et utiles sur la façon d'optimiser les connexions sur ces réseaux. Maintenez un ton professionnel et sécurisé. Si l'utilisateur demande de l'aide ou le contact du développeur, fournissez l'e-mail : borgeruicandala@gmail.com."
  },
  de: {
    connected: "Netzwerk Verbunden",
    disconnected: "Netzwerk Offline",
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
    advisor_instruction: "Sie sind der BRC Conectar Datenschutzberater, ein Experte für Internetfreiheit, VPNs, Verschlüsselung und Zensurumgehung, mit besonderem Fokus auf angolanische Netzwerke (Unitel, Movicel, Africell). Geben Sie prägnante, technische und hilfreiche Ratschläge zur Optimierung von Verbindungen in diesen Netzwerken. Bewahren Sie einen professionellen und sicheren Ton. Wenn der Benutzer nach Support oder Entwicklerkontakt fragt, geben Sie die E-Mail an: borgeruicandala@gmail.com."
  },
  it: {
    connected: "Rete Connessa",
    disconnected: "Rete Disconnessa",
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
    advisor_instruction: "Sei il consulente per la privacy di BRC Conectar, un esperto di libertà su Internet, VPN, crittografia e elusione della censura, con un focus speciale sulle reti angolane (Unitel, Movicel, Africell). Fornisci consigli concisi, tecnici e utili su come ottimizzare le connessioni su queste reti. Mantieni un tono professionale e sicuro. Se l'utente chiede supporto o il contatto dello sviluppatore, fornisci l'e-mail: borgeruicandala@gmail.com."
  },
  ru: {
    connected: "Сеть подключена",
    disconnected: "Сеть отключена",
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
    advisor_instruction: "Вы — консультант по конфиденциальности BRC Conectar, эксперт в области свободы интернета, VPN, шифрования и обхода цензуры, с особым вниманием к ангольским сетям (Unitel, Movicel, Africell). Дайте краткие, технические и полезные советы по оптимизации соединений в этих сетях. Сохраняйте профессиональный и безопасный тон. Если пользователь запрашивает поддержку или контакт разработчика, укажите адрес электронной почты: borgeruicandala@gmail.com."
  },
  zh: {
    connected: "网络已连接",
    disconnected: "网络已断开",
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
    advisor_instruction: "您是 BRC Conectar 隐私顾问，是互联网自由、VPN、加密和审查规避方面的专家，特别关注安哥拉网络（Unitel、Movicel、Africell）。提供有关如何优化这些网络连接的简洁、技术性和有用的建议。保持专业和安全的语气。如果用户请求支持或开发人员联系方式，请提供电子邮件：borgeruicandala@gmail.com。"
  },
  jp: {
    connected: "ネットワーク接続済み",
    disconnected: "ネットワークオフライン",
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

export default function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [servers, setServers] = useState<ServerLocation[]>(INITIAL_SERVERS);
  const [selectedServer, setSelectedServer] = useState<ServerLocation>(INITIAL_SERVERS[0]);
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);
  const [trafficData, setTrafficData] = useState<TrafficData[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

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
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' }), []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

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
    // Auto-connect on first load: find server with lowest latency and load
    const bestServer = INITIAL_SERVERS.reduce((prev, curr) => {
      const prevScore = prev.latency * (1 + prev.load / 100);
      const currScore = curr.latency * (1 + curr.load / 100);
      return currScore < prevScore ? curr : prev;
    });
    
    setSelectedServer(bestServer);
    
    setConnecting(true);
    const timer = setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

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
    if (connected) {
      setConnected(false);
    } else {
      setConnecting(true);
      setTimeout(() => {
        setConnecting(false);
        setConnected(true);
      }, 2000);
    }
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

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-0 overflow-hidden rounded-xl w-12 h-12 border border-brand-accent/50 shadow-lg shadow-brand-accent/20">
              <img 
                src="https://raw.githubusercontent.com/BorgeRui/BRC-Conectar/main/logo.png" 
                alt="BRC Conectar Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/brc-vpn/200";
                }}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">BRC Conectar <span className="text-brand-accent font-mono text-sm font-normal ml-2">v2.4.0</span></h1>
          </div>
          <p className="text-brand-text-secondary text-sm">{t.military_encryption}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 hover:bg-brand-text-secondary/10 rounded-full transition-colors text-brand-text-secondary"
            title={isDarkMode ? t.light_mode : t.dark_mode}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <StatusBadge connected={connected} t={t} />
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "p-2 hover:bg-brand-text-secondary/10 rounded-full transition-colors",
                showSettings ? "text-brand-accent bg-brand-accent/10" : "text-brand-text-secondary"
              )}
              title={t.settings}
            >
              <Settings className="w-5 h-5" />
            </button>
            <AnimatePresence>
              {showSettings && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-56 hardware-card z-50 overflow-hidden shadow-2xl border-brand-accent/20"
                >
                  <div className="p-3 border-b border-brand-text-secondary/10 bg-brand-accent/5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-brand-accent flex items-center gap-2">
                      <Settings className="w-3 h-3" />
                      {t.settings}
                    </span>
                  </div>
                  
                  <div className="p-2">
                    <div className="px-2 py-1 mb-1">
                      <span className="text-[9px] font-mono uppercase tracking-tighter text-brand-text-secondary flex items-center gap-1">
                        <Languages className="w-3 h-3" />
                        {t.language}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                      {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                        <button
                          key={code}
                          onClick={() => {
                            setLang(code as Language);
                            setShowSettings(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-1.5 text-[11px] font-mono rounded-md transition-all flex items-center justify-between",
                            lang === code 
                              ? "text-brand-accent bg-brand-accent/10" 
                              : "text-brand-text-secondary hover:bg-brand-text-secondary/10"
                          )}
                        >
                          {name}
                          {lang === code && <div className="w-1 h-1 rounded-full bg-brand-accent shadow-[0_0_5px_rgba(100,255,218,0.8)]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Map */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-8 flex flex-col gap-6"
        >
          
          {/* Connection Panel */}
          <section className="hardware-card p-6 flex flex-col md:flex-row gap-8 items-center">
            <div className="relative">
              <div className={cn(
                "w-48 h-48 rounded-full flex items-center justify-center border-4 transition-all duration-500",
                connected ? "border-brand-success glow-success" : "animate-color-cycle",
                connecting && "animate-pulse"
              )}>
                <button 
                  onClick={handleConnect}
                  disabled={connecting}
                  className={cn(
                    "w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 transition-all active:scale-95",
                    connected ? "bg-brand-success/20 text-brand-success" : "bg-inherit text-inherit hover:bg-white/5"
                  )}
                >
                  <Power className={cn("w-12 h-12", connecting && "animate-spin")} />
                  <span className="text-xs font-mono uppercase tracking-widest font-bold">
                    {connecting ? t.connecting : connected ? t.disconnect : t.connect}
                  </span>
                </button>
              </div>
              {/* Radial indicators */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className={cn(
                  "absolute w-full h-full border border-dashed border-brand-text-secondary/20 rounded-full scale-110",
                  connected ? "border-brand-success/30 animate-ring-pulse" : "animate-spin-slow"
                )} />
                <div className={cn(
                  "absolute w-full h-full border border-dashed border-brand-text-secondary/10 rounded-full scale-125",
                  connected ? "border-brand-success/20 animate-ring-pulse [animation-delay:1s]" : "animate-spin-reverse-slow"
                )} />
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-brand-bg/20 rounded-lg border border-brand-text-secondary/5">
                <div className="flex items-center gap-2 text-brand-text-secondary mb-1">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-mono">{t.virtual_location}</span>
                </div>
                <div className="text-lg font-bold flex items-center gap-2">
                  <span>{selectedServer.flag}</span>
                  {selectedServer.name}
                </div>
                <div className="text-xs text-brand-text-secondary font-mono">{t.node} {selectedServer.id.toUpperCase()}</div>
              </div>
              <div className="p-4 bg-brand-bg/20 rounded-lg border border-brand-text-secondary/5">
                <div className="flex items-center gap-2 text-brand-text-secondary mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-mono">{t.latency}</span>
                </div>
                <div className="text-lg font-bold">{connected ? `${selectedServer.latency}ms` : '--'}</div>
                <div className="text-xs text-brand-text-secondary font-mono">{t.optimized_path}</div>
              </div>
              <div className="p-4 bg-brand-bg/20 rounded-lg border border-brand-text-secondary/5">
                <div className="flex items-center gap-2 text-brand-text-secondary mb-1">
                  <Lock className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-mono">{t.protocol}</span>
                </div>
                <div className="text-lg font-bold">OpenVPN (UDP)</div>
                <div className="text-xs text-brand-text-secondary font-mono">AES-256-GCM</div>
              </div>
              <div className="p-4 bg-brand-bg/20 rounded-lg border border-brand-text-secondary/5">
                <div className="flex items-center gap-2 text-brand-text-secondary mb-1">
                  <Wifi className="w-4 h-4" />
                  <span className="text-[10px] uppercase font-mono">{t.public_ip}</span>
                </div>
                <div className="text-lg font-bold">{connected ? "185.12.44.201" : "72.14.213.9"}</div>
                <div className="text-xs text-brand-text-secondary font-mono">{connected ? t.protected : t.exposed}</div>
              </div>
            </div>
          </section>

          {/* Map Section */}
          <section className="hardware-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-accent" />
                {t.global_node_map}
              </h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-brand-accent" />
                  <span className="text-[10px] text-brand-text-secondary">Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-brand-text-secondary" />
                  <span className="text-[10px] text-brand-text-secondary">Available</span>
                </div>
              </div>
            </div>
            <NetworkMap selectedServer={connected ? selectedServer : null} isDarkMode={isDarkMode} servers={servers} t={t} />
          </section>

          {/* Stats Section */}
          <section className="hardware-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-accent" />
                {t.traffic_monitor}
              </h2>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-brand-accent" />
                  <span>DOWNLOAD</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-0.5 bg-brand-text-secondary" />
                  <span>UPLOAD</span>
                </div>
              </div>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficData}>
                  <defs>
                    <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isDarkMode ? "#64ffda" : "#0070f3"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isDarkMode ? "#64ffda" : "#0070f3"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#112240' : '#ffffff', 
                      border: '1px solid var(--card-border)', 
                      borderRadius: '8px',
                      color: 'var(--brand-text-primary)'
                    }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="down" stroke={isDarkMode ? "#64ffda" : "#0070f3"} fillOpacity={1} fill="url(#colorDown)" strokeWidth={2} />
                  <Area type="monotone" dataKey="up" stroke="var(--brand-text-secondary)" fillOpacity={0} strokeWidth={1} strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </motion.div>

        {/* Right Column: AI Assistant & Servers */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          
          {/* AI Privacy Advisor */}
          <section className="hardware-card flex flex-col h-[500px]">
            <div className="p-4 border-b border-brand-text-secondary/5 flex items-center justify-between">
              <h2 className="text-sm font-mono uppercase tracking-widest flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-accent" />
                {t.privacy_advisor}
              </h2>
              <div className="w-2 h-2 rounded-full bg-brand-success animate-pulse" />
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-brand-text-secondary/10">
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%] gap-1",
                  msg.role === 'user' ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-3 py-2 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-brand-accent text-white rounded-tr-none" 
                      : "bg-brand-text-secondary/10 text-brand-text-primary rounded-tl-none border border-brand-text-secondary/5"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-brand-text-secondary uppercase font-mono">
                    {msg.role === 'user' ? t.user : t.ai_name}
                  </span>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-1 items-center text-brand-text-secondary">
                  <div className="w-1 h-1 bg-brand-text-secondary rounded-full animate-bounce" />
                  <div className="w-1 h-1 bg-brand-text-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1 h-1 bg-brand-text-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-brand-text-secondary/5">
              <div className="relative">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={t.chat_placeholder}
                  className="w-full bg-brand-bg/50 border border-brand-text-secondary/20 rounded-lg py-2 pl-3 pr-10 text-sm focus:outline-none focus:border-brand-accent transition-colors"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-text-secondary hover:text-brand-accent transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Server Selector */}
          <section className="hardware-card p-6 flex-1">
            <h2 className="text-sm font-mono uppercase tracking-widest flex items-center gap-2 mb-6">
              <Wifi className="w-4 h-4 text-brand-accent" />
              {t.operator}
            </h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {PROVIDERS.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedProvider(p)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-[10px] font-mono border transition-all",
                    selectedProvider === p 
                      ? "bg-brand-accent/20 border-brand-accent text-brand-accent" 
                      : "bg-white/5 border-transparent text-brand-text-secondary hover:bg-white/10"
                  )}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>

            <h2 className="text-sm font-mono uppercase tracking-widest flex items-center gap-2 mb-6">
              <Server className="w-4 h-4 text-brand-accent" />
              Seleção de Nó
            </h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brand-text-secondary/10">
              {servers.map((server) => (
                <button
                  key={server.id}
                  onClick={() => setSelectedServer(server)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                    selectedServer.id === server.id 
                      ? "bg-brand-accent/10 border-brand-accent/50 text-brand-accent" 
                      : "bg-brand-text-secondary/5 border-transparent text-brand-text-secondary hover:bg-brand-text-secondary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      server.load > 80 ? "bg-brand-danger" : server.load > 50 ? "bg-yellow-500" : "bg-brand-success"
                    )} />
                    <span className="text-lg">{server.flag}</span>
                    <span className="text-sm font-medium">{server.name}</span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[10px]">
                    <span>{server.latency}MS</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-brand-text-secondary/5">
              <div className="flex items-center justify-between text-[10px] font-mono text-brand-text-secondary uppercase">
                <span>{t.system_load}</span>
                <span>42%</span>
              </div>
              <div className="mt-2 h-1 w-full bg-brand-text-secondary/5 rounded-full overflow-hidden">
                <div className="h-full bg-brand-accent w-[42%]" />
              </div>
            </div>
          </section>

        </motion.div>
      </main>

      {/* Footer / Status Bar */}
      <footer className="hardware-card px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono text-brand-text-secondary uppercase tracking-widest">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3" />
            <span>CPU: 12%</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            <span>LOGS: ACTIVE</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            <span>THREATS: 0</span>
          </div>
          <div className="flex items-center gap-2 border-l border-brand-text-secondary/10 pl-6">
            <Mail className="w-3 h-3 text-brand-accent" />
            <span>SUPORTE: borgeruicandala@gmail.com</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span>{t.session}: {connected ? "00:14:22" : "00:00:00"}</span>
          <div className="w-px h-3 bg-brand-text-secondary/10" />
          <span>{t.data}: {connected ? "1.2 GB" : "0 B"}</span>
        </div>
      </footer>
    </div>
  );
}
