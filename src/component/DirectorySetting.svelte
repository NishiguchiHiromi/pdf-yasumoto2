<script>
  import { onMount } from "svelte";
  import { Drive } from "../service/Drive";
  import Select, { Option } from "@smui/select";
  import Button from "@smui/button";
  import MenuSurface from "@smui/menu-surface";
  import Textfield from "@smui/textfield";
  import DirectoryTree from "./DirectoryTree.svelte";
  import { tick } from "svelte";

  export let fileSaveDirectoryId;
  let directories = [];
  let directory_ids = [];
  let tree;
  let newDirectoryName = "";
  let directoryCreateDirectoryId;
  let formSurface;

  onMount(async () => {
    getDirectories();
  });

  async function getDirectories() {
    directories = await Drive.getFolders();
    directory_ids = [];
    await tick();
    directory_ids = directories.map((d) => d.id);
    tree = createTree();
    fileSaveDirectoryId = directories[0].id;
    directoryCreateDirectoryId = directories[0].id;
  }

  function createTree() {
    return directories
      .filter((d) => !d.parents?.length)
      .map((dir) => setChildren(dir));
  }

  function setChildren(parent) {
    const children = directories.filter((d) => d.parents?.[0] === parent.id);
    if (children.length) {
      children.forEach((dir) => setChildren(dir));
      parent.children = children;
    }
    return parent;
  }

  async function createDirectory() {
    formSurface.setOpen(false);
    const newDir = await Drive.createFolder({
      folderName: newDirectoryName,
      parentId: directoryCreateDirectoryId,
    });
    await getDirectories();
    fileSaveDirectoryId = newDir.id;
    directoryCreateDirectoryId = newDir.id;
    newDirectoryName = "";
  }
</script>

<div>
  <div class="wrapper">
    {#if directory_ids.length}
      <Select bind:value={fileSaveDirectoryId} label="保存先">
        {#each directory_ids as id}
          <Option value={id}>
            {directories.find((d) => d.id === id).name}
          </Option>
        {/each}
      </Select>
    {/if}
    <div class="create-directory-button">
      <MenuSurface bind:this={formSurface} anchorCorner="BOTTOM_LEFT">
        <div
          style="width: 200px; margin: 1em; display: flex; flex-direction: column;"
        >
          <div>
            {#if directory_ids.length}
              <Select bind:value={directoryCreateDirectoryId} label="作成先">
                {#each directory_ids as id}
                  <Option value={id}>
                    {directories.find((d) => d.id === id).name}
                    <!-- {directories.find((d) => d.id === id).name} -->
                  </Option>
                {/each}
              </Select>
            {/if}
            <Textfield bind:value={newDirectoryName} label="ディレクトリ名" />
            <p style="text-align: right;">
              <Button style="margin-top: 1em;" on:click={createDirectory}
                >作成</Button
              >
            </p>
          </div>
        </div>
      </MenuSurface>
      <Button on:click={() => formSurface.setOpen(true)}>
        ディレクトリを追加
      </Button>
    </div>
  </div>
  <div class="margin-top">
    <DirectoryTree {tree} />
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    align-items: flex-end;

    .create-directory-button {
      margin-left: 20px;
    }
  }
  .margin-top {
    margin-top: 20px;
  }
</style>
