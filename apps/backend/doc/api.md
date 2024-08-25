# articles service

## get an article's detail

- input:

``` typescript
  {
    id: number
  }
```

- response:

``` typescript

{
  id: number,
  title: string,
  body: string,
  chapter?:{
   id:number,
   title:string,
   order: number
  },
  author?:{
    id: number,
    name: string
  }
}
```

## get articles

- input:

```typescript
{
  pagination?:{
    page: number,
    size: number
  },
  query?:{
    keyword: string
  }
}
```

- response:

```typescript

{
  pagination:{
    items: number,
    pages: number,
    size: number,
    current: number
  },
  detail:[{
    id: string,
    title: string,
    chapter?:{
       id:number,
       title:string,
       order: number
      },
    author?:{
      id: number,
      name: string
    }
  }]
}
```

## create an article

- input

```typescript
{
  title: string,
  body: string,
  author?:{
    name: string
  },
  chapter?:{
    order: number,
    title: string
  }
}
```

## update an article

- input

```typescript
{
  id: number,
  title?: string,
  body?: string,
  author?: {
    name: string
  },
  chapter?:{
    title: string,
    order: number
  }
}
```
