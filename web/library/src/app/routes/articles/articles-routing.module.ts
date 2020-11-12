import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ArticlesListComponent } from './list/list.component';
import { ArticlesDetailComponent } from './detail/detail.component';
import { ArticlesEditComponent } from './edit/edit.component';

const routes: Routes = [
  { path: '', component: ArticlesListComponent },
  { path: ':id', component: ArticlesDetailComponent },
  { path: 'edit', component: ArticlesEditComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ArticlesRoutingModule { }
