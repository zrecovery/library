
import { treaty } from '@elysiajs/eden'
import type { app } from 'backend/types/src/application/app'

const client = treaty<typeof app>('http://0.0.0.0:3000/')

export const getArticleDetail = (id: number) => client.api.articles({ id: id });

