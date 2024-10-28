<template>
  <div>
    <div class="description">
      <button @click="toggleSpace">Open space</button>
    </div>

    <Space />
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { initializeFlatfile } from '@flatfile/vue'
import { workbook } from './config'
import { listener } from './listener'

const FLATFILE_PUBLISHABLE_KEY = 'your_key'

const publishableKey = FLATFILE_PUBLISHABLE_KEY
const spaceProps = ref({
  // apiUrl: 'https://platform.flatfile.com/api',
  name: 'Trste!',
  publishableKey,
  workbook,
  listener,
  document: {
    title: 'Instructions',
    body:
      '# Supported file types\n' +
      '---\n' +
      'Please only import CSV and Excel files',
    defaultPage: true,
  },

  themeConfig: { root: { primaryColor: '#546a76', textColor: '#fff' }},
  userInfo: {
    name: 'my space name',
  },
  spaceInfo: {
    name: 'my space name',
  },
  displayAsModal: true,
  spaceBody: {},
  sidebarConfig: {
    showSidebar: true,
  },
})

const { Space, OpenEmbed } = initializeFlatfile(spaceProps.value)

const toggleSpace = () => {
  OpenEmbed()
}
</script>
