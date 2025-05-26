const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")
const stringSimilarity = require("string-similarity")
const helmet = require("helmet")
const rateLimit = require("express-rate-limit")
const path = require("path")
require("dotenv").config()

const knowledgeBase = require("./knowledgeBase.json")

const app = express()

// ✅ Confia no proxy da Railway (resolve problema do rate-limit com X-Forwarded-For)
app.set("trust proxy", 1)

// Porta usada: definida pelo Railway via process.env.PORT ou padrão local 3001
const PORT = process.env.PORT || 3001

// Middleware de segurança
app.use(helmet())

// Rate limiting básico por IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Muitas tentativas. Tente novamente em 15 minutos.",
  },
})
app.use("/api/", limiter)

// CORS (ajuste para dev e produção)
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://chatbot-jurid-production.up.railway.app"]
      : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
}
app.use(cors(corsOptions))

app.use(bodyParser.json({ limit: "10mb" }))
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }))

// Logging básico
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// --------------------- Lógica do chatbot ---------------------

function findBestMatch(userMessage) {
  if (!userMessage || typeof userMessage !== "string") return null

  const normalized = userMessage.toLowerCase().trim()

  const keywordMatches = knowledgeBase.filter((item) => {
    const keywords = item.keywords || []
    return keywords.some((k) => normalized.includes(k.toLowerCase()))
  })

  if (keywordMatches.length > 0) return keywordMatches[0]

  let bestMatch = null
  let highestSimilarity = 0

  knowledgeBase.forEach((item) => {
    const similarity = stringSimilarity.compareTwoStrings(normalized, item.pergunta.toLowerCase())
    if (similarity > highestSimilarity && similarity > 0.3) {
      highestSimilarity = similarity
      bestMatch = item
    }
  })

  return bestMatch
}

function generateContextualResponse(message, match) {
  if (!match) {
    return {
      reply:
        "Desculpe, não encontrei uma resposta específica para sua pergunta. Posso ajudar com informações sobre:\n\n" +
        "• Instalação de Certificados A1 (Windows/Mac)\n" +
        "• Instalação de Certificados A3 Físico\n" +
        "• Configuração do Vidaas (Computador/Celular)\n" +
        "• Configuração no PJe\n" +
        "• Configuração no Projudi\n\n" +
        "Por favor, reformule sua pergunta ou entre em contato com nosso suporte técnico.",
      confidence: 0,
      category: "fallback",
    }
  }

  return {
    reply: match.resposta,
    confidence: 1,
    category: match.categoria || "geral",
    relatedTopics: match.topicos_relacionados || [],
  }
}

// --------------------- Rotas da API ---------------------

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  })
})

app.post("/api/message", (req, res) => {
  try {
    const { message } = req.body

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({
        error: "Mensagem inválida",
        code: "INVALID_MESSAGE",
      })
    }

    if (message.length > 500) {
      return res.status(400).json({
        error: "Mensagem muito longa (máximo 500 caracteres)",
        code: "MESSAGE_TOO_LONG",
      })
    }

    const match = findBestMatch(message)
    const response = generateContextualResponse(message, match)

    console.log(`Pergunta: "${message.substring(0, 50)}..." | Confiança: ${response.confidence}`)

    res.json({ ...response, timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("Erro no processamento da mensagem:", error)
    res.status(500).json({ error: "Erro interno", code: "INTERNAL_ERROR" })
  }
})

app.get("/api/categories", (req, res) => {
  try {
    const categories = [...new Set(knowledgeBase.map((item) => item.categoria))]
    res.json({ categories, total: categories.length })
  } catch (err) {
    console.error("Erro ao buscar categorias:", err)
    res.status(500).json({ error: "Erro interno", code: "INTERNAL_ERROR" })
  }
})

app.get("/api/questions/:category", (req, res) => {
  try {
    const { category } = req.params
    const questions = knowledgeBase
      .filter((item) => item.categoria === category)
      .map((item) => ({
        id: item.id,
        pergunta: item.pergunta,
        categoria: item.categoria,
      }))
    res.json({ category, questions, total: questions.length })
  } catch (err) {
    console.error("Erro ao buscar perguntas:", err)
    res.status(500).json({ error: "Erro interno", code: "INTERNAL_ERROR" })
  }
})

app.get("/api/stats", (req, res) => {
  try {
    const totalQuestions = knowledgeBase.length
    const categories = [...new Set(knowledgeBase.map((item) => item.categoria))]

    const stats = categories.map((cat) => ({
      category: cat,
      count: knowledgeBase.filter((item) => item.categoria === cat).length,
    }))

    res.json({
      totalQuestions,
      totalCategories: categories.length,
      categoryBreakdown: stats,
      lastUpdated: new Date().toISOString(),
    })
  } catch (err) {
    console.error("Erro ao buscar estatísticas:", err)
    res.status(500).json({ error: "Erro interno", code: "INTERNAL_ERROR" })
  }
})

// 404 para APIs (isso deve vir antes de servir o frontend)
app.use("/api/*", (req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    code: "NOT_FOUND",
    availableRoutes: [
      "GET /api/health",
      "POST /api/message",
      "GET /api/categories",
      "GET /api/questions/:category",
      "GET /api/stats",
    ],
  })
})

// ✅ Servir frontend no final (fallback SPA)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.resolve(__dirname, "frontend/dist")
  app.use(express.static(frontendPath))
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"))
  })
}

// --------------------- Inicialização ---------------------

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`)
  console.log(`📚 Base de conhecimento carregada com ${knowledgeBase.length} itens`)
  console.log(`🔗 Health check disponível em: http://localhost:${PORT}/api/health`)
  console.log(`🤖 API do chatbot em: http://localhost:${PORT}/api/message`)
  if (process.env.NODE_ENV === "production") {
    console.log(`🌐 Frontend servido em: http://localhost:${PORT}`)
  }
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("Recebido SIGTERM. Encerrando servidor...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("Recebido SIGINT. Encerrando servidor...")
  process.exit(0)
})
