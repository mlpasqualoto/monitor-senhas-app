# Monitor de Senhas com Electron

O **Monitor de Senhas** é uma aplicação desktop desenvolvida com Electron que monitora sites de gerenciamento de senhas em busca de senhas específicas, notificando o usuário quando encontra uma correspondência. A aplicação funciona em segundo plano (tray) e envia notificações do sistema quando detecta senhas com prefixos específicos.

---
## ✨ Funcionalidades

- **Monitoramento Automático:** Verifica continuamente o site do cartório em busca de senhas com prefixos específicos.
- **Notificações do Sistema:** Envia alertas nativos do sistema operacional quando uma nova senha é detectada.
- **Funcionamento em Segundo Plano:** Continua monitorando mesmo quando minimizado, com ícone na bandeja do sistema.
- **Prefixos Personalizáveis:** Permite configurar quais prefixos de senha serão monitorados (PP, PPM, PPV, etc.).
- **Interface Amigável:** Apresenta a aplicação web do cartório em uma janela desktop nativa.

---
## 🛠 Tecnologias Utilizadas

- **Electron:** Framework para desenvolvimento de aplicações desktop multiplataforma.
- **Node.js:** Ambiente de execução JavaScript no backend.
- **dotenv:** Gerenciamento de variáveis de ambiente para configurações sensíveis.
- **JavaScript Injection:** Técnica para injetar código de monitoramento na página web.

---
## 📂 Estrutura do Código

### **main.js**
Configuração principal da aplicação Electron, incluindo:
- Criação da janela principal e configuração do sistema de tray.
- Injeção de scripts no contexto da página web.
- Gerenciamento de notificações do sistema operacional.
- Comunicação entre processos renderer e main via IPC.

### **Fluxo Principal**
1. Inicia aplicação Electron e cria a janela principal.
2. Carrega o site do cartório na janela.
3. Injeta script de monitoramento após o carregamento completo da página.
4. O script monitora continuamente elementos HTML em busca de padrões de senha.
5. Quando uma senha com prefixo monitorado é encontrada, envia notificação ao usuário.
6. A aplicação continua funcionando em segundo plano, mesmo quando a janela é fechada.

---
## ⚙️ Configuração do Projeto

1. **Clone o repositório:**
```bash
git clone <url-do-repositorio>
cd monitor-de-senhas
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Configure as variáveis de ambiente:**
- Crie um arquivo .env na raiz com:
```bash
APP_URL=<url_do_site_do_cartorio>
```

4. **Execute a aplicação:**
```bash
npm start
```

5. **Personalização (opcional):**
- Edite os prefixos monitorados no código (PREFIXOS_MONITORADOS).
- Ajuste o intervalo de verificação (INTERVALO_VERIFICACAO) conforme necessário.

---
## 🔍 Exemplo de Uso

- A aplicação inicia automaticamente o monitoramento após ser aberta.
- Quando uma senha com prefixo monitorado (ex: PP123, EPM456) é encontrada, uma notificação é exibida.
- Clique no ícone da bandeja do sistema para reabrir a aplicação a qualquer momento.
- Utilize o menu de contexto do ícone da bandeja para mostrar a aplicação, abrir DevTools ou sair.

---
## 🤝 Contribuições

- Contribuições são bem-vindas! Reporte issues ou envie sugestões via pull requests.

---
## 📜 Licença

- Este projeto está licenciado sob a licença MIT.
