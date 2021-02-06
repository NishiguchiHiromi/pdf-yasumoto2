<script>
  import { onMount, tick } from "svelte";
  import { FileDownloader } from "../service/FileDownloader";
  import { FileScraper } from "../service/FileScraper";
  import { CsvUploader } from "../service/file_uploader/CsvUploader";
  import { PdfUploader } from "../service/file_uploader/PdfUploader";
  import { Util } from "../service/Util";
  import LinearProgress from "@smui/linear-progress";
  import DataTable, { Head, Body, Row, Cell } from "@smui/data-table";
  import Button, { Label } from "@smui/button";
  import Snackbar from "@smui/snackbar";
  // import MyWorker from "web-worker:../worker";

  const STATUS = Object.freeze({
    notYet: 1,
    fetching: 2,
    converting: 3,
    uploading: 4,
    finish: 5,
    failed: 9,
  });
  const STATUS_TEXT = Object.freeze({
    [STATUS.notYet]: "開始前",
    [STATUS.fetching]: "pdf取得中",
    [STATUS.converting]: "pdf変換中",
    [STATUS.uploading]: "pdfアップロード中",
    [STATUS.finish]: "完了",
    [STATUS.failed]: "失敗",
  });

  export let directoryId;
  export let info = [];
  $: successCount = info.filter(({ status }) => status === STATUS.finish)
    .length;
  $: failureCount = info.filter(({ status }) => status === STATUS.failed)
    .length;
  $: allCount = info.length;

  let resultFile;
  let stoped = false;
  let finished = false;
  let finishSnackbar;
  let stopedSnackbar;

  onMount(() => {
    initializeInfo();
    start();
    console.log("start finish");
  });

  function initializeInfo() {
    info = info.map((data) => ({
      ...data,
      status: STATUS.notYet,
    }));
  }

  function setInfo({ id, ...properties }) {
    info = info.map((i) => {
      if (i.id != id) return i;
      return { ...i, ...properties };
    });
  }

  // function worker() {
  //   console.log("worker");
  //   // var worker = MyWorker();
  //   const worker = new Worker("build/worker.js");
  //   const listners = {
  //     progress: ({ type, ...info }) => {
  //       setInfo(info);
  //     },
  //     finish: () => {
  //       uploadResultCsv();
  //       finished = true;
  //       if (!stoped) finishSnackbar.open();
  //     },
  //   };
  //   //処理結果、受信イベント
  //   worker.addEventListener(
  //     "message",
  //     function (e) {
  //       console.log(e.data);
  //       listners[e.data.type](e.data);
  //     },
  //     false
  //   );
  //   worker.postMessage({ type: "start", info });
  // }

  async function start() {
    stoped = false;
    for (var fileInfo of info) {
      try {
        if (stoped) break;

        const scraper = new FileScraper({ url: fileInfo.url });
        await scraper.fetch();

        // ファイル変換
        setInfo({ id: fileInfo.id, status: STATUS.converting });
        const blob = await scraper.getBlob();

        // ファイルアップロード
        setInfo({ id: fileInfo.id, status: STATUS.uploading });
        const uploader = new PdfUploader({
          blob,
          directoryId,
          filename: fileInfo.filename,
        });
        const file = await uploader.upload();

        // 完了
        setInfo({
          id: fileInfo.id,
          status: STATUS.finish,
          fileId: file.id,
          fileData: file,
        });
      } catch (e) {
        setInfo({ id: fileInfo.id, status: STATUS.failed, error: e });
      }

      // 1秒待機
      await Util.sleep(1000);
    }

    // 結果情報CSVをアップロード
    uploadResultCsv();
    finished = true;
    if (!stoped) finishSnackbar.open();
  }

  async function uploadResultCsv() {
    const blob = createResultCsvBlob();
    const filename = `${Util.getNowNumber()}_result.csv`;
    const uploader = new CsvUploader({
      blob,
      directoryId,
      filename,
    });
    resultFile = await uploader.upload();
  }

  function createResultCsvBlob() {
    const data = [];
    // summary
    data.push([
      "成功",
      "失敗",
      "全件数",
      "URL",
      "結果",
      "ファイル名",
      "エラー",
    ]);
    data.push([successCount, failureCount, allCount]);
    // detail
    info.forEach(({ url, status, filename, error }) => {
      if (error) {
        error = JSON.stringify(
          error,
          Object.getOwnPropertyNames(error)
        ).replace(/,/g, "，");
      }
      data.push([null, null, null, url, STATUS_TEXT[status], filename, error]);
    });
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const csv_data = data
      .map((l) => {
        return l.join(",");
      })
      .join("\r\n");
    return new Blob([bom, csv_data], { type: "text/csv" });
  }

  function exit() {
    // stoped = true;
    worker.postMessage({ type: "stop" });
    stopedSnackbar.open();
  }

  async function downloadFile({ fileId, filename }) {
    const downloader = new FileDownloader({ fileId, filename });
    await downloader.download();
  }
</script>

<div>
  <!-- <button on:click={worker}>worker</button> -->
  <div class="header">
    {#if !finished}
      <Button on:click={exit} variant="unelevated"><Label>中断</Label></Button>
    {/if}
    {#if resultFile}
      <Button
        color="secondary"
        on:click={() =>
          downloadFile({ fileId: resultFile.id, filename: resultFile.name })}
        variant="unelevated"><Label>実行結果CSVをダウンロード</Label></Button
      >
    {/if}
  </div>
  <p>
    <LinearProgress progress={(successCount + failureCount) / allCount} />
  </p>
  <p>
    <span>成功：{successCount}</span>
    <span>失敗：{failureCount}</span>
    <span>全件数：{allCount}</span>
  </p>
  <DataTable style="width: 100%;">
    <Head>
      <Row>
        <Cell style="width: 40%;">ファイル名</Cell>
        <Cell style="width: 30%;">ステータス</Cell>
        <Cell style="width: 30%;" />
      </Row>
    </Head>
    <Body>
      {#each info.filter(({ status }) => status != STATUS.notYet) as fileInfo}
        <Row>
          <Cell>{fileInfo.filename}</Cell>
          <Cell style="text-align: center;">
            {STATUS_TEXT[fileInfo.status]}
          </Cell>
          <Cell>
            {#if fileInfo.status === STATUS.finish}
              <Button
                on:click={() => window.open(fileInfo.fileData.webViewLink)}
                variant="unelevated"><Label>閲覧</Label></Button
              >
              <Button
                on:click={() => downloadFile(fileInfo)}
                variant="unelevated"><Label>ダウンロード</Label></Button
              >
            {/if}
          </Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>
  <Snackbar bind:this={finishSnackbar}>
    <Label>完了しました</Label>
  </Snackbar>
  <Snackbar bind:this={stopedSnackbar}>
    <Label>中断しました</Label>
  </Snackbar>
</div>

<style lang="scss">
  .header {
    height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-end;
  }
</style>
