<script>
  export let tree = [];
  $: {
    console.log("tree", tree);
  }
  function toggleExpansion({ id }) {
    tree = tree.map((dir) => {
      if (dir.id === id) {
        dir.expanded = !dir.expanded;
      }
      return dir;
    });
  }
</script>

<div>
  {#each tree as dir}
    <div>
      {#if dir.children?.length}
        <span
          on:click|stopPropagation={() => toggleExpansion(dir)}
          class="parent"
        >
          <span class="arrow" class:arrowDown={dir.expanded}>&#x25b6</span>
          <span>{dir.name}</span>
        </span>
        {#if dir.expanded}
          <div class="children">
            <svelte:self tree={dir.children} />
          </div>
        {/if}
      {:else}
        <span class="arrow" />
        <span>{dir.name}</span>
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  .parent {
    cursor: pointer;
    .arrowDown {
      transform: rotate(90deg);
    }
  }
  .arrow {
    display: inline-block;
    width: 15px;
  }
  .children {
    padding-left: 30px;
  }
</style>
