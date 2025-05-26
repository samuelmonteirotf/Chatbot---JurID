# Chatbot Certificados Digitais - Full Stack

**Aplicação** para suporte a certificados digitais com frontend Vue.js e backend Node.js integrados em um único projeto.

## Visão Geral

Este projeto combina:
- **Frontend Vue.js** - Interface moderna e responsiva
- **Backend Node.js/Express** - API REST com base de conhecimento inteligente
- **Arquitetura Monorepo** - Desenvolvimento e deploy simplificados

### Funcionalidades

- ✅ **Chat Inteligente** com respostas contextuais
- ✅ **Suporte Completo** para certificados A1, A3 e Vidaas
- ✅ **Interface Responsiva** com tema claro/escuro
- ✅ **API REST Robusta** com rate limiting e segurança
- ✅ **Base de Conhecimento** extensiva sobre certificados
- ✅ **Deploy Unificado** com Docker e Docker Compose

## Instalação Rápida

### 1. Clone o projeto
\`\`\`bash
git clone <repository-url>
cd chatbot-certificado-digital
\`\`\`

### 2. Instale todas as dependências
\`\`\`bash
npm run install:all
\`\`\`

### 3. Configure as variáveis de ambiente
\`\`\`bash
cp backend/.env.example backend/.env
# Edite backend/.env conforme necessário
\`\`\`

### 4. Inicie o projeto completo
\`\`\`bash
npm run dev
\`\`\`

Isso iniciará:
- **Frontend** em http://localhost:3000
- **Backend** em http://localhost:3001

## Estrutura do Projeto

```plaintext
chatbot-certificado-digital/
├── frontend/                  # Front-end Vue 3 + Vite
│   ├── src/
│   │   ├── App.vue            # Componente raiz da aplicação
│   │   ├── main.js            # Ponto de entrada da aplicação
│   │   ├── style.css          # Estilos com Tailwind CSS
│   │   └── services/
│   │       └── chatService.js # Cliente HTTP para a API do chatbot
│   ├── index.html             # Template HTML base
│   ├── vite.config.js         # Configuração do Vite
│   ├── tailwind.config.js     # Configuração do Tailwind CSS
│   ├── postcss.config.js      # Configuração do PostCSS
│   └── package.json           # Dependências e scripts do front-end
│
├── backend/                  # Back-end Node.js + Express
│   ├── index.js               # Servidor principal da API
│   ├── knowledgeBase.json     # Base de conhecimento do chatbot
│   ├── .env.example           # Exemplo de variáveis de ambiente
│   └── package.json           # Dependências e scripts do back-end
│
├── package.json              # Scripts e orquestração do monorepo
├── docker-compose.yml        # Orquestração de containers (front + back)
├── Dockerfile                # Dockerfile para build unificado
└── README.md                 # Documentação do projeto
```

## Scripts Disponíveis

### Desenvolvimento
\`\`\`bash
npm run dev              # Inicia frontend + backend
npm run client:dev       # Apenas frontend (porta 3000)
npm run server:dev       # Apenas backend (porta 3001)
\`\`\`

### Produção
\`\`\`bash
npm run build           # Build completo
npm start               # Inicia em modo produção
npm run client:build    # Build apenas frontend
\`\`\`

### Utilidades
\`\`\`bash
npm run install:all     # Instala todas as dependências
npm run clean           # Remove node_modules
npm test                # Executa todos os testes
\`\`\`

## API Endpoints

Base URL: \`http://localhost:3001/api\`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | \`/health\` | Status do servidor |
| POST | \`/message\` | Enviar mensagem ao chatbot |
| GET | \`/categories\` | Listar categorias |
| GET | \`/questions/:category\` | Perguntas por categoria |
| GET | \`/stats\` | Estatísticas da base |

### Exemplo de Uso da API

\`\`\`javascript
// Enviar mensagem
const response = await fetch('/api/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: 'Como instalar certificado A1?' 
  })
})

const data = await response.json()
console.log(data.reply) // Resposta do chatbot
\`\`\`

## 🔧 Configuração

### Variáveis de Ambiente (backend/.env)

\`\`\`env
# Servidor
PORT=3001
NODE_ENV=development

# CORS (produção)
CORS_ORIGIN=https://seudominio.com

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100

# Segurança
SESSION_SECRET=seu_secret_muito_seguro
\`\`\`

### Proxy do Frontend (desenvolvimento)

O Vite está configurado para fazer proxy das chamadas \`/api\` para o backend:

\`\`\`javascript
// frontend/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
\`\`\`

## Deploy com Docker

### Build e execução
\`\`\`bash
# Build da imagem
docker build -t chatbot-certificados .

# Executar container
docker run -p 3001:3001 chatbot-certificados
\`\`\`

### Docker Compose (recomendado)
\`\`\`bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
\`\`\`

## Customização

### Adicionando Novas Perguntas

Edite \`backend/knowledgeBase.json\`:

\`\`\`json
{
  "id": 16,
  "pergunta": "Nova pergunta aqui?",
  "resposta": "Resposta detalhada...",
  "categoria": "nova-categoria",
  "keywords": ["palavra1", "palavra2"],
  "topicos_relacionados": ["topico1", "topico2"]
}
\`\`\`

### Modificando a Interface

O frontend usa **Tailwind CSS** para estilização:
- Edite \`frontend/src/App.vue\` para mudanças na interface
- Modifique \`frontend/src/style.css\` para estilos customizados
- Configure \`frontend/tailwind.config.js\` para temas personalizados

## Monitoramento

### Health Check
\`\`\`bash
curl http://localhost:3001/api/health
\`\`\`

### Logs
\`\`\`bash
# Desenvolvimento
npm run dev

# Produção com PM2
npm install -g pm2
pm2 start backend/index.js --name chatbot
pm2 logs chatbot
\`\`\`

## Segurança

- ✅ **Rate Limiting** - 100 requests/15min por IP
- ✅ **CORS** configurado para origens específicas
- ✅ **Helmet** para headers de segurança
- ✅ **Validação** de entrada em todos endpoints
- ✅ **Sanitização** de dados de resposta

## Testes

\`\`\`bash
# Executar todos os testes
npm test

# Testes do backend
cd backend && npm test

# Testes do frontend
cd frontend && npm test
\`\`\`

## Performance

### Frontend
- **Vite** para build otimizado
- **Tree-shaking** automático
- **Compressão gzip** em produção
- **Cache** de assets estáticos

### Backend
- **Rate limiting** para proteção
- **Compressão** de respostas
- **Headers** de cache apropriados
- **Graceful shutdown** implementado

## Deploy em Produção

### 1. Build da aplicação
\`\`\`bash
npm run build
\`\`\`

### 2. Configurar variáveis de ambiente
\`\`\`bash
export NODE_ENV=production
export PORT=3001
export CORS_ORIGIN=https://seudominio.com
\`\`\`

### 3. Iniciar servidor
\`\`\`bash
npm start
\`\`\`

O servidor servirá tanto a API quanto os arquivos estáticos do frontend.

## Suporte

- **GitHub Issues**: Para bugs e feature requests
- **Email**: suporte@seudominio.com
- **Documentação**: Veja os comentários no código

## Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

** Desenvolvido para a comunidade jurídica brasileira**

 **Certificados suportados**: A1, A3, Vidaas  
 **Sistemas compatíveis**: PJe, Projudi, e-CAC, Gov.br  
 **Pronto para produção**: Docker, HTTPS, monitoramento
\`\`\`
