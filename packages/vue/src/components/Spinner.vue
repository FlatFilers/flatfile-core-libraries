<template>
  <div>
    <div class="ff_spinner" data-testid="spinner-icon" />
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SpinnerC',
});
</script>

<style scoped>
@import "@css/main.css";

.ff_spinner {
  border: 4px solid rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
  border-top: 4px solid var(--ff-primary-color);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
