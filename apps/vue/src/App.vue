<script lang="jsx">
import { ref, onMounted, h, defineComponent } from 'vue'
import { initializeFlatfile } from '@flatfile/vue'
import { workbook } from './config'
import { listener } from './listener'

export default defineComponent({
  setup() {
    const publishableKey = 'your_key'
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

      themeConfig: { primaryColor: '#546a76', textColor: '#fff' },
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

    return {
      toggleSpace,
      Space,
    }
  },
  render(props, ctx) {
    const Space = props.Space

    return (
      <div>
        <div class="description">
          <button onClick={props.toggleSpace}>Open space</button>
        </div>

        <Space />
      </div>
    )
  },
})
</script>
