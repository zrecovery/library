import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ArticlesRoutingModule } from './articles-routing.module';

const COMPONENTS = [];
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
