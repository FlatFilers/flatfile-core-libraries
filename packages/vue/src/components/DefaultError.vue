<template>
  <div class="ff_error_container">
    <h3 class="ff_error_heading">Something went wrong</h3>
    <p class="ff_error_text">{{ errorMessage }}</p>
  </div>
</template>

<script>
export default {
  props: {
    error: {
      type: [String, Error],
      required: true,
    },
  },
  computed: {
    errorMessage() {
      return typeof this.error === 'string' ? this.error : this.error.message;
    },
  },
};
</script>

<style lang="scss">
.ff_error_container {
  display: flex;
  flex-direction: column;
  margin: 16px;
}

.ff_error_heading {
  display: flex;
  margin-bottom: 0;
}
</style>