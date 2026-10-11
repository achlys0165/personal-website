<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

interface Turnstile {
  ready(callback: () => void): void;
  render(element: HTMLElement, options: Record<string, unknown>): string;
  reset(id: string): void;
  remove(id: string): void;
}
const props = defineProps<{ siteKey: string }>();
const emit = defineEmits<{ token: [value: string] }>();
const container = ref<HTMLDivElement | null>(null);
const error = ref('');
let widgetId: string | undefined;
let disposed = false;
const client = () => (window as Window & { turnstile?: Turnstile }).turnstile;

async function load() {
  error.value = '';
  try {
    await new Promise<void>((resolve, reject) => {
      if (client()) { client()!.ready(resolve); return; }
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      const timer = setTimeout(() => { script.remove(); reject(new Error('Timeout')); }, 15_000);
      script.onload = () => { clearTimeout(timer); client() ? client()!.ready(resolve) : reject(new Error('Unavailable')); };
      script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('Unavailable')); };
      document.head.appendChild(script);
    });
    if (disposed || !container.value) return;
    widgetId = client()!.render(container.value, {
      sitekey: props.siteKey,
      action: 'contact',
      theme: 'dark',
      size: container.value.clientWidth < 300 ? 'compact' : 'flexible',
      callback: (token: string) => { error.value = ''; emit('token', token); },
      'expired-callback': () => { emit('token', ''); reset(); },
      'error-callback': () => { emit('token', ''); error.value = 'The security check could not load. Please retry or use the email link.'; return true; },
      'timeout-callback': () => { emit('token', ''); error.value = 'The security check timed out. Please retry.'; },
    });
  } catch {
    if (!disposed) error.value = 'The security check could not load. Please retry or use the email link.';
  }
}

function reset() {
  emit('token', '');
  error.value = '';
  if (widgetId !== undefined) client()?.reset(widgetId);
}
function retry() {
  if (widgetId !== undefined) reset();
  else void load();
}
defineExpose({ reset });
onMounted(load);
onBeforeUnmount(() => { disposed = true; if (widgetId !== undefined) client()?.remove(widgetId); });
</script>

<template>
  <div class="contact-security">
    <div ref="container" aria-label="Cloudflare security check"></div>
    <p v-if="error" class="contact-note contact-status-error" role="alert">{{ error }} <button type="button" class="security-retry" @click="retry">Retry security check</button></p>
  </div>
</template>
