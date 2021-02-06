<script>
  import Textfield from "@smui/textfield";
  // export let urlTemplate =
  //   "http://www.africau.edu/images/default/sample.pdf?[[パラメータ名1]]=[[パラメータ名1]]";
  export let urlTemplate = `https://www.fld.caa.go.jp/caaks/cssc06/youshiki5?yousiki5216File=A[[パラメータ名1]]%255CA[[パラメータ名1]]_youshiki5.pdf`;
</script>

<div class="wrapper">
  <Textfield
    fullwidth
    textarea
    bind:value={urlTemplate}
    label="URL"
    input$rows="1"
  />
</div>

<style lang="scss">
  .wrapper {
    margin: 10px 0;
  }
</style>
