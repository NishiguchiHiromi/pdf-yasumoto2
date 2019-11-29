class DB {
  param_arr = []
  selected_param_array = []
  url_param_count = 1

  get newNum() {
    return this.param_arr.map(info => info.num).reduce((a, b) => Math.max(a, b), 0) + 1
  }

  addParam() {
    const num = this.newNum;
    const newInfo = { num: num, name: `パラメータ${num}`, show: true }
    this.param_arr.push(newInfo)
    return newInfo;
  }

  getParam(num) {
    return this.param_arr.find(info => info.num == num)
  }

  get visibleParams() {
    return this.param_arr.filter(info => info.show)
  }

  deleteParam(num) {
    this.getParam(num).show = false;
  }

  addUrlParam() {
    this.url_param_count++
  }

  deleteUrlParam() {
    if (this.url_param_count > 0) {
      this.url_param_count--
    }
  }

  get urlParamCount() {
    return this.url_param_count
  }

  getParamValueArr(nums) {
    this.setParamValue(nums);
    return this.selected_param_array
  }

  // --------

  setParamValue(nums) {
    this.selected_param_array = []
    this.param_arr.forEach(info => {
      const num = info.num;
      const from = Number($(`#param${num}_from`).val());
      const to = Number($(`#param${num}_to`).val());
      const range = [...Array(to).keys()].map(i => ++i).filter(n => n >= from);
      this.getParam(num).range = range;
    })
    this.setParamValueArr(nums)
  }

  setParamValueArr(nums) {
    const valueArr = nums.map(num => this.getParam(num))
    this.loop(valueArr)
  }

  loop(values, num = 0, result = {}) {
    const current = values[num]
    if (current) {
      current.range.forEach(val => {
        const newObj = { ...result }
        newObj[current.num] = val
        this.loop(values, num + 1, newObj)
      })
    } else {
      this.selected_param_array.push(result);
    }
  }
}