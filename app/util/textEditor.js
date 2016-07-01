export default class TextEditor {
  constructor(component) {
    this.component = component;
    this.cursor = 0;
    this.cursor1 = null;
    this.cursor2 = null;
    this.showCursor = false;
  }

  toggleCursor() {
    this.showCursor = !this.showCursor;
  }

  setFromInput(selectionStart, selectionEnd) {
    if (selectionStart === selectionEnd) {
      this.cursor = selectionStart;
      this.cursor1 = null;
      this.cursor2 = null;
    } else {
      this.cursor = null;
      this.cursor1 = selectionStart + 1;
      this.cursor2 = selectionEnd + 1;
    }
  }

  setSelection(idx1, idx2, txt) {
    this.cursor1 = idx1;
    this.cursor2 = idx2;

    txt.setSelectionRange(idx1, idx2 - 1);
  }

  setCursor(idx, txt) {
    this.cursor = idx || this.cursor;
    this.cursor1 = null;
    this.cursor2 = null;

    txt.setSelectionRange(this.cursor, this.cursor);
  }
}
