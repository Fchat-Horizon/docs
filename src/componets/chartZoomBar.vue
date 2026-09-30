<script setup lang="ts">
  defineProps<{ zoomed: boolean }>();
  defineEmits<{ reset: [] }>();
</script>

<template>
  <div class="zoom-bar">
    <span class="hint">
      Drag to zoom · Shift+drag to pan · Pinch on touch screens
    </span>
    <button
      v-if="zoomed"
      class="reset"
      @click="$emit('reset')"
    >
      Reset zoom
    </button>
  </div>
</template>

<style scoped>
  .zoom-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    align-items: center;
    justify-content: space-between;
    min-height: 30px;
    margin-top: 8px;
    font-size: 13px;
  }

  .hint {
    color: var(--vp-c-text-3);
  }

  .reset {
    padding: 2px 10px;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
    color: var(--vp-c-text-2);
  }

  .reset:hover {
    background: var(--vp-c-default-soft);
  }
</style>
