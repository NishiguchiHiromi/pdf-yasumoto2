<script>
  import Button, { Label } from "@smui/button";
  export let logout;
</script>

<div>
  <Button color="secondary" on:click={logout} variant="unelevated">
    <Label>ログアウト</Label>
  </Button>
</div>

<style>
  div {
    text-align: right;
  }
</style>
