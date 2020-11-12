export class Article {
    id?:number;
    book:string;
    author:string;
    serial?:number;
    title:string;
    article?:string;

    constructor(book:string,author:string,serial:number,title:string,article:string){
        this.book=book;
        this.author=author;
        this.serial=serial;
        this.title=title;
        this.article=article;
    }
}

