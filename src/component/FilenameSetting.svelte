<script>
  import Textfield from "@smui/textfield";
  export let filenameTemplate = "filename_[[パラメータ名1]].pdf";
</script>

<div class="wrapper">
  <Textfield
    fullwidth
    textarea
    bind:value={filenameTemplate}
    label="ファイル名"
    input$rows="1"
  />
</div>

<style lang="scss">
  .wrapper {
    margin: 10px 0;
  }
</style>
