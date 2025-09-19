<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'navigate', id: string): void
}>()

const props = defineProps({
  initialActive: { type: String, default: 'calendar' },
})

const active = ref<string>(props.initialActive)

type Item = { id: string; label: string; hint?: string; icon: string }
const items: Item[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'dashboard', label: 'Dashboard', icon: 'chart' },
  { id: 'inbox', label: 'Inbox', icon: 'inbox' },
  { id: 'products', label: 'Products', icon: 'box' },
  { id: 'invoices', label: 'Invoices', icon: 'receipt' },
  { id: 'customers', label: 'Customers', icon: 'users' },
  { id: 'chat', label: 'Chat Room', icon: 'chat' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar' },
  { id: 'help', label: 'Help Center', icon: 'help' },
  { id: 'settings', label: 'Settings', icon: 'cog' },
]

function select(id: string) {
  active.value = id
  emit('navigate', id)
}

function onKey(e: KeyboardEvent, id: string) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    select(id)
  }
}
</script>

<template>
  <aside class="sidebar" role="navigation" aria-label="Main navigation">
    <div class="brand">
      <div class="logo" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="4" fill="rgba(255,255,255,0.03)" />
          <path d="M6 12h12" stroke="rgba(255,255,255,0.08)" stroke-width="1.5"></path>
        </svg>
      </div>
      <div class="brand-title">IMPEKABLE</div>
    </div>

    <nav class="menu" aria-label="Sidebar menu">
      <ul>
        <li
          v-for="item in items"
          :key="item.id"
          :class="{ item: true, active: active === item.id }"
        >
          <button
            :aria-current="active === item.id ? 'true' : 'false'"
            class="item-btn"
            @click="() => select(item.id)"
            @keydown="(e) => onKey(e, item.id)"
            type="button"
          >
            <span class="icon" aria-hidden="true">
              <svg
                v-if="item.icon === 'home'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 11.5L12 4l9 7.5"></path>
                <path d="M5 11.5v7a1 1 0 0 0 1 1h3v-5h6v5h3a1 1 0 0 0 1-1v-7"></path>
              </svg>
              <svg
                v-else-if="item.icon === 'chart'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 3v18h18"></path>
                <path d="M8 14v-6"></path>
                <path d="M12 18v-10"></path>
                <path d="M16 10v8"></path>
              </svg>
              <svg
                v-else-if="item.icon === 'inbox'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="3" width="18" height="14" rx="2"></rect>
                <path d="M3 13l4-6h10l4 6"></path>
              </svg>
              <svg
                v-else-if="item.icon === 'box'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M21 16V8a2 2 0 0 0-1-1.73L12 3 4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73L12 21l8-3.27A2 2 0 0 0 21 16z"
                ></path>
                <path d="M7.5 7.5l9 4"></path>
              </svg>
              <svg
                v-else-if="item.icon === 'receipt'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 6v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6"></path>
                <path d="M7 10h10M7 14h6"></path>
              </svg>
              <svg
                v-else-if="item.icon === 'users'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <svg
                v-else-if="item.icon === 'chat'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <svg
                v-else-if="item.icon === 'calendar'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3" y="4" width="18" height="18" rx="2"></rect>
                <path d="M16 2v4M8 2v4M3 10h18"></path>
              </svg>
              <svg
                v-else-if="item.icon === 'help'"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 2.5-3 4"></path>
                <path d="M12 17h.01"></path>
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 1v2"></path>
                <path d="M12 21v2"></path>
                <path d="M4.22 4.22l1.42 1.42"></path>
                <path d="M18.36 18.36l1.42 1.42"></path>
                <path d="M1 12h2"></path>
                <path d="M21 12h2"></path>
                <path d="M4.22 19.78l1.42-1.42"></path>
                <path d="M18.36 5.64l1.42-1.42"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </span>

            <span class="label">{{ item.label }}</span>
          </button>
        </li>
      </ul>
    </nav>

    <div class="footer">
      <small>v1.0</small>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
$sidebar-width: 220px;
$bg-1: #43425d;
$bg-2: #443b54;
$accent: #6d9cff;
$muted: #bdb7c6;
$active-bg: rgba(255, 255, 255, 0.04);
$active-bg-2: rgba(255, 255, 255, 0.02);
$text: #e7e4ee;

.sidebar {
  width: $sidebar-width;
  min-height: 100vh;
  background: linear-gradient(180deg, $bg-2 0%, $bg-1 100%);
  color: $text;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.02) inset;
  border-right: 1px solid rgba(255, 255, 255, 0.02);

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);

    .logo {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-title {
      font-weight: 700;
      letter-spacing: 2px;
      font-size: 12px;
      color: #fff;
      opacity: 0.95;
    }
  }

  .menu {
    padding-top: 8px;
    flex: 1;
    overflow: auto;

    ul {
      list-style: none;
      padding: 8px 0;
      margin: 0;

      li.item {
        margin: 2px 0px;
        position: relative;

        .item-btn {
          width: 100%;
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 10px 12px;
          background: transparent;
          border: none;
          color: inherit;
          text-align: left;
          cursor: pointer;
          justify-content: center;
          transition:
            background 0.12s ease,
            transform 0.05s ease;

          &:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(109, 156, 255, 0.12);
          }

          .icon {
            display: inline-flex;
            width: 24px;
            height: 24px;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.7);
          }

          .label {
            font-size: 13px;
            color: $muted;
            flex: 1;
          }
        }

        &:hover {
          .item-btn {
            background: $active-bg-2;
            .label {
              color: #fff;
            }
          }
        }

        &.active {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));

          .item-btn {
            .label {
              color: #fff;
              font-weight: 600;
            }
            .icon {
              color: $accent;
            }
          }

          &::before {
            content: '';
            position: absolute;
            left: 0px;
            top: 0;
            bottom: 0;
            width: 5px;
            background: linear-gradient(180deg, #6d9cff, #4ea1ff);

            box-shadow: 0 2px 6px rgba(109, 156, 255, 0.12);
          }
        }
      }
    }
  }

  .footer {
    padding: 12px 14px;
    border-top: 1px solid rgba(255, 255, 255, 0.02);
    text-align: center;
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
  }

  @media (max-width: 700px) {
    width: 72px;

    .brand-title {
      display: none;
    }
    .menu li.item .item-btn .label {
      display: none;
    }
  }
}
</style>
