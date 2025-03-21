const { app, BrowserWindow, Tray, Menu, shell, ipcMain, Notification } = require('electron');
const path = require('path');
const url = require('url');
const dotenv = require('dotenv');

dotenv.config();

// Mantenha uma referência global do objeto window, se não o fizer, a janela será
// fechada automaticamente quando o objeto JavaScript for coletado pelo garbage collector.
let mainWindow;
let tray = null;
let isQuitting = false;

function createWindow() {
    // Crie a janela do navegador.
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
        nodeIntegration: false, // Por segurança, desative a integração Node
        contextIsolation: true, // Isole o contexto do Electron
        preload: path.join(__dirname, 'preload.js') // Script de pré-carregamento
        }
    });

    // Carregue o site
    mainWindow.loadURL(`${process.env.APP_URL}`);

    // Abra o DevTools (opcional, remova em produção)
    // mainWindow.webContents.openDevTools();

    // Quando a página terminar de carregar, injete o script
    mainWindow.webContents.on('did-finish-load', () => {
        injectScript();
    });

    // Mantenha o aplicativo em execução quando a janela for fechada
    mainWindow.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            return false;
        }
        return true;
    });

    // Emitido quando a janela é fechada.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Crie o ícone da bandeja
    createTray();
}

function createTray() {
    tray = new Tray(path.join(__dirname, 'assets/icon.png'));
    const contextMenu = Menu.buildFromTemplate([
        { label: 'Mostrar Aplicativo', click: () => mainWindow.show() },
        { label: 'Abrir DevTools', click: () => mainWindow.webContents.openDevTools() },
        { type: 'separator' },
        { label: 'Sair', click: () => { isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('Monitor de Senhas');
    tray.setContextMenu(contextMenu);
    
    // Mostrar a janela ao clicar no ícone da bandeja
    tray.on('click', () => {
        mainWindow.show();
    });
}

function injectScript() {
    // Injete o script no contexto da página
    mainWindow.webContents.executeJavaScript(`
        console.log("Script injetado pelo Electron");
        
        // Função para enviar notificações para o Electron
        function notificarSenha(mensagem, contexto) {
            // Envia mensagem para o processo principal
            window.electronAPI.enviarNotificacao('nova-senha', mensagem, contexto);
        }
        
        // Armazena senhas já detectadas para evitar duplicações
        // Declarando no escopo global para garantir acesso em todas as funções
        const senhasDetectadas = new Set();

        // Configurações - ajuste conforme necessário
        const PREFIXOS_MONITORADOS = ['PP', 'PPM', 'PPV', 'PPL', 'EP', 'EPM', 'EPV', 'AN']; // Adicione ou remova prefixos conforme necessário
        const INTERVALO_VERIFICACAO = 3000; // 3 segundos - ajuste conforme necessário

        // Função para verificar senhas na página
        function verificarSenhas() {
            console.log('Verificando senhas no site do cartório...');
            
            // Seleciona todos os elementos com classe ng-binding
            const elementos = document.querySelectorAll('.ng-binding');
            console.log(\`Encontrados \${elementos.length} elementos com classe ng-binding\`);
            
            const senhasEncontradas = [];
            
            elementos.forEach(elemento => {
                const texto = elemento.textContent.trim();
                
                // Ignora elementos sem texto
                if (!texto) return;
                
                // Verifica cada prefixo
                PREFIXOS_MONITORADOS.forEach(prefixo => {
                    // Regex para detectar o prefixo seguido por números, com ou sem espaços
                    const regex = new RegExp(\`\${prefixo}\\\\s*\\\\d+\`, 'i');
                    
                    if (regex.test(texto)) {
                        const match = texto.match(regex);
                        if (match) {
                            const senhaEncontrada = match[0].replace(/\s+/g, ''); // Remove espaços extras
                            
                            // Evita duplicação
                            if (!senhasDetectadas.has(senhaEncontrada)) {
                                senhasDetectadas.add(senhaEncontrada);
                                
                                const contexto = texto.length > 100 ? texto.substring(0, 100) + '...' : texto;
                                
                                senhasEncontradas.push({
                                senha: senhaEncontrada,
                                textoCompleto: contexto
                                });
                                
                                console.log(\`Nova senha encontrada: \${senhaEncontrada}\`);
                                notificarSenha(senhaEncontrada, contexto);
                            }
                        }
                    }
                });
            });
            
            if (senhasEncontradas.length > 0) {
                console.log(\`Total de \${senhasEncontradas.length} novas senhas encontradas nesta verificação\`);
            }
        }

        // Função para iniciar o monitoramento
        function iniciarMonitoramento() {
            console.log(\`Iniciando monitoramento de senhas para prefixos: \${PREFIXOS_MONITORADOS.join(', ')}\`);
            console.log(\`Intervalo de verificação: \${INTERVALO_VERIFICACAO/1000} segundos\`);
            
            // Executa imediatamente a primeira verificação
            verificarSenhas();
            
            setInterval(verificarSenhas, INTERVALO_VERIFICACAO);
        }

        // Inicia o monitoramento
        iniciarMonitoramento();

        // Simular uma notificação após 5 segundos para teste
        setTimeout(() => {
            notificarSenha("Esta é uma notificação de teste");
        }, 5000);
    `);
}

// Este método será chamado quando o Electron terminar
// a inicialização e estiver pronto para criar janelas do navegador.
app.whenReady().then(() => {
    createWindow();
    
    app.on('activate', () => {
        // No macOS, é comum recriar uma janela no aplicativo quando o
        // ícone do dock é clicado e não há outras janelas abertas.
        if (mainWindow === null) createWindow();
    });
});

// Ouvinte para notificações do renderer
ipcMain.on('nova-senha', (event, mensagem, contexto) => {
    // Crie uma notificação nativa do sistema
    const notificacao = new Notification({
        title: 'Nova Senha Encontrada',
        body: `${mensagem}\n${contexto || ''}`,
        icon: path.join(__dirname, 'assets/icon.png'),
        silent: false, // Para emitir som
        hasReply: false, // Não precisa de resposta de texto
        timeoutType: 'never', // Nunca expira automaticamente (Windows)
        closeButtonText: 'Fechar', // Texto do botão fechar (macOS)
        actions: [
            {
                type: 'button',
                text: 'Visualizar'
            }
        ]
    });

    // Lidar com cliques na notificação
    notificacao.on('click', () => {
        console.log('Notificação clicada');
        // Mostrar a janela principal se estiver minimizada
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // Lidar com ações de botão na notificação (como "Visualizar")
    notificacao.on('action', (event, index) => {
        console.log(`Ação ${index} clicada`);
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });

    // Lidar com o fechamento da notificação
    notificacao.on('close', () => {
        console.log('Notificação fechada');
    });

    // Mostrar notificação
    notificacao.show();

    // Logging para depuração
    console.log('Notificação enviada:', mensagem);
});

// Sair quando todas as janelas estiverem fechadas, exceto no macOS.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// Quando o usuário clicar em sair no menu, defina isQuitting como true
app.on('before-quit', () => {
    isQuitting = true;
});
