<script>
  import Chip, { Icon, Text } from "@smui/chips";
  import Button, { Label } from "@smui/button";
  import MenuSurface from "@smui/menu-surface";
  import Textfield from "@smui/textfield";
  export let params = [{ id: 1, name: "パラメータ名1", from: 1, to: 2 }];

  function addParam() {
    params = [
      ...params,
      {
        id: new Date().getTime(),
        name: "パラメータ名new",
        from: 1,
        to: 2,
      },
    ];
  }
  function deleteParam(e, param) {
    e.stopPropagation();
    console.log(e, param);
    params = params.filter((p) => p.id !== param.id);
  }

  function selectParam({ id }) {
    params.find((p) => p.id === id).formSurface.setOpen(true);
  }
</script>

<div class="wrapper">
  <div class="chips">
    {#each params as param}
      <div class="chip-wrapper">
        <MenuSurface bind:this={param.formSurface} anchorCorner="BOTTOM_LEFT">
          <div
            style="width: 200px; margin: 1em; display: flex; flex-direction: column;"
          >
            <Textfield bind:value={param.name} label="パラメータ名" />
            <Textfield bind:value={param.from} label="From" type="number" />
            <Textfield bind:value={param.to} label="To" type="number" />
          </div>
        </MenuSurface>
        <Chip on:click={() => selectParam(param)}>
          <Text>{param.name}（{param.from}〜{param.to}）</Text>
          <Icon class="material-icons" on:click={(e) => deleteParam(e, param)}
            >cancel</Icon
          >
        </Chip>
      </div>
    {/each}
    <span class="button-wrapper">
      <Button on:click={addParam} variant="unelevated" color="secondary">
        <Label>追加</Label>
      </Button>
    </span>
  </div>
</div>

<style lang="scss">
  .wrapper {
    margin: 10px 0;
    .chips {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      .chip-wrapper {
        margin: 5px;
      }
    }
    .button-wrapper {
      margin-left: 15px;
    }
  }
</style>
