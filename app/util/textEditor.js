export default class TextEditor {
  constructor(component) {
    this.component = component;
    this.cursor = 0;
    this.cursor1 = null;
    this.cursor2 = null;
    this.showCursor = false;
  }

  getText() {
    return this.component.props.text;
  }

  toggleCursor() {
    this.showCursor = !this.showCursor;
  }

  moveCursor(dir, shift) {
    // TODO: implement shift-selection
    shift = false;

    if (shift && !this.cursor1 && !this.cursor2) {
      this.cursor1 = this.cursor2 = this.cursor;
    }

    if (!shift) {
      this.cursor1 = this.cursor2 = null;
    }

    if (dir === 'left') {
      this.cursor = this.cursor - 1;
      if (shift) {
        this.cursor2 = this.cursor;
      }
    } else if (dir === 'right') {
      this.cursor = this.cursor + 1;
      if (shift) {
        this.cursor2 = this.cursor;
      }
    } else {
      return;
    }
  }

  insertOrDeleteChar(char) {
    const currText = this.getText();
    let newText;
    if (!this.cursor1 && !this.cursor2) {
      const globalCurrIdx = this.cursor;
      const beforeCurr = currText.slice(0, globalCurrIdx + 1);
      const afterCurr = currText.slice(globalCurrIdx+1);
      if (!char) {
        newText = beforeCurr.slice(0, -1) + afterCurr;
        this.cursor = globalCurrIdx - 1;
      } else {
        newText = beforeCurr + char + afterCurr;
        this.cursor = globalCurrIdx + 1;
      }
    } else {
      const idx1 = this.cursor1;
      const idx2 = this.cursor2;

      const beforeCurr = currText.slice(0, idx1 + 1);
      const afterCurr = currText.slice(idx2);
      if (!char) {
        newText = beforeCurr + afterCurr;
        this.cursor1 = null;
        this.cursor2 = null;
        this.cursor = idx1;
      } else {
        newText = beforeCurr + char + afterCurr;
        this.cursor1 = null;
        this.cursor2 = null;
        this.cursor = idx1 + 1;
      }
    }

    return newText;
  }

  selectAll() {
    // doesn't quite select the first char
    this.cursor1 = 1;
    this.cursor2 = this.getText().length;
    this.cursor = this.cursor2;
  }
}
