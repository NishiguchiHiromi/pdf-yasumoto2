<script>
  import Button, { Label } from "@smui/button";
  export let login;
</script>

<div class="main">
  <Button on:click={login} variant="unelevated">
    <Label>ログイン</Label>
  </Button>
</div>

<style lang="scss">
  .main {
    width: 90%;
    margin: 0 auto;
    text-align: right;
    margin-top: 20px;
  }
</style>
