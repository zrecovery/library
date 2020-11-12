import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ArticlesRoutingModule } from './articles-routing.module';
import { ArticlesListComponent } from './list/list.component';
import { ArticlesDetailComponent } from './detail/detail.component';
import { ArticlesEditComponent } from './edit/edit.component';

const COMPONENTS = [ArticlesListComponent, ArticlesDetailComponent,  ArticlesEditComponent, ArticlesListComponent, ArticlesDetailComponent];
const COMPONENTS_DYNAMIC = [];

@NgModule({
  imports: [
    SharedModule,
    ArticlesRoutingModule
  ],
  declarations: [
    ...COMPONENTS,
    ...COMPONENTS_DYNAMIC
  ],
  entryComponents: COMPONENTS_DYNAMIC
})
export class ArticlesModule { }
