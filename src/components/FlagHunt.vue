<script setup lang="ts">
import { ref } from "vue";
import { acceptsFlag } from "../visualState";
import RenderAsset from "./RenderAsset.vue";
const answer = ref("");
const solved = ref(false);
const message = ref("");
function check() {
  solved.value = acceptsFlag(answer.value);
  message.value = solved.value
    ? "Flag accepted. Evidence connected."
    : "That is not the flag. Explore the shield or inspect the page source.";
}
</script>
<template>
  <details class="flag-hunt">
    <summary>For the CTF crowd: a small challenge</summary>
    <div class="flag-content">
      <p>
        A flag is tucked into this page’s HTML. Explore the shield, inspect the
        source, and submit what you find.
      </p>
      <form @submit.prevent="check">
        <label for="flag-answer">Found the flag?</label>
        <div class="flag-input-row">
          <input
            id="flag-answer"
            v-model="answer"
            placeholder="flag{…}"
            maxlength="80"
            spellcheck="false"
            autocomplete="off"
            required
          /><button class="button" type="submit">Submit flag</button>
        </div>
      </form>
      <p class="flag-status" role="status">{{ message }}</p>
      <div v-if="solved" class="flag-reward">
        <RenderAsset name="ctf-flag" />
        <div>
          <span class="metadata">Challenge complete</span>
          <h4>Evidence connected.</h4>
          <p>You found the portfolio flag. Thanks for taking a closer look.</p>
          <a href="#contact">Let’s talk ↗</a>
        </div>
      </div>
    </div>
  </details>
</template>
