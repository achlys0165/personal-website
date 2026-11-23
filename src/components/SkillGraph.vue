<script setup lang="ts">
import { computed, ref } from "vue";
import { appliedSkills } from "../caseStudies";
const selected = ref(0);
const projectIds = [
  ["hymn"],
  ["studyhub"],
  ["jsp"],
  ["webctf-auto"],
  ["supporting-work"],
];
const targets = [
  { id: "hymn", label: "TOP Church", y: 14 },
  { id: "studyhub", label: "StudyHub", y: 32 },
  { id: "jsp", label: "JSP Engineering", y: 50 },
  { id: "webctf-auto", label: "WebCTF-Auto", y: 68 },
  { id: "supporting-work", label: "Ministry systems", y: 86 },
];
const links = computed(() =>
  appliedSkills.flatMap((skill, index) =>
    projectIds[index].map((id) => ({
      key: skill.tools + id,
      index,
      from: 14 + index * 18,
      to: targets.find((t) => t.id === id)!.y,
    })),
  ),
);
</script>
<template>
  <div class="skill-graph">
    <div class="skill-graph-head metadata">
      <span>Tools used</span><span>Project evidence</span>
    </div>
    <div class="graph-field">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        class="skill-wires"
        aria-hidden="true"
      >
        <path
          v-for="link in links"
          :key="link.key"
          :class="{ linked: link.index === selected }"
          :d="`M34,${link.from} C50,${link.from} 50,${link.to} 66,${link.to}`"
        />
      </svg>
      <div class="skill-tools">
        <button
          v-for="(skill, index) in appliedSkills"
          :key="skill.tools"
          type="button"
          :aria-pressed="selected === index"
          :class="{ selected: selected === index }"
          @click="selected = index"
        >
          {{ skill.tools }}
        </button>
      </div>
      <div class="skill-targets">
        <a
          v-for="target in targets"
          :key="target.id"
          :href="'#' + target.id"
          :class="{ selected: projectIds[selected].includes(target.id) }"
          >{{ target.label }}<span class="metadata">View evidence</span></a
        >
      </div>
    </div>
    <p class="skill-context" role="status">
      {{ appliedSkills[selected].context }}
    </p>
  </div>
</template>
