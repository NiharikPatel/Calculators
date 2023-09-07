const apiKey = '87e66b766aea40df8f0d3fa0093f5c9d'; // Replace with your actual Spoonacular API key
const mealForm = document.getElementById('form1');
const mealPlanContainer = document.getElementById('mealPlan');


function calculateBFP(BMI, age, gender){
  let BFP=0;
  if (gender === 'Male' && age >= 18) {
    BFP = 1.20 * BMI + 0.23 * age - 16.2;
   
  } else if (gender === 'Male' && age < 18) {
    BFP = 1.51 * BMI - 0.70 * age - 2.2;
   
  } else if (gender === 'Female' && age >= 18) {
    BFP = 1.20 * BMI + 0.23 * age - 5.4;
   
  } else if (gender === 'Female' && age < 18) {
    BFP = 1.51 * BMI - 0.70 * age + 1.4;
    
  }
  return BFP
  }
  
  function calculateBMR(age, gender, weight, height) {
    let bmr = 0;
    if (gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else if (gender === 'Female') {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      
    }
    return bmr;
  }
  
  function calculateTDEE(bmr, activity) {
    let tdee = 0;
  
    switch (activity) {
      case 'sedentary':
        tdee = bmr * 1.2;
        break;
      case 'lightlyActive':
        tdee = bmr * 1.375;
        break;
      case 'moderatelyActive':
        tdee = bmr * 1.55;
        break;
      case 'veryActive':
        tdee = bmr * 1.725;
        break;
      case 'extraActive':
        tdee = bmr * 1.9;
        break;
    }
  
    return tdee;
  }

  function updateValues(){
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const activity = document.getElementById('activity').value;
    const BMI = (weight)/(Math.pow((height/100), 2))
    
    const bmr = calculateBMR(age, gender, weight, height);
    const tdee = calculateTDEE(bmr, activity);
    const calorieGoal = Math.round(tdee);  // Calculate user's daily calorie needs using Mifflin-St Jeor equation
    const fat = Math.round(calculateBFP(BMI, age, gender));
    document.getElementById('fat').value = fat;
    document.getElementById('cal').value = calorieGoal;
    return calorieGoal
  }
  mealForm.addEventListener('input', updateValues);
 
  function fetchRecipe(mealId) {
    
    if (mealId) {
      const recipeUrl = `https://api.spoonacular.com/recipes/${mealId}/information?apiKey=${apiKey}`;
      
      fetch(recipeUrl)
        .then(response => response.json())
        .then(recipeData => {
          // Display recipe and ingredients
          const recipeHTML = `
            <h2 >${recipeData.title}  <span id="symbox">${recipeData.vegetarian ? '<span class="green-symbol">&#x1F7E2;</span>' : '<span class="brown-symbol">&#x1F7E4;</span>'}</span></h2>
            <span><h4>Servings: </h4>${recipeData.servings} </span>
            <span><h4>Ready in minutes: </h4>${recipeData.readyInMinutes}</span>
            <span><h4>Meal Type: </h4>${recipeData.dishTypes[0]}</span>
            <h4>Ingredients: </h4>
            <ul>
              ${recipeData.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`).join('')}
            </ul>
            <h4>How to make: </h4>
            <ul>${recipeData.instructions}</ul>
            <p>${recipeData.nutrients}</p>
          `;
          
          const recipeContent = document.getElementById('recipeContent');
          recipeContent.innerHTML = recipeHTML;

          const recipeModal = document.getElementById('recipeModal');
          recipeModal.style.display = 'block';

          const closeButton = document.getElementsByClassName('close')[0];
          closeButton.addEventListener('click', function(){
            recipeModal.style.display = 'none'
          })
        })
        .catch(error => {
          console.error('Error fetching recipe:', error);
        });
    } else {
      console.log("No meal ID provided");
    }
  }

  
mealForm.addEventListener('submit', function(event){
  event.preventDefault();
  const type = document.getElementById('mealType').value;
  const bmr = calculateBMR(age, gender, weight, height);
    const tdee = calculateTDEE(bmr, activity);
    const calorieGoal = updateValues();
    let targetCal = 0;
    let mealType1, mealType2 = type;
    let url1;
    
  
function nutritioninfo(mealId){
  const id = mealId.id
console.log(id)
url2 = `https://api.spoonacular.com/recipes/${id}/nutritionWidget.json?apiKey=${apiKey}`;
fetch(url2)
.then(response=> response.json())
.then(data=>{
  
  const nutrientsinfo = 
  `
  <h4>nutrients</h4>
  <p>Calories:${data.calories} Cal</p>
  <p>Fat:${data.fat} </p>
  <p>Carbohydrates:${data.carbs} </p>
  <p>Protein:${data.protein} </p>
  `;
  const nutrientsContainer = document.getElementById(`nutrients-${id}`);
  if (nutrientsContainer) {
    nutrientsContainer.innerHTML = nutrientsinfo;
  }
})
.catch(error => {
  console.error('Error in getting nutirents', error);
});
}

 // Make API request to generate meal plan
 if(type ==='All Three'){
  const url = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&targetCalories=${calorieGoal}`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      // Display the generated meal plan
      const meals = data.meals;
      const mealPlanHTML = meals.map((meal, index) => {
        return `
          <div>
          <h3>Meal ${index + 1}</h3>
          <p>${meal.title}</p>
          <img src="https://webknox.com/recipeImages/${meal.id}-556x370.jpg" width="100px" height=100px" alt="Meal ${index + 1} Image"><br>
          <button class="show-recipe-button" data-recipe-id="${meal.id}">Show Recipe</button><br>
          <div id="nutrients-${meal.id}"></div>
          </div>
         
        `;
      }).join('');
     
      mealPlanContainer.innerHTML = mealPlanHTML;
      meals.forEach(meal => {
        nutritioninfo(meal);
      });
      })
    .catch(error => {
      console.error('Error generating meal plan:', error);
    });}

    else{
      if(type === 'breakfast'){
        targetCal = Math.round(.25 * calorieGoal);
        mealType1 === type;
        url1 = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&type=breakfast&targetCalories=${targetCal}`;
      }
      else if(type ==='dinner'){
        targetCal = Math.round(.25 * calorieGoal);
        mealType1 = 'maincourse';
        mealType2='salad';
       url1 = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&type=maincourse&targetCalories=${targetCal}`;
      }
      else if(type === 'lunch'){
        targetCal = Math.round(.50 * calorieGoal);
        mealType1 = 'maincourse';
        mealType2 = 'salad';
       url1 = `https://api.spoonacular.com/mealplanner/generate?apiKey=${apiKey}&timeFrame=day&type=maincourse,maincourse&targetCalories=${targetCal}`;
      }

      console.log(targetCal);
      console.log(mealType1,mealType2);
      // const url1 = `https://api.spoonacular.com/mealplanner/generate&type=${mealType1}${mealType2 ? `,${mealType2}` : ''}&targetCalories=${targetCal}`;      
      fetch(url1)
      .then(response =>response.json())
      .then(data=>{
        const meals = data.meals;
        const mealPlanHTML = meals.map((meal, index) => {
          return `
            <div>
            <h3>Meal ${index + 1}</h3>
            <p>${meal.title}</p>
            <img src="https://webknox.com/recipeImages/${meal.id}-556x370.jpg" width="100px" height=100px" alt="Meal ${index + 1} Image"><br>
            <button class="show-recipe-button" data-recipe-id="${meal.id}">Show Recipe</button><br>
            <div id="nutrients-${meal.id}"></div>
            </div>
           
          `;
        }).join('');
  
        mealPlanContainer.innerHTML = mealPlanHTML;
        meals.forEach(meal => {
          nutritioninfo(meal);
        });
       
        }
      )
      .catch(error => {
        console.error('Error generating meal plan:', error);
      });
    }
    mealPlanContainer.addEventListener('click', function(event){
      const target = event.target;

      if(target.classList.contains('show-recipe-button')){
        const recipeId = target.getAttribute('data-recipe-id');
        fetchRecipe(recipeId);
      }
    })
});

