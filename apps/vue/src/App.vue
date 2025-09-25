<script lang="jsx">
import { ref, onMounted, h, defineComponent } from 'vue'
import { initializeFlatfile } from '@flatfile/vue'
import { workbook } from './config'
import { listener } from './listener'

const FLATFILE_PUBLISHABLE_KEY = 'your_key'

export default defineComponent({
  setup() {
    const publishableKey = FLATFILE_PUBLISHABLE_KEY
    
    // Define themeConfig
    const themeConfig = {
      root: {
        primaryColor: "#3ccc65",
        backgroundColor: "#ffffff", 
        textColor: "#1f2937",
        borderRadius: "8px",
      },
      sidebar: {
        logo: "https://images.ctfassets.net/hjneo4qi4goj/gL6Blz3kTPdZXWknuIDVx/7bb7c73d93b111ed542d2ed426b42fd5/flatfile.svg",
        backgroundColor: "#3ccc65",
        textColor: "#1f2937",
        width: "280px",
        padding: "24px",
      }
    }
    
    const spaceProps = ref({
      // apiUrl: 'https://platform.flatfile.com/api',
      name: 'Trste!',
      publishableKey,
      workbook,
      listener,
      externalActorId: 'test-1',
      themeConfig,
      document: {
        title: 'Instructions',
        body:
          '# Supported file types\n' +
          '---\n' +
          'Please only import CSV and Excel files',
        defaultPage: true,
      },
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
