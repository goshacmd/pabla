export default class TextEditor {
  constructor() {
    this.start = 0;
    this.end = 0;
  }

  setFromInput(selectionStart, selectionEnd) {
    this.start = selectionStart;
    this.end = selectionEnd;
  }

  setSelection(idx1, idx2, txt) {
    this.start = idx1;
    this.end = idx2;

    txt.setSelectionRange(idx1, idx2);
  }

  setCursor(idx, txt) {
    this.start = idx || 0;
    this.end = idx || 0;

    txt.setSelectionRange(this.start, this.end);
  }
}
