import { Component, OnInit } from '@angular/core';
import { Article } from '../article';
import { ArticlesListService } from './list.service';


interface resArticles{
  message:string
  articles:Article[]
}

@Component({
  selector: 'app-articles-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ArticlesListComponent implements OnInit {
  articles:Article[]

  constructor(private articlesListService:ArticlesListService) { }

  ngOnInit() {
    this.getList()
  }

  getList() {
    this.articlesListService.getArticlesList()
      .subscribe(() => {
        console.log("startend")
      })
  }
  
}
