from dataclasses import dataclass
from typing import List, Dict, Union
from flask import Flask, request, jsonify
import re

# ==== Type Definitions, feel free to add or modify ===========================
@dataclass
class CookbookEntry:
	name: str

@dataclass
class RequiredItem():
	name: str
	quantity: int

@dataclass
class Recipe(CookbookEntry):
	required_items: List[RequiredItem]

@dataclass
class Ingredient(CookbookEntry):
	cook_time: int


# =============================================================================
# ==== HTTP Endpoint Stubs ====================================================
# =============================================================================
app = Flask(__name__)

# Store your recipes here!
cookbook = []

# Task 1 helper (don't touch)
@app.route("/parse", methods=['POST'])
def parse():
	data = request.get_json()
	recipe_name = data.get('input', '')
	parsed_name = parse_handwriting(recipe_name)
	if parsed_name is None:
		return 'Invalid recipe name', 400
	return jsonify({'msg': parsed_name}), 200

# [TASK 1] ====================================================================
# Takes in a recipeName and returns it in a form that 
def parse_handwriting(recipeName: str) -> Union[str | None]:
	recipeName = recipeName.lower()

	# Replace '-' and '_' with ' '
	recipeName = re.sub(r'-|_+', ' ', recipeName)

	output = ''
	for i in range(len(recipeName)):
		if recipeName[i].isalpha() or recipeName[i] == ' ':  # Valid character
			if i == 0 or recipeName[i - 1] == ' ':  # Capitalise starting character
				output += recipeName[i].upper()
			else:
				output += recipeName[i]

	# Remove leading, trailing and duplicate ' '
	output = output.strip()
	output = re.sub(r'\s+', ' ', output)

	return output if len(output) > 0 else None


# [TASK 2] ====================================================================
# Endpoint that adds a CookbookEntry to your magical cookbook
@app.route('/entry', methods=['POST'])
def create_entry():
	data = request.get_json()

	entry_name = data.get('name')
	for entry in cookbook:
		if entry.name == entry_name:
			return '', 400	# Entry name already in cookbook

	entry_type = data.get('type')
	if entry_type == 'recipe':
		required_items = []
		for item in data.get('requiredItems'):
			item_name = item.get('name')
			item_quantity = item.get('quantity')
			required_items.append(RequiredItem(item_name, item_quantity))

		cookbook.append(Recipe(entry_name, required_items))

		return '', 200
	elif entry_type == 'ingredient':
		entry_cook_time = data.get('cookTime')
		if entry_cook_time >= 0:
			cookbook.append(Ingredient(entry_name, entry_cook_time))

			return '', 200
		else:
			return '', 400	# cookTime < 0
	else:
		return '', 400	# Type is not 'recipe' or 'ingredient'


def lookup_entry(entry_name: str) -> Union[Recipe, Ingredient, None]:
	"""
	Looks up the entry name in the cookbook and returns the entry if it exists

	:param entry_name: The entry name the look for in the cookbook
	:return: The corresponding Recipe or Ingredient. If the entry name does not exist, return None
	"""
	for i in range(len(cookbook)):
		if cookbook[i].name == entry_name:
			return cookbook[i]

	return None

def summarise_ingredient(ingredient: Ingredient, ingredients: List, quantity: int, cook_time: List) -> None:
	"""
	Adds the ingredient to the ingredient list and updates the recipe cook time

	:param ingredient: The ingredient to add to the ingredients list
	:param ingredients: The ingredient list
	:param quantity: The quantity of the ingredient
	:param cook_time: The cook time of the recipe that the ingredient is a part of
	:return: None
	"""
	for i in ingredients:
		# Ingredient already exists in the ingredients list - so update it
		if i['name'] == ingredient.name:
			i['quantity'] += quantity
			cook_time.append(quantity * ingredient.cook_time)

			return None

	# Ingredient does not exist in the ingredients list - so add it
	ingredients.append({'name': ingredient.name, 'quantity': quantity})
	cook_time.append(quantity * ingredient.cook_time)

	return None

def create_recipe_summary(recipe: Recipe, ingredients: List, quantity: int, cook_time: List) -> bool:
	"""
	Create a recipe summary of the recipe

	:param recipe: The recipe to summarise
	:param ingredients: The recipes ingredients list
	:param quantity: The quantity of the recipe
	:param cook_time: The cook time of the recipe
	:return: True if the summary was created, False if the summary could not be created
	"""
	for item in recipe.required_items:
		current_item = lookup_entry(item.name)
		if current_item:
			if type(current_item) is Recipe:
				create_recipe_summary(current_item, ingredients, (quantity * item.quantity), cook_time)
			else:
				summarise_ingredient(current_item, ingredients, (quantity * item.quantity), cook_time)
		else:
			return False	# Item does not exist in cookbook

	return True


# [TASK 3] ====================================================================
# Endpoint that returns a summary of a recipe that corresponds to a query name
@app.route('/summary', methods=['GET'])
def summary():
	entry = lookup_entry(request.args.get('name'))
	if entry and type(entry) is Recipe:
		ingredients = []
		cook_time = []
		if not create_recipe_summary(entry, ingredients, 1, cook_time):
			return '', 400  # Recipe Ingredients do not exist
		else:
			return jsonify({'name': entry.name, 'cookTime': sum(cook_time), 'ingredients': ingredients}), 200
	else:
		return '', 400  # Recipe does not exist OR Entry is not a Recipe


# =============================================================================
# ==== DO NOT TOUCH ===========================================================
# =============================================================================

if __name__ == '__main__':
	app.run(debug=True, port=8080)
