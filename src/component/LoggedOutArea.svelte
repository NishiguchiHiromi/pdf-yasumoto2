<script>
  import Button, { Label } from "@smui/button";
  export let login;
</script>

<div>
  <Button on:click={login} variant="unelevated">
    <Label>ログイン</Label>
  </Button>
</div>

<style>
  div {
    text-align: right;
  }
</style>
