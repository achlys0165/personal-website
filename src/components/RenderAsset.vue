<script setup lang="ts">
withDefaults(defineProps<{ name: string; alt?: string; hero?: boolean }>(), {
  alt: "",
  hero: false,
});
</script>
<template>
  <img
    class="render-asset"
    :src="'/art/' + name + (hero ? '-960.webp' : '-320.webp')"
    :srcset="
      hero
        ? '/art/' +
          name +
          '-640.webp 640w, /art/' +
          name +
          '-960.webp 960w, /art/' +
          name +
          '-1280.webp 1280w'
        : '/art/' +
          name +
          '-160.webp 160w, /art/' +
          name +
          '-320.webp 320w, /art/' +
          name +
          '-640.webp 640w'
    "
    :sizes="
      hero
        ? '(max-width: 700px) 90vw, (max-width: 1000px) 70vw, 540px'
        : '(max-width: 700px) 160px, 220px'
    "
    :width="hero ? 1280 : 640"
    :height="hero ? 1280 : 640"
    :alt="alt"
    :loading="hero ? 'eager' : 'lazy'"
    :fetchpriority="hero ? 'high' : 'auto'"
    decoding="async"
  />
</template>
<style>
.render-asset {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
}
</style>
