
<script lang="jsx">
import { ref, onMounted, h, defineComponent } from 'vue';
import { initializeFlatfile } from '@flatfile/vue';
import { workbook } from "./config";
import { listener } from './listener'

const SPACE_ID = 'us_sp_12314';
const ENVIRONMENT_ID = 'us_env_1234';

export default defineComponent({
  setup() {
    const showSpace = ref(false);
    const publishableKey = 'your_key';
    const environmentId = ENVIRONMENT_ID;
    const spaceProps = ref({
      name: 'Trste!',
      environmentId,
      publishableKey,
      closeSpace: {
        operation: 'submitActionFg',
        onClose: () => showSpace.value = false,
      },
      workbook,
      listener,
      themeConfig: { primaryColor: "#546a76", textColor: "#fff" },
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

    return {
      toggleSpace,
      showSpace,
      Space
    }
  },
  render(props, ctx) {
    const Space = props.Space

    return (
      <div>
        <div class="description">
          <button onClick={props.toggleSpace}>{ props.showSpace ? 'Close' : 'Open' } space</button>
        </div>

        {props.showSpace && <div class="space-wrapper">
          <Space />
        </div>}
      </div>
    )
  },
});
</script>