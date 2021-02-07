<script>
  import Button, { Label } from "@smui/button";
  import ParamsSetting from "./ParamsSetting.svelte";
  import UrlSetting from "./UrlSetting.svelte";
  import DirectorySetting from "./DirectorySetting.svelte";
  import Header from "./Header.svelte";
  import Modal from "./Modal.svelte";
  import Status from "./Status.svelte";
  import FilenameSetting from "./FilenameSetting.svelte";

  export let logout;
  let params;
  let urlTemplate;
  let filenameTemplate;
  let fileSaveDirectoryId;
  let isModalOpen = false;
  let info = [];

  function start() {
    info = createInfo();
    openModal();
  }

  function openModal() {
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  function createInfo() {
    const allPatterns = params.reduce(
      (patterns, { name, to, from }) => {
        const range = [...Array(to).keys()]
          .map((i) => ++i)
          .filter((n) => n >= from);
        return patterns.flatMap((p) => {
          return range.map((number) => ({ ...p, [name]: number }));
        });
      },
      [undefined]
    );
    return allPatterns.map((p, id) => {
      let url = urlTemplate;
      let filename = filenameTemplate;
      Object.entries(p).forEach(([name, value]) => {
        const reg = new RegExp(`\\[\\[${name}\\]\\]`, "g");
        url = url.replace(reg, value);
        filename = filename.replace(reg, value);
      });
      return { id, url, filename };
    });
  }
</script>

<div class="main">
  <div class="margin-top">
    <Header {logout} />
  </div>
  <div class="margin-top">
    <ParamsSetting bind:params />
  </div>
  <div class="margin-top">
    <UrlSetting bind:urlTemplate />
  </div>
  <div class="margin-top">
    <FilenameSetting bind:filenameTemplate class="margin-top" />
  </div>
  <div class="margin-top">
    <DirectorySetting bind:fileSaveDirectoryId class="margin-top" />
  </div>
  <div class="start-button-wrapper">
    <Button on:click={start} variant="unelevated"><Label>開始</Label></Button>
  </div>
</div>
<Modal isOpen={isModalOpen} open={openModal} close={closeModal} let:closeModal>
  <div slot="content">
    <Status {info} directoryId={fileSaveDirectoryId} />
  </div>
</Modal>

<style lang="scss">
  .main {
    width: 90%;
    margin: 0 auto;

    .margin-top {
      margin-top: 20px;
    }

    .start-button-wrapper {
      margin-top: 30px;
      text-align: center;
    }
  }
</style>
