<script>
  import { init, login, logout } from "../service/gapiAuth";
  import { onMount } from "svelte";

  let loggedIn;

  onMount(async () => {
    init((isSignedIn) => (loggedIn = isSignedIn));
  });
</script>

{#if loggedIn}
  <slot name="logged-in-area" {logout}>ログインエリア</slot>
{:else}
  <slot name="logged-out-area" {login}>ログアウトエリア</slot>
{/if}
