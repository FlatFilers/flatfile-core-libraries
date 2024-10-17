<template>

  <div>
    <div class="description">
      <button @click="toggleSpace()">{{ showSpace ? 'Close' : 'Open' }} space</button>
    </div>

    <div class="space-wrapper" v-if="showSpace">
      <Space />
    </div>
  </div>

</template>


<script setup lang="ts">
import { ref } from 'vue';
import { initializeFlatfile } from '@flatfile/vue';


const SPACE_ID = 'us_sp_12314';
const ENVIRONMENT_ID = 'us_env_1234';
const sheet = {
  name: 'Contacts',
  slug: 'contacts',
  fields: [
    {
      key: 'firstName',
      type: 'string',
      label: 'First Name',
    },
    {
      key: 'lastName',
      type: 'string',
      label: 'Last Name',
    },
    {
      key: 'email',
      type: 'string',
      label: 'Email',
    },
  ],
}

const showSpace = ref(false);
const publishableKey = 'sk_1234';
const environmentId = ENVIRONMENT_ID;
const spaceProps = ref({
  name: 'Trste!',
  environmentId,
  publishableKey,
  sheet,
  onSubmit: async ({ job, sheet }: { job: any, sheet: any }) => {
    const data = await sheet.allData()
    console.log('onSubmit', data)
  },
  onRecordHook: (record: any, event: any) => {
    const firstName = record.get('firstName')
    const lastName = record.get('lastName')
    if (firstName && !lastName) {
      record.set('lastName', 'Rock')
      record.addInfo('lastName', 'Welcome to the Rock fam')
    }
    return record
  },
  closeSpace: {
    operation: 'submitActionFg',
    onClose: () => { showSpace.value = false; },
  },
  themeConfig: { root: { primaryColor: "#546a76", textColor: "#fff" } },
  userInfo: {
    name: 'my space name'
  },
  spaceInfo: {
    name: 'my space name'
  },
  displayAsModal: true,
  spaceBody: {
    metadata: {
      random: 'param'
    }
  }
});

const { Space, OpenEmbed } = initializeFlatfile(spaceProps.value);

const toggleSpace = () => {
  showSpace.value = !showSpace.value;
  OpenEmbed()
};
</script>