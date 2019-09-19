import { Injectable} from '@angular/core';

import { Recipe } from './recipe.model';
import { Ingredient } from '../shared/ingredient.model';
import { ShoppingListService } from './../shopping-list/shopping-list.service';
import { Subject } from 'rxjs';

@Injectable()
export class RecipeService {
  recipesChanged = new Subject<Recipe[]>();

  private recipes: Recipe[] = [
    new Recipe(
      'Burger King Burger',
      'Burger King -Burger only, nothing else matters',
      'https://assets3.thrillist.com/v1/image/2797371/size/tmg-article_default_mobile.jpg',
      [
        new Ingredient('Meat', 1),
        new Ingredient('Salad', 20),
        new Ingredient('Buns', 2)
      ]
    ),

    new Recipe(
      'Pizza',
      'Best pizza in Town!',
      'https://food-images.files.bbci.co.uk/food/recipes/quick_pepperoni_pizza_64616_16x9.jpg',
      [
        new Ingredient('Flour', 1),
        new Ingredient('Potato', 3),
        new Ingredient('Bacon', 14)
      ]
    )
  ];

  constructor(private shoppingListService: ShoppingListService) { }

  getRecipes() {
    return this.recipes.slice(); // this return a copy of the recipes array
  }

  getRecipe(index: number) {
    return this.recipes[index];
  }

  addIngredientToShoppingList(ingredients: Ingredient[]) {
    this.shoppingListService.addIngredients(ingredients);
  }

  adRecipe(recipe: Recipe) {
    this.recipes.push(recipe);
    this.recipesChanged.next(this.recipes.slice());
  }

  updateRecipe(index: number, newRecipe: Recipe) {
    this.recipes[index] = newRecipe;
    this.recipesChanged.next(this.recipes.slice());
  }

  deleteRecipe(index: number) {
    this.recipes.splice(index, 1);
    this.recipesChanged.next(this.recipes.slice());
  }

}
