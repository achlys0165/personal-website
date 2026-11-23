<script setup lang="ts">
import { ref } from "vue";
import { acceptsFlag } from "../visualState";
const answer = ref("");
const solved = ref(false);
const message = ref("");
function check() {
  solved.value = acceptsFlag(answer.value);
  message.value = solved.value
    ? "Flag accepted. Evidence connected."
    : "That is not the flag. Inspect the evidence board in the page source.";
}
</script>
<template>
  <details class="flag-hunt">
    <summary>For the CTF crowd: a small challenge</summary>
    <div class="flag-content">
      <p>
        One flag is tucked into this page’s HTML. Follow the evidence, inspect
        the source, and submit what you find.
      </p>
      <form @submit.prevent="check">
        <label for="flag-answer">Found the flag?</label>
        <div class="flag-input-row">
          <input
            id="flag-answer"
            v-model="answer"
            placeholder="FLAG{…}"
            maxlength="80"
            spellcheck="false"
            autocomplete="off"
            required
          /><button class="button" type="submit">Submit flag</button>
        </div>
      </form>
      <p class="flag-status" role="status">{{ message }}</p>
      <div v-if="solved" class="flag-reward">
        <svg
          width="48"
          height="48"
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          aria-hidden="true"
        >
          <path d="M8 29V4c6-4 10 4 17 0v14c-7 4-11-4-17 0" />
        </svg>
        <div>
          <span class="metadata">Challenge complete</span>
          <h4>Evidence connected.</h4>
          <p>You found the portfolio flag. Thanks for taking a closer look.</p>
        </div>
      </div>
    </div>
  </details>
</template>
