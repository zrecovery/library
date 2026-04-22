const ignoreSpaces = (cursor: number): number => {
  return cursor;
};
export const start = (cursor: number) => ignoreSpaces(cursor);
export const progress = (cursor: number, content: string) => {
  const start = ignoreSpaces(cursor);
  if (start >= content.length) {
    return null;
  }
  return `${((start / content.length) * 100).toFixed(2)}%`;
};
export interface SectionIndex {
  index: number;
  title: string;
  start: number;
  end: number;
}

const getSectionByCursor = (
  sectionIndexs: SectionIndex[],
  cursor: number,
): SectionIndex | undefined => {
  return sectionIndexs.filter((s) => s.start <= cursor && s.end >= cursor)[0];
};

/*
export const layoutPageStartsWith = (
  content: string,
  cursor: number,
  container: HTMLElement,
  pagesContainer: HTMLElement,
  article: HTMLElement
) => {
  // 1. insert container into dom, so styles would applied to it
  pagesContainer.appendChild(container);

  const nextCursor = layoutPageColumn(cursor, article, content,getSize(article));

  // 6. Everything done
  pagesContainer.removeChild(container);
  container.classList.remove("read-text-page-processing");

  return { container, cursor, nextCursor };
};
interface Size {height:number,width:number}
const getSize = (article: HTMLElement): Size => {
  return {height:0,width:0}
}
const layoutPageColumn = (
  cursor: number,
  body: HTMLElement,
  content: string,
  size:Size,
  sectionIndexs: SectionIndex[],
): number => {
  const { height, width } = size;

  // 2. fill texts until it overflow the content
  let isOverflow = false;

  const context = {
    start: ignoreSpaces(cursor),
  };
  while (!context.error) {
    renderContent(content,body, context,sectionIndexs);
    if (body.clientHeight !== body.scrollHeight) {
      renderContent(content,body, context,sectionIndexs);
      isOverflow = true;
      break;
    } else if (body.clientHeight > height * 4) {
      context.error = true;
    }
  }
  const paragraphs = Array.from(body.querySelectorAll("p[data-start]"));
  let nextCursor;
  if (isOverflow) {
    // 3. find out where the overflow happened
    const rect = body.getBoundingClientRect();
    const firstOut =
      paragraphs
        .slice(0)
        .reverse()
        .find((p) => {
          return p.getBoundingClientRect().top < rect.bottom;
        }) ?? paragraphs[0];
    const startPos = Number(firstOut.dataset.start);
    const textNode = firstOut.firstChild;
    let low = 0;
    let high = textNode ? textNode.textContent.length - 1 : -1;
    const range = document.createRange();
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      range.setStart(textNode, mid);
      range.setEnd(textNode, mid + 1);
      if (range.getBoundingClientRect().bottom > rect.bottom) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    let targetHeight = null;
    if (high < 0) {
      targetHeight = firstOut.getBoundingClientRect().top - rect.top;
    } else {
      range.setStart(textNode, low - 1);
      range.setEnd(textNode, low);
      targetHeight = range.getBoundingClientRect().bottom - rect.top;
    }
    nextCursor = startPos + low;
    // 4. Hide overflow content
    body.style.height = targetHeight + "px";
    body.style.bottom = "auto";
  } else {
    nextCursor = context.cursor;
  }
  // 5. Mark following contents hidden
  paragraphs.forEach((paragraph) => {
    const start = Number(paragraph.dataset.start);
    const text = paragraph.textContent;
    const length = text.length;
    const end = start + length;
    if (start >= nextCursor) {
      paragraph.remove();
    } else if (end > nextCursor) {
      const pos = nextCursor - start;
      const before = text.slice(0, pos);
      const after = text.slice(pos);
      paragraph.textContent = before;
      // the overflowed text is still necessary here
      // as it may change the behavior of some render properties
      // `text-align: justify` for example
      const afterSpan = document.createElement("span");
      afterSpan.setAttribute("aria-hidden", "true");
      afterSpan.textContent = after;
      paragraph.appendChild(afterSpan);
      paragraph.classList.add("text-truncated-end");
    }
  });

  return nextCursor;
};

interface PageRenderContext {
  paragraph: HTMLParagraphElement;
  before: HTMLElement;
  start: number;
  end: number;
  cursor: number;
  previous: string;
  error: boolean;
  nextSection: number;
}

const MAXCONTENTLENGTH = 5000;
  const renderContent=(content:string,body: HTMLElement, context: PageRenderContext,sectionIndexs:SectionIndex[]) =>{


    const step: number = 100;
    const start_cursor = (context.cursor == null)?context.cursor : context.start;
    if (context.previous == null) {
      const text = content.slice(Math.max(0, context.cursor - MAXCONTENTLENGTH), context.cursor);
      context.previous = text.slice(text.lastIndexOf('\n') + 1);
    }

    const end_cursor =context.end == null?Math.min(context.cursor + step, content.length):Math.min(context.end, content.length);

    if (sectionIndexs.length > 0 && context.nextSection == null) {

      const ref = start_cursor - context.previous.length - 1;
      const nextSection = Math.max(getSectionByCursor(sectionIndexs, ref)?.index ?? 0, 0) + 1;
      if (nextSection >= sectionIndexs.length) {
        context.nextSection = 0
      }
      else {
        context.nextSection = nextSection
      };
    }
    const trunk = content.slice(start_cursor, end_cursor);
    if (!trunk) {
      context.error = true;
      return context;
    }
    let pos2 = start_cursor;
    trunk.split(/(\n)/).forEach(line => {
      if (!context.paragraph && line) {
        const paragraph = document.createElement('p');
        context.paragraph = paragraph;
        paragraph.classList.add('text');
        paragraph.dataset.start = String(pos2);
        if (pos2 === 0 || content[pos2 - 1] !== '\n') {
          paragraph.classList.add('text-truncated-start');
        }
        if (context.nextSection) {

          const contentsItem = sectionIndexs[context.nextSection];
          if (contentsItem?.start === pos2 - context.previous.length) {
            paragraph.setAttribute('role', 'heading');
            paragraph.setAttribute('aria-level', '3');
            paragraph.classList.add('text-heading');
            context.nextSection = (context.nextSection + 1) % sectionIndexs.length;
          }
        }
        body.insertBefore(paragraph, context.before);
      }
      if (line === '\n') {
        context.paragraph = null;
        context.previous = '';
      } else if (line) {
        context.paragraph.textContent += line;
        context.previous += line;
      }
      pos2 += line.length;
    });
    return context;
  }
