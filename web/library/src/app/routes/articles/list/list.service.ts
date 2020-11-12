import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArticlesListService {

  constructor(private http:HttpClient) { }
  
  getArticlesList() {
    return this.http.get("/api/articles")
  }
}
