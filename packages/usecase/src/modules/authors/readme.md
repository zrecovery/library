# Authors

## Use Cases

### FindAuthorDetailUseCase

```typescript
import { FindAuthorDetailUseCase } from "@library/usecase/authors/find-detail";

const findAuthorDetailUseCase = new FindAuthorDetailUseCase(authorDetailFinder);

const result = await findAuthorDetailUseCase.execute({ id: 1 });
```
