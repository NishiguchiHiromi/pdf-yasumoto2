class Modal {
  modalId = "modal"
  contentWrapperId = "modal-content-wrapper"
  contentId = "modal-content"
  buttonAreaId = "modal-button-area"
  closeButtonId = "modal-close-button"

  html = `
    <div id="${this.modalId}">
      <div id="${this.contentWrapperId}">
        <div id="${this.contentId}">
        </div>
        <div id="${this.buttonAreaId}">
          <button id="${this.closeButtonId}">閉じる</button>
        </div>
      </div>
    </div>
  `
  style = `
    <style>
      #${this.modalId} {
        background: rgba(0, 0, 0, 0.5);
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        height: 100%;
        width: 100%;
        z-index: 999999999;
        display: none;
      }

      #${this.contentWrapperId} {
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

      #${this.contentId} {
        width: 100%;
        height: calc(100% - 30px);
        overflow: scroll;
        border: solid 1px gray;
      }

      #${this.buttonAreaId} {
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  `
  constructor({ $appendEl = $("body") } = {}) {
    console.log("モーダルインスタンス生成")
    this.$appendEl = $appendEl;
    this.init();
    this.addEventListners();
  }

  init() {
    console.log("モーダル初期化")
    this.$appendEl.append($(this.style));
    this.$elModal = $(this.html)
    this.$appendEl.append(this.$elModal);
  }

  addEventListners() {
    $(`#${this.closeButtonId}`).on("click", () => {
      this.close()
    })
  }

  open($elContent) {
    console.log("モーダルopen")
    this.append($elContent)
    this.$elModal.show();
  }

  append($el) {
    $(`#${this.contentId}`).append($el)
  }

  close() {
    console.log("モーダルclose")
    this.$elModal.hide();
    $(`#${this.contentId}`).empty();
  }
}