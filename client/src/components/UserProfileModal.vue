<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, User as UserIcon, Lock, Mail, Calendar, ShieldCheck, Check } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'
import { useToastStore } from '../stores/toast'
import { useUiStore } from '../stores/ui'
import { api } from '../utils/api'
import BaseButton from './BaseButton.vue'
import BaseInput from './BaseInput.vue'

const auth = useAuthStore()
const toast = useToastStore()
const ui = useUiStore()

const name = ref(auth.user?.name || '')
const email = ref(auth.user?.email || '')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isSaving = ref(false)
const errorMessage = ref('')

watch(() => ui.isProfileOpen, (open) => {
  if (open) {
    name.value = auth.user?.name || ''
    email.value = auth.user?.email || ''
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    errorMessage.value = ''
  }
})

const initials = computed(() => {
  const parts = (name.value || auth.user?.name || 'U').trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (name.value || auth.user?.name || 'U').slice(0, 2).toUpperCase()
})

async function saveProfile() {
  errorMessage.value = ''
  if (name.value.trim().length < 2) {
    errorMessage.value = 'O nome deve possuir pelo menos 2 caracteres.'
    return
  }

  if (newPassword.value) {
    if (!currentPassword.value) {
      errorMessage.value = 'Informe a senha atual para autorizar a troca de senha.'
      return
    }
    if (newPassword.value.length < 8) {
      errorMessage.value = 'A nova senha deve possuir ao menos 8 caracteres.'
      return
    }
    if (newPassword.value !== confirmPassword.value) {
      errorMessage.value = 'A confirmação de senha não confere.'
      return
    }
  }

  isSaving.value = true
  try {
    const payload: { name: string; currentPassword?: string; newPassword?: string } = {
      name: name.value.trim(),
    }
    if (newPassword.value) {
      payload.currentPassword = currentPassword.value
      payload.newPassword = newPassword.value
    }

    const res = await api<{ user: { id: string; name: string; email: string } }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })

    if (auth.user) {
      auth.user.name = res.user.name
      localStorage.setItem('atendeflow.user', JSON.stringify(auth.user))
    }

    toast.success('Perfil atualizado', 'Seus dados foram atualizados com sucesso.')
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    ui.closeProfile()
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Falha ao salvar dados.'
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="ui.isProfileOpen" class="modal-backdrop" @click.self="ui.closeProfile">
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="profile-title">
          <div class="modal-header">
            <div>
              <h3 id="profile-title" class="modal-title">Meu Perfil</h3>
              <p class="modal-subtitle">Visualize e gerencie suas informações de conta e acesso.</p>
            </div>
            <button type="button" class="close-btn" aria-label="Fechar" @click="ui.closeProfile">
              <X :size="20" />
            </button>
          </div>

          <!-- Card de Apresentação do Usuário -->
          <div class="user-hero-card">
            <div class="hero-avatar">
              {{ initials }}
            </div>
            <div class="hero-details">
              <div class="hero-name-row">
                <h4 class="hero-name">{{ auth.user?.name }}</h4>
                <span class="role-pill">
                  <ShieldCheck :size="13" /> Administrador
                </span>
              </div>
              <p class="hero-email">{{ auth.user?.email }}</p>
              <div class="hero-meta">
                <span><Calendar :size="12" /> Membro ativo da equipe</span>
              </div>
            </div>
          </div>

          <form class="profile-form" @submit.prevent="saveProfile">
            <h4 class="section-title">Dados Pessoais</h4>

            <BaseInput
              v-model="name"
              label="Nome completo"
              placeholder="Seu nome"
              required
              :minlength="2"
            >
              <template #icon>
                <UserIcon :size="16" />
              </template>
            </BaseInput>

            <BaseInput
              v-model="email"
              label="E-mail"
              placeholder="seu@email.com"
              disabled
            >
              <template #icon>
                <Mail :size="16" />
              </template>
            </BaseInput>

            <div class="divider" />

            <h4 class="section-title">Alterar Senha <span class="optional-tag">(Opcional)</span></h4>

            <BaseInput
              v-model="currentPassword"
              type="password"
              label="Senha atual"
              placeholder="Digite sua senha atual"
            >
              <template #icon>
                <Lock :size="16" />
              </template>
            </BaseInput>

            <div class="grid-2">
              <BaseInput
                v-model="newPassword"
                type="password"
                label="Nova senha"
                placeholder="Mínimo 8 caracteres"
                :minlength="8"
              >
                <template #icon>
                  <Lock :size="16" />
                </template>
              </BaseInput>

              <BaseInput
                v-model="confirmPassword"
                type="password"
                label="Confirmar nova senha"
                placeholder="Repita a nova senha"
                :minlength="8"
              >
                <template #icon>
                  <Lock :size="16" />
                </template>
              </BaseInput>
            </div>

            <p v-if="errorMessage" class="error-box" role="alert">
              {{ errorMessage }}
            </p>

            <div class="modal-footer">
              <BaseButton type="button" variant="outline" size="md" :disabled="isSaving" @click="ui.closeProfile">
                Cancelar
              </BaseButton>

              <BaseButton type="submit" variant="primary" size="md" :loading="isSaving">
                <Check :size="16" />
                <span>Salvar alterações</span>
              </BaseButton>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-modal);
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  animation: scaleUp 0.15s ease-out;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.modal-title {
  font-size: var(--font-size-title-2);
  font-weight: 700;
  color: var(--color-text-primary);
}

.modal-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.close-btn {
  color: var(--color-text-secondary);
  padding: 4px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}
.close-btn:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

.user-hero-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.hero-avatar {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: linear-gradient(135deg, #18324A 0%, #244667 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(24, 50, 74, 0.25);
}

.hero-details {
  flex: 1;
  min-width: 0;
}

.hero-name-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.hero-name {
  font-size: var(--font-size-body);
  font-weight: 700;
  color: var(--color-text-primary);
}

.role-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background-color: #EDF3F8;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.hero-email {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.section-title {
  font-size: var(--font-size-xs);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.optional-tag {
  font-weight: 400;
  text-transform: none;
  color: var(--color-text-muted);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.divider {
  height: 1px;
  background-color: var(--color-border);
  margin: var(--space-2) 0;
}

.error-box {
  background-color: var(--color-danger-bg);
  border: 1px solid #FECACA;
  color: var(--color-danger-text);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (max-width: 500px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}
</style>
