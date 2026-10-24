import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import RequestCard from '../src/components/RequestCard.vue'
import BaseButton from '../src/components/BaseButton.vue'
import StatusBadge from '../src/components/StatusBadge.vue'
import StatCard from '../src/components/StatCard.vue'
import BaseInput from '../src/components/BaseInput.vue'
import DataTable from '../src/components/DataTable.vue'
import type { RequestItem } from '../src/types'

const item: RequestItem = {
  id: '12345678-aaaa-bbbb-cccc-123456789000',
  title: 'Acesso ao ambiente',
  description: 'Não consigo acessar minha conta',
  category: 'Acesso e conta',
  status: 'Aberta',
  priority: 'Alta',
  createdAt: '2026-10-20T10:00:00.000Z',
}

describe('RequestCard', () => {
  it('renders request details and emits status changes', async () => {
    const wrapper = mount(RequestCard, { props: { item } })
    expect(wrapper.text()).toContain('Acesso ao ambiente')
    const select = wrapper.find('select[aria-label="Status de Acesso ao ambiente"]')
    await select.setValue('Concluída')
    expect(wrapper.emitted('statusChange')?.[0]).toEqual([item.id, 'Concluída'])
  })
})

describe('BaseButton', () => {
  it('renders button with correct variant and emits click event', async () => {
    const wrapper = mount(BaseButton, {
      props: { variant: 'secondary' },
      slots: { default: 'Clique aqui' },
    })
    expect(wrapper.text()).toContain('Clique aqui')
    expect(wrapper.classes()).toContain('btn-secondary')
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('disables button when loading', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Salvar' },
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
  })
})

describe('StatusBadge', () => {
  it('renders badge with correct status class', () => {
    const wrapper = mount(StatusBadge, {
      props: { status: 'Aberta' },
    })
    expect(wrapper.text()).toContain('Aberta')
    expect(wrapper.classes()).toContain('badge-aberto')
  })

  it('renders badge with correct priority class', () => {
    const wrapper = mount(StatusBadge, {
      props: { priority: 'Alta' },
    })
    expect(wrapper.text()).toContain('Alta')
    expect(wrapper.classes()).toContain('badge-alta')
  })
})

describe('StatCard', () => {
  it('renders title, value and badge', () => {
    const wrapper = mount(StatCard, {
      props: {
        title: 'Total de solicitações',
        value: 128,
        badgeText: '+12%',
        badgeType: 'success',
      },
    })
    expect(wrapper.text()).toContain('Total de solicitações')
    expect(wrapper.text()).toContain('128')
    expect(wrapper.text()).toContain('+12%')
  })
})

describe('BaseInput', () => {
  it('emits update:modelValue on input change', async () => {
    const wrapper = mount(BaseInput, {
      props: {
        label: 'E-mail',
        modelValue: '',
      },
    })
    const input = wrapper.find('input')
    await input.setValue('usuario@atendeflow.com')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['usuario@atendeflow.com'])
  })
})

describe('DataTable', () => {
  it('renders columns and paginated items', () => {
    const columns = [
      { key: 'id', label: '#' },
      { key: 'title', label: 'Título' },
    ]
    const items = [
      { id: '1', title: 'Solicitação 1' },
      { id: '2', title: 'Solicitação 2' },
    ]
    const wrapper = mount(DataTable, {
      props: { columns, items, pageSize: 5 },
    })
    expect(wrapper.text()).toContain('Solicitação 1')
    expect(wrapper.text()).toContain('Solicitação 2')
    expect(wrapper.text()).toContain('Mostrando 1 a 2 de 2 resultados')
  })
})
