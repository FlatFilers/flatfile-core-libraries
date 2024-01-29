<template>
  <div
    data-testid="close-confirm-modal"
    className="flatfile_outer-shell"
  >
    <div className="flatfile_inner-shell">
      <div className="flatfile_modal">
        <div className="flatfile_modal-heading">
          {{exitTitle}}
        </div>
        <div className="flatfile_modal-text">{{exitText}}</div>
        <div className="flatfile_button-group">
          <button
            className="flatfile_button flatfile_secondary"
            @click="onCancel"
          ><div>{{ exitSecondaryButtonText }}</div></button>
          <button
            className="flatfile_button flatfile_primary"
            @click="onConfirm"
          ><div>{{ exitPrimaryButtonText }}</div></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    onConfirm: Function,
    onCancel: Function,
    exitText: {
      type: String,
      default: 'Are you sure you want to exit? Any unsaved changes will be lost.',
    },
    exitTitle: {
      type: String,
      default: 'Close Window',
    },
    exitPrimaryButtonText: {
      type: String,
      default: 'Yes, exit',
    },
    exitSecondaryButtonText: {
      type: String,
      default: 'No, stay',
    },
  },
};
</script>

<style lang="scss">
.flatfile_outer-shell {
  background-color: var(--ff-bg-fade);
  border-radius: var(--ff-border-radius);
  top: 0;
  left: 0;
  width: calc(100% - 40px);
  height: calc(100vh - 40px);
  padding: 20px;
  display: block;
  overflow-y: auto;
  position: fixed;
  tab-size: 4;
  z-index: 1200;
}
.flatfile_inner-shell {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 0px;
  tab-size: 4;
  text-align: left;
}
.flatfile_modal {
  box-sizing: border-box;
  display: block;
  padding: 1.5em;
  tab-size: 4;
  text-align: left;
  background: #fff;
  min-width: 500px;
  max-width: 500px;
  border-radius: var(--ff-dialog-border-radius);
}
.flatfile_modal-heading {
  font-size: 1.225em;
  font-weight: 600;
  margin-bottom: 0.4em;
  color: var(--ff-text-color);
}
.flatfile_modal-text {
  font-size: 14px;
  line-height: 1.25em;
  margin-bottom: 2em;
  color: var(--ff-secondary-color);
}
.flatfile_button-group {
  display: flex;
  justify-content: flex-end;
}
.flatfile_button {
  border: 0;
  border-radius: 1px;
  border-radius: 1px;
  margin-left: 15px;
  padding: 8px 12px;
  cursor: pointer;
}
.flatfile_primary {
  border: 1px solid var(--ff-primary-color);
  background-color: var(--ff-primary-color);
  color: #fff;
}
.flatfile_secondary {
  color: var(--ff-secondary-color);
}

</style>