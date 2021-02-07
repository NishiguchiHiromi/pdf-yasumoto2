<script>
  import Button, { Label } from "@smui/button";
  export let isOpen;
  export let close;
</script>

{#if isOpen}
  <div class="background">
    <div class="wrapper">
      <div class="content">
        <slot name="content">モーダルコンテンツ</slot>
      </div>
      <div class="footer">
        <slot name="footer" closeModal={close}>
          <div class="button-wrapper">
            <Button color="secondary" on:click={close} variant="unelevated">
              <Label>閉じる</Label>
            </Button>
          </div>
        </slot>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .background {
    background: rgba(0, 0, 0, 0.5);
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    z-index: 999999999;
  }

  .wrapper {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 80%;
    height: 80%;
    margin: auto;
    padding: 10px;
    background: white;
    border-radius: 5px;
  }
  .content {
    height: 86%;
    overflow-y: scroll;
  }
  .footer {
    height: 15%;
    display: flex;
    justify-content: center;
    align-items: flex-end;
  }
  .button-wrapper {
    text-align: center;
  }
</style>
