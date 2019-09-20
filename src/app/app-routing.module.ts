import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { ShoppingListComponent } from './shopping-list/shopping-list.component';
import { RecipesComponent } from './recipes/recipes.component';
import { RecipeDetailComponent } from './recipes/recipe-detail/recipe-detail.component';
import { RecipeStartComponent } from './recipes/recipe-start/recipe-start.component';
import { RecipeEditComponent } from './recipes/recipe-edit/recipe-edit.component';
import { RecipesResolverService } from './recipes/recipes-resolver.service';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';


const appRoutes: Routes = [
  { path: '', redirectTo: '/recipes', pathMatch: 'full' },
  {
    path: 'recipes', component: RecipesComponent, canActivate: [AuthGuard], children: [
      { path: '', component: RecipeStartComponent, pathMatch: 'full' },
      { path: 'new', component: RecipeEditComponent },
      { path: ':id', component: RecipeDetailComponent, resolve: [RecipesResolverService] },
      { path: ':id/edit', component: RecipeEditComponent, resolve: [RecipesResolverService] },
    ]
  },
  { path: 'shopping-list', component: ShoppingListComponent },
  { path: 'auth', component: AuthComponent }

  // { path: '**', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})

export class AppRoutingModule {
}
