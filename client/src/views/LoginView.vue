<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  MessageSquare,
  Check,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
} from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import BaseButton from '../components/BaseButton.vue'
import BaseInput from '../components/BaseInput.vue'

const auth = useAuthStore()
const toast = useToastStore()
const router = useRouter()

const mode = ref<'login' | 'register'>('login')
const name = ref('')
const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const showPassword = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  try {
    const payload: Record<string, string> = {
      email: email.value.trim(),
      password: password.value,
    }

    if (mode.value === 'register') {
      if (name.value.trim().length < 2) {
        error.value = 'Informe seu nome completo.'
        return
      }
      payload.name = name.value.trim()
    }

    await auth.authenticate(mode.value, payload)
    toast.success(
      mode.value === 'login' ? 'Bem-vindo de volta!' : 'Conta criada!',
      `Autenticado como ${auth.user?.name || email.value}`
    )
    await router.push('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Não foi possível autenticar.'
  }
}

function handleForgotPassword() {
  toast.info(
    'Recuperação de senha',
    'Entre em contato com o administrador do sistema para redefinir sua credencial.'
  )
}

function handleGoogleAuth() {
  toast.info(
    'Login Corporativo Google',
    'A integração SSO Google está configurada para domínios autorizados pela organização.'
  )
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card-container">
      <!-- Coluna Esquerda: Apresentação da Marca (Azul Profundo) -->
      <div class="auth-brand-panel">
        <div class="brand-top">
          <div class="brand-logo-icon">
            <MessageSquare :size="24" />
          </div>
          <span class="brand-title">Atende<span class="brand-flow">Flow</span></span>
        </div>

        <div class="brand-content">
          <h1 class="brand-heading">Bem-vindo de volta!</h1>
          <p class="brand-subheading">
            Acesse sua conta para continuar gerenciando suas solicitações.
          </p>

          <ul class="benefit-list">
            <li class="benefit-item">
              <span class="benefit-check"><Check :size="14" /></span>
              <span>Atendimento mais organizado</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-check"><Check :size="14" /></span>
              <span>Acompanhamento em tempo real</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-check"><Check :size="14" /></span>
              <span>Equipe mais produtiva</span>
            </li>
            <li class="benefit-item">
              <span class="benefit-check"><Check :size="14" /></span>
              <span>Tudo em um só lugar</span>
            </li>
          </ul>
        </div>

        <div class="brand-footer">
          <span>Design System AtendeFlow • Gestão & Atendimento</span>
        </div>
      </div>

      <!-- Coluna Direita: Formulário de Autenticação (Superfície Branca) -->
      <div class="auth-form-panel">
        <!-- Abas Entrar / Cadastrar -->
        <div class="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'login'"
            :class="['tab-btn', { active: mode === 'login' }]"
            @click="mode = 'login'; error = ''"
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="mode === 'register'"
            :class="['tab-btn', { active: mode === 'register' }]"
            @click="mode = 'register'; error = ''"
          >
            Cadastrar
          </button>
        </div>

        <!-- Título do formulário -->
        <div class="form-header">
          <h2 class="form-title">
            {{ mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta' }}
          </h2>
          <p class="form-subtitle">Informe seus dados para continuar</p>
        </div>

        <form class="auth-form" @submit.prevent="submit">
          <!-- Campo Nome (apenas no cadastro) -->
          <BaseInput
            v-if="mode === 'register'"
            v-model="name"
            label="Nome"
            placeholder="Seu nome completo"
            required
            autocomplete="name"
          >
            <template #icon>
              <UserIcon :size="18" />
            </template>
          </BaseInput>

          <!-- Campo E-mail -->
          <BaseInput
            v-model="email"
            type="email"
            label="E-mail"
            placeholder="seu@email.com"
            required
            autocomplete="email"
          >
            <template #icon>
              <Mail :size="18" />
            </template>
          </BaseInput>

          <!-- Campo Senha -->
          <BaseInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Senha"
            placeholder="Sua senha"
            required
            :minlength="mode === 'register' ? 8 : 1"
            autocomplete="current-password"
          >
            <template #icon>
              <Lock :size="18" />
            </template>
            <template #right>
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'Ocultar senha' : 'Exibir senha'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="18" />
                <Eye v-else :size="18" />
              </button>
            </template>
          </BaseInput>

          <!-- Opções Lembrar e Esqueceu Senha -->
          <div class="form-options">
            <label class="remember-label">
              <input v-model="rememberMe" type="checkbox" class="checkbox-input" />
              <span>Lembrar de mim</span>
            </label>

            <button
              type="button"
              class="forgot-link"
              @click="handleForgotPassword"
            >
              Esqueceu a senha?
            </button>
          </div>

          <!-- Erro de validação ou API -->
          <p v-if="error" class="form-error-banner" role="alert">
            {{ error }}
          </p>

          <!-- Botão Primário Entrar / Cadastrar -->
          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            block
            :loading="auth.busy"
          >
            {{ mode === 'login' ? 'Entrar' : 'Criar conta' }}
          </BaseButton>

          <!-- Separador "ou" -->
          <div class="auth-divider">
            <span class="divider-text">ou</span>
          </div>

          <!-- Botão Social Google -->
          <button
            type="button"
            class="google-auth-btn"
            @click="handleGoogleAuth"
          >
            <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Entrar com Google</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  background-color: var(--color-bg);
}

.auth-card-container {
  display: flex;
  width: 100%;
  max-width: 960px;
  min-height: 580px;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
}

/* Painel Esquerdo Azul */
.auth-brand-panel {
  flex: 1;
  background: linear-gradient(160deg, #18324A 0%, #122436 100%);
  color: var(--color-text-inverted);
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brand-logo-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(20, 184, 166, 0.4);
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-flow {
  color: var(--color-secondary);
}

.brand-content {
  margin: var(--space-8) 0;
}

.brand-heading {
  font-size: 30px;
  font-weight: 700;
  line-height: 1.25;
  color: white;
  margin-bottom: var(--space-3);
}

.brand-subheading {
  font-size: var(--font-size-sm);
  color: #94A3B8;
  line-height: 1.6;
  max-width: 320px;
  margin-bottom: var(--space-6);
}

.benefit-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  color: #CBD5E1;
}

.benefit-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: rgba(20, 184, 166, 0.2);
  color: var(--color-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-footer {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
}

/* Painel Direito Branco */
.auth-form-panel {
  flex: 1.1;
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.auth-tabs {
  display: flex;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: var(--space-6);
}

.tab-btn {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  text-align: center;
  position: relative;
  transition: all var(--transition-fast);
}

.tab-btn:hover {
  color: var(--color-text-primary);
}

.tab-btn.active {
  color: var(--color-text-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-secondary);
}

.form-header {
  margin-bottom: var(--space-6);
}

.form-title {
  font-size: var(--font-size-title-2);
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.form-subtitle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.password-toggle {
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--color-text-primary);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  margin-top: -4px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-secondary);
  cursor: pointer;
}

.checkbox-input {
  accent-color: var(--color-secondary);
  width: 16px;
  height: 16px;
}

.forgot-link {
  color: var(--color-info);
  font-weight: 500;
  transition: color var(--transition-fast);
}

.forgot-link:hover {
  color: var(--color-info-text);
  text-decoration: underline;
}

.form-error-banner {
  background-color: var(--color-danger-bg);
  border: 1px solid #FECACA;
  color: var(--color-danger-text);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  line-height: 1.4;
}

.auth-divider {
  position: relative;
  text-align: center;
  margin: var(--space-2) 0;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--color-border);
}

.divider-text {
  position: relative;
  background-color: var(--color-surface);
  padding: 0 var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.google-auth-btn {
  width: 100%;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all var(--transition-fast);
}

.google-auth-btn:hover {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-hover);
}

@media (max-width: 800px) {
  .auth-card-container {
    flex-direction: column;
    max-width: 480px;
  }

  .auth-brand-panel {
    padding: var(--space-6);
  }

  .brand-content {
    margin: var(--space-4) 0;
  }

  .brand-heading {
    font-size: 24px;
  }

  .auth-form-panel {
    padding: var(--space-6);
  }
}
</style>
