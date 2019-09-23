import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';

//Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';

//Services
import { AuthService } from './auth/auth.service';
import { DataStorageService } from './shared/data-storage.service';
import { RecipesResolverService } from './recipes/recipes-resolver.service';

// Modules
import { ShoppingListModule } from './shopping-list/shopping-list.module';

import { AuthGuard } from './auth/auth.guard';
import { SharedModule } from './shared/shared.module';
import { CoreModule } from './core.module';
import { AuthModule } from './auth/auth.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    HttpClientModule,
    SharedModule,
    CoreModule,
  ],
  providers: [
    AuthGuard,
    AuthService,
    DataStorageService,
    RecipesResolverService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
