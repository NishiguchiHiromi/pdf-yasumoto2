<script>
	import Authorize from "./Authorize.svelte";
	import LoggedInArea from "./LoggedInArea.svelte";
	import LoggedOutArea from "./LoggedOutArea.svelte";
</script>

<main>
	<Authorize let:login let:logout>
		<div slot="logged-out-area">
			<LoggedOutArea {login} />
		</div>
		<div slot="logged-in-area">
			<LoggedInArea {logout} />
		</div>
	</Authorize>
</main>
