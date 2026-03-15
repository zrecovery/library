# Chapters

## Use Cases

### FindChapterDetailUseCase

```typescript
import { FindChapterDetailUseCase } from "@library/usecase/chapters/find-detail";

const findChapterDetailUseCase = new FindChapterDetailUseCase(chapterDetailFinder);

const result = await findChapterDetailUseCase.execute({ id: 1 });
```
